const request = require('supertest')
const app = require('../../src/app')

describe('GET /api/v1/products', () => {
  it('responds without crashing (even if DB not ready)', async () => {
    const res = await request(app).get('/api/v1/products')

    expect([200, 500]).toContain(res.status)
    expect(res.headers['content-type']).toMatch(/application\/json/i)
    expect(typeof res.body.success).toBe('boolean')
    expect(typeof res.body.message === 'string' || res.body.message === null).toBe(true)
  })
})

