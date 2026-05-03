// backend/src/features/products/product.search.js
const prisma = require('../../shared/utils/database')

const searchProducts = async (query) => {
  const searchTerm = query?.toLowerCase() || ''
  
  if (!searchTerm || searchTerm.length < 2) {
    return []
  }

  // Use raw SQL for case-insensitive search
  const products = await prisma.$queryRaw`
    SELECT 
      p.product_id,
      p.name,
      p.description,
      p.price,
      p.compare_price,
      p.frame_shape,
      p.face_shape,
      p.gender,
      p.material,
      p.prescription_ready,
      p.virtual_try_on,
      p.is_active,
      p.is_bundle,
      p.lens_width,
      p.bridge_width,
      p.temple_length,
      p.diameter,
      p.base_curve,
      p.water_content,
      p.details,
      p.created_at,
      p.updated_at,
      b.name as brand_name,
      b.brand_id,
      c.name as category_name,
      c.category_id
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.brand_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.is_active = true
      AND (
        LOWER(p.name) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(b.name) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(c.name) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(COALESCE(p.description, '')) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(COALESCE(p.frame_shape, '')) LIKE ${'%' + searchTerm + '%'}
        OR LOWER(COALESCE(p.material, '')) LIKE ${'%' + searchTerm + '%'}
      )
    ORDER BY p.name ASC
    LIMIT 10
  `

  // Format the results
  return products.map(p => ({
    product_id: p.product_id,
    name: p.name,
    description: p.description,
    price: p.price,
    compare_price: p.compare_price,
    frame_shape: p.frame_shape,
    brands: { name: p.brand_name, brand_id: p.brand_id },
    categories: { name: p.category_name, category_id: p.category_id },
    product_variants: [],
    lens_width: p.lens_width,
    bridge_width: p.bridge_width,
    temple_length: p.temple_length,
  }))
}

module.exports = { searchProducts }