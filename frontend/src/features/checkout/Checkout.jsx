// Checkout.jsx - Updated with all improvements
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Truck, Shield, RotateCcw, Tag } from 'lucide-react'

const MOCK_CART_ITEMS = [
  {
    id: 1,
    name: "MIU MIU Eyewear logo-print glasses",
    price: 264.00,
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
    quantity: 1,
    color: "Purple",
    prescription: "3.5R / 3.0L",
    colorHex: '#8B0000'
  }
]

const COUNTRIES = ['Lebanon', 'United States', 'Canada', 'United Kingdom', 'France', 'UAE']
const FREE_SHIPPING_THRESHOLD = 50

const PAYMENT_METHODS = [
  { 
    id: 'whish', 
    name: 'Whish Pay', 
    icon: 'https://play-lh.googleusercontent.com/KhI49b7VQF4n6oaA5bpHyRw9QlUOj6nDpXkHcCoSi5VNVZ-krKWLkaNpWfA9E5PZlA=s48-rw',
    description: 'Pay with Whish app'
  },
  { 
    id: 'mastercard', 
    name: 'Credit Card', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    description: 'Visa, Mastercard, Amex'
  },
  { 
    id: 'cod', 
    name: 'Cash on Delivery', 
    icon: null,
    description: 'Pay when you receive'
  }
]

