import { adminApiClient } from './adminApiClient'

export const adminOrderService = {
  async list({ page = 1, limit = 20, status } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) params.set('status', status)
    return adminApiClient.get(`/admin/orders?${params.toString()}`)
  },

  async updateStatus({ orderId, status }) {
    return adminApiClient.patch(`/admin/orders/${orderId}/status`, { status })
  },
    async getById(orderId) {
    return adminApiClient.get(`/admin/orders/${orderId}`)
  },



}

