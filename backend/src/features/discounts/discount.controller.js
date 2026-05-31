const { validateDiscountCode, getAllCodes, createCode, deleteCode, toggleCode } = require('./discount.service')

async function validate(req, res) {
  try {
    const { code, orderTotal } = req.body
    if (!code || !orderTotal) return res.status(400).json({ success: false, message: 'Code and order total are required' })
   const result = await validateDiscountCode(code.toUpperCase(), Number(orderTotal))
        return res.json({ success: result.valid, ...result })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function getAll(req, res) {
  try {
    const codes = await getAllCodes()
    return res.json({ success: true, data: codes })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function create(req, res) {
  try {
    const { code, type, value, min_order, max_uses, expires_at } = req.body
    if (!code || !type || !value) return res.status(400).json({ success: false, message: 'Code, type and value are required' })
    const newCode = await createCode({ code, type, value, min_order, max_uses, expires_at })
    return res.json({ success: true, data: newCode })
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'This code already exists' })
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function remove(req, res) {
  try {
    await deleteCode(req.params.code)
    return res.json({ success: true })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function toggle(req, res) {
  try {
    await toggleCode(req.params.code)
    return res.json({ success: true })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { validate, getAll, create, remove, toggle }