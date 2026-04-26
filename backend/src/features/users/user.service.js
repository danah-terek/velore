const prisma = require('../../shared/utils/database')
const bcrypt = require('bcryptjs')

const userService = {
  async getProfile(userId) {
    const user = await prisma.users.findUnique({
      where: { user_id: BigInt(userId) },
      include: {
        roles: true,
        addresses: true,
        wishlists: {
          include: {
            _count: {
              select: {
                wishlist_items: true
              }
            }
          }
        },
        _count: {
          select: {
            orders: true,
          }
        }
      }
    })

    if (!user) throw new Error('User not found')

    return {
      id: user.user_id.toString(),
      email: user.email,
      name: user.name,
      role: user.roles?.name,
      loyalty_points: user.loyalty_points,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login,
      addresses: user.addresses.map(a => ({
        address_id: a.address_id.toString(),
        street: a.street,
        city: a.city,
        state: a.state,
        postal_code: a.postal_code,
        country: a.country
      })),
      orders_count: user._count.orders,
      wishlist_count: user.wishlists?._count.wishlist_items ?? 0
    }
  },

  async updateProfile(userId, data) {
    const { name, email } = data

    if (email) {
      const existing = await prisma.users.findUnique({ where: { email } })
      if (existing && existing.user_id.toString() !== userId.toString()) {
        throw new Error('Email already in use')
      }
    }

    const user = await prisma.users.update({
      where: { user_id: BigInt(userId) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        updated_at: new Date()
      }
    })

    return {
      id: user.user_id.toString(),
      email: user.email,
      name: user.name
    }
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.users.findUnique({
      where: { user_id: BigInt(userId) }
    })

    if (!user) throw new Error('User not found')

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) throw new Error('Current password is incorrect')

    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters')

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.users.update({
      where: { user_id: BigInt(userId) },
      data: { password: hashedPassword, updated_at: new Date() }
    })

    return { message: 'Password changed successfully' }
  },

  async addAddress(userId, addressData) {
    const { street, city, state, postal_code, country } = addressData

    const address = await prisma.addresses.create({
      data: {
        user_id: BigInt(userId),
        street,
        city,
        state,
        postal_code,
        country
      }
    })

    return {
      address_id: address.address_id.toString(),
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country
    }
  },

  async updateAddress(userId, addressId, addressData) {
    const address = await prisma.addresses.findFirst({
      where: {
        address_id: BigInt(addressId),
        user_id: BigInt(userId)
      }
    })

    if (!address) throw new Error('Address not found')

    const updated = await prisma.addresses.update({
      where: { address_id: BigInt(addressId) },
      data: addressData
    })

    return {
      address_id: updated.address_id.toString(),
      street: updated.street,
      city: updated.city,
      state: updated.state,
      postal_code: updated.postal_code,
      country: updated.country
    }
  },

  async deleteAddress(userId, addressId) {
    const address = await prisma.addresses.findFirst({
      where: {
        address_id: BigInt(addressId),
        user_id: BigInt(userId)
      }
    })

    if (!address) throw new Error('Address not found')

    await prisma.addresses.delete({
      where: { address_id: BigInt(addressId) }
    })

    return { message: 'Address deleted successfully' }
  },

  async deleteAccount(userId) {
    await prisma.users.delete({
      where: { user_id: BigInt(userId) }
    })

    return { message: 'Account deleted successfully' }
  },

  async getOrders(userId) {
    const orders = await prisma.orders.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        addresses: true,
        orders_items: {
          include: {
            products: true,
            product_variants: true
          }
        },
        payments: true
      },
      orderBy: { order_date: 'desc' }
    })

    return orders.map(order => ({
      order_id: order.order_id.toString(),
      status: order.status,
      order_date: order.order_date,
      address: order.addresses,
      items: order.orders_items.map(item => ({
        order_item_id: item.order_item_id.toString(),
        product_name: item.products.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })),
      payment: order.payments ? {
        status: order.payments.status,
        amount: order.payments.amount,
        method: order.payments.payment_meth
      } : null
    }))
  }
}

module.exports = userService