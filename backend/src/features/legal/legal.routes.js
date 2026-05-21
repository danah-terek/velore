const router = require('express').Router()
const prisma = require('../../shared/utils/database')
const { adminAuthMiddleware } = require('../../shared/middleware/middleware')

// Public: get a single legal page
router.get('/:slug', async (req, res) => {
  try {
    const page = await prisma.legal_pages.findUnique({
      where: { slug: req.params.slug }
    })
    if (!page) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, data: page })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Admin: update a legal page
router.put('/:slug', adminAuthMiddleware, async (req, res) => {
  try {
    const { content } = req.body
    const page = await prisma.legal_pages.upsert({
      where: { slug: req.params.slug },
      update: { content },
      create: {
        slug: req.params.slug,
        title: req.body.title || req.params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        content
      }
    })
    res.json({ success: true, data: page })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router