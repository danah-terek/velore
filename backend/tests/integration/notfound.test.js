const request = require('supertest')
const app = require('../../src/app')

describe('404 handler', () => {
  it('returns consistent JSON shape for unknown routes', async () => {
    const res = await request(app).get('/__does_not_exist__')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      message: 'Route not found',
      errors: []
    })
  })
})

