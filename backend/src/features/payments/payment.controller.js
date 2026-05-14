function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return require('stripe')(key)
}

const paymentController = {
  // Create a payment intent and return client secret
  async createPaymentIntent(req, res) {
    const stripe = getStripe()
    if (!stripe) {
      return res.status(501).json({
        success: false,
        message: 'Card payments are not configured yet.',
        errors: []
      })
    }
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
        message: 'Payment intent created',
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent',
        errors: [error.message]
      })
    }
  },

  // Confirm payment and create order
  async confirmPayment(req, res) {
    const stripe = getStripe()
    if (!stripe) {
      return res.status(501).json({
        success: false,
        message: 'Card payments are not configured yet.',
        errors: []
      })
    }
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
          data: {
            orderNumber: paymentIntent.metadata.orderNumber
          }
        })
      } else {
        res.status(400).json({
          success: false,
          message: `Payment status: ${paymentIntent.status}`,
          errors: []
        })
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to confirm payment',
        errors: [error.message]
      })
    }
  }
}

module.exports = paymentController