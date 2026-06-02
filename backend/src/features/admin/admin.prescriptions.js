const prisma = require('../../shared/utils/database')

function jsonError(res, status, message) {
  return res.status(status).json({ success: false, message })
}

async function listPrescriptions(req, res) {
  const variantId = Number(req.params.variantId)
  const list = await prisma.variant_prescriptions.findMany({
    where: { variant_id: variantId },
    orderBy: { id: 'asc' }
  })
  res.json({ success: true, data: list.map(p => ({ ...p, id: p.id.toString(), variant_id: p.variant_id.toString() })) })
}

async function createPrescription(req, res) {
  const variantId = Number(req.params.variantId)
  const { sph, cyl, axis, bc, dia, stock_quantity } = req.body
  const created = await prisma.variant_prescriptions.create({
    data: {
      variant_id: variantId,
      sph: sph || null,
      cyl: cyl || null,
      axis: axis ? parseInt(axis) : null,
      bc: bc ? parseFloat(bc) : null,
      dia: dia ? parseFloat(dia) : null,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0
    }
  })
  res.json({ success: true, data: { ...created, id: created.id.toString(), variant_id: created.variant_id.toString() } })
}

async function updatePrescription(req, res) {
  const id = Number(req.params.id)
  const { sph, cyl, axis, bc, dia, stock_quantity } = req.body
  const updated = await prisma.variant_prescriptions.update({
    where: { id },
    data: {
      sph: sph || null,
      cyl: cyl || null,
      axis: axis ? parseInt(axis) : null,
      bc: bc ? parseFloat(bc) : null,
      dia: dia ? parseFloat(dia) : null,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0
    }
  })
  res.json({ success: true, data: updated })
}

async function deletePrescription(req, res) {
  const id = Number(req.params.id)
  await prisma.variant_prescriptions.delete({ where: { id } })
  res.json({ success: true })
}

module.exports = { listPrescriptions, createPrescription, updatePrescription, deletePrescription }