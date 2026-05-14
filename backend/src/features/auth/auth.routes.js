const router = require('express').Router()
const authController = require('./auth.controller')
const { authMiddleware } = require('../../shared/middleware/middleware')
const { registerValidation, loginValidation } = require('./auth.validation')

// Public routes (with validation)
router.post('/register', registerValidation, authController.register)
router.post('/login', loginValidation, authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile)

module.exports = router