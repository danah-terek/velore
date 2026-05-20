const router = require('express').Router()
const prisma = require('../../shared/utils/database')
const { adminAuthMiddleware } = require('../../shared/middleware/middleware')

// Public: get active banner messages
router.get('/', async (req, res) => {
  try {
    const messages = await prisma.top_banner.findMany({
      where: { is_active: true },
      orderBy: { slot: 'asc' }
    })
    res.json({ success: true, data: messages })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Admin: update banner messages
router.put('/', adminAuthMiddleware, async (req, res) => {
  try {
    const { messages } = req.body // [{ slot: 1, message: "...", is_active: true }, ...]
    
    for (const msg of messages) {
      await prisma.top_banner.upsert({
        where: { slot: msg.slot },
        update: { message: msg.message, is_active: msg.is_active },
        create: { slot: msg.slot, message: msg.message, is_active: msg.is_active }
      })
    }
    
    const updated = await prisma.top_banner.findMany({ orderBy: { slot: 'asc' } })
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router