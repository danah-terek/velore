import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Truck, Shield, RotateCcw, Tag, CheckCircle, X } from 'lucide-react'
import cartService from '../cart/cartService'
import orderService from './orderService'

const COUNTRIES = ['Lebanon', 'United States', 'Canada', 'United Kingdom', 'France', 'UAE']
const FREE_SHIPPING_THRESHOLD = 50

// ─── Brand Logos ──────────────────────────────────────────────────────────────

const WhishLogo = () => (
  <svg width="70" height="26" viewBox="0 0 140 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="140" height="52" rx="7" fill="#E8001C"/>
    <text x="13" y="36" fontFamily="'Arial Black', 'Arial Bold', Arial, sans-serif" fontSize="25" fontWeight="900" fill="white" letterSpacing="-0.5">whish</text>
    <circle cx="120" cy="18" r="4.5" fill="white" opacity="0.85"/>
    <circle cx="128" cy="26" r="3.5" fill="white" opacity="0.6"/>
    <circle cx="120" cy="34" r="2.5" fill="white" opacity="0.4"/>
  </svg>
)

const VisaLogo = () => (
  <svg width="44" height="28" viewBox="0 0 880 560" xmlns="http://www.w3.org/2000/svg">
    <rect width="880" height="560" rx="50" fill="#1A1F71"/>
    <rect y="460" width="880" height="100" rx="0" fill="#F7A600"/>
    <text x="440" y="390" textAnchor="middle" fontFamily="'Times New Roman', Georgia, serif" fontSize="310" fontWeight="bold" fontStyle="italic" fill="white">VISA</text>
  </svg>
)

const MastercardLogo = () => (
  <svg width="44" height="28" viewBox="0 0 152 96" xmlns="http://www.w3.org/2000/svg">
    <rect width="152" height="96" rx="9" fill="#1A1A1A"/>
    <circle cx="55" cy="48" r="32" fill="#EB001B"/>
    <circle cx="97" cy="48" r="32" fill="#F79E1B"/>
    <path d="M76 20.5a32 32 0 0 1 0 55A32 32 0 0 1 76 20.5z" fill="#FF5F00"/>
  </svg>
)

const PAYMENT_METHODS = [
  {
    id: 'whish',
    name: 'Whish Money',
    description: 'Redirects you to the Whish app or website to complete payment',
    logo: <WhishLogo />,
  },
  {
    id: 'mastercard',
    name: 'Credit / Debit Card',
    description: 'Redirects you to our secure Stripe payment page',
    logo: (
      <div className="flex items-center gap-1.5">
        <VisaLogo />
        <MastercardLogo />
      </div>
    ),
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives',
    logo: <span className="text-2xl">💵</span>,
  },
]

