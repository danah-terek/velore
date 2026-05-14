const userService = require('./user.service')

const userController = {
  async getProfile(req, res) {
    try {
      const data = await userService.getProfile(req.user.userId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(404).json({ success: false, error: error.message })
    }
  },

  async updateProfile(req, res) {
    try {
      const data = await userService.updateProfile(req.user.userId, req.body)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async addAddress(req, res) {
    try {
      const data = await userService.addAddress(req.user.userId, req.body)
      res.status(201).json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async updateAddress(req, res) {
    try {
      const data = await userService.updateAddress(req.user.userId, req.params.addressId, req.body)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async deleteAddress(req, res) {
    try {
      const data = await userService.deleteAddress(req.user.userId, req.params.addressId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async getOrders(req, res) {
    try {
      const data = await userService.getOrders(req.user.userId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}

module.exports = userController