const cartService = require('./cart.service')

// Helper to serialize BigInt
const serialize = (obj) => JSON.parse(JSON.stringify(obj, (_, v) =>
  typeof v === 'bigint' ? v.toString() : v
))

const cartController = {
  async getCart(req, res) {
    try {
      const cart = await cartService.getCart(req.user.userId)
      res.json({ success: true, data: serialize(cart) })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },

  async addItem(req, res) {
    try {
      const item = await cartService.addItem(req.user.userId, req.body)
      res.json({ success: true, data: serialize(item) })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async updateQuantity(req, res) {
    try {
      const item = await cartService.updateQuantity(req.user.userId, req.body)
      res.json({ success: true, data: serialize(item) })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async removeItem(req, res) {
    try {
      await cartService.removeItem(req.user.userId, parseInt(req.params.variantId))
      res.json({ success: true, message: 'Item removed' })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async clearCart(req, res) {
    try {
      await cartService.clearCart(req.user.userId)
      res.json({ success: true, message: 'Cart cleared' })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}

module.exports = cartController