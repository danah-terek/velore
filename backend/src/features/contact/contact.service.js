const prisma = require('../../shared/utils/database')

const createContactMessage = async ({ name, email, subject, message }) => {
  const entry = await prisma.contact_messages.create({
    data: { name, email, subject, message }
  })

  return {
    ...entry,
    message_id: entry.message_id.toString()
  }
}

module.exports = { createContactMessage }