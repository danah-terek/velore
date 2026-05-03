const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const paymentController = {
  // Create a payment intent and return client secret
  async createPaymentIntent(req, res) {
    try {
      const { amount, currency = 'usd' } = req.body
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency,
        metadata: {
          orderNumber: req.body.orderNumber || 'N/A'
        }
      })

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },

  // Confirm payment and create order
  async confirmPayment(req, res) {
    try {
      const { paymentIntentId, orderData } = req.body
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      if (paymentIntent.status === 'succeeded') {
        // Create the order in your database
        // Use your existing orderService.createOrder() here
        
        res.json({
          success: true,
          message: 'Payment confirmed',
          orderNumber: paymentIntent.metadata.orderNumber
        })
      } else {
        res.status(400).json({
          success: false,
          error: `Payment status: ${paymentIntent.status}`
        })
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
}

module.exports = paymentController