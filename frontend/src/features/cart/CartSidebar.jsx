// CartSidebar.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { EyewearCard } from '../../shared/components/eyewear'
import cartService from './cartService'

const FREE_SHIPPING_THRESHOLD = 50

function CartItem({ item, onUpdateQuantity, onRemove, loading }) {
  const price = item.variant 
    ? parseFloat(item.product.price) + parseFloat(item.variant.priceAdjustment)
    : parseFloat(item.product.price)

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      {/* Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
        <img 
          src={item.product.image || item.variant?.images?.[0] || 'https://via.placeholder.com/80'} 
          alt={item.product.name} 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate pr-2">{item.product.name}</h4>
          <button 
            onClick={onRemove}
            disabled={loading}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {item.variant && (
          <p className="text-xs text-gray-500 mt-0.5">
            {item.variant.colorName && `${item.variant.colorName}`}
            {item.variant.size && ` / ${item.variant.size}`}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-300 rounded-sm">
            <button 
              onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              disabled={loading || item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm text-gray-700">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="text-sm font-semibold text-gray-900">${(price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

export default function CartSidebar({ isOpen, onClose }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // Load cart when opened
  useEffect(() => {
    if (isOpen) {
      loadCart()
    }
  }, [isOpen])

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const loadCart = useCallback(async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
if (!token) {
  setCart({ items: [], total: 0 })
  return
}

    setLoading(true)
    try {
      const response = await cartService.getCart()
      setCart(response.data)
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateQuantity = async (productId, variantId, newQuantity) => {
    if (newQuantity < 1) return
    setLoading(true)
    try {
      await cartService.updateQuantity({ productId, variantId, quantity: newQuantity })
      await loadCart()
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (productId, variantId) => {
    setLoading(true)
    try {
      await cartService.removeItem(variantId || productId)
      await loadCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setLoading(false)
    }
  }

  const cartItems = cart?.items || []
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart?.total ? parseFloat(cart.total) : 0
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progressPercentage = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

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

        {/* Free shipping progress */}
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
          {!cart ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : cartCount === 0 ? (
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
            <div className="pb-4">
              {cartItems.map(item => (
                <CartItem 
                  key={`${item.productId}-${item.variantId || '0'}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={() => removeItem(item.productId, item.variantId)}
                  loading={loading}
                />
              ))}
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