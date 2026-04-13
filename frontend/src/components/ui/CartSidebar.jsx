// CartSidebar.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import EyewearCard from "../eyewear/EyewearCard"

// Mock cart data - replace with your state management later
const MOCK_CART_ITEMS = [
  {
    id: 1,
    name: "MIU MIU Eyewear logo-print glasses",
    price: 264.00,
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
    quantity: 1,
    stock: 9,
    colors: ['#8B0000']
  }
]

// Recommended products
const RECOMMENDED = [
  {
    id: 101,
    category: 'glasses',
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
    name: "MIU MIU Eyewear logo-print glasses",
    price: 264,
    description: "Contemporary eyewear crafted with premium acetate.",
    colors: ['#8B0000', '#1E3A8A', '#2D2D2D']
  },
  {
    id: 102,
    category: 'sunglasses',
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
    name: "MIU MIU Eyewear logo-print sunglasses",
    price: 264,
    description: "Contemporary eyewear crafted with premium acetate.",
    colors: ['#8B0000', '#2F4F4F']
  },
  {
    id: 103,
    category: 'lenses',
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400",
    name: "MIU MIU Eyewear logo-print lenses",
    price: 264,
    description: "Contemporary eyewear crafted with premium acetate.",
    colors: ['#ADD8E6']
  }
]

const FREE_SHIPPING_THRESHOLD = 297

function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      {/* Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate pr-2">{item.name}</h4>
          <button 
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-0.5">{item.stock} in stock</p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-300 rounded-sm">
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm text-gray-700">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              disabled={item.quantity >= item.stock}
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

function RecommendedCard({ product }) {
  return (
    <div className="bg-gray-100/50 rounded-sm p-3">
      <EyewearCard {...product} />
    </div>
  )
}

export default function CartSidebar({ isOpen, onClose }) {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS)
  const [isVisible, setIsVisible] = useState(false)
  
  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progressPercentage = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  if (!isVisible && !isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] md:max-w-[450px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Your cart</h2>
            {cartCount > 0 && (
              <span className="text-sm text-gray-500">({cartCount})</span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Free shipping progress - only show if cart has items */}
        {cartCount > 0 && (
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            {amountToFreeShipping > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Spend <span className="font-semibold text-gray-900">${amountToFreeShipping.toFixed(2)}</span> more for free shipping!
                </p>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-900 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-green-600 font-medium">🎉 You qualify for free shipping!</p>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {cartCount === 0 ? (
            // Empty cart state
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-6">Add items to get started</p>
              <button
                onClick={onClose}
                className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            // Cart with items
            <div className="pb-4">
              {cartItems.map(item => (
                <CartItem 
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          )}

          {/* You may like section */}
          {cartCount > 0 && (
            <div className="py-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">You may like</h3>
              <div className="grid grid-cols-2 gap-3">
                {RECOMMENDED.slice(0, 2).map(product => (
                  <RecommendedCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with checkout */}
        {cartCount > 0 && (
          <div className="px-6 py-5 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-lg font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full bg-gray-900 text-white text-center py-3 text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-900 mt-3 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}