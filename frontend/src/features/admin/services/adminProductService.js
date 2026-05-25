import { adminApiClient } from './adminApiClient'

export const adminProductService = {
  // Admin list (minimal fields)
  async list({ page = 1, limit = 20, search = '', is_active } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    if (is_active !== undefined) params.set('is_active', String(is_active))
    return adminApiClient.get(`/admin/products?${params.toString()}`)
  },

  // Public product detail (legacy; kept for compatibility)
  async get(productId) {
    return adminApiClient.get(`/products/${productId}`)
  },

  // Admin product detail (preferred; includes variants/images/stock)
  async getAdminProduct(productId) {
    return adminApiClient.get(`/admin/products/${productId}`)
  },

  async create(payload) {
    return adminApiClient.post('/products', payload)
  },

  async update(productId, payload) {
    return adminApiClient.patch(`/products/${productId}`, payload)
  },

  async delete(productId) {
    return adminApiClient.delete(`/products/${productId}`)
  },

  async listCategories() {
    return adminApiClient.get('/categories')
  },

  async listBrands() {
    return adminApiClient.get('/brands')
  },

  async createBrand(name) {
    return adminApiClient.post('/brands', { name })
  },

  async uploadProductImages(files) {
    const form = new FormData()
    for (const f of Array.from(files || [])) form.append('files', f)
    return adminApiClient.post('/admin/uploads/product-images', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async listProductVariants(productId) {
    return adminApiClient.get(`/admin/products/${productId}/variants`)
  },

  async createProductVariant(productId, payload) {
    return adminApiClient.post(`/admin/products/${productId}/variants`, payload)
  },

  async updateProductVariant(variantId, payload) {
    return adminApiClient.patch(`/admin/variants/${variantId}`, payload)
  },

  async deleteProductVariant(variantId) {
    return adminApiClient.delete(`/admin/variants/${variantId}`)
  },
}