import { useEffect, useState, useCallback } from 'react'
import apiClient from '../../shared/services/apiClient'

export default function CustomersList() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loyalty, setLoyalty] = useState(null)
  const [orders, setOrders] = useState([])
  const [actionId, setActionId] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const q = search ? `&search=${encodeURIComponent(search)}` : ''
      const res = await apiClient.get(`/admin/users?page=1&limit=50${q}`)
      setUsers(res?.data || [])
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to load customers')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleSearch = (e) => {
    e.preventDefault()
    loadUsers()
  }

  const toggleUser = async (id) => {
    setActionId(id)
    try {
      const res = await apiClient.patch(`/admin/users/${id}/toggle-status`)
      const active = res?.data?.is_active
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: active } : u)))
      if (selected?.id === id) setSelected((s) => ({ ...s, is_active: active }))
    } catch (e) {
      setError(e?.error || e?.message || 'Toggle failed')
    } finally {
      setActionId(null)
    }
  }

  const openUser = async (user) => {
    setSelected(user)
    setDetail(null)
    setLoyalty(null)
    setOrders([])
    try {
      const [uRes, allOrdersRes, loyRes] = await Promise.all([
        apiClient.get(`/admin/users/${user.id}`),
        apiClient.get('/admin/orders?page=1&limit=200'),
        apiClient.get(`/loyalty/${user.id}`).catch(() => null)
      ])
      setDetail(uRes?.data || uRes)
      const all = allOrdersRes?.data || []
      setOrders(all.filter((o) => o.user?.email === user.email))
      const lData = loyRes?.data
      setLoyalty(lData || null)
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to load customer detail')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email"
            className="w-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="bg-gray-900 text-white hover:bg-gray-700 px-6 py-2.5 text-sm font-medium transition-colors">
          Search
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500 py-8">Loading customers…</p>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Name', 'Email', 'Points', 'Orders', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => openUser(u)}>
                  <td className="px-4 py-3 text-gray-900">{u.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3">{u.loyalty_points ?? 0}</td>
                  <td className="px-4 py-3">{u.orders_count ?? 0}</td>
                  <td className="px-4 py-3">{u.is_active ? 'Active' : 'Disabled'}</td>
                  <td className="px-4 py-3 text-gray-600">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={actionId === u.id}
                      onClick={() => toggleUser(u.id)}
                      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm transition-colors"
                    >
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">{selected.name || selected.email}</h3>
          {detail && (
            <p className="text-sm text-gray-600 mb-4">Orders (total): {detail.orders_count ?? orders.length}</p>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Order history</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-sm p-3">
                {orders.length === 0 ? (
                  <p className="text-sm text-gray-500">No orders found.</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="text-sm border-b border-gray-100 pb-2">
                      <span className="font-mono">#{o.id}</span>
                      <span className="text-gray-600"> · {o.status} · ${Number(o.payment?.amount || 0).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Loyalty</h4>
              {!loyalty ? (
                <p className="text-sm text-gray-500">No loyalty data.</p>
              ) : (
                <div className="text-sm space-y-2">
                  <p>Balance: <strong>{loyalty.currentPoints ?? loyalty.current_points ?? 0}</strong> pts</p>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-sm p-3">
                    {(loyalty.transactions || []).map((t) => (
                      <div key={t.transaction_id} className="border-b border-gray-100 py-1">
                        {t.type} {t.points > 0 ? '+' : ''}{t.points} · {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button type="button" onClick={() => { setSelected(null); setDetail(null); setLoyalty(null); setOrders([]) }} className="mt-4 text-sm text-gray-700 underline">
            Close detail
          </button>
        </div>
      )}
    </div>
  )
}
