const router = require('express').Router()
const blogController = require('./blog.controller')
const { adminAuthMiddleware } = require('../../shared/middleware/middleware')

router.get('/', blogController.getPublishedBlogs)
router.get('/:id', blogController.getBlogById)

router.post('/', adminAuthMiddleware, blogController.createBlog)
router.put('/:id', adminAuthMiddleware, blogController.updateBlog)
router.delete('/:id', adminAuthMiddleware, blogController.deleteBlog)

module.exports = router
