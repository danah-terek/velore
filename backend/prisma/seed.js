const { PrismaClient, Prisma } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const DEMO = {
  adminEmail: 'admin@velore.local',
  adminPassword: 'Admin123!Demo',
  customers: [
    { email: 'customer1@velore.local', password: 'Customer123!Demo', name: 'Lina Hassan' },
    { email: 'customer2@velore.local', password: 'Customer123!Demo', name: 'Omar Saeed' },
    { email: 'customer3@velore.local', password: 'Customer123!Demo', name: 'Maya Nabil' }
  ]
}

function money(value) {
  return new Prisma.Decimal(value)
}

async function ensureRole(name, description) {
  return prisma.role.upsert({
    where: { name },
    update: { description },
    create: { name, description }
  })
}

async function findOrCreateByName(model, name) {
  const existing = await model.findFirst({ where: { name } })
  if (existing) return existing
  return model.create({ data: { name } })
}

async function ensureCartAndWishlist(userId) {
  await prisma.carts.upsert({
    where: { user_id: userId },
    update: {},
    create: { user_id: userId }
  })
  await prisma.wishlists.upsert({
    where: { user_id: userId },
    update: {},
    create: { user_id: userId }
  })
}

async function ensureAddress(userId, payload) {
  const existing = await prisma.addresses.findFirst({
    where: {
      user_id: userId,
      street: payload.street,
      city: payload.city
    }
  })
  if (existing) return existing
  return prisma.addresses.create({
    data: {
      user_id: userId,
      street: payload.street,
      city: payload.city,
      state: payload.state,
      postal_code: payload.postal_code,
      country: payload.country
    }
  })
}

