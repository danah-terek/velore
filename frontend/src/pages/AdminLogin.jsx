import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../shared/services/apiClient'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiClient.post('/admin/login', { email, password })
      const payload = res?.data
      const token = payload?.token
      const admin = payload?.admin
      if (!token || !admin) {
        setError('Invalid response from server')
        setLoading(false)
        return
      }
      sessionStorage.setItem('admin_token', token)
      sessionStorage.setItem('velore_admin_user', JSON.stringify(admin))
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err?.error || err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-sm shadow-sm p-6 md:p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Admin sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Velore control panel</p>

        {error && (
          <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white hover:bg-gray-700 px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/" className="text-gray-900 hover:underline">Back to store</Link>
        </p>
      </div>
    </div>
  )
}