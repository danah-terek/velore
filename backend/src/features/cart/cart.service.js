const prisma = require('../../shared/utils/database')

async function resolveVariantForProduct({ productIdNum, variantIdNum }) {
  if (variantIdNum) {
    const v = await prisma.product_variants.findUnique({
      where: { variant_id: Number(variantIdNum) },
      select: {
        variant_id: true,
        product_id: true,
        sku: true,
        stock_quantity: true,
        low_stock_alert: true,
        images: true,
        products: { select: { name: true } },
      },
    })
    if (!v || Number(v.product_id) !== Number(productIdNum)) {
      throw new Error('Invalid product variant.')
    }
    return v
  }

  // No variant provided → choose a default variant for this product (limitation)
  const v = await prisma.product_variants.findFirst({
    where: { product_id: Number(productIdNum) },
    orderBy: { created_at: 'asc' },
    select: {
      variant_id: true,
      product_id: true,
      sku: true,
      stock_quantity: true,
      low_stock_alert: true,
      images: true,
      products: { select: { name: true } },
    },
  })
  if (!v) {
    // Product exists with no variants (possible) → treat as unlimited? No. Safe default is reject.
    throw new Error('This product is not purchasable yet (no variants).')
  }
  return v
}

function formatStockError({ available, productName }) {
  const a = Number(available || 0)
  return `Only ${a} units available for ${productName || 'this product'}.`
}