async function main() {
  // ── Roles ─────────────────────────────────────────────────────────────
  const superAdminRole = await ensureRole('super_admin', 'Full access')
  const staffAdminRole = await ensureRole('staff_admin', 'Operational staff access')
  const adminRole = await ensureRole('admin', 'Admin access')
  const customerRole = await ensureRole('customer', 'Customer role')

  // ── Admin ─────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash(DEMO.adminPassword, 10)
  const admin = await prisma.admin.upsert({
    where: { email: DEMO.adminEmail },
    update: { password_hash: adminHash, role_id: adminRole.role_id },
    create: {
      email: DEMO.adminEmail,
      password_hash: adminHash,
      name: 'Velore Demo Admin',
      role_id: adminRole.role_id
    }
  })

  await prisma.admin.upsert({
    where: { email: 'superadmin@velore.com' },
    update: {},
    create: {
      email: 'superadmin@velore.com',
      password_hash: await bcrypt.hash('SuperAdmin123!Demo', 10),
      name: 'Super Admin (Demo)',
      role_id: superAdminRole.role_id
    }
  })

  // ── Customers ─────────────────────────────────────────────────────────
  const customerIds = []
  for (const c of DEMO.customers) {
    const hash = await bcrypt.hash(c.password, 10)
    const user = await prisma.users.upsert({
      where: { email: c.email },
      update: { name: c.name, password: hash, role_id: customerRole.role_id },
      create: { email: c.email, name: c.name, password: hash, role_id: customerRole.role_id }
    })
    customerIds.push(user.user_id)
    await ensureCartAndWishlist(user.user_id)
  }

  // Addresses (optional but useful for orders)
  const [u1, u2] = customerIds
  const addr1 = await ensureAddress(u1, {
    street: '12 El Tahrir St',
    city: 'Cairo',
    state: 'Cairo',
    postal_code: '11511',
    country: 'Egypt'
  })
  const addr2 = await ensureAddress(u2, {
    street: '5 Al Gezira St',
    city: 'Giza',
    state: 'Giza',
    postal_code: '12611',
    country: 'Egypt'
  })

  // ── Categories & Brands ───────────────────────────────────────────────
  const categories = {
    sunglasses: await findOrCreateByName(prisma.categories, 'Sunglasses'),
    optical: await findOrCreateByName(prisma.categories, 'Optical Glasses'),
    bluelight: await findOrCreateByName(prisma.categories, 'Blue Light Glasses'),
    sports: await findOrCreateByName(prisma.categories, 'Sports Eyewear'),
    kids: await findOrCreateByName(prisma.categories, 'Kids Eyewear')
  }

  const brands = {
    velore: await findOrCreateByName(prisma.brands, 'Velore Signature'),
    maison: await findOrCreateByName(prisma.brands, 'Maison Clair'),
    nova: await findOrCreateByName(prisma.brands, 'Nova Lens'),
    aurelia: await findOrCreateByName(prisma.brands, 'Aurelia Optics'),
    urban: await findOrCreateByName(prisma.brands, 'Urban Frame')
  }

  // ── Products & Variants ───────────────────────────────────────────────
  const productSpecs = [
    {
      name: 'Noir Classic Sunglasses',
      description: 'Polarized lenses with a timeless square silhouette and matte-black finish.',
      price: money('129.00'),
      compare_price: money('159.00'),
      category: categories.sunglasses,
      brand: brands.velore,
      gender: 'unisex',
      frame_shape: 'square',
      face_shape: 'oval',
      material: 'acetate',
      variants: [
        { sku: 'VL-DEMO-NOIR-BLK', color_name: 'Matte Black', color_hex: '#0B0B0B', size: 'M', stock: 28, images: ['/uploads/products/demo/noir-classic-01.svg'] },
        { sku: 'VL-DEMO-NOIR-TORT', color_name: 'Tortoise', color_hex: '#6B4F3A', size: 'M', stock: 14, images: ['/uploads/products/demo/noir-classic-02.svg'] }
      ]
    },
    {
      name: 'Aurelia Gold Round Frames',
      description: 'Lightweight round metal frames with adjustable nose pads and premium hinge feel.',
      price: money('179.00'),
      compare_price: null,
      category: categories.optical,
      brand: brands.aurelia,
      gender: 'unisex',
      frame_shape: 'round',
      face_shape: 'square',
      material: 'metal',
      variants: [
        { sku: 'VL-DEMO-AUR-GLD-S', color_name: 'Gold', color_hex: '#D4AF37', size: 'S', stock: 10, images: ['/uploads/products/demo/aurelia-gold-round-01.svg'] },
        { sku: 'VL-DEMO-AUR-GLD-M', color_name: 'Gold', color_hex: '#D4AF37', size: 'M', stock: 22, images: ['/uploads/products/demo/aurelia-gold-round-02.svg'] }
      ]
    },
    {
      name: 'Urban Clear Blue‑Light Glasses',
      description: 'Blue-light filtering lenses with crystal-clear frame—made for long screen sessions.',
      price: money('99.00'),
      compare_price: money('119.00'),
      category: categories.bluelight,
      brand: brands.urban,
      gender: 'unisex',
      frame_shape: 'rectangle',
      face_shape: 'round',
      material: 'acetate',
      variants: [
        { sku: 'VL-DEMO-URB-CLR-M', color_name: 'Crystal Clear', color_hex: '#E6F1FF', size: 'M', stock: 35, images: ['/uploads/products/demo/urban-clear-01.svg'] }
      ]
    },
    {
      name: 'Maison Tortoise Optical Frame',
      description: 'A warm tortoise pattern with a refined keyhole bridge—classic everyday optical.',
      price: money('149.00'),
      compare_price: null,
      category: categories.optical,
      brand: brands.maison,
      gender: 'unisex',
      frame_shape: 'wayfarer',
      face_shape: 'heart',
      material: 'acetate',
      variants: [
        { sku: 'VL-DEMO-MAI-TORT-M', color_name: 'Tortoise', color_hex: '#6B4F3A', size: 'M', stock: 18, images: ['/uploads/products/demo/maison-tortoise-01.svg'] }
      ]
    },
    {
      name: 'Nova Sport Polarized Sunglasses',
      description: 'Wrap-around polarized sunglasses engineered for outdoor training and glare control.',
      price: money('139.00'),
      compare_price: null,
      category: categories.sports,
      brand: brands.nova,
      gender: 'unisex',
      frame_shape: 'wrap',
      face_shape: 'oval',
      material: 'polycarbonate',
      variants: [
        { sku: 'VL-DEMO-NOV-SPT-BLK', color_name: 'Black', color_hex: '#111111', size: 'L', stock: 20, images: ['/uploads/products/demo/nova-sport-01.svg'] },
        { sku: 'VL-DEMO-NOV-SPT-GRY', color_name: 'Graphite', color_hex: '#3A3A3A', size: 'L', stock: 12, images: ['/uploads/products/demo/nova-sport-02.svg'] }
      ]
    },
    {
      name: 'Velore Signature Aviator',
      description: 'Iconic aviator geometry with modern lens tint and durable metal construction.',
      price: money('189.00'),
      compare_price: money('219.00'),
      category: categories.sunglasses,
      brand: brands.velore,
      gender: 'unisex',
      frame_shape: 'aviator',
      face_shape: 'diamond',
      material: 'metal',
      variants: [
        { sku: 'VL-DEMO-AVI-GLD', color_name: 'Gold', color_hex: '#D4AF37', size: 'M', stock: 16, images: ['/uploads/products/demo/velore-aviator-01.svg'] },
        { sku: 'VL-DEMO-AVI-SLV', color_name: 'Silver', color_hex: '#C0C0C0', size: 'M', stock: 11, images: ['/uploads/products/demo/velore-aviator-02.svg'] }
      ]
    }
  ]

  const extraSpecs = [
    {
      name: 'Maison Soft‑Edge Kids Frames',
      description: 'Lightweight, flexible frames built for comfort and durability for kids.',
      price: money('79.00'),
      compare_price: null,
      category: categories.kids,
      brand: brands.maison,
      gender: 'kids',
      frame_shape: 'round',
      face_shape: 'oval',
      material: 'tr90',
      variants: [
        { sku: 'VL-DEMO-KIDS-BLU-S', color_name: 'Sky Blue', color_hex: '#7EC8E3', size: 'S', stock: 25, images: ['/uploads/products/demo/kids-softedge-01.svg'] }
      ]
    },
    {
      name: 'Aurelia Minimal Titanium Frames',
      description: 'Ultra-light titanium optical frames with a clean minimalist profile.',
      price: money('229.00'),
      compare_price: null,
      category: categories.optical,
      brand: brands.aurelia,
      gender: 'unisex',
      frame_shape: 'rectangle',
      face_shape: 'oval',
      material: 'titanium',
      variants: [
        { sku: 'VL-DEMO-TI-GRY-M', color_name: 'Titanium Grey', color_hex: '#8A8F98', size: 'M', stock: 9, images: ['/uploads/products/demo/aurelia-titanium-01.svg'] }
      ]
    },
    {
      name: 'Urban Slate Blue‑Light Frames',
      description: 'Soft slate frame with blue-light lens option—ideal for work and study.',
      price: money('109.00'),
      compare_price: null,
      category: categories.bluelight,
      brand: brands.urban,
      gender: 'unisex',
      frame_shape: 'square',
      face_shape: 'heart',
      material: 'acetate',
      variants: [
        { sku: 'VL-DEMO-URB-SLT-M', color_name: 'Slate', color_hex: '#5B6770', size: 'M', stock: 19, images: ['/uploads/products/demo/urban-slate-01.svg'] }
      ]
    },
    {
      name: 'Nova Lens Everyday Sunglasses',
      description: 'Everyday polarized sunglasses with balanced tint and comfortable nose bridge.',
      price: money('119.00'),
      compare_price: null,
      category: categories.sunglasses,
      brand: brands.nova,
      gender: 'unisex',
      frame_shape: 'rectangle',
      face_shape: 'round',
      material: 'acetate',
      variants: [
        { sku: 'VL-DEMO-NOV-EVD-BRN', color_name: 'Brown', color_hex: '#5A3E2B', size: 'M', stock: 17, images: ['/uploads/products/demo/nova-everyday-01.svg'] }
      ]
    },
    {
      name: 'Velore Signature Cat‑Eye Sunglasses',
      description: 'Elegant cat‑eye silhouette with UV protection and a subtle gradient lens.',
      price: money('159.00'),
      compare_price: money('189.00'),
      category: categories.sunglasses,
      brand: brands.velore,
      gender: 'women',
      frame_shape: 'cat-eye',
      face_shape: 'square',
      material: 'acetate',
      variants: [
        { sku: 'VL-DEMO-CAT-BLK-M', color_name: 'Black', color_hex: '#0B0B0B', size: 'M', stock: 13, images: ['/uploads/products/demo/velore-cateye-01.svg'] }
      ]
    },
    {
      name: 'Maison Classic Browline Frames',
      description: 'Retro browline optical frames with premium acetate top bar and metal rim.',
      price: money('169.00'),
      compare_price: null,
      category: categories.optical,
      brand: brands.maison,
      gender: 'unisex',
      frame_shape: 'browline',
      face_shape: 'oval',
      material: 'mixed',
      variants: [
        { sku: 'VL-DEMO-BROW-BLK-M', color_name: 'Black', color_hex: '#111111', size: 'M', stock: 8, images: ['/uploads/products/demo/maison-browline-01.svg'] }
      ]
    }
  ]

  const allSpecs = [...productSpecs, ...extraSpecs]

  const seededProductIds = []
  for (const p of allSpecs) {
    const existing = await prisma.products.findFirst({
      where: {
        name: p.name,
        brand_id: p.brand.brand_id,
        category_id: p.category.category_id
      }
    })

    const product = existing
      ? await prisma.products.update({
          where: { product_id: existing.product_id },
          data: {
            description: p.description,
            price: p.price,
            compare_price: p.compare_price,
            gender: p.gender,
            frame_shape: p.frame_shape,
            face_shape: p.face_shape,
            material: p.material,
            is_active: true
          }
        })
      : await prisma.products.create({
          data: {
            name: p.name,
            description: p.description,
            price: p.price,
            compare_price: p.compare_price,
            category_id: p.category.category_id,
            brand_id: p.brand.brand_id,
            gender: p.gender,
            frame_shape: p.frame_shape,
            face_shape: p.face_shape,
            material: p.material,
            is_active: true,
            prescription_ready: ['optical', 'bluelight', 'kids'].includes(
              Object.keys(categories).find((k) => categories[k] === p.category) || ''
            )
          }
        })

    seededProductIds.push(product.product_id)

    for (const v of p.variants) {
      await prisma.product_variants.upsert({
        where: { sku: v.sku },
        update: {
          color_name: v.color_name,
          color_hex: v.color_hex,
          size: v.size,
          stock_quantity: v.stock,
          images: v.images
        },
        create: {
          product_id: product.product_id,
          sku: v.sku,
          color_name: v.color_name,
          color_hex: v.color_hex,
          size: v.size,
          stock_quantity: v.stock,
          images: v.images
        }
      })
    }
  }

  // ── Blog posts ────────────────────────────────────────────────────────
  const blogSpecs = [
    {
      slug: 'how-to-clean-your-glasses',
      title: 'How to Clean Your Glasses Without Scratching',
      excerpt: 'Simple daily habits to keep your lenses crystal clear.',
      category: 'Care',
      author: 'Velore Team',
      image: '/uploads/blogs/demo/lens-care-guide.svg',
      read_time: '4 min',
      content:
        'Use lukewarm water, a gentle soap, and a microfiber cloth. Avoid paper towels. Rinse dust before wiping to prevent micro-scratches.'
    },
    {
      slug: 'frames-for-your-face-shape',
      title: 'Choosing Frames for Your Face Shape',
      excerpt: 'A quick guide to matching frames with your natural features.',
      category: 'Style',
      author: 'Velore Team',
      image: '/uploads/blogs/demo/face-shape-guide.svg',
      read_time: '6 min',
      content:
        'Round faces pair well with angular frames; square faces often look great with round or oval shapes. Balance is the goal—try complementary geometry.'
    },
    {
      slug: 'sunglasses-buying-guide',
      title: 'Sunglasses Buying Guide: UV, Polarization, and Fit',
      excerpt: 'What actually matters when shopping for sunglasses.',
      category: 'Guide',
      author: 'Velore Team',
      image: '/uploads/blogs/demo/sunglasses-guide.svg',
      read_time: '5 min',
      content:
        'Prioritize UV protection, then choose polarization for glare-heavy environments. Fit matters: lenses should cover the eye area without pinching temples.'
    },
    {
      slug: 'blue-light-glasses-explained',
      title: 'Blue‑Light Glasses Explained',
      excerpt: 'Do blue‑light lenses help and who should consider them?',
      category: 'Work',
      author: 'Velore Team',
      image: '/uploads/blogs/demo/blue-light-guide.svg',
      read_time: '5 min',
      content:
        'Blue‑light filtering can reduce glare and eye strain for some users. Pair it with good lighting and regular breaks for the best results.'
    }
  ]

  for (const b of blogSpecs) {
    await prisma.blog_posts.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        excerpt: b.excerpt,
        content: b.content,
        image: b.image,
        author: b.author,
        category: b.category,
        read_time: b.read_time,
        is_published: true
      },
      create: {
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content,
        image: b.image,
        author: b.author,
        category: b.category,
        read_time: b.read_time,
        is_published: true
      }
    })
  }

  // ── Orders + Payments + Reviews (optional; create only if absent) ─────
  const existingOrdersU1 = await prisma.orders.count({ where: { user_id: u1 } })
  const existingOrdersU2 = await prisma.orders.count({ where: { user_id: u2 } })

  const createdOrderIds = []

  if (existingOrdersU1 === 0) {
    const order = await prisma.orders.create({
      data: {
        user_id: u1,
        address_id: addr1.address_id,
        status: 'delivered',
        points_redeemed: 0,
        discount_from_points: money('0')
      }
    })
    createdOrderIds.push(order.order_id)
  }

  if (existingOrdersU2 === 0) {
    const order = await prisma.orders.create({
      data: {
        user_id: u2,
        address_id: addr2.address_id,
        status: 'pending',
        points_redeemed: 0,
        discount_from_points: money('0')
      }
    })
    createdOrderIds.push(order.order_id)
  }

  // Add items + payments for newly created orders
  for (const orderId of createdOrderIds) {
    const productId = seededProductIds[0]
    const variant = await prisma.product_variants.findFirst({ where: { product_id: productId } })
    await prisma.orders_items.create({
      data: {
        order_id: orderId,
        product_id: productId,
        variant_id: variant?.variant_id ?? null,
        quantity: 1,
        unit_price: money('129.00'),
        total_price: money('129.00')
      }
    })

    await prisma.payments.upsert({
      where: { order_id: orderId },
      update: { status: 'completed', payment_meth: 'demo' },
      create: {
        order_id: orderId,
        amount: money('129.00'),
        payment_meth: 'demo',
        status: 'completed'
      }
    })
  }

  // FIXED: Seed approved reviews - check for existing user+product combo
  for (const orderId of createdOrderIds) {
    const existingReview = await prisma.reviews.findFirst({ 
      where: { 
        user_id: u1, 
        product_id: seededProductIds[0] 
      } 
    })
    if (existingReview) continue
    
    await prisma.reviews.create({
      data: {
        order_id: orderId,
        user_id: u1,
        product_id: seededProductIds[0],
        rating: 5,
        comment: 'High quality, comfortable fit, and the lens tint looks great outdoors.',
        status: 'approved'
      }
    })
  }

  // Seed feedback rows (used by some review queries in codebase)
  const feedbackPairs = [
    { user_id: u1, product_id: seededProductIds[0], comment: 'Great build quality and quick delivery.' },
    { user_id: u2, product_id: seededProductIds[1], comment: 'Lightweight and premium feel. Love the round shape.' },
    { user_id: u2, product_id: seededProductIds[2], comment: 'Perfect for long work sessions. Eyes feel less tired.' }
  ]
  for (const f of feedbackPairs) {
    const exists = await prisma.feedback.findFirst({
      where: { user_id: f.user_id, product_id: f.product_id, comment: f.comment }
    })
    if (!exists) {
      await prisma.feedback.create({
        data: {
          user_id: f.user_id,
          product_id: f.product_id,
          comment: f.comment
        }
      })
    }
  }

  console.log('✅ Seed finished')
  console.log('• roles:', Object.keys(await prisma.role.findMany()).length)
  console.log('• admin:', admin.email)
  console.log('• customers:', DEMO.customers.map((c) => c.email).join(', '))
  console.log('• categories:', Object.values(categories).length)
  console.log('• brands:', Object.values(brands).length)
  console.log('• products seeded/updated:', allSpecs.length)
  console.log('• blogs seeded/updated:', blogSpecs.length)
  console.log('• demo image paths use /uploads/products/demo/*.svg and /uploads/blogs/demo/*.svg')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })