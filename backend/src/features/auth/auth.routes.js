const router = require('express').Router()
const authController = require('./auth.controller')
const { authMiddleware } = require('../../shared/middleware/middleware')
// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile)

module.exports = router