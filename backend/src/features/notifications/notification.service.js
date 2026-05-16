const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function sendNotification(userId, message, type) {
  await prisma.notifications.create({
    data: {
      user_id: Number(userId),
      message,
      type,
    }
  })
}

module.exports = { sendNotification }