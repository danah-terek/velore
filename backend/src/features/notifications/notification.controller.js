const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const serialize = (obj) => JSON.parse(JSON.stringify(obj, (_, v) =>
  typeof v === 'bigint' ? v.toString() : v
))

async function getMyNotifications(req, res) {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

    const notifications = await prisma.notifications.findMany({
      where: { user_id: Number(userId) },
      orderBy: { sent_at: 'desc' },
      take: 20,
    })

    return res.json({ success: true, data: serialize(notifications) })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getMyNotifications }