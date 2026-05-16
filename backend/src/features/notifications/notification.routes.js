const router = require('express').Router()
const { getMyNotifications } = require('./notification.controller')
const { authMiddleware } = require('../../shared/middleware/middleware')

router.get('/', authMiddleware, getMyNotifications)

module.exports = router