// PaymentSuccess.jsx
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)
  
  useEffect(() => {
    // Get order details from URL params or fetch from your backend
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')
    
    if (orderId) {
      setOrderDetails({
        orderId,
        status: status || 'success',
        amount: searchParams.get('amount') || '264.00'
      })
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-sm p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        {orderDetails && (
          <div className="bg-gray-50 rounded-sm p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Order ID:</span>
              <span className="text-gray-900 font-medium">{orderDetails.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="text-gray-900 font-medium">${orderDetails.amount}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/account/orders"
            className="block w-full text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            View Order Status
          </Link>
        </div>
      </div>
    </div>
  )
}