const request = require('supertest')
const jwt = require('jsonwebtoken')

function createAdminToken({ role }) {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
  return jwt.sign(
    { adminId: '1', email: 'admin-test@velore.local', role, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  )
}

describe('Admin product media + variants security', () => {
  // eslint-disable-next-line global-require
  const app = require('../../src/app')

  it('rejects upload without admin token', async () => {
    const res = await request(app)
      .post('/api/v1/admin/uploads/product-images')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ success: false })
  })

  it('rejects variant list without admin token', async () => {
    const res = await request(app)
      .get('/api/v1/admin/products/1/variants')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ success: false })
  })

  it('rejects variant create without admin token', async () => {
    const res = await request(app)
      .post('/api/v1/admin/products/1/variants')
      .send({ sku: 'TEST-SKU-1', stock_quantity: 1 })

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ success: false })
  })

  it('variant create rejects negative stock (even if DB not available)', async () => {
    const token = createAdminToken({ role: 'staff_admin' })
    const res = await request(app)
      .post('/api/v1/admin/products/1/variants')
      .set('Authorization', `Bearer ${token}`)
      .send({ sku: 'TEST-SKU-NEG', stock_quantity: -1 })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false })
  })

  it('variant create rejects external image URLs (even if DB not available)', async () => {
    const token = createAdminToken({ role: 'staff_admin' })
    const res = await request(app)
      .post('/api/v1/admin/products/1/variants')
      .set('Authorization', `Bearer ${token}`)
      .send({ sku: 'TEST-SKU-IMG', images: ['https://evil.example/x.png'] })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false })
  })

  it('variant update rejects invalid image paths (even if DB not available)', async () => {
    const token = createAdminToken({ role: 'staff_admin' })
    const res = await request(app)
      .patch('/api/v1/admin/variants/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ images: ['http://evil.example/x.png'] })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false })
  })

  it('staff_admin cannot delete variant (super admin only)', async () => {
    const token = createAdminToken({ role: 'staff_admin' })
    const res = await request(app)
      .delete('/api/v1/admin/variants/1')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ success: false })
  })

  it('public product list still responds (200 or 500 if DB not ready)', async () => {
    const res = await request(app).get('/api/v1/products')
    expect([200, 500]).toContain(res.status)
    expect(typeof res.body.success).toBe('boolean')
  })
})

