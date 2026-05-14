import { useEffect, useState, useCallback } from 'react'
import apiClient from '../../shared/services/apiClient'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrdersManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const q = filter ? `&status=${encodeURIComponent(filter)}` : ''
      const response = await apiClient.get(`/admin/orders?page=1&limit=100${q}`)
      setOrders(response?.data || [])
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      const res = await apiClient.patch(`/admin/orders/${orderId}/status`, { status })
      const newStatus = res?.data?.status || status
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    } catch (e) {
      setError(e?.error || e?.message || 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['', ...STATUSES].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500 py-8">Loading orders…</p>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono">#{order.id}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">{order.user?.name || '—'}</span>
                    <span className="block text-xs text-gray-500">{order.user?.email}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.date ? new Date(order.date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{order.items_count ?? 0}</td>
                  <td className="px-4 py-3 text-gray-900">${Number(order.payment?.amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status || 'pending'}
                      disabled={updatingId === order.id}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="border border-gray-300 px-2 py-1.5 text-sm bg-white capitalize"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
