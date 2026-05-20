const router = require('express').Router()
const prisma = require('../../shared/utils/database')
const { adminAuthMiddleware } = require('../../shared/middleware/middleware')

// Public: get active banner messages
router.get('/', async (req, res) => {
  try {
    const messages = await prisma.top_banner.findMany({
      where: { is_active: true },
      orderBy: { id: 'asc' }
    })
    res.json({ success: true, data: messages })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Admin: get ALL banner messages (including inactive)
router.get('/all', adminAuthMiddleware, async (req, res) => {
  try {
    const messages = await prisma.top_banner.findMany({
      orderBy: { id: 'asc' }
    })
    res.json({ success: true, data: messages })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Admin: save all banners (replaces everything)
router.put('/', adminAuthMiddleware, async (req, res) => {
  try {
    const { messages } = req.body

    // Delete removed ones
    const incomingIds = messages.filter(m => m.id).map(m => m.id)
    if (incomingIds.length > 0) {
      await prisma.top_banner.deleteMany({
        where: { id: { notIn: incomingIds } }
      })
    } else {
      await prisma.top_banner.deleteMany()
    }

    // Upsert each
    for (const msg of messages) {
      if (msg.id) {
        await prisma.top_banner.update({
          where: { id: msg.id },
          data: { message: msg.message, is_active: msg.is_active, slot: msg.slot }
        })
      } else {
        await prisma.top_banner.create({
          data: { message: msg.message, is_active: msg.is_active, slot: msg.slot || 0 }
        })
      }
    }

    const updated = await prisma.top_banner.findMany({ orderBy: { id: 'asc' } })
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Admin: delete a single banner
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await prisma.top_banner.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true, message: 'Deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router