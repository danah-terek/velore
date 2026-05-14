import { useEffect, useState } from 'react'
import apiClient from '../../shared/services/apiClient'

export default function StaffManagement() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('admin')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [admins, setAdmins] = useState([])
  const [listError, setListError] = useState('')

  const loadAdmins = async () => {
    setListError('')
    try {
      const res = await apiClient.get('/admin/admins')
      const list = res?.data || []
      setAdmins(Array.isArray(list) ? list : [])
    } catch (e) {
      setAdmins([])
      setListError(e?.error || e?.message || 'Could not load admin list (GET /admin/admins may not be available yet).')
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      await apiClient.post('/admin/admins', { email, password, name, role })
      setMessage('Admin account created.')
      setEmail('')
      setPassword('')
      setName('')
      setRole('admin')
      loadAdmins()
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to create admin')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Create admin account</h2>
        {message && <p className="text-sm text-green-700 mb-3">{message}</p>}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4 max-w-3xl">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm bg-white">
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 text-white hover:bg-gray-700 px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create admin'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Existing admins</h2>
        {listError && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-3 mb-4">{listError}</p>}
        <div className="overflow-x-auto border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Role'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 && !listError ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No admins loaded.</td></tr>
              ) : (
                admins.map((a) => (
                  <tr key={a.id || a.email} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">{a.name || '—'}</td>
                    <td className="px-4 py-3">{a.email}</td>
                    <td className="px-4 py-3 capitalize">{a.role || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
