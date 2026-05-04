import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
const res = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      setStatus('success')
      setMessage(data.message || 'Check your email for a reset link.')
    } catch (err) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Forgot Password</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

        {status === 'success' ? (
          <div className="text-center">
            <div className="text-green-600 text-4xl mb-4">✅</div>
            <p className="text-gray-700">{message}</p>
            <Link to="/login" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition"
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}