import apiClient from '../../shared/services/apiClient'
import cartService from '../cart/cartService'
import favoriteService from '../favorite/favoriteService'

const clearStorage = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('guestCart')
  localStorage.removeItem('guestFavorites')
}

const mergeGuestCart = async () => {
  const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
  if (guestCart.length > 0) {
    for (const item of guestCart) {
      try {
        await cartService.addItem({
          productId: Number(item.productId),
          quantity: item.quantity || 1
        })
      } catch (err) {
        console.error('Failed to merge guest cart item:', item, err)
      }
    }
    localStorage.removeItem('guestCart')
  }
}

const authService = {
  login: async (data) => {
    clearStorage()
    const response = await apiClient.post('/auth/login', data)

    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    // Merge guest cart into API cart
    await mergeGuestCart()

    // ✅ Reload the page so FavoritesContext re-mounts and loads from API
    window.location.href = '/'
    
    return response
  },

  register: async (data) => {
    clearStorage()
    const response = await apiClient.post('/auth/register', data)
    return response
  },

  logout: () => {
    clearStorage()
    window.location.href = '/login'
  },

  getProfile: () => apiClient.get('/auth/profile'),
}

export default authService