require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const prisma = require('./shared/utils/database')
const categoryRoutes = require('./features/categories/category.routes')
const authRoutes = require('./features/auth/auth.routes')
const brandRoutes = require('./features/brand/brand.routes')
const productRoutes = require('./features/products/product.routes')
const reviewRoutes = require('./features/reviews/review.routes')
const favoriteRoutes = require('./features/favorites/favorite.routes')
const userRoutes = require('./features/users/user.routes')
const contactRoutes = require('./features/contact/contact.routes')
const loyaltyRoutes = require('./features/loyalty/loyalty.routes')
const adminRoutes = require('./features/admin/admin.routes')
const blogRoutes = require('./features/blog')
const paymentRoutes = require('./features/payments/payment.routes')
const notificationRoutes = require('./features/notifications/notification.routes')
const discountRoutes = require('./features/discounts/discount.routes')
const bannerRoutes = require('./features/banner/banner.routes')

const app = express()
app.set('json replacer', (_, v) => typeof v === 'bigint' ? v.toString() : v)

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176'
].filter(Boolean)

app.use(cors({
  origin(origin, cb) {
    // Allow non-browser clients (curl, server-to-server) with no Origin header
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    return cb(new Error('CORS: origin not allowed'), false)
  },
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded/demo assets only (no other directories)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    data: {
      timestamp: new Date().toISOString()
    }
  })
})

// API v1 routes
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/brands', brandRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/favorites', favoriteRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/contact', contactRoutes)
app.use('/api/v1/loyalty', loyaltyRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/blogs', blogRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/ai-advisor', require('./features/ai-advisor'));
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/discounts', discountRoutes)

app.use('/api/v1/cart', require('./features/cart/cart.routes'))
app.use('/api/v1/orders', require('./features/orders/order.routes'))
app.use('/api/v1/banner', bannerRoutes)

app.get('/api/v1/test-db', async (req, res) => {
  try {
    const [
      userCount,
      roleCount,
      productCount,
      categoryCount,
      brandCount,
      blogCount,
      reviewCount
    ] = await Promise.all([
      prisma.users.count(),
      prisma.role.count(),
      prisma.products.count(),
      prisma.categories.count(),
      prisma.brands.count(),
      prisma.blog_posts.count({ where: { is_published: true } }),
      prisma.reviews.count({ where: { status: 'approved' } })
    ])
    res.json({
      success: true,
      message: 'Database connected!',
      data: {
        users: userCount,
        roles: roleCount,
        products: productCount,
        categories: categoryCount,
        brands: brandCount,
        blogs: blogCount,
        reviews: reviewCount
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      errors: [error.message]
    })
  }
})

// 404 handler (API)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: []
  })
})

// Error handler (API)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500
  const safeMessage = typeof err.message === 'bigint' ? err.message.toString() : (err.message || 'Internal server error')
  res.status(status).json({
    success: false,
    message: safeMessage,
    errors: err.errors || []
  })
})

module.exports = app