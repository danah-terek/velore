const router = require('express').Router()
const orderController = require('./order.controller')
const { authMiddleware } = require('../../shared/middleware/middleware')

router.use(authMiddleware)

router.post('/checkout', orderController.checkout)
router.get('/', orderController.getMyOrders)
router.get('/:id', orderController.getOrderById)

module.exports = router