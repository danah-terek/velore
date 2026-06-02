import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag, Sparkles, Truck, ShieldCheck } from 'lucide-react'
import cartService from './cartService'
import { useCart } from '../../shared/contexts/CartContext'
import useCurrency from '../../shared/hooks/useCurrency'
import { resolveImageUrl } from '../../shared/utils/imageUrl'
import RecommendedItem from './RecommendedItem'

const FREE_SHIPPING_THRESHOLD = 50

// ─── CART ITEM COMPONENT ──────────────────────────────────────────────────────
function CartItem({ item, onQuantityChange, onRemove }) {
  const { formatPrice } = useCurrency()
  const name = item.products?.name || item.product?.name || item.name || 'Product'
  const price = parseFloat(item.products?.price || item.product?.price || item.price || 0)

  const imageRaw =
    item.images?.[0] ||
    item.product_variants?.images?.[0] ||
    item.products?.product_variants?.[0]?.images?.[0] ||
    null

  const image = resolveImageUrl(imageRaw) || null
  const variantId = item.variant_id || item.variantId || null
  const quantity = Number(item.quantity) || 0
  const availableStock =
    item.available_stock ??
    item.product_variants?.stock_quantity ??
    item.availableStock ??
    null

  const prescription = item.prescription_data || item.prescriptionData || null

  // Robust check for any filled prescription data field
  const hasPrescription = prescription && (
    prescription.sph || prescription.cyl || prescription.axis || prescription.bc || prescription.dia ||
    prescription.sph_r || prescription.sph_l ||
    prescription.cyl_r || prescription.cyl_l ||
    prescription.power || prescription.power_r || prescription.power_l
  )

  // Identify whether this data profile maps to standard glasses or single contacts/lenses
  const isContactLens = prescription && (
    prescription.bc !== undefined || 
    prescription.dia !== undefined || 
    prescription.power !== undefined
  )

  const stockIssue = typeof availableStock === 'number' && quantity > availableStock
  const disablePlus = typeof availableStock === 'number' && quantity >= availableStock
  const isLowStock = typeof availableStock === 'number' && availableStock > 0 && availableStock <= 5
  const isOutOfStock = availableStock === 0

  return (
    <div className="group flex gap-4 py-4 border-b border-gray-100 last:border-b-0 animate-fadeIn">
      <Link
        to={`/product/${item.product_id || item.productId}`}
        className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
      >
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy"
            onError={(e) => { e.currentTarget.src = '' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={18} className="text-gray-300" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <Link to={`/product/${item.product_id || item.productId}`}
              className="text-sm font-medium text-gray-900 truncate hover:text-gray-700 transition-colors">
              {name}
            </Link>
            <button
              onClick={() => onRemove(variantId, item.prescription_id || null)}
              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
              title="Remove"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* PRESCRIPTION MANAGEMENT CARDS */}
          {hasPrescription && (
            <div className="mt-2 p-2 bg-blue-50/30 rounded-xl border border-blue-100/50 text-[10px] text-gray-600">
              <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-blue-100/40">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span className="font-semibold text-blue-800 uppercase tracking-wider text-[9px]">
                  {isContactLens ? 'Contact Lens Specs' : 'Glasses Prescription'}
                </span>
              </div>
              
              {isContactLens ? (
                /* ─── CONTACT LENSES DETAILED DISPLAY ─── */
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {(prescription.power !== undefined || prescription.sph !== undefined) && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">PWR / SPH:</span>
                      <span className="font-medium text-gray-900">{prescription.power || prescription.sph}</span>
                    </div>
                  )}
                  {prescription.bc && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Curve (BC):</span>
                      <span className="font-medium text-gray-900">{prescription.bc}</span>
                    </div>
                  )}
                  {prescription.dia && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Diameter (DIA):</span>
                      <span className="font-medium text-gray-900">{prescription.dia}</span>
                    </div>
                  )}
                  {prescription.cyl && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">CYL:</span>
                      <span className="font-medium text-gray-900">{prescription.cyl}</span>
                    </div>
                  )}
                  {prescription.axis && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Axis:</span>
                      <span className="font-medium text-gray-900">{prescription.axis}°</span>
                    </div>
                  )}
                </div>
              ) : (
                /* ─── EYE GLASSES DETAILED DISPLAY (OD/OS) ─── */
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="border-r border-gray-200/60 pr-2">
                      <p className="font-bold text-gray-900 mb-0.5 border-b border-gray-200/40 pb-0.5">OD (Right Eye)</p>
                      <p className="flex justify-between"><span>SPH:</span> <span className="font-medium text-gray-900">{prescription.sph_r || prescription.sph || '-'}</span></p>
                      <p className="flex justify-between"><span>CYL:</span> <span className="font-medium text-gray-900">{prescription.cyl_r || '-'}</span></p>
                    </div>
                    <div className="pl-1">
                      <p className="font-bold text-gray-900 mb-0.5 border-b border-gray-200/40 pb-0.5">OS (Left Eye)</p>
                      <p className="flex justify-between"><span>SPH:</span> <span className="font-medium text-gray-900">{prescription.sph_l || prescription.sph || '-'}</span></p>
                      <p className="flex justify-between"><span>CYL:</span> <span className="font-medium text-gray-900">{prescription.cyl_l || '-'}</span></p>
                    </div>
                  </div>
                  {(prescription.axis || prescription.axis_r || prescription.axis_l || prescription.pd) && (
                    <div className="mt-1.5 pt-1.5 border-t border-blue-100/40 grid grid-cols-2 gap-2 text-[9px] font-medium text-gray-500">
                      {(prescription.axis || prescription.axis_r || prescription.axis_l) && (
                        <p>AXIS: <span className="text-gray-900 font-semibold">
                          {prescription.axis ? `${prescription.axis}°` : `R: ${prescription.axis_r || '-'}° / L: ${prescription.axis_l || '-'}°`}
                        </span></p>
                      )}
                      {prescription.pd && <p>PD: <span className="text-gray-900 font-semibold">{prescription.pd} mm</span></p>}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {typeof availableStock === 'number' && (
            <div className="mt-1">
              {isOutOfStock ? (
                <p className="text-[11px] text-red-500 font-medium">Out of stock</p>
              ) : isLowStock ? (
                <p className="text-[11px] text-amber-600 font-medium">Only {availableStock} left</p>
              ) : null}
              {stockIssue && <p className="text-[11px] text-red-500 mt-0.5">Max available: {availableStock}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => onQuantityChange(variantId, quantity - 1, item.prescription_id || null)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={quantity <= 1}
            >
              <Minus size={13} />
            </button>
            <span className="w-9 text-center text-sm font-medium text-gray-900 select-none">{quantity}</span>
            <button
              onClick={() => onQuantityChange(variantId, quantity + 1, item.prescription_id || null)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={disablePlus}
            >
              <Plus size={13} />
            </button>
          </div>
          <span className="text-sm font-semibold text-gray-900">{formatPrice(price * quantity)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── EMPTY CART COMPONENT ─────────────────────────────────────────────────────
function EmptyCart({ onClose, recommended }) {
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col">
      <div className="flex flex-col items-center flex-1 px-6 py-10 min-h-0">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 flex-shrink-0">
          <ShoppingBag size={30} className="text-gray-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex-shrink-0">Your cart is empty</h3>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-[260px] flex-shrink-0">
          Looks like you haven't added anything yet. Let's change that!
        </p>
        {recommended.length > 0 && (
          <div className="w-full mb-6 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-amber-500" />
              <p className="text-xs font-semibold text-gray-900">Trending Now</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-none no-scrollbar">
              {recommended.map((product) => (
                <div key={product.product_id || product.id} className="snap-start flex-shrink-0 w-[140px]">
                  <RecommendedItem product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 min-h-[20px]" />
        <div className="w-full flex-shrink-0 sticky bottom-0 bg-white pt-3">
          <button onClick={onClose}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg shadow-gray-900/10">
            Browse Products
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">Free shipping on orders over $50</p>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN CART SIDEBAR ────────────────────────────────────────────────────────
export default function CartSidebar({ isOpen, onClose }) {
  const { formatPrice } = useCurrency()
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const [isVisible, setIsVisible] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [recommended, setRecommended] = useState([])

  const items = cartItems

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const excludeIds = items.map(i => i.product_id).filter(Boolean)
      cartService.getRecommended(excludeIds)
        .then(res => setRecommended(res?.data?.data || res?.data || []))
        .catch(() => setRecommended([]))
    }
  }, [isOpen, items.length])

  const handleClearAll = async () => {
    setIsClearing(true)
    try {
      await clearCart()
    } catch (err) {
      console.error('Failed to clear cart:', err)
    } finally {
      setIsClearing(false)
    }
  }

  const handleQuantityChange = async (variantId, newQuantity, prescriptionId = null) => {
    setCartMessage('')
    await updateQuantity(variantId, newQuantity, prescriptionId)
  }

  const handleRemove = async (variantId, prescriptionId = null) => {
    await removeFromCart(variantId, prescriptionId)
  }

  const hasStockIssues = items.some(item => {
    const stock = item.available_stock ?? item.product_variants?.stock_quantity ?? null
    return typeof stock === 'number' && (item.quantity || 0) > stock
  })

  const cartCount = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
  const subtotal = items.reduce((sum, i) => {
    const price = parseFloat(i.products?.price || i.product?.price || i.price || 0)
    return sum + price * (Number(i.quantity) || 0)
  }, 0)
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  if (!isVisible && !isOpen) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-[440px] bg-white z-50 shadow-2xl flex flex-col transition-all duration-400 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
            {cartCount > 0 && <p className="text-xs text-gray-500 mt-0.5">{cartCount} items</p>}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={handleClearAll} disabled={isClearing}
                className="text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                {isClearing ? 'Clearing...' : 'Clear'}
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress */}
        {cartCount > 0 && (
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
            {amountToFreeShipping > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">
                    <Truck size={14} className="inline mr-1.5 -mt-0.5" />
                    {formatPrice(amountToFreeShipping)} away from <span className="font-semibold text-gray-900">free shipping</span>
                  </span>
                  <span className="text-xs font-medium text-gray-400">{Math.round(shippingProgress)}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gray-900 to-gray-700 rounded-full" style={{ width: `${shippingProgress}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <Sparkles size={16} /> Free shipping unlocked!
              </div>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <EmptyCart onClose={onClose} recommended={recommended} />
        ) : (
          <>
            <div className="px-5 flex-shrink-0">
              {cartMessage && <div className="mt-3 p-3 bg-red-50 border text-red-600 text-xs rounded-xl">{cartMessage}</div>}
              {hasStockIssues && <div className="mt-3 p-3 bg-amber-50 border text-amber-700 text-xs rounded-xl">Some items exceed available stock.</div>}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 no-scrollbar">
              <div className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <CartItem
                    key={item.cart_item_id || `${item.variant_id || 'base'}_${item.prescription_id || 'none'}_${index}`}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {recommended.length > 0 && (
                <div className="py-6 mt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={15} className="text-amber-500" />
                    <p className="text-sm font-semibold text-gray-900">You Might Also Like</p>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mr-5 pr-5 snap-x no-scrollbar">
                    {recommended.map((product) => (
                      <div key={product.product_id || product.id} className="snap-start flex-shrink-0 w-[140px]">
                        <RecommendedItem product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">Shipping & taxes calculated at checkout</p>
              <Link to="/checkout" onClick={onClose}
                className="block w-full bg-gray-900 text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-[0.98]">
                Proceed to Checkout
              </Link>
              <button onClick={onClose} className="w-full text-center text-sm text-gray-500 hover:text-gray-900 mt-2.5 py-1.5">
                Continue Shopping
              </button>
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1 text-[10px] text-gray-400"><ShieldCheck size={12} /> Secure checkout</div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400"><Truck size={12} /> Free over $50</div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}