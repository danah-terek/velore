const prisma = require('../../shared/utils/database')

function jsonError(res, status, message, errors = []) {
  return res.status(status).json({ success: false, message, errors })
}

function isExternalUrl(s) {
  return /^https?:\/\//i.test(String(s || '').trim())
}

function validateImages(images) {
  if (images === undefined) return null
  if (!Array.isArray(images)) return 'images must be an array of strings'
  for (const v of images) {
    if (typeof v !== 'string') return 'images must be an array of strings'
    const p = v.trim()
    if (!p) return 'images contains an empty path'
  }
  return null
}

function toInt(v) {
  if (v === null || v === undefined || v === '') return undefined
  const n = Number(v)
  if (!Number.isInteger(n)) return NaN
  return n
}

function toDecimalString(v) {
  if (v === null || v === undefined || v === '') return undefined
  const s = String(v).trim()
  if (!s) return undefined
  if (Number.isNaN(Number(s))) return NaN
  return s
}

async function listVariants(req, res) {
  const productId = Number(req.params.productId)
  if (!Number.isInteger(productId) || productId < 1) return jsonError(res, 400, 'Invalid productId', [])

  const variants = await prisma.product_variants.findMany({
    where: { product_id: productId },
    orderBy: { created_at: 'desc' },
    select: {
      variant_id: true,
      product_id: true,
      sku: true,
      color_name: true,
      color_hex: true,
      size: true,
      price_adjustment: true,
      stock_quantity: true,
      low_stock_alert: true,
      images: true,
      tryon_images: true,
      variant_prescriptions: {        // ← ADD THIS
        orderBy: { id: 'asc' },
        select: {
          id: true,
          sph: true,
          cyl: true,
          axis: true,
          bc: true,
          dia: true,
          stock_quantity: true,
        }
      },
      prescription_data: true,
      created_at: true,
      updated_at: true,
    }
  })

  return res.json({
    success: true,
    message: null,
    data: variants.map(v => ({
      ...v,
      variant_id: v.variant_id.toString(),
      product_id: v.product_id.toString(),
      price_adjustment: v.price_adjustment?.toString?.() ?? v.price_adjustment,
    }))
  })
}

