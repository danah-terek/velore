const prisma = require('../../shared/utils/database')

const cartService = {
  async getCart(userId) {
    const userIdNum = Number(userId)
    
    let cart = await prisma.carts.findUnique({
      where: { user_id: userIdNum },
      include: {
        cart_items: {
          include: {
            products: true,
            product_variants: true
          }
        }
      }
    })

    if (!cart) {
      cart = await prisma.carts.create({
        data: { user_id: userIdNum },
        include: {
          cart_items: {
            include: {
              products: true,
              product_variants: true
            }
          }
        }
      })
    }

    const total = cart.cart_items.reduce((sum, item) => {
      const price = item.product_variants
        ? parseFloat(item.products.price) + parseFloat(item.product_variants.price_adjustment || 0)
        : parseFloat(item.products.price)
      return sum + (price * item.quantity)
    }, 0)

    return { ...cart, total: total.toFixed(2) }
  },

  async addItem(userId, { productId, product_id, variantId, variant_id, quantity = 1, prescriptionData }) {
    const productIdNum = Number(product_id || productId)
    const variantIdNum = variant_id || variantId ? Number(variant_id || variantId) : null
    const userIdNum = Number(userId)
    
    if (!productIdNum) {
      throw new Error('Product ID is required')
    }
    
    let cart = await prisma.carts.findUnique({
      where: { user_id: userIdNum }
    })

    if (!cart) {
      cart = await prisma.carts.create({
        data: { user_id: userIdNum }
      })
    }

    const existingWhere = {
      cart_id: cart.carts_id,
      product_id: productIdNum,
    }
    
    if (variantIdNum) {
      existingWhere.variant_id = variantIdNum
    } else {
      existingWhere.variant_id = null
    }
    
    const existing = await prisma.cart_items.findFirst({
      where: existingWhere
    })

    if (existing) {
      return prisma.cart_items.update({
        where: { cart_item_id: existing.cart_item_id },
        data: { 
          quantity: existing.quantity + quantity,
          prescription_data: prescriptionData || existing.prescription_data
        }
      })
    }

    return prisma.cart_items.create({
      data: {
        cart_id: cart.carts_id,
        product_id: productIdNum,
        variant_id: variantIdNum,
        quantity,
        prescription_data: prescriptionData || null
      }
    })
  },

  async updateQuantity(userId, { cart_item_id, quantity }) {
  const userIdNum = Number(userId)
  const cartItemIdNum = Number(cart_item_id)
  const quantityNum = Number(quantity)

  // Verify this cart_item belongs to this user
  const item = await prisma.cart_items.findFirst({
    where: {
      cart_item_id: cartItemIdNum,
      carts: { user_id: userIdNum }
    },
    include: { carts: true }
  })

  if (!item) throw new Error('Item not found in cart')

  return prisma.cart_items.update({
    where: { cart_item_id: cartItemIdNum },
    data: { quantity: quantityNum }
  })
},

  async removeItem(userId, cartItemId) {
  const userIdNum = Number(userId)
  const cartItemIdNum = Number(cartItemId)

  const item = await prisma.cart_items.findFirst({
    where: {
      cart_item_id: cartItemIdNum,
      carts: { user_id: userIdNum }
    }
  })

  if (!item) throw new Error('Item not found in cart')

  return prisma.cart_items.delete({
    where: { cart_item_id: cartItemIdNum }
  })
},

  async clearCart(userId) {
    const userIdNum = Number(userId)
    
    const cart = await prisma.carts.findUnique({
      where: { user_id: userIdNum }
    })

    if (!cart) {
      return { message: 'Cart already empty' }
    }

    return prisma.cart_items.deleteMany({
      where: { cart_id: cart.carts_id }
    })
  }
}

module.exports = cartService