import apiClient from '../../shared/services/apiClient'

const cartService = {
  getCart: () => apiClient.get('/cart'),
  addItem: (data) => apiClient.post('/cart/add', data),
  updateQuantity: (data) => apiClient.put('/cart/update', data),
  
  // Change 'variantId' to 'cartItemId' to ensure you target the database primary key record
  removeItem: (cartItemId) => apiClient.delete(`/cart/remove/${cartItemId}`),
  
  clearCart: () => apiClient.delete('/cart/clear'),
  getRecommended: (excludeIds = []) =>
    apiClient.get('/products/recommended', {
      params: { exclude: excludeIds.join(','), limit: 6 },
    }),
}

export default cartService