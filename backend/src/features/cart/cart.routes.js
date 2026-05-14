const router = require('express').Router()
const cartController = require('./cart.controller')
const { authMiddleware } = require('../../shared/middleware/middleware')

router.use(authMiddleware) // All cart routes require login

router.get('/', cartController.getCart)
router.post('/add', cartController.addItem)
router.put('/update', cartController.updateQuantity)
router.delete('/remove/:variantId', cartController.removeItem)
router.delete('/clear', cartController.clearCart)

module.exports = router