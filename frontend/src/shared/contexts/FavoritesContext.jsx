import { createContext, useContext, useState } from 'react'

const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])



  const [toast, setToast] = useState(null)
const clearFavorites = () => setFavorites([])

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) {
        showToast(`${product.name} removed from favorites`)
        return prev.filter(p => p.id !== product.id)
      } else {
        showToast(`${product.name} added to favorites`)
        return [...prev, product]
      }
    })
  }







  const isFavorite = (id) => favorites.some(p => p.id === id)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, toast, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}