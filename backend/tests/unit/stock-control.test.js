jest.mock('../../src/shared/utils/database', () => {
  const prisma = {
    carts: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cart_items: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    product_variants: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    addresses: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    orders: {
      create: jest.fn(),
    },
    payments: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  }
  return prisma
})

const prisma = require('../../src/shared/utils/database')
const cartService = require('../../src/features/cart/cart.service')
const orderService = require('../../src/features/orders/order.service')

describe('Stock control (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('cartService.addItem', () => {
    it('rejects when cumulative quantity exceeds stock', async () => {
      prisma.carts.findUnique.mockResolvedValue({ carts_id: 10 })
      prisma.cart_items.findFirst.mockResolvedValue({ cart_item_id: 55, quantity: 3 })

      prisma.product_variants.findUnique.mockResolvedValue({
        variant_id: 99,
        product_id: 1,
        stock_quantity: 5,
        products: { name: 'Velore Frame' },
      })

      await expect(
        cartService.addItem(1, { product_id: 1, variant_id: 99, quantity: 3 })
      ).rejects.toThrow('Only 5 units available for Velore Frame.')
    })
  })

  describe('cartService.updateQuantity', () => {
    it('rejects when new quantity exceeds stock', async () => {
      prisma.cart_items.findFirst.mockResolvedValue({
        cart_item_id: 55,
        carts: { user_id: 1 },
        product_id: 1,
        variant_id: 99,
        quantity: 1,
        products: { name: 'Velore Frame' },
        product_variants: { variant_id: 99, stock_quantity: 5 },
      })

      prisma.product_variants.findUnique.mockResolvedValue({
        variant_id: 99,
        product_id: 1,
        stock_quantity: 5,
        products: { name: 'Velore Frame' },
      })

      await expect(
        cartService.updateQuantity(1, { cart_item_id: 55, quantity: 6 })
      ).rejects.toThrow('Only 5 units available for Velore Frame.')
    })
  })

  describe('orderService.createOrder', () => {
    it('rejects checkout when requested quantity exceeds stock (guest)', async () => {
      prisma.users.findUnique.mockResolvedValue({ user_id: 999 })
      prisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          product_variants: {
            findMany: jest.fn().mockResolvedValue([
              {
                variant_id: 123,
                stock_quantity: 5,
                price_adjustment: 0,
                products: { name: 'Velore Frame', price: 100 },
              },
            ]),
          },
        }
        return fn(tx)
      })

      await expect(
        orderService.createOrder(null, {
          payment_method: 'cod',
          address: { address: 'x', city: 'y', postalCode: 'z', country: 'Lebanon' },
          guestItems: [{ product_id: 1, quantity: 6 }],
        })
      ).rejects.toThrow('Only 5 units available for Velore Frame.')
    })

    it('deducts stock exactly once when order is created (guest)', async () => {
      prisma.users.findUnique.mockResolvedValue({ user_id: 999 })
      let txRef = null
      prisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          product_variants: {
            findMany: jest.fn().mockResolvedValue([
              {
                variant_id: 123,
                stock_quantity: 5,
                price_adjustment: 0,
                products: { name: 'Velore Frame', price: 100 },
              },
            ]),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          addresses: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ address_id: 77 }),
          },
          orders: {
            create: jest.fn().mockResolvedValue({
              order_id: 500,
              orders_items: [],
            }),
          },
          payments: {
            create: jest.fn().mockResolvedValue({ payment_id: 1 }),
          },
          cart_items: {
            deleteMany: jest.fn(),
          },
        }
        txRef = tx
        return fn(tx)
      })

      await orderService.createOrder(null, {
        payment_method: 'cod',
        address: { address: 'x', city: 'y', postalCode: 'z', country: 'Lebanon' },
        guestItems: [{ product_id: 1, quantity: 2 }],
      })

      // transaction was used
      expect(prisma.$transaction).toHaveBeenCalledTimes(1)
      expect(txRef.product_variants.updateMany).toHaveBeenCalledTimes(1)
      expect(txRef.orders.create).toHaveBeenCalledTimes(1)
      expect(txRef.payments.create).toHaveBeenCalledTimes(1)
    })

    it('prevents negative stock via guarded decrement', async () => {
      prisma.users.findUnique.mockResolvedValue({ user_id: 999 })
      prisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          product_variants: {
            findMany: jest.fn().mockResolvedValue([
              {
                variant_id: 123,
                stock_quantity: 1,
                price_adjustment: 0,
                products: { name: 'Velore Frame', price: 100 },
              },
            ]),
            updateMany: jest.fn().mockResolvedValue({ count: 0 }),
            findUnique: jest.fn().mockResolvedValue({ stock_quantity: 1, products: { name: 'Velore Frame' } }),
          },
          addresses: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ address_id: 77 }),
          },
        }
        return fn(tx)
      })

      await expect(
        orderService.createOrder(null, {
          payment_method: 'cod',
          address: { address: 'x', city: 'y', postalCode: 'z', country: 'Lebanon' },
          guestItems: [{ product_id: 1, quantity: 2 }],
        })
      ).rejects.toThrow('Only 1 units available for Velore Frame.')
    })
  })
})

