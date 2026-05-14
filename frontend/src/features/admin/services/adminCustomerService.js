import { adminApiClient } from './adminApiClient'

export const adminCustomerService = {
  async list({ page = 1, limit = 20, search = '', is_active } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    if (is_active !== undefined) params.set('is_active', String(is_active))
    return adminApiClient.get(`/admin/users?${params.toString()}`)
  },

  async toggleStatus({ userId }) {
    return adminApiClient.patch(`/admin/users/${userId}/toggle-status`)
  },

  async delete({ userId }) {
    return adminApiClient.delete(`/admin/users/${userId}`)
  },
}

