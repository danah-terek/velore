const prisma = require('../../shared/utils/database')

async function validateDiscountCode(code, orderTotal) {
  const discount = await prisma.discount_codes.findUnique({
    where: { code: code.toUpperCase() }
  })
  if (!discount) return { valid: false, message: 'Invalid discount code' }
  if (!discount.is_active) return { valid: false, message: 'This code is no longer active' }
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) return { valid: false, message: 'This code has expired' }
  if (discount.max_uses && discount.used_count >= discount.max_uses) return { valid: false, message: 'This code has reached its usage limit' }
  if (orderTotal < Number(discount.min_order)) return { valid: false, message: `Minimum order of $${discount.min_order} required` }

  const discountAmount = discount.type === 'percentage'
    ? (orderTotal * Number(discount.value)) / 100
    : Number(discount.value)

  return {
    valid: true,
    code: discount.code,
    type: discount.type,
    value: Number(discount.value),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    message: `Code applied! You save $${discountAmount.toFixed(2)}`
  }
}

async function getAllCodes() {
  const codes = await prisma.discount_codes.findMany({
    orderBy: { created_at: 'desc' }
  })
  return codes.map(c => ({
    ...c,
    code_id: c.code_id.toString(),
    value: Number(c.value),
    min_order: Number(c.min_order)
  }))
}

async function createCode({ code, type, value, min_order, max_uses, expires_at }) {
  return await prisma.discount_codes.create({
    data: {
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      min_order: min_order ? parseFloat(min_order) : 0,
      max_uses: max_uses ? parseInt(max_uses) : null,
      expires_at: expires_at ? new Date(expires_at) : null
    }
  })
}

async function deleteCode(code) {
  await prisma.discount_codes.delete({
    where: { code: code.toUpperCase() }
  })
}

async function toggleCode(code) {
  const current = await prisma.discount_codes.findUnique({
    where: { code: code.toUpperCase() }
  })
  await prisma.discount_codes.update({
    where: { code: code.toUpperCase() },
    data: { is_active: !current.is_active }
  })
}

async function incrementUsage(code) {
  await prisma.discount_codes.update({
    where: { code: code.toUpperCase() },
    data: { used_count: { increment: 1 } }
  })
}

module.exports = { validateDiscountCode, getAllCodes, createCode, deleteCode, toggleCode, incrementUsage }