const prisma = require('../../shared/utils/database')

const serialize = (obj) => JSON.parse(JSON.stringify(obj, (_, v) =>
  typeof v === 'bigint' ? v.toString() : v
))

const orderService = {
  async createOrder(userId, { address_id, payment_method }) {
    // Get cart with items
    const cart = await prisma.carts.findUnique({
      where: { user_id: BigInt(userId) },
      include: {
        cart_items: {
          include: {
            products: true,
            product_variants: true
          }
        }
      }
    })

    if (!cart || cart.cart_items.length === 0) {
      throw new Error('Cart is empty')
    }

    // Calculate totals
    const subtotal = cart.cart_items.reduce((sum, item) => {
      const price = item.product_variants
        ? parseFloat(item.products.price) + parseFloat(item.product_variants.price_adjustment || 0)
        : parseFloat(item.products.price)
      return sum + (price * item.quantity)
    }, 0)

    const shippingCost = subtotal >= 50 ? 0 : 3
    const total = subtotal + shippingCost

    // Create order
    const order = await prisma.orders.create({
      data: {
        user_id: BigInt(userId),
        address_id: BigInt(address_id),
        status: 'pending',
        orders_items: {
          create: cart.cart_items.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            quantity: item.quantity,
            unit_price: item.product_variants
              ? parseFloat(item.products.price) + parseFloat(item.product_variants.price_adjustment || 0)
              : parseFloat(item.products.price),
            total_price: item.quantity * (item.product_variants
              ? parseFloat(item.products.price) + parseFloat(item.product_variants.price_adjustment || 0)
              : parseFloat(item.products.price))
          }))
        }
      },
      include: {
        orders_items: {
          include: {
            products: true,
            product_variants: true
          }
        }
      }
    })

    // Clear cart
    await prisma.cart_items.deleteMany({
      where: { cart_id: cart.carts_id }
    })

    // Create payment record
    await prisma.payments.create({
      data: {
        order_id: order.order_id,
        amount: total,
        payment_meth: payment_method,
        status: 'pending'
      }
    })

    return serialize(order)
  },

  async getUserOrders(userId) {
    const orders = await prisma.orders.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        orders_items: {
          include: {
            products: true,
            product_variants: true
          }
        },
        payments: true,
        addresses: true
      },
      orderBy: { order_date: 'desc' }
    })
    return serialize(orders)
  },

  async getOrderById(orderId) {
    const order = await prisma.orders.findUnique({
      where: { order_id: BigInt(orderId) },
      include: {
        orders_items: {
          include: {
            products: true,
            product_variants: true
          }
        },
        payments: true,
        addresses: true
      }
    })
    return serialize(order)
  }
}

module.exports = orderService