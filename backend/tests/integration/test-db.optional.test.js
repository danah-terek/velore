const request = require('supertest')
const app = require('../../src/app')

const describeIf = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip

describeIf('DB-backed smoke tests (requires Docker DB running)', () => {
  it('GET /api/v1/test-db returns success true', async () => {
    const res = await request(app).get('/api/v1/test-db')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe('Database connected!')
    expect(res.body.data).toEqual({
      users: expect.any(Number),
      roles: expect.any(Number)
    })
  })
})

