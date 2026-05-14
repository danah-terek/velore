import { useEffect, useState } from 'react'
import apiClient from '../../shared/services/apiClient'

export default function DashboardOverview() {
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await apiClient.get('/admin/dashboard')
        const data = res?.data
        if (!cancelled) setDash(data)
      } catch (e) {
        if (!cancelled) setError(e?.error || e?.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <p className="text-sm text-gray-500 py-8">Loading dashboard…</p>
  }
  if (error) {
    return <p className="text-sm text-red-600 py-8">{error}</p>
  }
  if (!dash) return null

  const cards = [
    { label: 'Total Users', value: dash.users?.total ?? 0 },
    { label: 'Active Users', value: dash.users?.active ?? 0 },
    { label: 'Total Orders', value: dash.orders?.total ?? 0 },
    { label: 'Pending Orders', value: dash.orders?.pending ?? 0 },
    { label: 'Total Products', value: dash.products?.total ?? 0 },
    { label: 'Revenue', value: `$${Number(dash.revenue?.total || 0).toLocaleString()}` }
  ]

  const recent = dash.recent_orders || []

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-sm shadow-sm p-6 border border-gray-200">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{c.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-2xl font-semibold px-6 py-4 border-b border-gray-200">Recent orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Order', 'Customer', 'Date', 'Status', 'Amount'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No recent orders</td>
                </tr>
              ) : (
                recent.map((row) => (
                  <tr key={row.order_id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">#{row.order_id}</td>
                    <td className="px-4 py-3 text-gray-700">{row.user || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.date ? new Date(row.date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{row.status || '—'}</td>
                    <td className="px-4 py-3 text-gray-900">${Number(row.amount || 0).toFixed(2)}</td>
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
