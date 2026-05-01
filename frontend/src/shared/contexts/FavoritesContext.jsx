import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import favoriteService from '../../features/favorite/favoriteService'

const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  const [toast, setToast] = useState(null)

  // ✅ Load favorites on mount and when reload is called
  const loadFavorites = useCallback(async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    
    if (token) {
      // ✅ Logged in: ONLY from API
      try {
        const response = await favoriteService.getFavorites()
        if (Array.isArray(response?.data)) {
          setFavorites(response.data.map(item => ({
            id: item.product?.id || item.product_id,
            product_id: item.product?.id || item.product_id,
            name: item.product?.name,
            price: item.product?.price,
            image: item.product?.variants?.[0]?.images?.[0] || '',
            description: item.product?.description,
            colors: item.product?.variants?.map(v => v.color_hex).filter(Boolean) || []
          })))
        } else {
          setFavorites([])
        }
      } catch (error) {
        console.error('Failed to load favorites:', error)
        setFavorites([])
      }
    } else {
      // ✅ Guest: ONLY from localStorage
      const guestFavorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
      setFavorites(guestFavorites)
    }
  }, [])

  // ✅ Load on mount
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // ✅ Reload function - call this after login/logout
  const reloadFavorites = () => {
    loadFavorites()
  }

  const loadGuestFavorites = () => {
    const guestFavorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
    setFavorites(guestFavorites)
  }

  const toggleFavorite = async (product) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const exists = favorites.find(f => String(f.id) === String(product.id))
    
    if (token) {
      try {
        if (exists) {
          await favoriteService.removeFavorite(product.id)
        } else {
          await favoriteService.addFavorite(product.id)
        }
        await loadFavorites()
        showToast(exists ? 'Removed from favorites' : 'Added to favorites!')
      } catch (error) {
        console.error('Favorite toggle failed:', error)
      }
    } else {
      let guestFavorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
      
      if (exists) {
        guestFavorites = guestFavorites.filter(f => String(f.id) !== String(product.id))
        showToast('Removed from favorites')
      } else {
        guestFavorites.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '',
          description: product.description || '',
          colors: product.colors || []
        })
        showToast('Added to favorites!')
      }
      
      localStorage.setItem('guestFavorites', JSON.stringify(guestFavorites))
      setFavorites(guestFavorites)
    }
  }

  const isFavorite = (id) => {
    return favorites.some(f => String(f.id) === String(id))
  }

  const clearFavorites = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      try {
        for (const f of favorites) {
          await favoriteService.removeFavorite(f.id)
        }
      } catch (error) {
        console.error('Failed to clear favorites:', error)
      }
    }
    localStorage.removeItem('guestFavorites')
    setFavorites([])
    showToast('All favorites cleared')
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, toast, clearFavorites, reloadFavorites }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}