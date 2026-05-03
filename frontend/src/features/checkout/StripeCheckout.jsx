import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import apiClient from '../../shared/services/apiClient'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function CheckoutForm({ amount, orderNumber, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    try {
      // 1. Get client secret from backend
      const { data } = await apiClient.post('/payments/create-intent', {
        amount,
        currency: 'usd',
        orderNumber
      })

      // 2. Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      })

      if (stripeError) {
        setError(stripeError.message)
        setProcessing(false)
        return
      }

      // 3. Confirm with backend
      await apiClient.post('/payments/confirm', {
        paymentIntentId: paymentIntent.id,
        orderData: { orderNumber, amount }
      })

      onSuccess(paymentIntent.id)
    } catch (err) {
      setError(err.error || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-sm p-3">
        <CardElement options={{
          style: {
            base: {
              fontSize: '14px',
              color: '#111827',
              '::placeholder': { color: '#9CA3AF' }
            }
          }
        }} />
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-700 transition-colors rounded-sm disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  )
}

export default function StripeCheckout({ amount, orderNumber, onSuccess, onError }) {
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    // Fallback for demo mode
    return (
      <div className="text-center p-4">
        <button
          onClick={() => onSuccess('demo_' + Date.now())}
          className="w-full bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-700 transition-colors rounded-sm"
        >
          [DEMO] Pay ${amount.toFixed(2)}
        </button>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} orderNumber={orderNumber} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}