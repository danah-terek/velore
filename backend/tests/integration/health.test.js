const request = require('supertest')
const app = require('../../src/app')

describe('GET /health', () => {
  it('returns service status', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      message: 'Backend is running',
      data: {
        timestamp: expect.any(String)
      }
    })
  })
})

