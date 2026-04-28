const prisma = require('../../shared/utils/database')

const favoriteService = {
  async getFavorites(userId) {
    const wishlist = await prisma.wishlists.findUnique({
      where: { user_id: Number(userId) },
      include: {
        wishlist_items: {
          include: {
            products: {
              include: {
                brands: true,
                categories: true,
                product_variants: true
              }
            }
          }
        }
      }
    })

    if (!wishlist) throw new Error('Wishlist not found')

    return wishlist.wishlist_items.map(item => ({
      wishlist_items_id: item.wishlist_items_id.toString(),
      product: {
        id: item.products.product_id.toString(),
        name: item.products.name,
        price: item.products.price,
        compare_price: item.products.compare_price,
        brand: item.products.brands?.name,
        category: item.products.categories?.name,
        variants: item.products.product_variants
      }
    }))
  },

  async addFavorite(userId, productId) {
    const wishlist = await prisma.wishlists.findUnique({
      where: { user_id: Number(userId) }
    })

    if (!wishlist) throw new Error('Wishlist not found')

    const existing = await prisma.wishlist_items.findUnique({
      where: {
        wishlist_id_product_id: {
          wishlist_id: wishlist.wishlist_id,
          product_id: Number(productId)
        }
      }
    })

    if (existing) throw new Error('Product already in favorites')

    const item = await prisma.wishlist_items.create({
      data: {
        wishlist_id: wishlist.wishlist_id,
        product_id: Number(productId)
      }
    })

    return { wishlist_items_id: item.wishlist_items_id.toString() }
  },

  async removeFavorite(userId, productId) {
    const wishlist = await prisma.wishlists.findUnique({
      where: { user_id: Number(userId) }
    })

    if (!wishlist) throw new Error('Wishlist not found')

    await prisma.wishlist_items.delete({
      where: {
        wishlist_id_product_id: {
          wishlist_id: wishlist.wishlist_id,
          product_id: Number(productId)
        }
      }
    })

    return { message: 'Removed from favorites' }
  }
}

module.exports = favoriteService