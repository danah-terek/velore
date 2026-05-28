import { useCallback, useEffect, useMemo, useState } from 'react'
import { Package, ShoppingCart, Users, Star, Newspaper, TrendingUp } from 'lucide-react'

import { useAdminAuth } from '../auth/AdminAuthContext'
import { adminDashboardService } from '../services/adminDashboardService'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'

function normalizeRole(role) {
  if (!role) return null
  if (role === 'admin') return 'staff_admin'
  return role
}

// Elegant, muted status palette
const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'cancelled':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    case 'completed':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    default:
      return 'bg-gray-50 text-gray-800 border-gray-200';
  }
};

export default function CRMDashboard() {
  const { admin } = useAdminAuth()
  const role = normalizeRole(admin?.role)
  const isSuper = role === 'super_admin'

  const [state, setState] = useState({ loading: true, error: null, data: null })

  const load = useCallback(async () => {
    setState({ loading: true, error: null, data: null })
    try {
      const res = await adminDashboardService.getDashboard()
      setState({ loading: false, error: null, data: res.data })
    } catch (e) {
      setState({ loading: false, error: e?.message || e?.error || 'Failed to load dashboard', data: null })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const cards = useMemo(() => {
    const d = state.data
    if (!d) return []
    const items = [
      { label: 'Products', value: d.products?.total ?? '—', icon: Package },
      { label: 'Orders', value: d.orders?.total ?? '—', icon: ShoppingCart },
      { label: 'Customers', value: d.users?.total ?? '—', icon: Users },
    ]
    if (isSuper && d.revenue?.total !== undefined) {
      items.unshift({
        label: 'Revenue',
        value: `$${Number(d.revenue.total || 0).toLocaleString()}`,
        icon: TrendingUp,
        hint: 'Completed payments',
      })
    }
    return items
  }, [state.data, isSuper])

  if (state.loading) return <CRMLoadingState label="Loading dashboard…" />
  if (state.error) return <CRMErrorState message={state.error} onRetry={load} />

  const d = state.data
  if (!d) return <CRMEmptyState title="No dashboard data" message="The dashboard did not return any data." />

  return (
    <div className="space-y-12 bg-white min-h-screen">
      <CRMPageHeader
        title="Dashboard"
        subtitle={isSuper ? 'Operational Overview + Analytics Access' : 'Operational Overview'}
      />

      {/* KPI Grid */}
      <div className={`grid gap-6 ${cards.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {cards.map((c) => (
          <div key={c.label} className="border border-black p-8 hover:bg-black group transition-colors">
            <c.icon className="w-5 h-5 text-black group-hover:text-white mb-6" />
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 group-hover:text-gray-300">{c.label}</div>
            <div className="text-3xl font-light text-black group-hover:text-white mt-1">{c.value}</div>
            {c.hint && <div className="text-[9px] font-serif italic text-gray-400 mt-2">{c.hint}</div>}
          </div>
        ))}
      </div>

      {/* Recent Orders List */}
      <CRMSectionCard title="Recent orders" subtitle="Real-time activity log">
        {!Array.isArray(d.recent_orders) || d.recent_orders.length === 0 ? (
          <CRMEmptyState title="No recent orders" message="Orders will appear here once available." />
        ) : (
          <div className="space-y-0 border-t border-black">
            {d.recent_orders.map((o) => (
              <div key={o.order_id} className="flex items-center justify-between py-6 border-b border-black">
                <div>
                  <div className="text-sm font-bold text-black">{o.user || '—'}</div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500">
                    #{o.order_id} · {o.date ? new Date(o.date).toLocaleDateString() : '—'}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Elegant Color-Coded Status */}
                  <span className={`text-[9px] font-bold uppercase tracking-[0.1em] border px-3 py-1 ${getStatusStyles(o.status)}`}>
                    {o.status}
                  </span>
                  <div className="text-sm font-bold tabular-nums">
                    ${Number(o.amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CRMSectionCard>

      {/* Secondary Modules */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-black p-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Reviews</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500 italic">
            <Star className="w-4 h-4 text-black" />
            Use the Reviews page to approve/reject pending reviews.
          </div>
        </div>
        <div className="border border-black p-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Blogs</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500 italic">
            <Newspaper className="w-4 h-4 text-black" />
            Use the Blogs page to view published posts.
          </div>
        </div>
      </div>
    </div>
  )
}