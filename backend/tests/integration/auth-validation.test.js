const request = require('supertest')
const app = require('../../src/app')

describe('Auth validation', () => {
  it('POST /api/v1/auth/register returns 400 on invalid body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'short', name: '' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Validation error')
    expect(Array.isArray(res.body.errors)).toBe(true)
  })

  it('POST /api/v1/auth/login returns 400 on missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@velore.local' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Validation error')
    expect(Array.isArray(res.body.errors)).toBe(true)
  })
})

