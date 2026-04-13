// Checkout.jsx - No API Required, Works Instantly
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

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

const PAYMENT_METHODS = [
  { id: 'whish', name: 'Whish Pay', icon: '💳' },
  { id: 'mastercard', name: 'Credit Card (Mastercard/Visa)', icon: '💳' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💰' }
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

  const subtotal = MOCK_CART_ITEMS.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal

  const handlePayment = () => {
    const method = PAYMENT_METHODS.find(m => m.id === selectedPayment)
    const orderId = `ORDER-${Date.now()}`
    
    if (method.id === 'cod') {
      alert(`Order placed! You'll pay $${total.toFixed(2)} upon delivery.`)
      window.location.href = `/payment-success?orderId=${orderId}&amount=${total}&method=cod`
      return
    }
    
    // Demo simulation - no API needed
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
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 md:px-16 py-6">
          <Link to="/" className="text-2xl font-semibold text-gray-900">VELORE</Link>
        </div>
      </div>

      <div className="px-6 md:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/cart" className="hover:text-gray-900">Cart</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1 space-y-6">
              
              {/* Contact */}
              <div className="bg-white rounded-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                />
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactInfo.newsletter}
                    onChange={(e) => setContactInfo({ ...contactInfo, newsletter: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">Email me with news and offers</span>
                </label>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery</h2>
                <div className="space-y-4">
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => handleShippingChange('country', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none bg-white"
                  >
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First name" onChange={(e) => handleShippingChange('firstName', e.target.value)} className="border border-gray-300 px-4 py-2.5 text-sm" />
                    <input type="text" placeholder="Last name" onChange={(e) => handleShippingChange('lastName', e.target.value)} className="border border-gray-300 px-4 py-2.5 text-sm" />
                  </div>
                  
                  <input type="text" placeholder="Address" onChange={(e) => handleShippingChange('address', e.target.value)} className="w-full border border-gray-300 px-4 py-2.5 text-sm" />
                  <input type="text" placeholder="Apartment (optional)" onChange={(e) => handleShippingChange('apartment', e.target.value)} className="w-full border border-gray-300 px-4 py-2.5 text-sm" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City" onChange={(e) => handleShippingChange('city', e.target.value)} className="border border-gray-300 px-4 py-2.5 text-sm" />
                    <input type="text" placeholder="Postal code" onChange={(e) => handleShippingChange('postalCode', e.target.value)} className="border border-gray-300 px-4 py-2.5 text-sm" />
                  </div>
                  
                  <input type="tel" placeholder="Phone" onChange={(e) => handleShippingChange('phone', e.target.value)} className="w-full border border-gray-300 px-4 py-2.5 text-sm" />
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment</h2>
                <p className="text-xs text-gray-500 mb-4">All transactions are secure and encrypted.</p>
                
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(method => (
                    <label key={method.id} className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer ${selectedPayment === method.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                      <input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={(e) => setSelectedPayment(e.target.value)} className="w-4 h-4" />
                      <span className="text-xl">{method.icon}</span>
                      <span className="font-medium text-gray-900">{method.name}</span>
                    </label>
                  ))}
                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-gray-600">Same as shipping address</span>
                </label>

                {!sameAsShipping && (
                  <div className="space-y-4 mt-4">
                    <select onChange={(e) => handleBillingChange('country', e.target.value)} className="w-full border border-gray-300 px-4 py-2.5 text-sm bg-white">
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First name" onChange={(e) => handleBillingChange('firstName', e.target.value)} className="border border-gray-300 px-4 py-2.5 text-sm" />
                      <input type="text" placeholder="Last name" onChange={(e) => handleBillingChange('lastName', e.target.value)} className="border border-gray-300 px-4 py-2.5 text-sm" />
                    </div>
                    <input type="text" placeholder="Address" onChange={(e) => handleBillingChange('address', e.target.value)} className="w-full border border-gray-300 px-4 py-2.5 text-sm" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="City" onChange={(e) => handleBillingChange('city', e.target.value)} className="border border-gray-300 px-4 py-2.5 text-sm" />
                      <input type="text" placeholder="Postal code" onChange={(e) => handleBillingChange('postalCode', e.target.value)} className="border border-gray-300 px-4 py-2.5 text-sm" />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input type="checkbox" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-gray-600">Save this information for next time</span>
                </label>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:w-96">
              <div className="bg-white rounded-sm p-6 sticky top-24">
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
                    <p className="text-sm font-semibold">${item.price}</p>
                  </div>
                ))}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>Free</span></div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
                  </div>
                </div>

                <button onClick={handlePayment} disabled={!isFormValid()} className={`w-full mt-6 py-3 text-sm font-medium ${isFormValid() ? 'bg-gray-900 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  COMPLETE ORDER
                </button>

                <Link to="/" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-900 mt-4">
                  <ChevronLeft size={16} /> Return to shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}