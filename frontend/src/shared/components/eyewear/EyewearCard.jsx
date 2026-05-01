import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../../contexts'
import cartService from "../../../features/cart/cartService";

export default function EyewearCard({ id, productId, product_id, image, name, price, description, colors }) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const [addingToCart, setAddingToCart] = useState(false)
  
  const productIdFinal = product_id || productId || id
  const favorited = isFavorite(productIdFinal)

  const handleAddToCart = async (e) => {
  e.preventDefault()
  e.stopPropagation()
  
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  
  // ✅ Guest mode: ONLY localStorage
  if (!token) {
    const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    const existing = localCart.find(item => item.productId === productIdFinal)
    
    if (existing) {
      existing.quantity += 1
    } else {
      localCart.push({
        productId: productIdFinal,
        name: name,
        price: parseFloat(price),
        image: image || '',
        quantity: 1
      })
    }
    
    localStorage.setItem('guestCart', JSON.stringify(localCart))
    
    const btn = e.target
    btn.textContent = 'Added!'
    setTimeout(() => { btn.textContent = 'Add to cart' }, 1000)
    return  // ← STOP here
  }
  
  // ✅ Logged in: ONLY API
  setAddingToCart(true)
  try {
    await cartService.addItem({
      productId: Number(productIdFinal),
      quantity: 1
    })
    
    const btn = e.target
    btn.textContent = 'Added!'
    setTimeout(() => { btn.textContent = 'Add to cart' }, 1000)
  } catch (error) {
    console.error('Failed to add to cart:', error)
  } finally {
    setAddingToCart(false)
  }
}

  return (
    <div className="bg-blue-100 rounded-sm relative flex flex-col w-full">
      <Link
        to="/ai-advisor"
        className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-gray-600 hover:bg-white transition z-10"
      >
        Virtual Try-on
      </Link>

      <Link to={`/product/${productIdFinal}`} className="block">
        <div className="p-3 md:p-6">
          <img src={image} alt={name} className="w-full object-contain h-32 md:h-48" />
        </div>

        <div className="flex gap-1 md:gap-2 px-3 md:px-4 mb-2 md:mb-3">
          {colors?.map((color, index) => (
            <div
              key={index}
              className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="px-3 md:px-4 mb-3 md:mb-4">
          <h3 className="font-medium text-xs md:text-sm text-gray-900 mb-1 line-clamp-2">{name}</h3>
          <p className="text-xs md:text-sm font-semibold text-gray-900 mb-1">${parseFloat(price).toFixed(2)}</p>
          <p className="text-xs text-gray-500 hidden md:block">{description}</p>
        </div>
      </Link>

      <div className="flex items-center gap-2 px-3 md:px-4 pb-3 md:pb-4 mt-auto">
        <button 
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="flex-1 bg-black text-white text-xs md:text-sm py-1.5 md:py-2 px-2 md:px-4 hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {addingToCart ? 'Adding...' : 'Add to cart'}
        </button>

        <button
          onClick={() => toggleFavorite({ id: productIdFinal, image, name, price, description, colors })}
          className="transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 md:w-6 md:h-6"
            fill={favorited ? 'red' : 'none'}
            viewBox="0 0 24 24"
            stroke={favorited ? 'red' : 'currentColor'}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}