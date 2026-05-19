import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import cartService from './cartService'
import useCurrency from '../../shared/hooks/useCurrency'
import { resolveImageUrl } from '../../shared/utils/imageUrl'

const FREE_SHIPPING_THRESHOLD = 50

function CartItem({ item, onRemove, onQuantityChange, isGuest }) {
  const { formatPrice } = useCurrency()
    const name = item.products?.name || item.product?.name || item.name || 'Product'
  const price = parseFloat(item.products?.price || item.product?.price || item.price || 0)
  const imageRaw = item.products?.product_variants?.[0]?.images?.[0] || item.product?.image || item.image || null
  const image = resolveImageUrl(imageRaw) || null
  const itemId = item.cart_item_id
  const productId = item.product_id || item.productId
  const variantId = item.variant_id || item.variantId || null
  const quantity = item.quantity || 0
  const availableStock =
    item.available_stock ??
    item.product_variants?.stock_quantity ??
    item.availableStock ??
    null

  const prescription = item.prescription_data || item.prescriptionData || null
  const hasPrescription = prescription && (prescription.sph_r || prescription.sph_l || prescription.cyl_r || prescription.cyl_l || prescription.axis || prescription.pd)

  const stockIssue = typeof availableStock === 'number' && quantity > availableStock
  const disablePlus = typeof availableStock === 'number' && quantity >= availableStock

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget
              img.onerror = null
              img.src = ''
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No image</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate pr-2">{name}</h4>
          <button
            onClick={() => onRemove(isGuest ? { productId, variantId } : itemId)}
            className="text-gray-400 hover:text-red-500 flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {hasPrescription && (
          <div className="mt-1 p-2 bg-blue-50 rounded-sm border border-blue-100">
            <p className="text-xs font-medium text-blue-700 mb-1">Prescription:</p>
            <div className="text-xs text-blue-600 space-y-0.5">
              {(prescription.sph_r || prescription.sph_l) && (
                <p>SPH: R {prescription.sph_r || '0.00'} / L {prescription.sph_l || '0.00'}</p>
              )}
              {(prescription.cyl_r || prescription.cyl_l) && (
                <p>CYL: R {prescription.cyl_r || '0.00'} / L {prescription.cyl_l || '0.00'}</p>
              )}
              {prescription.axis && <p>Axis: {prescription.axis}°</p>}
              {prescription.pd && <p>PD: {prescription.pd}mm</p>}
            </div>
          </div>
        )}

        {typeof availableStock === 'number' ? (
          <div className="mt-2">
            {availableStock === 0 ? (
              <p className="text-xs text-red-600">Out of stock</p>
            ) : availableStock <= 5 ? (
              <p className="text-xs text-orange-600">Only {availableStock} left</p>
            ) : (
              <p className="text-xs text-gray-500">In stock</p>
            )}
            {stockIssue ? (
              <p className="text-xs text-red-600 mt-1">
                Your cart has {quantity}. Only {availableStock} available — please reduce quantity.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-300 rounded-sm">
            <button
              onClick={() => onQuantityChange(isGuest ? { productId, variantId } : itemId, quantity - 1, isGuest)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100"
              disabled={quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              onClick={() => onQuantityChange(isGuest ? { productId, variantId } : itemId, quantity + 1, isGuest)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100"
              disabled={disablePlus}
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="text-sm font-semibold">{formatPrice(price * quantity)}</p>
        </div>
      </div>
    </div>
  )
}

export default function CartSidebar({ isOpen, onClose }) {
  const { formatPrice } = useCurrency()
  const [items, setItems] = useState([])
  const [isGuest, setIsGuest] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [cartMessage, setCartMessage] = useState('')

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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    if (!token) {
      setIsGuest(true)
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      setItems(localCart)
      return
    }

    setIsGuest(false)
    try {
      const response = await cartService.getCart()
      const cartItems = response?.cart_items || response?.data?.cart_items || []
      setItems(Array.isArray(cartItems) ? cartItems : [])
    } catch (error) {
      console.error('Failed to load cart:', error)
      if (error?.response?.status === 401) {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        setIsGuest(true)
        const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
        setItems(localCart)
      } else {
        setItems([])
      }
    }
  }

  const handleClearAll = async () => {
    setIsClearing(true)
    setCartMessage('')
    try {
      if (isGuest) {
        localStorage.setItem('guestCart', '[]')
        setItems([])
      } else {
        await cartService.clearCart()
        setItems([])
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
    } finally {
      setIsClearing(false)
    }
  }

  const handleQuantityChange = async (id, newQuantity, isGuestItem) => {
    if (newQuantity < 1) return
    setCartMessage('')

    if (isGuestItem) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      const keyProductId = typeof id === 'object' ? id.productId : id
      const keyVariantId = typeof id === 'object' ? id.variantId : null

      const updated = localCart.map(item => {
        const match = item.productId === keyProductId && (item.variantId || null) === (keyVariantId || null)
        if (!match) return item
        const maxQty = typeof item.availableStock === 'number' ? item.availableStock : null
        if (maxQty !== null && newQuantity > maxQty) {
          setCartMessage(`Only ${maxQty} units available for ${item.name || 'this product'}.`)
          return { ...item, quantity: maxQty }
        }
        return { ...item, quantity: newQuantity }
      })
      localStorage.setItem('guestCart', JSON.stringify(updated))
      setItems(updated)
    } else {
      try {
        await cartService.updateQuantity({ cart_item_id: id, quantity: newQuantity })
        loadCart()
      } catch (error) {
        const msg = error?.response?.data?.message || error?.message || 'Failed to update quantity.'
        setCartMessage(msg)
      }
    }
  }

  const handleRemove = async (id) => {
    if (isGuest) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      const updated = localCart.filter(item => !(item.productId === id.productId && (item.variantId || null) === (id.variantId || null)))
      localStorage.setItem('guestCart', JSON.stringify(updated))
      setItems(updated)
    } else {
      try {
        await cartService.removeItem(id)
        loadCart()
      } catch (error) {
        console.error('Failed to remove item:', error)
      }
    }
  }

  const hasStockIssues = items.some((item) => {
    const availableStock =
      item.available_stock ??
      item.product_variants?.stock_quantity ??
      item.availableStock ??
      null
    const qty = item.quantity || 0
    return typeof availableStock === 'number' && qty > availableStock
  })

  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(
      item.products?.price ||
      item.product?.price ||
      item.price ||
      0
    )
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
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearing ? 'Clearing...' : 'Clear all'}
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Free shipping bar */}
        {cartCount > 0 && (
          <div className="px-6 py-4 border-b border-gray-200">
            {amountToFreeShipping > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Spend <span className="font-semibold">{formatPrice(amountToFreeShipping)}</span> more for free shipping!
                </p>
                <div className="h-1.5 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-gray-900 transition-all"
                    style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-green-600 font-medium">🎉 Free shipping!</p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {cartMessage ? (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-sm">
              {cartMessage}
            </div>
          ) : null}
          {hasStockIssues ? (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded-sm">
              Some items exceed available stock. Please reduce quantities before checkout.
            </div>
          ) : null}
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
              {items.map((item, index) => (
                <CartItem
                  key={item.cart_item_id || item.productId || index}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  isGuest={isGuest}
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
               <span className="text-lg font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            {hasStockIssues ? (
              <button
                type="button"
                disabled
                className="block w-full bg-gray-200 text-gray-400 text-center py-3 text-sm font-medium cursor-not-allowed"
              >
                Fix quantities to checkout
              </button>
            ) : (
              <Link to="/checkout" onClick={onClose} className="block w-full bg-gray-900 text-white text-center py-3 text-sm font-medium hover:bg-gray-700">
                Checkout
              </Link>
            )}
            <button onClick={onClose} className="block w-full text-center text-sm text-gray-500 hover:text-gray-900 mt-3">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}