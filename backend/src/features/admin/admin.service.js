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

  async getDashboardStats(role) {
    const isSuperAdmin = role === 'super_admin'

    const [
      totalUsers,
      activeUsers,
      totalOrders,
      pendingOrders,
      totalProducts,
      recentOrders,
      totalRevenue
    ] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { is_active: true } }),
      prisma.orders.count(),
      prisma.orders.count({ where: { status: 'pending' } }),
      prisma.products.count({ where: { is_active: true } }),
      prisma.orders.findMany({
        take: 5,
        orderBy: { order_date: 'desc' },
        include: {
          users: { select: { name: true, email: true } },
          payments: { select: { amount: true, status: true } }
        }
      }),
      isSuperAdmin
        ? prisma.payments.aggregate({
            _sum: { amount: true },
            where: { status: 'completed' }
          })
        : Promise.resolve(null)
    ])

    const data = {
      users: { total: totalUsers, active: activeUsers },
      orders: { total: totalOrders, pending: pendingOrders },
      products: { total: totalProducts },
      recent_orders: recentOrders.map(o => ({
        order_id: o.order_id.toString(),
        user: o.users?.name || o.users?.email,
        status: o.status,
        amount: o.payments?.amount || 0,
        date: o.order_date
      }))
    }

    if (isSuperAdmin) {
      data.revenue = { total: Number(totalRevenue?._sum?.amount || 0) }
    }

    return data
  },

  async getAnalytics() {
    // Minimal, real-data analytics for Super Admin only.
    const [totalRevenue, completedPaymentsCount, ordersTotal, ordersByStatus, productsActive, usersTotal] =
      await Promise.all([
        prisma.payments.aggregate({
          _sum: { amount: true },
          where: { status: 'completed' }
        }),
        prisma.payments.count({ where: { status: 'completed' } }),
        prisma.orders.count(),
        prisma.orders.groupBy({
          by: ['status'],
          _count: { _all: true }
        }),
        prisma.products.count({ where: { is_active: true } }),
        prisma.users.count()
      ])

    return {
      revenue: { total: Number(totalRevenue._sum.amount || 0), completed_payments: completedPaymentsCount },
      orders: {
        total: ordersTotal,
        by_status: ordersByStatus.map(r => ({ status: r.status, count: r._count._all }))
      },
      products: { active: productsActive },
      customers: { total: usersTotal }
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
          product_variants: { select: { stock_quantity: true, images: true } },
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
        total_stock: (p.product_variants || []).reduce((sum, v) => sum + Number(v.stock_quantity || 0), 0),
        thumbnail: (p.product_variants || []).flatMap(v => (Array.isArray(v.images) ? v.images : [])).find(Boolean) || null,
        created_at: p.created_at
      })),
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    }
  },

  async getAdminProductById(productId) {
    const id = Number(productId)
    if (!Number.isInteger(id) || id < 1) throw new Error('Product not found')

    const product = await prisma.products.findUnique({
      where: { product_id: id },
      include: {
        brands: { select: { brand_id: true, name: true } },
        categories: { select: { category_id: true, name: true } },
        product_variants: {
          orderBy: { created_at: 'desc' },
          select: {
            variant_id: true,
            sku: true,
            color_name: true,
            color_hex: true,
            size: true,
            price_adjustment: true,
            stock_quantity: true,
            low_stock_alert: true,
            images: true,
            created_at: true,
            updated_at: true,
          }
        }
      }
    })

    if (!product) throw new Error('Product not found')

    return {
      product_id: product.product_id.toString(),
      name: product.name,
      description: product.description,
      price: product.price?.toString?.() ?? product.price,
      compare_price: product.compare_price?.toString?.() ?? product.compare_price ?? null,
      category_id: product.category_id?.toString?.() ?? String(product.category_id),
      brand_id: product.brand_id?.toString?.() ?? String(product.brand_id),
      frame_shape: product.frame_shape,
      face_shape: product.face_shape,
      gender: product.gender,
      material: product.material,
      prescription_ready: product.prescription_ready,
      virtual_try_on: product.virtual_try_on,
      is_active: product.is_active,
      is_bundle: product.is_bundle,
      created_at: product.created_at,
      updated_at: product.updated_at,
      brands: product.brands
        ? { brand_id: product.brands.brand_id.toString(), name: product.brands.name }
        : null,
      categories: product.categories
        ? { category_id: product.categories.category_id.toString(), name: product.categories.name }
        : null,
      product_variants: (product.product_variants || []).map(v => ({
        ...v,
        variant_id: v.variant_id.toString(),
        price_adjustment: v.price_adjustment?.toString?.() ?? v.price_adjustment,
      }))
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

  async getAdmins() {
  const admins = await prisma.admin.findMany({
    select: {
      admin_id: true,
      email: true,
      name: true,
      created_at: true,
      roles: { select: { name: true } }
    },
    orderBy: { created_at: 'desc' }
  });
  return admins.map(a => ({
    id: a.admin_id.toString(),
    email: a.email,
    name: a.name,
    role: a.roles?.name,
    created_at: a.created_at
  }));
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
  },
  
  async getAllStaff({ page = 1, limit = 20, search = '', role = '' }) {
    const skip = (page - 1) * limit
   
    // Get the role IDs for staff and admin roles
    const staffRoles = await prisma.role.findMany({
      where: {
        name: { in: ['staff', 'admin', 'staff_admin'] }
      }
    })
   
    const roleIds = staffRoles.map(r => r.role_id)
   
    const where = {
      role_id: { in: roleIds },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(role && {
        roles: { name: role }
      })
    }

    const [staff, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          roles: { select: { name: true, role_id: true } }
        }
      }),
      prisma.admin.count({ where })
    ])

    return {
      data: staff.map(s => ({
        id: s.admin_id.toString(),
        email: s.email,
        name: s.name,
        role: s.roles?.name,
        role_id: s.roles?.role_id ? s.roles.role_id.toString() : null,
        created_at: s.created_at
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    }
  },

  async getStaffById(staffId) {
    const staff = await prisma.admin.findUnique({
      where: { admin_id: BigInt(staffId) },
      include: {
        roles: { select: { name: true, role_id: true } }
      }
    })
   
    if (!staff) throw new Error('Staff member not found')

    return {
      id: staff.admin_id.toString(),
      email: staff.email,
      name: staff.name,
      role: staff.roles?.name,
      role_id: staff.roles?.role_id ? staff.roles.role_id.toString() : null,
      created_at: staff.created_at
    }
  },

  async createStaff(creatorAdminId, data) {
    const { email, password, name, role } = data
   
    // Check if staff role exists, if not create it
    let roleRecord = await prisma.role.findUnique({ where: { name: role || 'staff' } })
    if (!roleRecord) {
      roleRecord = await prisma.role.create({
        data: {
          name: role || 'staff',
          description: 'Staff member with limited admin access'
        }
      })
    }

    const existing = await prisma.admin.findUnique({ where: { email } })
    if (existing) throw new Error('Staff member with this email already exists')

    const hashedPassword = await bcrypt.hash(password, 10)

    const newStaff = await prisma.admin.create({
      data: {
        email,
        password_hash: hashedPassword,
        name,
        role_id: roleRecord.role_id
      },
      include: { roles: true }
    })

    await adminService.log(creatorAdminId, 'CREATE_STAFF', `Created staff: ${email} with role: ${role || 'staff'}`)

    return {
      id: newStaff.admin_id.toString(),
      email: newStaff.email,
      name: newStaff.name,
      role: newStaff.roles?.name,
      created_at: newStaff.created_at
    }
  },

  async updateStaff(adminId, staffId, data) {
    const staff = await prisma.admin.findUnique({ where: { admin_id: BigInt(staffId) } })
    if (!staff) throw new Error('Staff member not found')

    const updateData = {}
   
    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10)
    }
    if (data.role) {
      const roleRecord = await prisma.role.findUnique({ where: { name: data.role } })
      if (!roleRecord) throw new Error(`Role "${data.role}" not found`)
      updateData.role_id = roleRecord.role_id
    }

    const updated = await prisma.admin.update({
      where: { admin_id: BigInt(staffId) },
      data: updateData,
      include: { roles: true }
    })

    await adminService.log(adminId, 'UPDATE_STAFF', `Updated staff: ${updated.email}`)

    return {
      id: updated.admin_id.toString(),
      email: updated.email,
      name: updated.name,
      role: updated.roles?.name
    }
  },

  async deleteStaff(adminId, staffId) {
    const staff = await prisma.admin.findUnique({ where: { admin_id: BigInt(staffId) } })
    if (!staff) throw new Error('Staff member not found')
   
    // Don't allow deleting super admin
    if (staff.roles?.name === 'super_admin') {
      throw new Error('Cannot delete super admin')
    }

    await prisma.admin.delete({ where: { admin_id: BigInt(staffId) } })
    await adminService.log(adminId, 'DELETE_STAFF', `Deleted staff: ${staff.email}`)

    return { message: 'Staff member deleted successfully' }
  },

  async getRoles() {
    const roles = await prisma.role.findMany({
      where: {
        name: { not: 'customer' } // Don't show customer role for staff assignment
      },
      select: {
        role_id: true,
        name: true,
        description: true
      },
      orderBy: { name: 'asc' }
    })

    return roles.map(r => ({
      id: r.role_id.toString(),
      name: r.name,
      description: r.description
    }))

}};



module.exports = adminService