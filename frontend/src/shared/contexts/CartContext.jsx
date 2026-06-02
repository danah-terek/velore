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
        
        const savedRx = JSON.parse(localStorage.getItem('prescriptionDataBackup') || '{}')
        
        const merged = (Array.isArray(items) ? items : []).map(serverItem => {
          const key = `${serverItem.variant_id}_${serverItem.prescription_id}`
          if (savedRx[key]) {
            return { ...serverItem, prescriptionData: savedRx[key] }
          }
          return serverItem
        })
        
        setCartItems(merged)
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
  const addToCart = async (itemData) => {
    if (!itemData) return;

    const token = getToken()
    const productId = itemData.product_id;
    const variantId = itemData.variant_id;
    const qtyToAdd = Number(itemData.quantity) || 1;
    const pId = (itemData.prescriptionId !== undefined && itemData.prescriptionId !== null) 
      ? String(itemData.prescriptionId) 
      : null;

    if (token) {
      // Optimistic update
      setCartItems(prev => {
        const exists = prev.find(
          i => (i.variant_id && variantId ? String(i.variant_id) === String(variantId) : i.variant_id === variantId) &&
               (i.prescription_id ? String(i.prescription_id) : null) === pId
        )
        if (exists) {
          return prev.map(i =>
            (i.variant_id && variantId ? String(i.variant_id) === String(variantId) : i.variant_id === variantId) &&
            (i.prescription_id ? String(i.prescription_id) : null) === pId
              ? { ...i, quantity: (Number(i.quantity) || 0) + qtyToAdd }
              : i
          )
        }
        return [...prev, {
          product_id: productId,
          variant_id: variantId,
          prescription_id: pId ? Number(pId) : null,
          prescriptionData: itemData.prescriptionData || null,
          quantity: qtyToAdd,
          products: { name: itemData.name || '', price: itemData.price || 0 },
          images: itemData.images || [],
        }]
      })

      try {
        // Build payload - only include prescriptionData if it has values
        const payload = {
          productId: Number(productId),
          variantId: variantId ? Number(variantId) : undefined,
          quantity: qtyToAdd,
          prescriptionId: pId ? Number(pId) : null,
        }
        if (itemData.prescriptionData && Object.values(itemData.prescriptionData).some(v => v !== '' && v !== null && v !== undefined)) {
          payload.prescriptionData = itemData.prescriptionData
        }
        await cartService.addItem(payload)
        
        // Save to localStorage backup
        if (itemData.prescriptionData && Object.values(itemData.prescriptionData).some(v => v !== '' && v !== null)) {
          const savedRx = JSON.parse(localStorage.getItem('prescriptionDataBackup') || '{}')
          savedRx[`${variantId}_${pId}`] = itemData.prescriptionData
          localStorage.setItem('prescriptionDataBackup', JSON.stringify(savedRx))
        }
        await loadCart()
        showToast('Added to cart!')
      } catch (err) {
        console.error('Failed to add to cart:', err)
        await loadCart()
      }
    } else {
      // Guest
      setCartItems(prev => {
        const exists = prev.find(
          i => String(i.product_id) === String(productId) &&
               String(i.variant_id ?? '') === String(variantId ?? '') &&
               (i.prescription_id ? String(i.prescription_id) : null) === pId
        )
        if (exists) {
          return prev.map(i =>
            String(i.product_id) === String(productId) &&
            String(i.variant_id ?? '') === String(variantId ?? '') &&
            (i.prescription_id ? String(i.prescription_id) : null) === pId
              ? { ...i, quantity: (Number(i.quantity) || 0) + qtyToAdd }
              : i
          )
        }
        return [...prev, {
          product_id: productId,
          variant_id: variantId,
          prescription_id: pId ? Number(pId) : null,
          prescriptionData: itemData.prescriptionData || null,
          quantity: qtyToAdd,
          products: { name: itemData.name || '', price: itemData.price || 0 },
          images: itemData.images || [],
        }]
      })
      if (itemData.prescriptionData && Object.values(itemData.prescriptionData).some(v => v !== '' && v !== null)) {
        const savedRx = JSON.parse(localStorage.getItem('prescriptionDataBackup') || '{}')
        savedRx[`${variantId}_${pId}`] = itemData.prescriptionData
        localStorage.setItem('prescriptionDataBackup', JSON.stringify(savedRx))
      }
      showToast('Added to cart!')
    }
  }

  // ─── Remove from cart ──────────────────────────────────────────────────────
  const removeFromCart = async (variantId, prescriptionId = null) => {
    const token = getToken()

    const itemToDelete = cartItems.find(i => 
      String(i.variant_id ?? '') === String(variantId ?? '') &&
      String(i.prescription_id ?? '') === String(prescriptionId ?? '')
    );

    setCartItems(prev =>
      prev.filter(i => 
        !(String(i.variant_id ?? '') === String(variantId ?? '') &&
          String(i.prescription_id ?? '') === String(prescriptionId ?? ''))
      )
    )

    if (token) {
      try {
        const targetId = itemToDelete?.cart_item_id || variantId;
        await cartService.removeItem(targetId);
        await loadCart();
      } catch (err) {
        console.error('Failed to remove item:', err);
        await loadCart();
      }
    }
  }

  // ─── Update quantity ───────────────────────────────────────────────────────
  const updateQuantity = async (variantId, newQuantity, prescriptionId = null) => {
    if (newQuantity < 1) return removeFromCart(variantId, prescriptionId)

    setCartItems(prev =>
      prev.map(i =>
        String(i.variant_id ?? '') === String(variantId ?? '') &&
        String(i.prescription_id ?? '') === String(prescriptionId ?? '')
          ? { ...i, quantity: newQuantity }
          : i
      )
    )

    if (getToken()) {
      try {
        const item = cartItems.find(i => 
          String(i.variant_id ?? '') === String(variantId ?? '') &&
          String(i.prescription_id ?? '') === String(prescriptionId ?? '')
        )
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
    localStorage.removeItem('prescriptionDataBackup')
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