export default function Checkout() {
  const [contactInfo, setContactInfo] = useState({ email: '', newsletter: false })
  const [shippingAddress, setShippingAddress] = useState({
    country: 'Lebanon',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    phone: ''
  })
  const [selectedPayment, setSelectedPayment] = useState('mastercard')
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [billingAddress, setBillingAddress] = useState(null)
  const [saveInfo, setSaveInfo] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)

  const subtotal = MOCK_CART_ITEMS.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 10
  const total = subtotal + shipping - discountAmount

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'WELCOME10' && !discountApplied) {
      setDiscountAmount(subtotal * 0.1)
      setDiscountApplied(true)
    } else if (discountCode.toUpperCase() === 'FREESHIP' && !discountApplied) {
      setDiscountApplied(true)
    } else {
      alert('Invalid discount code')
    }
  }

  const handlePayment = () => {
    const method = PAYMENT_METHODS.find(m => m.id === selectedPayment)
    const orderId = `ORDER-${Date.now()}`
    
    if (method.id === 'cod') {
      alert(`Order placed! You'll pay $${total.toFixed(2)} upon delivery.`)
      window.location.href = `/payment-success?orderId=${orderId}&amount=${total}&method=cod`
      return
    }
    
    const confirm = window.confirm(
      `[DEMO MODE]\n\nPay $${total.toFixed(2)} via ${method.name}?\n\nClick OK to simulate successful payment.`
    )
    
    if (confirm) {
      window.location.href = `/payment-success?orderId=${orderId}&amount=${total}&method=${method.id}`
    }
  }

  const isFormValid = () => {
    return contactInfo.email && 
           shippingAddress.firstName && 
           shippingAddress.lastName && 
           shippingAddress.address && 
           shippingAddress.city && 
           shippingAddress.phone
  }

  const handleShippingChange = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
  }

  const handleBillingChange = (field, value) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
     

      <div className="px-6 md:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>

          {/* Free Shipping Banner */}
          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-sm p-4 mb-6">
              <div className="flex items-center gap-3">
                <Truck className="text-blue-600" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more to get FREE shipping!
                  </p>
                  <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${(subtotal / FREE_SHIPPING_THRESHOLD) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1 space-y-6">
              
              {/* Contact */}
              <div className="bg-white rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Contact
                </h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all rounded-sm"
                />
                <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={contactInfo.newsletter}
                    onChange={(e) => setContactInfo({ ...contactInfo, newsletter: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Email me with news and offers</span>
                </label>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  Delivery
                </h2>
                <div className="space-y-4">
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => handleShippingChange('country', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all rounded-sm bg-white"
                  >
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First name" value={shippingAddress.firstName} onChange={(e) => handleShippingChange('firstName', e.target.value)} className="border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all rounded-sm" />
                    <input type="text" placeholder="Last name" value={shippingAddress.lastName} onChange={(e) => handleShippingChange('lastName', e.target.value)} className="border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all rounded-sm" />
                  </div>
                  
                  <input type="text" placeholder="Address" value={shippingAddress.address} onChange={(e) => handleShippingChange('address', e.target.value)} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all rounded-sm" />
                  <input type="text" placeholder="Apartment (optional)" value={shippingAddress.apartment} onChange={(e) => handleShippingChange('apartment', e.target.value)} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all rounded-sm" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City" value={shippingAddress.city} onChange={(e) => handleShippingChange('city', e.target.value)} className="border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all rounded-sm" />
                    <input type="text" placeholder="Postal code" value={shippingAddress.postalCode} onChange={(e) => handleShippingChange('postalCode', e.target.value)} className="border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all rounded-sm" />
                  </div>
                  
                  <input type="tel" placeholder="Phone" value={shippingAddress.phone} onChange={(e) => handleShippingChange('phone', e.target.value)} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all rounded-sm" />
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  Payment
                </h2>
                <p className="text-xs text-gray-500 mb-4 ml-8">All transactions are secure and encrypted.</p>
                
                <div className="space-y-3 ml-8">
                  {PAYMENT_METHODS.map(method => (
                    <label 
                      key={method.id} 
                      className={`flex items-center gap-4 p-4 border-2 rounded-sm cursor-pointer transition-all ${
                        selectedPayment === method.id 
                          ? 'border-green-500 bg-green-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="payment" 
                        value={method.id} 
                        checked={selectedPayment === method.id} 
                        onChange={(e) => setSelectedPayment(e.target.value)} 
                        className="w-4 h-4 text-green-600 focus:ring-green-500" 
                      />
                      {method.icon ? (
                        <img src={method.icon} alt={method.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-2xl">💰</span>
                      )}
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{method.name}</span>
                        <p className="text-xs text-gray-500">{method.description}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <span className="text-green-600 text-xs font-medium">✓ Selected</span>
                      )}
                    </label>
                  ))}
                </div>

                <label className="flex items-center gap-2 mt-6 ml-8 cursor-pointer group">
                  <input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-gray-900" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Same as shipping address</span>
                </label>

                {!sameAsShipping && (
                  <div className="space-y-4 mt-4 ml-8">
                    <select onChange={(e) => handleBillingChange('country', e.target.value)} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 rounded-sm bg-white">
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First name" onChange={(e) => handleBillingChange('firstName', e.target.value)} className="border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 rounded-sm" />
                      <input type="text" placeholder="Last name" onChange={(e) => handleBillingChange('lastName', e.target.value)} className="border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 rounded-sm" />
                    </div>
                    <input type="text" placeholder="Address" onChange={(e) => handleBillingChange('address', e.target.value)} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 rounded-sm" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="City" onChange={(e) => handleBillingChange('city', e.target.value)} className="border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 rounded-sm" />
                      <input type="text" placeholder="Postal code" onChange={(e) => handleBillingChange('postalCode', e.target.value)} className="border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 rounded-sm" />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 mt-4 ml-8 cursor-pointer group">
                  <input type="checkbox" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-gray-900" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Save this information for next time</span>
                </label>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:w-96">
              <div className="bg-white rounded-sm p-6 shadow-md sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {MOCK_CART_ITEMS.map(item => (
                  <div key={item.id} className="flex gap-3 pb-4 mb-4 border-b border-gray-100">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-sm overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: item.colorHex }} />
                        <span className="text-xs text-gray-500">{item.color}</span>
                      </div>
                      {item.prescription && <p className="text-xs text-gray-500 mt-1">{item.prescription}</p>}
                    </div>
                    <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                ))}

                {/* Discount Code */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Discount Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      disabled={discountApplied}
                      className="flex-1 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 rounded-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <button
                      onClick={applyDiscount}
                      disabled={discountApplied || !discountCode}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                  {discountApplied && (
                    <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                      <Tag size={12} /> Discount applied!
                      <button 
                        onClick={() => {
                          setDiscountApplied(false)
                          setDiscountAmount(0)
                          setDiscountCode('')
                        }}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                      >
                        Remove
                      </button>
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Try: WELCOME10 or FREESHIP</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discountApplied && discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (10%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600' : 'text-gray-900'}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {subtotal >= FREE_SHIPPING_THRESHOLD && (
                    <p className="text-xs text-green-600">✓ Free shipping applied!</p>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-semibold text-base">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">USD</p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 my-4 py-3 border-y border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Shield size={14} /> Secure
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Truck size={14} /> Fast Shipping
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <RotateCcw size={14} /> Easy Returns
                  </div>
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={!isFormValid()} 
                  className={`w-full py-3.5 text-sm font-medium transition-all rounded-sm ${
                    isFormValid() 
                      ? 'bg-gray-900 text-white hover:bg-gray-700 shadow-md hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  COMPLETE ORDER • ${total.toFixed(2)}
                </button>

                <Link to="/shop" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-900 mt-4 transition-colors group">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}