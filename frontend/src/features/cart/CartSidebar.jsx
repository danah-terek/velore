import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import cartService from './cartService'

const FREE_SHIPPING_THRESHOLD = 50

function CartItem({ item, onRemove, onQuantityChange }) {
  const name = item.products?.name || 'Product'
  const price = parseFloat(item.products?.price || 0)
  const image = item.products?.product_variants?.[0]?.images?.[0] || 'https://via.placeholder.com/80'
  const itemId = item.cart_item_id

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate pr-2">{name}</h4>
          <button onClick={() => onRemove(itemId)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-300 rounded-sm">
            <button
              onClick={() => onQuantityChange(itemId, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(itemId, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="text-sm font-semibold">${(price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

export default function CartSidebar({ isOpen, onClose }) {
  const [items, setItems] = useState([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadCart()
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const loadCart = async () => {
  try {
    const response = await cartService.getCart()
    // Backend returns { success: true, data: { carts_id, cart_items: [], total } }
    const cartItems = response?.data?.cart_items || response?.cart_items || []
    setItems(Array.isArray(cartItems) ? cartItems : [])
  } catch (error) {
    console.error('Failed to load cart:', error)
    setItems([])
  }
}
  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      // NOTE: Adjust the field names to match what your backend's PUT /cart/update expects
      await cartService.updateQuantity({ cart_item_id: cartItemId, quantity: newQuantity })
      loadCart()
    } catch (error) {
      console.error('Failed to update:', error)
    }
  }

  const handleRemove = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId)
      loadCart()
    } catch (error) {
      console.error('Failed to remove:', error)
    }
  }

  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || item.price || 0)
    return sum + price * (item.quantity || 0)
  }, 0)
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  if (!isVisible && !isOpen) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] md:max-w-[450px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your cart {cartCount > 0 && `(${cartCount})`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
            <X size={22} />
          </button>
        </div>

        {/* Free shipping */}
        {cartCount > 0 && (
          <div className="px-6 py-4 border-b border-gray-200">
            {amountToFreeShipping > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Spend <span className="font-semibold">${amountToFreeShipping.toFixed(2)}</span> more for free shipping!
                </p>
                <div className="h-1.5 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-gray-900 transition-all"
                    style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-green-600 font-medium">:tada: Free shipping!</p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-6">Add items to get started</p>
              <button onClick={onClose} className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-700">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="pb-4">
              {items.map((item) => (
                <CartItem
                  key={item.cart_item_id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-lg font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="block w-full bg-gray-900 text-white text-center py-3 text-sm font-medium hover:bg-gray-700">
              Checkout
            </Link>
            <button onClick={onClose} className="block w-full text-center text-sm text-gray-500 hover:text-gray-900 mt-3">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}