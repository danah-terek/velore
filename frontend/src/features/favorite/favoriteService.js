import apiClient from '../../shared/services/apiClient'

const favoriteService = {
  getFavorites: () => apiClient.get('/favorites'),
  addFavorite: (productId) => apiClient.post(`/favorites/${productId}`),
  removeFavorite: (productId) => apiClient.delete(`/favorites/${productId}`),
}

export default favoriteService