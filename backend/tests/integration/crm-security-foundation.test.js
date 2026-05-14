const request = require('supertest')
const jwt = require('jsonwebtoken')

function createAdminToken({ role }) {
  return jwt.sign(
    {
      adminId: '1',
      email: 'admin-test@velore.local',
      role,
      isAdmin: true
    },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  )
}

describe('CRM backend security foundation', () => {
  beforeAll(() => {
    // Ensure tokens can be created/verified in test env.
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
  })

  // Require app AFTER JWT_SECRET is set.
  // eslint-disable-next-line global-require
  const app = require('../../src/app')

  it('rejects product create without token', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ name: 'X', price: '10', category_id: 1, brand_id: 1 })
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ success: false })
  })

  it('rejects category create without token', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'New Category' })
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ success: false })
  })

  it('rejects brand create without token', async () => {
    const res = await request(app)
      .post('/api/v1/brands')
      .send({ name: 'New Brand' })
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ success: false })
  })

  it('rejects review delete without token', async () => {
    const res = await request(app).delete('/api/v1/reviews/1')
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ success: false })
  })

  it('prevents staff_admin from accessing staff management', async () => {
    const token = createAdminToken({ role: 'staff_admin' })
    const res = await request(app)
      .get('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ success: false })
  })

  it('prevents staff_admin from accessing analytics', async () => {
    const token = createAdminToken({ role: 'staff_admin' })
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ success: false })
  })

  it('allows super_admin to access analytics (may 200 or 500 if DB unavailable)', async () => {
    const token = createAdminToken({ role: 'super_admin' })
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${token}`)

    expect([200, 500]).toContain(res.status)
    // Must not be rejected by auth/RBAC if token is valid.
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
  })
})

