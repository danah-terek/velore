const router = require('express').Router()
const favoriteController = require('./favorite.controller')
const { authMiddleware } = require('../../shared/middleware/middleware')

router.get('/', authMiddleware, favoriteController.getFavorites)
router.post('/:productId', authMiddleware, favoriteController.addFavorite)
router.delete('/:productId', authMiddleware, favoriteController.removeFavorite)

module.exports = router