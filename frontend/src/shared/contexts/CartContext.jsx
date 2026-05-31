import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import cartService from '../../features/cart/cartService'

const CartContext = createContext()

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // Derive count from items
  useEffect(() => {
    const count = cartItems.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)
    setCartCount(count)
  }, [cartItems])

  // ─── Load cart ─────────────────────────────────────────────────────────────
  const loadCart = useCallback(async () => {
    const token = getToken()
    if (token) {
      try {
        const response = await cartService.getCart()
        const items = response?.data?.cart_items || response?.cart_items || []
        setCartItems(Array.isArray(items) ? items : [])
      } catch (err) {
        console.error('Failed to load cart:', err)
        setCartItems([])
      }
    } else {
      try {
        const guest = JSON.parse(localStorage.getItem('guestCart') || '[]')
        setCartItems(Array.isArray(guest) ? guest : [])
      } catch {
        setCartItems([])
      }
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Persist guest cart
  useEffect(() => {
    if (!getToken()) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems))
    }
  }, [cartItems])

  // ─── Add to cart ───────────────────────────────────────────────────────────
  const addToCart = async (product) => {
    const token = getToken()

    if (token) {
      // Optimistic update
      setCartItems(prev => {
        const exists = prev.find(
          i => String(i.variant_id) === String(product.variantId)
        )
        if (exists) {
          return prev.map(i =>
            String(i.variant_id) === String(product.variantId)
              ? { ...i, quantity: (Number(i.quantity) || 1) + 1 }
              : i
          )
        }
        return [...prev, {
          product_id: product.product_id,
          variant_id: product.variantId,
          quantity: 1,
          products: { name: product.name, price: product.price },
          images: [product.image],
        }]
      })
      try {
        await cartService.addItem({
          productId: Number(product.product_id),
          variantId: product.variantId ? Number(product.variantId) : undefined,
          quantity: 1,
        })
        await loadCart() // sync with server truth
        showToast('Added to cart!')
      } catch (err) {
        console.error('Failed to add to cart:', err)
        await loadCart() // rollback
      }
    } else {
      // Guest
      setCartItems(prev => {
        const exists = prev.find(
          i => String(i.product_id) === String(product.product_id) &&
               String(i.variant_id ?? '') === String(product.variantId ?? '')
        )
        if (exists) {
          return prev.map(i =>
            String(i.product_id) === String(product.product_id) &&
            String(i.variant_id ?? '') === String(product.variantId ?? '')
              ? { ...i, quantity: (Number(i.quantity) || 1) + 1 }
              : i
          )
        }
        return [...prev, {
          product_id: product.product_id,
          variant_id: product.variantId,
          quantity: 1,
          products: { name: product.name, price: product.price },
          images: [product.image],
        }]
      })
      showToast('Added to cart!')
    }
  }

  // ─── Remove from cart ──────────────────────────────────────────────────────
  const removeFromCart = async (variantId) => {
    // Optimistic
    setCartItems(prev =>
      prev.filter(i => String(i.variant_id) !== String(variantId))
    )
    if (getToken()) {
      try {
        await cartService.removeItem(variantId)
        await loadCart()
      } catch (err) {
        console.error('Failed to remove:', err)
        await loadCart()
      }
    }
  }

  // ─── Update quantity ───────────────────────────────────────────────────────
  const updateQuantity = async (variantId, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(variantId)

    // Optimistic
    setCartItems(prev =>
      prev.map(i =>
        String(i.variant_id) === String(variantId)
          ? { ...i, quantity: newQuantity }
          : i
      )
    )
    if (getToken()) {
      try {
        // Find the cart_item_id for this variant
        const item = cartItems.find(i => String(i.variant_id) === String(variantId))
        if (!item?.cart_item_id) return
        await cartService.updateQuantity({ cart_item_id: item.cart_item_id, quantity: newQuantity })
        await loadCart()
      } catch (err) {
        console.error('Failed to update quantity:', err)
        await loadCart()
      }
    }
  }

  // ─── Clear cart ────────────────────────────────────────────────────────────
  const clearCart = async () => {
    setCartItems([])
    if (getToken()) {
      try {
        await cartService.clearCart()
      } catch (err) {
        console.error('Failed to clear cart:', err)
      }
    } else {
      localStorage.removeItem('guestCart')
    }
  }

  // ─── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartToast: toast,
      loadCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}