// ─── COD Success Modal ────────────────────────────────────────────────────────
function OrderConfirmationModal({ orderNumber, total, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition">
          <X size={20} />
        </button>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Order Confirmed!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your order has been placed. We'll prepare it and deliver it to you shortly.
          </p>
          <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-100 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order #</span>
              <span className="font-semibold text-gray-900 font-mono text-xs">{orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment</span>
              <span className="font-semibold text-gray-900">Cash on Delivery</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">${total}</span>
            </div>
          </div>
          <Link
            to="/shop"
            className="w-full text-center py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition"
            onClick={onClose}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Card Payment Modal ──────────────────────────────────────────────────────
function CardPaymentModal({ total, onClose, onSubmit }) {
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [errors, setErrors] = useState({})

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const handleSubmit = () => {
    const newErrors = {}
    if (cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Enter valid card number'
    if (!cardHolder.trim()) newErrors.cardHolder = 'Cardholder name is required'
    if (expiry.length < 5) newErrors.expiry = 'Enter valid expiry (MM/YY)'
    if (cvv.length < 3) newErrors.cvv = 'Enter valid CVV'
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder,
        expiry,
        cvv
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Card Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Card Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className={`w-full border px-4 py-3 text-sm outline-none rounded-lg ${errors.cardNumber ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <VisaLogo />
                <MastercardLogo />
              </div>
            </div>
            {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className={`w-full border px-4 py-3 text-sm outline-none rounded-lg ${errors.cardHolder ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`}
            />
            {errors.cardHolder && <p className="text-red-500 text-xs mt-1">{errors.cardHolder}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className={`w-full border px-4 py-3 text-sm outline-none rounded-lg ${errors.expiry ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`}
              />
              {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
              <input
                type="password"
                placeholder="123"
                maxLength="4"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className={`w-full border px-4 py-3 text-sm outline-none rounded-lg ${errors.cvv ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`}
              />
              {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount to pay</span>
              <span className="font-bold text-gray-900">${total}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition"
          >
            Pay ${total}
          </button>
          
          <p className="text-xs text-gray-400 text-center mt-2">
            🔒 This is a simulation. No real payment will be processed.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Whish Payment Modal ─────────────────────────────────────────────────────
function WhishPaymentModal({ total, onClose, onSubmit }) {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)

  const handleNext = () => {
    const newErrors = {}
    if (phone.length < 8) newErrors.phone = 'Enter valid phone number'
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) setStep(2)
  }

  const handleSubmit = () => {
    const newErrors = {}
    if (pin.length < 4) newErrors.pin = 'PIN must be at least 4 digits'
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onSubmit({ phone, pin })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Whish Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <WhishLogo />
              <span className="text-sm text-gray-500">Pay with Whish</span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+961 3 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                className={`w-full border px-4 py-3 text-sm outline-none rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-[#E8001C] text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Enter your Whish PIN to confirm</p>
              <p className="text-xs text-gray-400 mt-1">Phone: {phone}</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Whish PIN</label>
              <input
                type="password"
                placeholder="Enter PIN"
                maxLength="6"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`w-full border px-4 py-3 text-sm outline-none rounded-lg ${errors.pin ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`}
              />
              {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin}</p>}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount to pay</span>
                <span className="font-bold text-gray-900">${total}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-[#E8001C] text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Confirm Payment
              </button>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-2">
              🔒 This is a simulation. No real payment will be processed.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Checkout Component ──────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isAutofilled, setIsAutofilled] = useState(false)

  const [showCODModal, setShowCODModal] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [showCardForm, setShowCardForm] = useState(false)
  const [showWhishForm, setShowWhishForm] = useState(false)

  const [contactInfo, setContactInfo] = useState({ email: '' })
  const [shippingAddress, setShippingAddress] = useState({
    country: 'Lebanon', firstName: '', lastName: '', address: '',
    city: '', postalCode: '', phone: ''
  })
  const [selectedPayment, setSelectedPayment] = useState('cod')
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)

  useEffect(() => {
    loadCart()
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  // ✅ Auto-fill checkout form when user is logged in
  useEffect(() => {
    const autofillCheckoutForm = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      if (!token) return
      
      try {
        const response = await fetch('/api/v1/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) throw new Error('Failed to fetch profile')
        
        const result = await response.json()
        const userData = result?.data
        
        if (!userData) return
        
        setContactInfo({ email: userData.email || '' })
        
        if (userData.addresses && userData.addresses.length > 0) {
          const defaultAddr = userData.addresses[0]
          
          setShippingAddress({
            country: defaultAddr.country || 'Lebanon',
            firstName: userData.name?.split(' ')[0] || '',
            lastName: userData.name?.split(' ').slice(1).join(' ') || '',
            address: defaultAddr.street || '',
            city: defaultAddr.city || '',
            postalCode: defaultAddr.postal_code || '',
            phone: ''
          })
        } else if (userData.name) {
          const nameParts = userData.name.split(' ')
          setShippingAddress(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || ''
          }))
        }
        
        setIsAutofilled(true)
      } catch (error) {
        console.error('Auto-fill checkout failed:', error)
      }
    }
    
    autofillCheckoutForm()
  }, [])

  const loadCart = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      try {
        const result = await cartService.getCart()
        const cart = result?.data || {}
        const items = cart?.cart_items || []
        setCartItems(items)
        setCartTotal(parseFloat(cart?.total || 0))
      } catch { loadGuestCart() }
    } else {
      loadGuestCart()
    }
  }

  const loadGuestCart = () => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    setCartItems(guestCart.map(item => ({
      product_id: item.productId,
      variant_id: item.variantId || null,
      quantity: item.quantity,
      available_stock: item.availableStock ?? null,
      products: { name: item.name, price: item.price, image: item.image },
      product_variants: null,
      prescriptionData: item.prescriptionData || null
    })))
    const total = guestCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
    setCartTotal(total)
  }

  const cartIsEmpty = cartItems.length === 0
  const subtotal = cartIsEmpty ? 0 : cartTotal
  const shipping = cartIsEmpty ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3
  const discountSafe = cartIsEmpty ? 0 : discountAmount
  const total = Math.max(0, subtotal + shipping - discountSafe)

  const applyDiscount = () => {
    if (cartIsEmpty) return
    if (discountCode.toUpperCase() === 'WELCOME10' && !discountApplied) {
      setDiscountAmount(subtotal * 0.1); setDiscountApplied(true)
    } else if (discountCode.toUpperCase() === 'FREESHIP' && !discountApplied) {
      setDiscountAmount(shipping); setDiscountApplied(true)
    } else {
      alert('Invalid discount code')
    }
  }

  const validateForm = () => {
    const errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!contactInfo.email.trim()) errors.email = 'Email is required'
    else if (!emailRegex.test(contactInfo.email)) errors.email = 'Please enter a valid email (e.g., user@gmail.com)'
    if (!shippingAddress.firstName.trim()) errors.firstName = 'First name is required'
    if (!shippingAddress.lastName.trim()) errors.lastName = 'Last name is required'
    if (!shippingAddress.address.trim()) errors.address = 'Address is required'
    if (!shippingAddress.city.trim()) errors.city = 'City is required'
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const generateOrderNumber = () =>
    `VEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const stockIssues = cartItems
    .map((item) => {
      const available =
        item.available_stock ??
        item.product_variants?.stock_quantity ??
        null
      const qty = Number(item.quantity || 0)
      return typeof available === 'number' && qty > available
    })
    .some(Boolean)

  const buildOrderPayload = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    
    const payload = {
      payment_method: selectedPayment,
      email: contactInfo.email,
      name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      phone: shippingAddress.phone,
      address: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode || '',
        country: shippingAddress.country
      }
    }

    if (!token) {
      payload.guestItems = cartItems.map(item => ({
        product_id: Number(item.product_id || item.productId),
        variant_id: item.variant_id ? Number(item.variant_id) : (item.variantId ? Number(item.variantId) : null),
        quantity: item.quantity || 1,
      }))
    }

    return payload
  }

  const createOrder = async () => {
    const orderNumber = generateOrderNumber()
    const response = await orderService.checkout(buildOrderPayload())
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) localStorage.removeItem('guestCart')
    return { response, orderNumber: response?.data?.orderNumber || orderNumber }
  }

  // ✅ COD — show in-page success modal
  const handleCODCheckout = async () => {
    setLoading(true)
    try {
      const { response, orderNumber } = await createOrder()
      setConfirmedOrder({ orderNumber, orderId: response?.data?.order_id })
      setShowCODModal(true)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Checkout failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Whish — show simulated whish form
  const handleWhishCheckout = async () => {
    if (!validateForm()) return
    if (stockIssues) {
      setError('Some items exceed available stock. Please adjust quantities in your cart before checkout.')
      return
    }
    setError('')
    setShowWhishForm(true)
  }

  const handleWhishFormSubmit = (whishData) => {
    console.log('💸 Whish payment simulated:', whishData)
    setShowWhishForm(false)
    handleCODCheckout()
  }

  // ✅ Card — show simulated card form
  const handleCardCheckout = async () => {
    if (!validateForm()) return
    if (stockIssues) {
      setError('Some items exceed available stock. Please adjust quantities in your cart before checkout.')
      return
    }
    setError('')
    setShowCardForm(true)
  }

  const handleCardFormSubmit = (cardData) => {
    console.log('💳 Card payment simulated:', cardData)
    setShowCardForm(false)
    handleCODCheckout()
  }

  const handleCheckout = () => {
    setError('')
    if (!validateForm()) return
    if (stockIssues) {
      setError('Some items exceed available stock. Please adjust quantities in your cart before checkout.')
      return
    }
    if (selectedPayment === 'cod') handleCODCheckout()
    else if (selectedPayment === 'whish') handleWhishCheckout()
    else if (selectedPayment === 'mastercard') handleCardCheckout()
  }

  const handleShippingChange = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
    setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  const ctaLabel = () => {
    if (loading) return 'Processing...'
    if (selectedPayment === 'whish') return `PAY WITH WHISH  •  $${total.toFixed(2)}`
    if (selectedPayment === 'mastercard') return `PAY BY CARD  •  $${total.toFixed(2)}`
    return `CONFIRM ORDER  •  $${total.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Modals */}
      {showCardForm && (
        <CardPaymentModal
          total={total.toFixed(2)}
          onClose={() => setShowCardForm(false)}
          onSubmit={handleCardFormSubmit}
        />
      )}
      
      {showWhishForm && (
        <WhishPaymentModal
          total={total.toFixed(2)}
          onClose={() => setShowWhishForm(false)}
          onSubmit={handleWhishFormSubmit}
        />
      )}

      {showCODModal && confirmedOrder && (
        <OrderConfirmationModal
          orderNumber={confirmedOrder.orderNumber}
          total={total.toFixed(2)}
          onClose={() => { setShowCODModal(false); navigate('/shop') }}
        />
      )}

      <div className="px-6 md:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/shop" className="hover:text-gray-900">Shop</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {error}
            </div>
          )}
          {stockIssues && !error && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded">
              Some items exceed available stock. Please update quantities before confirming your order.
            </div>
          )}

          {isAutofilled && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded flex items-center gap-2">
              <CheckCircle size={16} />
              Your information has been pre-filled from your account. Please verify and update if needed.
            </div>
          )}

          {!isLoggedIn && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-sm text-sm text-blue-700">
              You're checking out as a guest.{' '}
              <Link to="/login" className="font-medium underline">Login for faster checkout</Link>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">

              {/* 1. Contact */}
              <div className="bg-white rounded-sm p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Contact
                </h2>
                <input
                  type="email" placeholder="Email" value={contactInfo.email}
                  onChange={(e) => { setContactInfo({ email: e.target.value }); setFieldErrors(p => ({ ...p, email: '' })) }}
                  className={`w-full border px-4 py-3 text-sm outline-none rounded-sm ${fieldErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`}
                />
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              {/* 2. Delivery */}
              <div className="bg-white rounded-sm p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  Delivery
                </h2>
                <div className="space-y-4">
                  <select value={shippingAddress.country} onChange={(e) => handleShippingChange('country', e.target.value)} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 rounded-sm bg-white">
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input type="text" placeholder="First name" value={shippingAddress.firstName} onChange={(e) => handleShippingChange('firstName', e.target.value)} className={`w-full border px-4 py-3 text-sm outline-none rounded-sm ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`} />
                      {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>}
                    </div>
                    <div>
                      <input type="text" placeholder="Last name" value={shippingAddress.lastName} onChange={(e) => handleShippingChange('lastName', e.target.value)} className={`w-full border px-4 py-3 text-sm outline-none rounded-sm ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`} />
                      {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <input type="text" placeholder="Address" value={shippingAddress.address} onChange={(e) => handleShippingChange('address', e.target.value)} className={`w-full border px-4 py-3 text-sm outline-none rounded-sm ${fieldErrors.address ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`} />
                    {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input type="text" placeholder="City" value={shippingAddress.city} onChange={(e) => handleShippingChange('city', e.target.value)} className={`w-full border px-4 py-3 text-sm outline-none rounded-sm ${fieldErrors.city ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`} />
                      {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
                    </div>
                    <input type="text" placeholder="Postal code" value={shippingAddress.postalCode} onChange={(e) => handleShippingChange('postalCode', e.target.value)} className="border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 rounded-sm" />
                  </div>
                  <div>
                    <input type="tel" placeholder="Phone" value={shippingAddress.phone} onChange={(e) => handleShippingChange('phone', e.target.value)} className={`w-full border px-4 py-3 text-sm outline-none rounded-sm ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'}`} />
                    {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* 3. Payment */}
              <div className="bg-white rounded-sm p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  Payment
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(method => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-sm transition-all ${
                        cartIsEmpty
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : selectedPayment === method.id
                            ? 'border-green-500 bg-green-50 cursor-pointer'
                            : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-4 h-4"
                        disabled={cartIsEmpty}
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 block">{method.name}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                      </div>
                      <div className="flex-shrink-0">{method.logo}</div>
                      {selectedPayment === method.id && <span className="text-green-600 text-xs font-medium ml-1">✓ Selected</span>}
                    </label>
                  ))}
                </div>
                {selectedPayment === 'whish' && (
                  <p className="mt-3 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded p-3">
                    🔗 You'll be redirected to the <strong>Whish app</strong> (or website if not installed) to complete payment.
                  </p>
                )}
                {selectedPayment === 'mastercard' && (
                  <p className="mt-3 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded p-3">
                    🔒 You'll be redirected to our <strong>secure Stripe payment page</strong> to enter your card details.
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-96">
              <div className="bg-white rounded-sm p-6 shadow-md sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">Your cart is empty</p>
                ) : (
                  cartItems.map((item, index) => {
                    const prescription = item.prescription_data || item.prescriptionData || null
                    const hasPrescription = prescription && (prescription.sph_r || prescription.sph_l || prescription.cyl_r || prescription.cyl_l || prescription.axis || prescription.pd)
                    const itemName = item.products?.name || item.name || 'Product'
                    const itemPrice = parseFloat(item.products?.price || item.price || 0)
                    const itemImage = item.products?.image || item.products?.product_variants?.[0]?.images?.[0] || item.image || null

                    return (
                      <div key={index} className="flex gap-3 pb-4 mb-4 border-b border-gray-100">
                        <div className="w-12 h-12 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                          {itemImage
                            ? <img src={itemImage} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{itemName}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          {hasPrescription && (
                            <div className="mt-1 p-1.5 bg-blue-50 rounded-sm border border-blue-100">
                              <p className="text-xs font-medium text-blue-700">Prescription:</p>
                              <div className="text-xs text-blue-600 space-y-0.5">
                                {(prescription.sph_r || prescription.sph_l) && <p>SPH: R {prescription.sph_r || '0.00'} / L {prescription.sph_l || '0.00'}</p>}
                                {(prescription.cyl_r || prescription.cyl_l) && <p>CYL: R {prescription.cyl_r || '0.00'} / L {prescription.cyl_l || '0.00'}</p>}
                                {prescription.axis && <p>Axis: {prescription.axis}°</p>}
                                {prescription.pd && <p>PD: {prescription.pd}mm</p>}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-semibold">${(itemPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    )
                  })
                )}

                {/* Discount Code */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Discount code" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} disabled={discountApplied} className="flex-1 border border-gray-300 px-3 py-2 text-sm outline-none rounded-sm disabled:bg-gray-100" />
                    <button onClick={applyDiscount} disabled={discountApplied || !discountCode} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 rounded-sm disabled:opacity-50">Apply</button>
                  </div>
                  
                  {/* ✅ Discount hints - shown only when no discount is applied */}
                  {!discountApplied && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      <p className="text-xs text-gray-400">
                        Use <span className="font-mono font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">WELCOME10</span> for 10% off
                      </p>
                      <p className="text-xs text-gray-400">
                        Use <span className="font-mono font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">FREESHIP</span> for free shipping
                      </p>
                    </div>
                  )}
                  
                  {discountApplied && (
                    <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                      <Tag size={12} /> Discount applied!
                      <button onClick={() => { setDiscountApplied(false); setDiscountAmount(0); setDiscountCode('') }} className="text-gray-400 hover:text-gray-600 ml-2">Remove</button>
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  {discountSafe > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${discountSafe.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 my-4 py-3 border-y border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500"><Shield size={14} /> Secure</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500"><Truck size={14} /> Fast Shipping</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500"><RotateCcw size={14} /> Easy Returns</div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || loading || stockIssues}
                  className="w-full py-3.5 text-sm font-medium rounded-sm transition-all bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {ctaLabel()}
                </button>

                <Link to="/shop" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-900 mt-4">
                  <ChevronLeft size={16} /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}