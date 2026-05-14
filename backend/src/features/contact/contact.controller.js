const { createContactMessage } = require('./contact.service')

const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
      errors: []
    })
  }

  try {
    const entry = await createContactMessage({ name, email, subject, message })
    return res.status(201).json({ success: true, message: 'Message received', data: entry })
  } catch (err) {
    console.error('Contact form error:', err)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong.',
      errors: [err?.message].filter(Boolean)
    })
  }
}

module.exports = { submitContactForm }