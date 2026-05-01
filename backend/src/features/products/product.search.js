// backend/src/features/products/product.search.js
const prisma = require('../../shared/utils/database')

const searchProducts = async (query) => {
  const searchTerm = query?.toLowerCase() || ''
  
  if (!searchTerm || searchTerm.length < 2) {
    return []
  }

  return prisma.products.findMany({
    where: {
      is_active: true,
      OR: [
        // Search by product name (case-insensitive)
        { name: { contains: searchTerm, mode: 'insensitive' } },
        // Search by brand name
        { brands: { name: { contains: searchTerm, mode: 'insensitive' } } },
        // Search by category name
        { categories: { name: { contains: searchTerm, mode: 'insensitive' } } },
        // Search by description
        { description: { contains: searchTerm, mode: 'insensitive' } },
        // Search by frame shape
        { frame_shape: { contains: searchTerm, mode: 'insensitive' } },
        // Search by material
        { material: { contains: searchTerm, mode: 'insensitive' } },
      ]
    },
    include: {
      brands: { select: { name: true } },
      categories: { select: { name: true } },
      product_variants: {
        select: {
          variant_id: true,
          color_name: true,
          color_hex: true,
          price_adjustment: true,
          stock_quantity: true,
          images: true
        }
      }
    },
    take: 10,
    orderBy: { name: 'asc' }
  })
}

module.exports = { searchProducts }