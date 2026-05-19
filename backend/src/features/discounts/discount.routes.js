const router = require('express').Router()
const { validate, getAll, create, remove, toggle } = require('./discount.controller')
const { adminAuthMiddleware } = require('../../shared/middleware/middleware')

router.post('/validate', validate)
router.get('/', adminAuthMiddleware, getAll)
router.post('/', adminAuthMiddleware, create)
router.delete('/:code', adminAuthMiddleware, remove)
router.patch('/:code/toggle', adminAuthMiddleware, toggle)

module.exports = router