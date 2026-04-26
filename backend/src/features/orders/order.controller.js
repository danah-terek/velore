const orderService = require('./order.service')

const orderController = {
  async checkout(req, res) {
    try {
      const order = await orderService.createOrder(req.user.userId, req.body)
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
      res.json({ success: true, data: order })
    } catch (error) {
      res.status(404).json({ success: false, error: error.message })
    }
  }
}

module.exports = orderController