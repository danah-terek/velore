const prisma = require('../../shared/utils/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminService = {

  // ─── Auth ──────────────────────────────────────────────────

  async login(email, password) {
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: { roles: true }
    })

    if (!admin) throw new Error('Invalid credentials')

    const isValid = await bcrypt.compare(password, admin.password_hash)
    if (!isValid) throw new Error('Invalid credentials')

    await adminService.log(admin.admin_id, 'ADMIN_LOGIN', `Admin ${admin.email} logged in`)

    const token = jwt.sign(
      {
        adminId: admin.admin_id.toString(),
        email: admin.email,
        role: admin.roles?.name,
        isAdmin: true
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return {
      admin: {
        id: admin.admin_id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.roles?.name
      },
      token
    }
  },

  async createAdmin(creatorAdminId, data) {
    const { email, password, name, role } = data

    const existing = await prisma.admin.findUnique({ where: { email } })
    if (existing) throw new Error('Admin with this email already exists')

    const roleRecord = await prisma.role.findUnique({ where: { name: role || 'admin' } })
    if (!roleRecord) throw new Error(`Role "${role}" not found`)

    const hashedPassword = await bcrypt.hash(password, 10)

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password_hash: hashedPassword,
        name,
        role_id: roleRecord.role_id
      },
      include: { roles: true }
    })

    await adminService.log(creatorAdminId, 'CREATE_ADMIN', `Created admin: ${email}`)

    return {
      id: newAdmin.admin_id.toString(),
      email: newAdmin.email,
      name: newAdmin.name,
      role: newAdmin.roles?.name
    }
  },

  // ─── Dashboard ─────────────────────────────────────────────

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { is_active: true } }),
      prisma.orders.count(),
      prisma.orders.count({ where: { status: 'pending' } }),
      prisma.products.count({ where: { is_active: true } }),
      prisma.payments.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      }),
      prisma.orders.findMany({
        take: 5,
        orderBy: { order_date: 'desc' },
        include: {
          users: { select: { name: true, email: true } },
          payments: { select: { amount: true, status: true } }
        }
      })
    ])

    return {
      users: { total: totalUsers, active: activeUsers },
      orders: { total: totalOrders, pending: pendingOrders },
      products: { total: totalProducts },
      revenue: { total: Number(totalRevenue._sum.amount || 0) },
      recent_orders: recentOrders.map(o => ({
        order_id: o.order_id.toString(),
        user: o.users?.name || o.users?.email,
        status: o.status,
        amount: o.payments?.amount || 0,
        date: o.order_date
      }))
    }
  },

  // ─── Users ─────────────────────────────────────────────────

  async getAllUsers({ page = 1, limit = 20, search = '', is_active }) {
    const skip = (page - 1) * limit
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(is_active !== undefined && { is_active })
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          roles: { select: { name: true } },
          _count: { select: { orders: true } }
        }
      }),
      prisma.users.count({ where })
    ])

    return {
      data: users.map(u => ({
        id: u.user_id.toString(),
        name: u.name,
        email: u.email,
        role: u.roles?.name,
        is_active: u.is_active,
        loyalty_points: u.loyalty_points,
        orders_count: u._count.orders,
        created_at: u.created_at,
        last_login: u.last_login
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    }
  },

  async getUserById(userId) {
    const user = await prisma.users.findUnique({
      where: { user_id: Number(userId) },
      include: {
        roles: true,
        addresses: true,
        _count: { select: { orders: true } }
      }
    })
    if (!user) throw new Error('User not found')

    return {
      id: user.user_id.toString(),
      name: user.name,
      email: user.email,
      role: user.roles?.name,
      is_active: user.is_active,
      loyalty_points: user.loyalty_points,
      orders_count: user._count.orders,
      addresses: user.addresses,
      created_at: user.created_at,
      last_login: user.last_login
    }
  },

  async toggleUserStatus(adminId, userId) {
    const user = await prisma.users.findUnique({ where: { user_id: Number(userId) } })
    if (!user) throw new Error('User not found')

    const updated = await prisma.users.update({
      where: { user_id: Number(userId) },
      data: { is_active: !user.is_active }
    })

    await adminService.log(adminId, 'TOGGLE_USER_STATUS', `User ${userId} is_active => ${updated.is_active}`)

    return { id: updated.user_id.toString(), is_active: updated.is_active }
  },

  async deleteUser(adminId, userId) {
    const user = await prisma.users.findUnique({ where: { user_id: Number(userId) } })
    if (!user) throw new Error('User not found')

    await prisma.users.delete({ where: { user_id: Number(userId) } })
    await adminService.log(adminId, 'DELETE_USER', `Deleted user ${userId} (${user.email})`)

    return { message: 'User deleted successfully' }
  },

  // ─── Products ──────────────────────────────────────────────

  async getAllProducts({ page = 1, limit = 20, search = '', is_active }) {
    const skip = (page - 1) * limit
    const where = {
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(is_active !== undefined && { is_active })
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          brands: { select: { name: true } },
          categories: { select: { name: true } },
          _count: { select: { product_variants: true } }
        }
      }),
      prisma.products.count({ where })
    ])

    return {
      data: products.map(p => ({
        id: p.product_id.toString(),
        name: p.name,
        price: p.price,
        brand: p.brands?.name,
        category: p.categories?.name,
        is_active: p.is_active,
        variants_count: p._count.product_variants,
        created_at: p.created_at
      })),
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    }
  },

  async toggleProductStatus(adminId, productId) {
    const product = await prisma.products.findUnique({ where: { product_id: Number(productId) } })
    if (!product) throw new Error('Product not found')

    const updated = await prisma.products.update({
      where: { product_id: Number(productId) },
      data: { is_active: !product.is_active }
    })

    await adminService.log(adminId, 'TOGGLE_PRODUCT_STATUS', `Product ${productId} is_active => ${updated.is_active}`)

    return { id: updated.product_id.toString(), is_active: updated.is_active }
  },

  async deleteProduct(adminId, productId) {
    const product = await prisma.products.findUnique({ where: { product_id: Number(productId) } })
    if (!product) throw new Error('Product not found')

    await prisma.products.delete({ where: { product_id: Number(productId) } })
    await adminService.log(adminId, 'DELETE_PRODUCT', `Deleted product ${productId} (${product.name})`)

    return { message: 'Product deleted successfully' }
  },

  // ─── Orders ────────────────────────────────────────────────

  async getAllOrders({ page = 1, limit = 20, status }) {
    const skip = (page - 1) * limit
    const where = { ...(status && { status }) }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { order_date: 'desc' },
        include: {
          users: { select: { name: true, email: true } },
          payments: { select: { amount: true, status: true, payment_meth: true } },
          _count: { select: { orders_items: true } }
        }
      }),
      prisma.orders.count({ where })
    ])

    return {
      data: orders.map(o => ({
        id: o.order_id.toString(),
        user: { name: o.users?.name, email: o.users?.email },
        status: o.status,
        items_count: o._count.orders_items,
        payment: o.payments,
        date: o.order_date
      })),
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    }
  },

  async updateOrderStatus(adminId, orderId, status) {
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!allowed.includes(status)) throw new Error(`Invalid status. Must be: ${allowed.join(', ')}`)

    const order = await prisma.orders.findUnique({ where: { order_id: Number(orderId) } })
    if (!order) throw new Error('Order not found')

    const updated = await prisma.orders.update({
      where: { order_id: Number(orderId) },
      data: { status }
    })

    await adminService.log(adminId, 'UPDATE_ORDER_STATUS', `Order ${orderId} => ${status}`)

    return { id: updated.order_id.toString(), status: updated.status }
  },

  // ─── Audit Logs ────────────────────────────────────────────

  async getAuditLogs({ page = 1, limit = 50 }) {
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.audit_logs.findMany({
        skip,
        take: Number(limit),
        orderBy: { action_date: 'desc' },
        include: { admin: { select: { email: true, name: true } } }
      }),
      prisma.audit_logs.count()
    ])

    return {
      data: logs.map(l => ({
        id: l.log_id.toString(),
        admin: l.admin?.name || l.admin?.email,
        action: l.action,
        details: l.details,
        date: l.action_date
      })),
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    }
  },

  async log(adminId, action, details) {
    try {
      await prisma.audit_logs.create({
        data: {
          admin_id: adminId ? BigInt(adminId) : null,
          action,
          details
        }
      })
    } catch (_) {}
  }
}

module.exports = adminService