async function createVariant(req, res) {
  const productId = Number(req.params.productId)
  if (!Number.isInteger(productId) || productId < 1) return jsonError(res, 400, 'Invalid productId', [])

  const {
    sku, color_name, color_hex, size, price_adjustment,
    stock_quantity, low_stock_alert, images, tryon_images, prescription_data,
  } = req.body || {}

  if (!sku || typeof sku !== 'string' || !sku.trim()) {
    return jsonError(res, 400, 'sku is required', [])
  }

  const stock = toInt(stock_quantity)
  if (stock !== undefined && (Number.isNaN(stock) || stock < 0)) {
    return jsonError(res, 400, 'stock_quantity must be an integer >= 0', [])
  }

  const low = toInt(low_stock_alert)
  if (low !== undefined && (Number.isNaN(low) || low < 0)) {
    return jsonError(res, 400, 'low_stock_alert must be an integer >= 0', [])
  }

  const pa = toDecimalString(price_adjustment)
  if (pa !== undefined && Number.isNaN(pa)) {
    return jsonError(res, 400, 'price_adjustment must be numeric', [])
  }

  const imgErr = validateImages(images)
  if (imgErr) return jsonError(res, 400, imgErr, [])

  const tryOnErr = validateImages(tryon_images)
  if (tryOnErr) return jsonError(res, 400, tryOnErr, [])

  const product = await prisma.products.findUnique({ where: { product_id: productId }, select: { product_id: true } })
  if (!product) return jsonError(res, 404, 'Product not found', [])

  try {
    const created = await prisma.product_variants.create({
      data: {
        product_id: productId,
        sku: sku.trim(),
        color_name: color_name ?? null,
        color_hex: color_hex ?? null,
        size: size ?? null,
        price_adjustment: pa,
        stock_quantity: stock ?? 0,
        low_stock_alert: low ?? 5,
        images: images ?? [],
        tryon_images: tryon_images ?? [],
        prescription_data: prescription_data ?? null,
      },
      select: {
        variant_id: true,
        product_id: true,
        sku: true,
        color_name: true,
        color_hex: true,
        size: true,
        price_adjustment: true,
        stock_quantity: true,
        low_stock_alert: true,
        images: true,
        tryon_images: true,
        prescription_data: true,
        created_at: true,
        updated_at: true,
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Variant created successfully',
      data: {
        ...created,
        variant_id: created.variant_id.toString(),
        product_id: created.product_id.toString(),
        price_adjustment: created.price_adjustment?.toString?.() ?? created.price_adjustment,
      }
    })
  } catch (e) {
    if (e?.code === 'P2002') {
      return jsonError(res, 409, 'SKU already exists', [])
    }
    return jsonError(res, 500, 'Failed to create variant', [e.message])
  }
}

async function updateVariant(req, res) {
  const variantId = Number(req.params.variantId)
  if (!Number.isInteger(variantId) || variantId < 1) return jsonError(res, 400, 'Invalid variantId', [])

  const {
    sku, color_name, color_hex, size, price_adjustment,
    stock_quantity, low_stock_alert, images, tryon_images, prescription_data,
  } = req.body || {}

  if (sku !== undefined) {
    if (typeof sku !== 'string' || !sku.trim()) return jsonError(res, 400, 'sku cannot be empty', [])
  }

  const stock = toInt(stock_quantity)
  if (stock_quantity !== undefined && (Number.isNaN(stock) || stock < 0)) {
    return jsonError(res, 400, 'stock_quantity must be an integer >= 0', [])
  }

  const low = toInt(low_stock_alert)
  if (low_stock_alert !== undefined && (Number.isNaN(low) || low < 0)) {
    return jsonError(res, 400, 'low_stock_alert must be an integer >= 0', [])
  }

  const pa = toDecimalString(price_adjustment)
  if (price_adjustment !== undefined && pa !== undefined && Number.isNaN(pa)) {
    return jsonError(res, 400, 'price_adjustment must be numeric', [])
  }

  const imgErr = validateImages(images)
  if (imgErr) return jsonError(res, 400, imgErr, [])

  const tryOnErr = validateImages(tryon_images)
  if (tryOnErr) return jsonError(res, 400, tryOnErr, [])

  const existing = await prisma.product_variants.findUnique({ where: { variant_id: variantId }, select: { variant_id: true, product_id: true } })
  if (!existing) return jsonError(res, 404, 'Variant not found', [])

  try {
    const updated = await prisma.product_variants.update({
      where: { variant_id: variantId },
      data: {
        ...(sku !== undefined ? { sku: sku.trim() } : {}),
        ...(color_name !== undefined ? { color_name: color_name || null } : {}),
        ...(color_hex !== undefined ? { color_hex: color_hex || null } : {}),
        ...(size !== undefined ? { size: size || null } : {}),
        ...(price_adjustment !== undefined ? { price_adjustment: pa } : {}),
        ...(stock_quantity !== undefined ? { stock_quantity: stock } : {}),
        ...(low_stock_alert !== undefined ? { low_stock_alert: low } : {}),
        ...(images !== undefined ? { images } : {}),
        ...(tryon_images !== undefined ? { tryon_images } : {}),
        ...(prescription_data !== undefined ? { prescription_data } : {}),
      },
      select: {
        variant_id: true,
        product_id: true,
        sku: true,
        color_name: true,
        color_hex: true,
        size: true,
        price_adjustment: true,
        stock_quantity: true,
        low_stock_alert: true,
        images: true,
        tryon_images: true,
        prescription_data: true,
        created_at: true,
        updated_at: true,
      }
    })

    return res.json({
      success: true,
      message: 'Variant updated successfully',
      data: {
        ...updated,
        variant_id: updated.variant_id.toString(),
        product_id: updated.product_id.toString(),
        price_adjustment: updated.price_adjustment?.toString?.() ?? updated.price_adjustment,
      }
    })
  } catch (e) {
    if (e?.code === 'P2002') {
      return jsonError(res, 409, 'SKU already exists', [])
    }
    return jsonError(res, 500, 'Failed to update variant', [e.message])
  }
}

async function deleteVariant(req, res) {
  const variantId = Number(req.params.variantId)
  if (!Number.isInteger(variantId) || variantId < 1) return jsonError(res, 400, 'Invalid variantId', [])

  const existing = await prisma.product_variants.findUnique({ where: { variant_id: variantId }, select: { variant_id: true } })
  if (!existing) return jsonError(res, 404, 'Variant not found', [])

  await prisma.product_variants.delete({ where: { variant_id: variantId } })

  return res.json({
    success: true,
    message: 'Variant deleted successfully',
    data: { deleted: true }
  })
}

module.exports = { listVariants, createVariant, updateVariant, deleteVariant }