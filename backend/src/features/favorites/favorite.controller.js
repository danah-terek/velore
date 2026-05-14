const favoriteService = require('./favorite.service')

const favoriteController = {
  async getFavorites(req, res) {
    try {
      const data = await favoriteService.getFavorites(req.user.userId)
      res.json({ success: true, message: null, data })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message, errors: [] })
    }
  },

  async addFavorite(req, res) {
    try {
      const data = await favoriteService.addFavorite(req.user.userId, req.params.productId)
      res.status(201).json({ success: true, message: 'Added to favorites', data })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message, errors: [] })
    }
  },

  async removeFavorite(req, res) {
  try {
    const data = await favoriteService.removeFavorite(req.user.userId, req.params.productId)
    res.json({ success: true, message: 'Removed from favorites', data })
  } catch (error) {
      res.status(400).json({ success: false, message: error.message, errors: [] })
    }
  }
}

module.exports = favoriteController