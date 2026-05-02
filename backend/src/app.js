require('dotenv').config()
const express = require('express')
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


const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5176', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Velore API is running!',
    timestamp: new Date().toISOString()
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




app.use('/api/v1/cart', require('./features/cart/cart.routes'))
app.use('/api/v1/orders', require('./features/orders/order.routes'))

app.get('/api/v1/test-db', async (req, res) => {
  try {
    const userCount = await prisma.users.count()
    const roleCount = await prisma.role.count()
    res.json({ 
      success: true, 
      message: 'Database connected!',
      users: userCount,
      roles: roleCount
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})
module.exports = app