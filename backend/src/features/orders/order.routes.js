const router = require('express').Router()
const orderController = require('./order.controller')
const { optionalAuth, authMiddleware } = require('../../shared/middleware/middleware')

// Guest can checkout too (optional auth)
router.post('/checkout', optionalAuth, orderController.checkout)

// These require login
router.get('/', authMiddleware, orderController.getMyOrders)
router.get('/:id', authMiddleware, orderController.getOrderById)

module.exports = router