const cartService = {
  async getCart(userId) {
    const userIdNum = Number(userId)

    let cart = await prisma.carts.findUnique({
      where: { user_id: userIdNum },
      include: {
        cart_items: {
          include: {
            products: {
              select: {
                product_id: true,
                name: true,
                price: true,
              }
            },
            product_variants: {
              select: {
                variant_id: true,
                sku: true,
                stock_quantity: true,
                low_stock_alert: true,
                images: true,
                price_adjustment: true,
              }
            }
          }
        }
      }
    })

    if (!cart) {
      cart = await prisma.carts.create({
        data: { user_id: userIdNum },
        include: {
          cart_items: {
            include: {
              products: {
                select: {
                  product_id: true,
                  name: true,
                  price: true,
                }
              },
              product_variants: {
                select: {
                  variant_id: true,
                  sku: true,
                  stock_quantity: true,
                  low_stock_alert: true,
                  images: true,
                  price_adjustment: true,
                }
              }
            }
          }
        }
      })
    }

    // Fetch prescription stock for items that have a prescription_id
    const itemsWithPrescription = cart.cart_items.filter(item => item.prescription_id);
    let prescriptionStocks = {};
    if (itemsWithPrescription.length > 0) {
      const prescriptionIds = itemsWithPrescription.map(item => item.prescription_id);
      const prescriptions = await prisma.variant_prescriptions.findMany({
        where: { id: { in: prescriptionIds } },
        select: { id: true, stock_quantity: true }
      });
      prescriptions.forEach(p => { prescriptionStocks[p.id] = p.stock_quantity; });
    }

    const cartItems = (cart.cart_items || []).map((item) => {
      const prescriptionId = item.prescription_id;
      const available = prescriptionId
        ? (prescriptionStocks[prescriptionId] ?? 0)
        : (item.product_variants?.stock_quantity ?? null);
      return {
        ...item,
        available_stock: available,
        sku: item.product_variants?.sku || null,
        images: item.product_variants?.images || [],
      }
    })

    const total = cart.cart_items.reduce((sum, item) => {
      const price = item.product_variants
        ? parseFloat(item.products.price) + parseFloat(item.product_variants.price_adjustment || 0)
        : parseFloat(item.products.price)
      return sum + (price * item.quantity)
    }, 0)

    return { ...cart, cart_items: cartItems, total: total.toFixed(2) }
  },

  async addItem(userId, { productId, product_id, variantId, variant_id, quantity = 1, prescriptionData, prescriptionId }) {
    console.log('Backend received prescriptionId:', prescriptionId)
    const productIdNum = Number(product_id || productId)
    const variantIdNum = variant_id || variantId ? Number(variant_id || variantId) : null
    const userIdNum = Number(userId)
    const qtyNum = Number(quantity || 1)
    const prescriptionIdNum = prescriptionId ? Number(prescriptionId) : null  // ← ADD THIS

    if (!productIdNum) {
      throw new Error('Product ID is required')
    }
    if (!Number.isInteger(qtyNum) || qtyNum < 1) {
      throw new Error('Quantity must be at least 1.')
    }

    let cart = await prisma.carts.findUnique({
      where: { user_id: userIdNum }
    })

    if (!cart) {
      cart = await prisma.carts.create({
        data: { user_id: userIdNum }
      })
    }

    const existingWhere = {
      cart_id: cart.carts_id,
      product_id: productIdNum,
    }

    // Resolve a variant for stock enforcement
    const resolvedVariant = await resolveVariantForProduct({ productIdNum, variantIdNum })
    existingWhere.variant_id = resolvedVariant.variant_id

    // ✅ CHECK PRESCRIPTION STOCK IF PRESCRIPTION ID PROVIDED
    let availableStock = Number(resolvedVariant.stock_quantity || 0)
    let prescriptionDataToSave = prescriptionData || null

    if (prescriptionIdNum) {
      const prescription = await prisma.variant_prescriptions.findUnique({
        where: { id: prescriptionIdNum }
      })
      if (!prescription) {
        throw new Error('Prescription not found')
      }
      availableStock = Number(prescription.stock_quantity || 0)
      prescriptionDataToSave = {
        sph: prescription.sph,
        cyl: prescription.cyl,
        axis: prescription.axis,
        bc: prescription.bc,
        dia: prescription.dia,
      }
    }

    // Check for existing item with same variant AND prescription
    const existingWhereWithPrescription = {
      ...existingWhere,
      prescription_id: prescriptionIdNum || null
    }

    const existing = await prisma.cart_items.findFirst({
      where: existingWhereWithPrescription
    })

    const existingQty = existing?.quantity ? Number(existing.quantity) : 0
    const totalRequested = existingQty + qtyNum
    if (totalRequested > availableStock) {
      throw new Error(formatStockError({ available: availableStock, productName: resolvedVariant.products?.name }))
    }

    if (existing) {
      return prisma.cart_items.update({
        where: { cart_item_id: existing.cart_item_id },
        data: {
          quantity: existing.quantity + qtyNum,
          prescription_data: prescriptionDataToSave
        }
      })
    }

    return prisma.cart_items.create({
      data: {
        cart_id: cart.carts_id,
        product_id: productIdNum,
        variant_id: resolvedVariant.variant_id,
        quantity: qtyNum,
        prescription_id: prescriptionIdNum || null,  // ← SAVE PRESCRIPTION ID
        prescription_data: prescriptionDataToSave
      }
    })
  },

  async updateQuantity(userId, { cart_item_id, quantity }) {
    const userIdNum = Number(userId)
    const cartItemIdNum = Number(cart_item_id)
    const quantityNum = Number(quantity)

    // Verify this cart_item belongs to this user
    const item = await prisma.cart_items.findFirst({
      where: {
        cart_item_id: cartItemIdNum,
        carts: { user_id: userIdNum }
      },
      include: {
        carts: true,
        products: { select: { name: true } },
        product_variants: { select: { variant_id: true, stock_quantity: true } }
      }
    })

    if (!item) throw new Error('Item not found in cart')
    if (!Number.isInteger(quantityNum) || quantityNum < 1) throw new Error('Quantity must be at least 1.')

    // Resolve variant (should exist because we enforce it on add)
    const variantIdNum = item.variant_id ? Number(item.variant_id) : null
    const productIdNum = Number(item.product_id)
    const resolvedVariant = await resolveVariantForProduct({ productIdNum, variantIdNum })
    const available = Number(resolvedVariant.stock_quantity || 0)
    if (quantityNum > available) {
      throw new Error(formatStockError({ available, productName: resolvedVariant.products?.name }))
    }

    return prisma.cart_items.update({
      where: { cart_item_id: cartItemIdNum },
      data: { quantity: quantityNum }
    })
  },

  async removeItem(userId, cartItemId) {
    const userIdNum = Number(userId)
    const cartItemIdNum = Number(cartItemId)

    const item = await prisma.cart_items.findFirst({
      where: {
        cart_item_id: cartItemIdNum,
        carts: { user_id: userIdNum }
      }
    })

    if (!item) throw new Error('Item not found in cart')

    return prisma.cart_items.delete({
      where: { cart_item_id: cartItemIdNum }
    })
  },

  async clearCart(userId) {
    const userIdNum = Number(userId)

    const cart = await prisma.carts.findUnique({
      where: { user_id: userIdNum }
    })

    if (!cart) {
      return { message: 'Cart already empty' }
    }

    return prisma.cart_items.deleteMany({
      where: { cart_id: cart.carts_id }
    })
  }
}

module.exports = cartService