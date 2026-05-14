const request = require('supertest')
const app = require('../../src/app')

describe('Payments not configured', () => {
  it('returns 501 when STRIPE_SECRET_KEY is missing', async () => {
    const previous = process.env.STRIPE_SECRET_KEY
    delete process.env.STRIPE_SECRET_KEY

    const res = await request(app)
      .post('/api/v1/payments/create-intent')
      .send({ amount: 10, currency: 'usd' })

    if (previous) process.env.STRIPE_SECRET_KEY = previous

    expect(res.status).toBe(501)
    expect(res.body).toEqual({
      success: false,
      message: 'Card payments are not configured yet.',
      errors: []
    })
  })
})

