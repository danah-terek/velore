import { useEffect, useState } from 'react'
import apiClient from '../../shared/services/apiClient'

export default function AnalyticsPage() {
  const [dash, setDash] = useState(null)
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [d, o, u, p] = await Promise.all([
          apiClient.get('/admin/dashboard'),
          apiClient.get('/admin/orders?page=1&limit=500'),
          apiClient.get('/admin/users?page=1&limit=100'),
          apiClient.get('/admin/products?page=1&limit=100')
        ])
        if (!cancelled) {
          setDash(d?.data)
          setOrders(o?.data || [])
          setUsers(u?.data || [])
          setProducts(p?.data || [])
        }
      } catch (e) {
        if (!cancelled) setError(e?.error || e?.message || 'Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <p className="text-sm text-gray-500 py-8">Loading analytics…</p>
  if (error) return <p className="text-sm text-red-600 py-8">{error}</p>

  const revenue = Number(dash?.revenue?.total || 0)
  const completedOrders = orders.filter((x) => x.status === 'delivered').length

  const revenueByMonth = {}
  orders.forEach((ord) => {
    if (!ord.date) return
    const d = new Date(ord.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(ord.payment?.amount || 0)
  })
  const monthKeys = Object.keys(revenueByMonth).sort().slice(-6)
  const maxMonth = Math.max(...monthKeys.map((k) => revenueByMonth[k]), 1)

  const topCustomers = [...users]
    .sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0))
    .slice(0, 5)

  const topProducts = [...products].slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-sm shadow-sm p-6 border border-gray-200">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Total revenue</p>
          <p className="text-2xl font-semibold text-gray-900">${revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-sm shadow-sm p-6 border border-gray-200">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Delivered orders (sample)</p>
          <p className="text-2xl font-semibold text-gray-900">{completedOrders}</p>
        </div>
        <div className="bg-white rounded-sm shadow-sm p-6 border border-gray-200">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Active users</p>
          <p className="text-2xl font-semibold text-gray-900">{dash?.users?.active ?? 0}</p>
        </div>
        <div className="bg-white rounded-sm shadow-sm p-6 border border-gray-200">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Catalog products</p>
          <p className="text-2xl font-semibold text-gray-900">{dash?.products?.total ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Orders over time (by month, revenue)</h2>
        <div className="space-y-3">
          {monthKeys.length === 0 ? (
            <p className="text-sm text-gray-500">Not enough order data.</p>
          ) : (
            monthKeys.map((k) => {
              const v = revenueByMonth[k]
              const pct = Math.round((v / maxMonth) * 100)
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>{k}</span>
                    <span>${v.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-sm overflow-hidden">
                    <div className="h-full bg-gray-900 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-sm shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Top customers (by order count)</h2>
          <ul className="space-y-2 text-sm">
            {topCustomers.map((c) => (
              <li key={c.id} className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-900">{c.name || c.email}</span>
                <span className="text-gray-600">{c.orders_count ?? 0} orders</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-sm shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Products snapshot</h2>
          <ul className="space-y-2 text-sm">
            {topProducts.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-900 truncate pr-2">{p.name}</span>
                <span className="text-gray-600 flex-shrink-0">${Number(p.price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
