const router = require('express').Router()
const paymentController = require('./payment.controller')

router.post('/create-intent', paymentController.createPaymentIntent)
router.post('/confirm', paymentController.confirmPayment)

module.exports = router