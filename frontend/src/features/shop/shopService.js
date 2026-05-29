import apiClient from '../../shared/services/apiClient'

const shopService = {
  getProducts: (params) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  getCategories: () => apiClient.get('/categories'),
  getBrands: (params) => apiClient.get('/brands', { params }),
}

export default shopService