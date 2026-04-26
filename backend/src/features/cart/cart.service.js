const prisma = require('../../shared/utils/database')

const cartService = {
  async getCart(userId) {
    let cart = await prisma.carts.findUnique({
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

    if (!cart) {
      cart = await prisma.carts.create({
        data: { user_id: BigInt(userId) },
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

async addItem(userId, { product_id, variant_id, quantity = 1 }) {
  let cart = await prisma.carts.findUnique({
    where: { user_id: BigInt(userId) }
  })

  if (!cart) {
    cart = await prisma.carts.create({
      data: { user_id: BigInt(userId) }
    })
  }

  // If no variant_id, check if item already exists and update or create
  if (!variant_id) {
    const existing = await prisma.cart_items.findFirst({
      where: {
        cart_id: cart.carts_id,
        product_id: BigInt(product_id),
        variant_id: null
      }
    })

    if (existing) {
      return prisma.cart_items.update({
        where: { cart_item_id: existing.cart_item_id },
        data: { quantity: existing.quantity + quantity }
      })
    }

    return prisma.cart_items.create({
      data: {
        cart_id: cart.carts_id,
        product_id: BigInt(product_id),
        variant_id: null,
        quantity
      }
    })
  }

  return prisma.cart_items.upsert({
    where: {
      cart_id_product_id_variant_id: {
        cart_id: cart.carts_id,
        product_id: BigInt(product_id),
        variant_id: BigInt(variant_id)
      }
    },
    update: { quantity: { increment: quantity } },
    create: {
      cart_id: cart.carts_id,
      product_id: BigInt(product_id),
      variant_id: BigInt(variant_id),
      quantity
    }
  })
},

async updateQuantity(userId, { product_id, variant_id, quantity }) {
  const cart = await prisma.carts.findUnique({
    where: { user_id: BigInt(userId) }
  })

  if (!variant_id) {
    const existing = await prisma.cart_items.findFirst({
      where: {
        cart_id: cart.carts_id,
        product_id: BigInt(product_id),
        variant_id: null
      }
    })
    return prisma.cart_items.update({
      where: { cart_item_id: existing.cart_item_id },
      data: { quantity }
    })
  }

  return prisma.cart_items.update({
    where: {
      cart_id_product_id_variant_id: {
        cart_id: cart.carts_id,
        product_id: BigInt(product_id),
        variant_id: BigInt(variant_id)
      }
    },
    data: { quantity }
  })
},

  async removeItem(userId, variantId) {
    const cart = await prisma.carts.findUnique({
      where: { user_id: BigInt(userId) }
    })

    return prisma.cart_items.deleteMany({
      where: {
        cart_id: cart.carts_id,
        variant_id: BigInt(variantId)
      }
    })
  },

  async clearCart(userId) {
    const cart = await prisma.carts.findUnique({
      where: { user_id: BigInt(userId) }
    })

    return prisma.cart_items.deleteMany({
      where: { cart_id: cart.carts_id }
    })
  }
}

module.exports = cartService