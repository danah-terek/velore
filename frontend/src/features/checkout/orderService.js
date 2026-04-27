import apiClient from '../../shared/services/apiClient'

const orderService = {
  checkout: (data) => apiClient.post('/orders/checkout', data),
  getOrders: () => apiClient.get('/orders'),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
}

export default orderService