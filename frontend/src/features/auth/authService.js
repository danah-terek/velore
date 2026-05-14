import apiClient from '../../shared/services/apiClient'
import cartService from '../cart/cartService'

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
    const result = await apiClient.post('/auth/login', data)
    if (!result?.success) {
      throw new Error(result?.message || 'Login failed')
    }

    localStorage.setItem('token', result.data.token)
    localStorage.setItem('user', JSON.stringify(result.data.user))

    // Merge guest cart into API cart
    await mergeGuestCart()

    // ✅ Reload the page so FavoritesContext re-mounts and loads from API
    window.location.href = '/'
    
    return result
  },

  register: async (data) => {
    clearStorage()
    const result = await apiClient.post('/auth/register', data)
    if (!result?.success) {
      throw new Error(result?.message || 'Registration failed')
    }
    return result
  },

  logout: () => {
    clearStorage()
    window.location.href = '/login'
  },

  getProfile: () => apiClient.get('/auth/profile'),
}

export default authService