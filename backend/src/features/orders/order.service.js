const prisma = require('../../shared/utils/database')

const serialize = (obj) => JSON.parse(JSON.stringify(obj, (_, v) =>
  typeof v === 'bigint' ? v.toString() : v
))

// ✅ Get or create a guest user to satisfy the required user_id FK on orders
async function getGuestUserId() {
  const GUEST_EMAIL = 'guest@velore.com'
  
  let guestUser = await prisma.users.findUnique({ where: { email: GUEST_EMAIL } })
  
  if (!guestUser) {
    // Create the guest user if it doesn't exist yet
    guestUser = await prisma.users.create({
      data: {
        email: GUEST_EMAIL,
        password: 'GUEST_NO_LOGIN',
        name: 'Guest',
        is_active: false,
      }
    })
  }
  
  return Number(guestUser.user_id)
}

const orderService = {
  async createOrder(userId, { address_id, payment_method, email, name, phone, address: guestAddress, guestItems }) {
    let cart
    let resolvedUserId // the actual user_id we'll store on the order

    if (userId) {
      // ─── Logged-in user ───────────────────────────────────────────────────
      resolvedUserId = Number(userId)

      cart = await prisma.carts.findUnique({
        where: { user_id: resolvedUserId },
        include: {
          cart_items: {
            include: { products: true, product_variants: true }
          }
        }
      })

      if (!cart || cart.cart_items.length === 0) {
        throw new Error('Your cart is empty. Please add items before checking out.')
      }

    } else {
      // ─── Guest user ───────────────────────────────────────────────────────
      if (!guestItems || guestItems.length === 0) {
        throw new Error('Your cart is empty. Please add items before checking out.')
      }
      if (!guestAddress) {
        throw new Error('Shipping address is required.')
      }

      // Use the guest placeholder user to satisfy the required FK
      resolvedUserId = await getGuestUserId()

      // Build a cart-like object from the items sent by the frontend
      cart = {
        carts_id: null,
        cart_items: guestItems.map(item => ({
          product_id: Number(item.product_id),
          variant_id: item.variant_id ? Number(item.variant_id) : null,
          quantity: Number(item.quantity) || 1,
          products: { price: parseFloat(item.price || 0) },
          product_variants: null
        }))
      }
    }

    // ─── Calculate totals ─────────────────────────────────────────────────
    const subtotal = cart.cart_items.reduce((sum, item) => {
      const price = item.product_variants
        ? parseFloat(item.products.price) + parseFloat(item.product_variants.price_adjustment || 0)
        : parseFloat(item.products.price)
      return sum + (price * item.quantity)
    }, 0)

    const shippingCost = subtotal >= 50 ? 0 : 3
    const total = subtotal + shippingCost

    // ─── Resolve address ──────────────────────────────────────────────────
    let addressId

    if (userId && address_id) {
      // Logged-in user with a saved address
      const existing = await prisma.addresses.findFirst({
        where: { address_id: Number(address_id), user_id: Number(userId) }
      })
      if (existing) addressId = existing.address_id
    }

    if (!addressId) {
      // Create a new address record (works for both guests and logged-in users)
      const created = await prisma.addresses.create({
        data: {
          user_id: resolvedUserId,
          street: guestAddress?.address || guestAddress?.street || 'N/A',
          city: guestAddress?.city || 'N/A',
          state: 'N/A',
          postal_code: guestAddress?.postalCode || guestAddress?.postal_code || '00000',
          country: guestAddress?.country || 'Lebanon',
        }
      })
      addressId = created.address_id
    }

    // ─── Generate order number ────────────────────────────────────────────
    const orderNumber = `VEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // ─── Create order ─────────────────────────────────────────────────────
    const order = await prisma.orders.create({
      data: {
        user_id: resolvedUserId,   // ✅ always a valid BigInt now
        address_id: Number(addressId),
        status: 'pending',
        orders_items: {
          create: cart.cart_items.map(item => {
            const unitPrice = item.product_variants
              ? parseFloat(item.products.price) + parseFloat(item.product_variants.price_adjustment || 0)
              : parseFloat(item.products.price)
            return {
              product_id: Number(item.product_id),
              variant_id: item.variant_id ? Number(item.variant_id) : null,
              quantity: Number(item.quantity),
              unit_price: unitPrice,
              total_price: parseFloat((unitPrice * item.quantity).toFixed(2))
            }
          })
        }
      },
      include: {
        orders_items: {
          include: { products: true, product_variants: true }
        }
      }
    })

    // ─── Clear cart for logged-in users ───────────────────────────────────
    if (userId && cart.carts_id) {
      await prisma.cart_items.deleteMany({ where: { cart_id: cart.carts_id } })
    }

    // ─── Create payment record ────────────────────────────────────────────
    await prisma.payments.create({
      data: {
        order_id: order.order_id,
        amount: total,
        payment_meth: payment_method || 'cod',
        status: 'pending'
      }
    })

    return {
      ...serialize(order),
      orderNumber,
      total: total.toFixed(2),
      subtotal: subtotal.toFixed(2),
      shipping: shippingCost.toFixed(2),
    }
  },

  async getUserOrders(userId) {
    const orders = await prisma.orders.findMany({
      where: { user_id: Number(userId) },
      include: {
        orders_items: { include: { products: true, product_variants: true } },
        payments: true,
        addresses: true
      },
      orderBy: { order_date: 'desc' }
    })
    return serialize(orders)
  },

  async getOrderById(orderId) {
    const order = await prisma.orders.findUnique({
      where: { order_id: Number(orderId) },
      include: {
        orders_items: { include: { products: true, product_variants: true } },
        payments: true,
        addresses: true
      }
    })
    if (!order) throw new Error('Order not found')
    return serialize(order)
  }
}

module.exports = orderService