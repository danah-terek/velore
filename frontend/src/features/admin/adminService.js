import apiClient from "../../shared/services/apiClient"
const adminService = {

  // ─── Auth ──────────────────────────────────────────────────────────────────

  login: (email, password) =>
    apiClient.post('/admin/login', { email, password }),

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  getDashboard: () =>
    apiClient.get('/admin/dashboard'),

  // ─── Users ─────────────────────────────────────────────────────────────────

  getUsers: ({ page = 1, limit = 20, search = '', is_active } = {}) => {
    const params = new URLSearchParams({ page, limit })
    if (search)      params.set('search', search)
    if (is_active !== undefined) params.set('is_active', is_active)
    return apiClient.get(`/admin/users?${params}`)
  },

  getUser: (userId) =>
    apiClient.get(`/admin/users/${userId}`),

  toggleUserStatus: (userId) =>
    apiClient.patch(`/admin/users/${userId}/toggle-status`),

  deleteUser: (userId) =>
    apiClient.delete(`/admin/users/${userId}`),

  // ─── Products ──────────────────────────────────────────────────────────────

  getProducts: ({ page = 1, limit = 20, search = '', is_active } = {}) => {
    const params = new URLSearchParams({ page, limit })
    if (search)      params.set('search', search)
    if (is_active !== undefined) params.set('is_active', is_active)
    return apiClient.get(`/admin/products?${params}`)
  },

  toggleProductStatus: (productId) =>
    apiClient.patch(`/admin/products/${productId}/toggle-status`),

  deleteProduct: (productId) =>
    apiClient.delete(`/admin/products/${productId}`),

  // ─── Orders ────────────────────────────────────────────────────────────────

  getOrders: ({ page = 1, limit = 20, status } = {}) => {
    const params = new URLSearchParams({ page, limit })
    if (status) params.set('status', status)
    return apiClient.get(`/admin/orders?${params}`)
  },

  updateOrderStatus: (orderId, status) =>
    apiClient.patch(`/admin/orders/${orderId}/status`, { status }),

  // ─── Audit Logs ────────────────────────────────────────────────────────────

  getAuditLogs: ({ page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams({ page, limit })
    return apiClient.get(`/admin/audit-logs?${params}`)
  },
}

export default adminService