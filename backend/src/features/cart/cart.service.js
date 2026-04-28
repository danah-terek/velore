const prisma = require('../../shared/utils/database')

const cartService = {
  async getCart(userId) {
    // ✅ Convert userId to number first
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

  async addItem(userId, { productId, product_id, variantId, variant_id, quantity = 1 }) {
    // ✅ Use whichever ID is provided, convert to number
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

    // ✅ Check if item already exists
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
        data: { quantity: existing.quantity + quantity }
      })
    }

    // ✅ Create new cart item
    return prisma.cart_items.create({
      data: {
        cart_id: cart.carts_id,
        product_id: productIdNum,
        variant_id: variantIdNum,
        quantity
      }
    })
  },

  async updateQuantity(userId, { productId, product_id, variantId, variant_id, quantity }) {
    const userIdNum = Number(userId)
    const productIdNum = Number(product_id || productId)
    const variantIdNum = variant_id || variantId ? Number(variant_id || variantId) : null
    const quantityNum = Number(quantity)
    
    const cart = await prisma.carts.findUnique({
      where: { user_id: userIdNum }
    })

    if (!cart) {
      throw new Error('Cart not found')
    }

    const where = {
      cart_id: cart.carts_id,
      product_id: productIdNum,
    }
    
    if (variantIdNum) {
      where.variant_id = variantIdNum
    } else {
      where.variant_id = null
    }

    const existing = await prisma.cart_items.findFirst({ where })
    
    if (!existing) {
      throw new Error('Item not found in cart')
    }

    return prisma.cart_items.update({
      where: { cart_item_id: existing.cart_item_id },
      data: { quantity: quantityNum }
    })
  },

  async removeItem(userId, variantId) {
    const userIdNum = Number(userId)
    const variantIdNum = Number(variantId)
    
    const cart = await prisma.carts.findUnique({
      where: { user_id: userIdNum }
    })

    if (!cart) {
      throw new Error('Cart not found')
    }

    return prisma.cart_items.deleteMany({
      where: {
        cart_id: cart.carts_id,
        variant_id: variantIdNum
      }
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