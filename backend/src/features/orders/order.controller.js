const orderService = require('./order.service')

const orderController = {
  // ✅ Checkout for BOTH guest and logged-in
  async checkout(req, res) {
    try {
      const userId = req.user?.userId || null; // ✅ null for guest
      const order = await orderService.createOrder(userId, req.body)
      res.status(201).json({ success: true, data: order })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async getMyOrders(req, res) {
    try {
      const orders = await orderService.getUserOrders(req.user.userId)
      res.json({ success: true, data: orders })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },

  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id)
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' })
      }
      // ✅ FIXED: Actually return the order
      res.json({ success: true, data: order })
    } catch (error) {
      res.status(404).json({ success: false, error: error.message })
    }
  }
}

module.exports = orderController