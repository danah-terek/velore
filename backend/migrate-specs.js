const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function migrate() {
  const products = await p.products.findMany()

  for (const product of products) {
    const specs = {}

    if (product.frame_shape) specs.frame_shape = product.frame_shape
    if (product.lens_width) specs.lens_width = product.lens_width
    if (product.bridge_width) specs.bridge_width = product.bridge_width
    if (product.temple_length) specs.temple_length = product.temple_length
    if (product.material) specs.material = product.material
    if (product.face_shape) specs.face_shape = product.face_shape
    if (product.diameter) specs.diameter = product.diameter
    if (product.base_curve) specs.base_curve = product.base_curve
    if (product.water_content) specs.water_content = product.water_content

    if (Object.keys(specs).length > 0) {
      await p.products.update({
        where: { product_id: product.product_id },
        data: { specifications: specs }
      })
      console.log('Migrated:', product.name)
    }
  }

  console.log('Done!')
  await p.$disconnect()
}

migrate()