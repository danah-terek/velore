require('dotenv').config()
const express = require('express')
const cors = require('cors')
const prisma = require('./shared/utils/database')
const categoryRoutes = require('./features/categories/category.routes') // 👈 add


const authRoutes = require('./features/auth/auth.routes')

const brandRoutes = require('./features/brand/brand.routes')
const productRoutes = require('./features/products/product.routes')
const reviewRoutes = require('./features/reviews/review.routes')


const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

app.use('/api/categories', categoryRoutes) // 👈 add
app.use('/api/brands', brandRoutes)
app.use('/api/products', productRoutes) // 👈 missing
app.use('/api/reviews', reviewRoutes)
app.use('/api/auth', authRoutes)


app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count()
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