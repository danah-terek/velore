import apiClient from '../../shared/services/apiClient'

const shopService = {
  getProducts: (params) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  getCategories: () => apiClient.get('/categories'),
  getBrands: () => apiClient.get('/brands'),
}

export default shopService