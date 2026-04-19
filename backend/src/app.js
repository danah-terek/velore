require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Velore API is running!',
    timestamp: new Date().toISOString()
  })
})

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' })
})

// Routes will be added here later
// app.use('/api/v1/auth', require('./features/auth/auth.routes'))
// app.use('/api/v1/products', require('./features/products/product.routes'))

module.exports = app