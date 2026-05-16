const prisma = require('../../shared/utils/database')

const serialize = (obj) => JSON.parse(JSON.stringify(obj, (_, v) =>
  typeof v === 'bigint' ? v.toString() : v
))

function formatStockError({ available, productName }) {
  const a = Number(available || 0)
  return `Only ${a} units available for ${productName || 'this product'}.`
}

async function resolveVariantForProductTx(tx, { productIdNum, variantIdNum }) {
  if (variantIdNum) {
    const v = await tx.product_variants.findUnique({
      where: { variant_id: Number(variantIdNum) },
      select: { variant_id: true, product_id: true, stock_quantity: true, price_adjustment: true, products: { select: { name: true, price: true } } },
    })
    if (!v || Number(v.product_id) !== Number(productIdNum)) throw new Error('Invalid product variant.')
    return v
  }

  const variants = await tx.product_variants.findMany({
    where: { product_id: Number(productIdNum) },
    orderBy: { created_at: 'asc' },
    select: { variant_id: true, stock_quantity: true, price_adjustment: true, products: { select: { name: true, price: true } } },
    take: 2,
  })

  if (variants.length === 0) throw new Error('This product is not purchasable yet (no variants).')
  if (variants.length > 1) throw new Error('Please select a product variant before checkout.')
  return variants[0]
}

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
    const isGuest = !userId
    const resolvedUserId = userId ? Number(userId) : await getGuestUserId()

    if (isGuest) {
      if (!guestItems || guestItems.length === 0) throw new Error('Your cart is empty. Please add items before checking out.')
      if (!guestAddress) throw new Error('Shipping address is required.')
    }

    // Load cart for logged-in user
    const cart = isGuest
      ? null
      : await prisma.carts.findUnique({
          where: { user_id: resolvedUserId },
          include: { cart_items: true },
        })

    const sourceItems = isGuest ? guestItems : (cart?.cart_items || [])
    if (!sourceItems || sourceItems.length === 0) {
      throw new Error('Your cart is empty. Please add items before checking out.')
    }

    // Transaction: validate stock, decrement stock, create order+items, clear cart (if any), create payment
    const result = await prisma.$transaction(async (tx) => {
      // Resolve items against DB (never trust frontend price)
      const resolved = []
      for (const item of sourceItems) {
        const productIdNum = Number(item.product_id || item.productId)
        const variantIdNum = item.variant_id || item.variantId ? Number(item.variant_id || item.variantId) : null
        const qty = Number(item.quantity || 1)
        if (!productIdNum) throw new Error('Product ID is required')
        if (!Number.isInteger(qty) || qty < 1) throw new Error('Quantity must be at least 1.')

        const v = await resolveVariantForProductTx(tx, { productIdNum, variantIdNum })
        const available = Number(v.stock_quantity || 0)
        if (qty > available) throw new Error(formatStockError({ available, productName: v.products?.name }))

        const basePrice = parseFloat(v.products?.price || 0)
        const adj = parseFloat(v.price_adjustment || 0)
        const unitPrice = basePrice + adj

        resolved.push({
          product_id: productIdNum,
          variant_id: Number(v.variant_id),
          quantity: qty,
          unit_price: unitPrice,
          product_name: v.products?.name || null,
        })
      }

      // Deduct stock with guard (prevents negative stock)
      for (const r of resolved) {
        const updated = await tx.product_variants.updateMany({
          where: {
            variant_id: Number(r.variant_id),
            stock_quantity: { gte: r.quantity },
          },
          data: { stock_quantity: { decrement: r.quantity } },
        })
        if (!updated || updated.count !== 1) {
          // Re-read to provide accurate message
          const v2 = await tx.product_variants.findUnique({
            where: { variant_id: Number(r.variant_id) },
            select: { stock_quantity: true, products: { select: { name: true } } },
          })
          const available = Number(v2?.stock_quantity || 0)
          throw new Error(formatStockError({ available, productName: v2?.products?.name }))
        }
      }

      // Resolve address inside tx
      let addressId
      if (!isGuest && address_id) {
        const existing = await tx.addresses.findFirst({
          where: { address_id: Number(address_id), user_id: Number(resolvedUserId) }
        })
        if (existing) addressId = existing.address_id
      }
      if (!addressId) {
        const created = await tx.addresses.create({
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

      // Totals from resolved items
      const subtotal = resolved.reduce((sum, r) => sum + (r.unit_price * r.quantity), 0)
      const shippingCost = subtotal >= 50 ? 0 : 3
      const total = subtotal + shippingCost

      const orderNumber = `VEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      const order = await tx.orders.create({
        data: {
          user_id: resolvedUserId,
          address_id: Number(addressId),
          status: 'pending',
          orders_items: {
            create: resolved.map((r) => ({
              product_id: Number(r.product_id),
              variant_id: Number(r.variant_id),
              quantity: Number(r.quantity),
              unit_price: r.unit_price,
              total_price: parseFloat((r.unit_price * r.quantity).toFixed(2)),
            }))
          }
        },
        include: { orders_items: { include: { products: true, product_variants: true } } }
      })

      if (!isGuest && cart?.carts_id) {
        await tx.cart_items.deleteMany({ where: { cart_id: cart.carts_id } })
      }

      await tx.payments.create({
        data: {
          order_id: order.order_id,
          amount: total,
          payment_meth: payment_method || 'cod',
          status: 'pending'
        }
      })

      return {
        order,
        orderNumber,
        total,
        subtotal,
        shippingCost,
      }
    })

    return {
      ...serialize(result.order),
      orderNumber: result.orderNumber,
      total: result.total.toFixed(2),
      subtotal: result.subtotal.toFixed(2),
      shipping: result.shippingCost.toFixed(2),
    }
  },

async getUserOrders(userId) {
  const orders = await prisma.orders.findMany({
    where: { user_id: Number(userId) },
    include: {
      orders_items: {
        include: {
          products: {
            include: {
              categories: true,
              brands: true
            }
          },
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
      where: { order_id: Number(orderId) },
      include: {
        orders_items: { include: { products: true, product_variants: true } },
        payments: true,
        addresses: true
      }
    })
    if (!order) throw new Error('Order not found')
    return serialize(order)
  },
  async updateOrderStatus(orderId, status) {
  const order = await prisma.orders.update({
    where: { order_id: Number(orderId) },
    data: { status },
  })

  // Auto-award loyalty points when order is delivered
  if (status === 'delivered' && order.user_id) {
    const { checkAndAwardPoints } = require('../loyalty/loyalty.service')
    try {
      await checkAndAwardPoints(BigInt(order.user_id), BigInt(order.order_id))
    } catch (e) {
      console.error('Loyalty points error:', e.message)
    }
  }

  return serialize(order)
},
}

module.exports = orderService