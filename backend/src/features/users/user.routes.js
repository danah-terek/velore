const router = require('express').Router()
const userController = require('./user.controller')
const { authMiddleware } = require('../../shared/middleware/middleware')

// All routes are protected
router.get('/profile', authMiddleware, userController.getProfile)
router.put('/profile', authMiddleware, userController.updateProfile)
router.get('/orders', authMiddleware, userController.getOrders)

// Address routes
router.post('/addresses', authMiddleware, userController.addAddress)
router.put('/addresses/:addressId', authMiddleware, userController.updateAddress)
router.delete('/addresses/:addressId', authMiddleware, userController.deleteAddress)

module.exports = router