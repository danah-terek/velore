const { createContactMessage } = require('./contact.service')

const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  try {
    const entry = await createContactMessage({ name, email, subject, message })
    return res.status(201).json({ success: true, data: entry })
  } catch (err) {
    console.error('Contact form error:', err)
    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

module.exports = { submitContactForm }