// PaymentSuccess.jsx
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Mail } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)
  
  useEffect(() => {
    const orderId = searchParams.get('orderId')
    const orderNumber = searchParams.get('orderNumber')
    const amount = searchParams.get('amount')
    
    if (orderId) {
      setOrderDetails({
        orderId,
        orderNumber: orderNumber || orderId,
        amount: amount || '0.00'
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
          Order Confirmed!
        </h1>
        
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        
        {orderDetails && (
          <div className="bg-gray-50 rounded-sm p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Number:</span>
              <span className="text-gray-900 font-medium">{orderDetails.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="text-gray-900 font-medium">${orderDetails.amount}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <Mail size={16} />
          <span>Order confirmation sent to your email</span>
        </div>
        
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/shop"
            className="block w-full text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Browse More Products
          </Link>
        </div>
      </div>
    </div>
  )
}