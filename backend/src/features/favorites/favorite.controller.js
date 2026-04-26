const favoriteService = require('./favorite.service')

const favoriteController = {
  async getFavorites(req, res) {
    try {
      const data = await favoriteService.getFavorites(req.user.userId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async addFavorite(req, res) {
    try {
      const data = await favoriteService.addFavorite(req.user.userId, req.params.productId)
      res.status(201).json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async removeFavorite(req, res) {
    try {
      const data = await favoriteService.removeFavorite(req.user.userId, req.params.productId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}

module.exports = favoriteController