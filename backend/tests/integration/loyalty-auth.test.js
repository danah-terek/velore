const request = require('supertest')
const app = require('../../src/app')

describe('Loyalty security', () => {
  it('GET /api/v1/loyalty/points without token returns 401', async () => {
    const res = await request(app).get('/api/v1/loyalty/points')
    expect([401, 403]).toContain(res.status)
    expect(res.body).toMatchObject({ success: false })
    expect(typeof res.body.message).toBe('string')
    expect(Array.isArray(res.body.errors)).toBe(true)
  })

  it('POST /api/v1/loyalty/award without token returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/loyalty/award')
      .send({ userId: '1', orderId: '1' })

    expect([401, 403]).toContain(res.status)
    expect(res.body).toMatchObject({ success: false })
    expect(typeof res.body.message).toBe('string')
    expect(Array.isArray(res.body.errors)).toBe(true)
  })
})

