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

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return { border: '1px solid rgba(251,191,36,0.40)', color: '#92660a', background: 'rgba(251,191,36,0.08)' }
    case 'cancelled':
      return { border: '1px solid rgba(224,85,85,0.35)', color: '#b03a3a', background: 'rgba(224,85,85,0.06)' }
    case 'completed':
      return { border: '1px solid rgba(118,205,214,0.40)', color: '#76CDD6', background: 'rgba(118,205,214,0.08)' }
    default:
      return { border: '1px solid rgba(30,29,34,0.15)', color: 'rgba(30,29,34,0.50)', background: 'rgba(30,29,34,0.04)' }
  }
}

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

  useEffect(() => { load() }, [load])

  const cards = useMemo(() => {
    const d = state.data
    if (!d) return []
    const items = [
      { label: 'Products',  value: d.products?.total ?? '—', icon: Package },
      { label: 'Orders',    value: d.orders?.total ?? '—',   icon: ShoppingCart },
      { label: 'Customers', value: d.users?.total ?? '—',    icon: Users },
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
  if (state.error)   return <CRMErrorState message={state.error} onRetry={load} />

  const d = state.data
  if (!d) return <CRMEmptyState title="No dashboard data" message="The dashboard did not return any data." />

  return (
    <div className="space-y-10 min-h-screen" style={{ background: '#EFF8FE' }}>

      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}>
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#76CDD6' }}>
          Operations
        </span>
        <h1 className="text-4xl font-light mt-2" style={{ color: '#1E1D22' }}>Dashboard</h1>
        <p className="text-sm mt-2 font-light" style={{ color: 'rgba(30,29,34,0.50)' }}>
          {isSuper ? 'Operational overview + analytics access.' : 'Operational overview.'}
        </p>
      </div>

      {/* KPI Grid */}
      <div className={`grid gap-5 ${cards.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {cards.map((c) => (
          <KPICard key={c.label} c={c} />
        ))}
      </div>

      {/* Recent Orders */}
      <div
        className="p-8"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(118,205,214,0.22)',
          borderRadius: '4px',
        }}
      >
        <div className="mb-6">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#1E1D22' }}>
            Recent Orders
          </h2>
          <p className="text-[10px] mt-1" style={{ color: '#76CDD6' }}>Real-time activity log</p>
        </div>

        {!Array.isArray(d.recent_orders) || d.recent_orders.length === 0 ? (
          <CRMEmptyState title="No recent orders" message="Orders will appear here once available." />
        ) : (
          <div style={{ borderTop: '1px solid rgba(118,205,214,0.18)' }}>
            {d.recent_orders.map((o) => (
              <div
                key={o.order_id}
                className="flex items-center justify-between py-5"
                style={{ borderBottom: '1px solid rgba(118,205,214,0.13)' }}
              >
                <div>
                  <div className="text-sm font-bold" style={{ color: '#1E1D22' }}>{o.user || '—'}</div>
                  <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'rgba(30,29,34,0.40)' }}>
                    #{o.order_id} · {o.date ? new Date(o.date).toLocaleDateString() : '—'}
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1"
                    style={{ borderRadius: '4px', ...getStatusStyles(o.status) }}
                  >
                    {o.status}
                  </span>
                  <div className="text-sm font-bold tabular-nums" style={{ color: '#1E1D22' }}>
                    ${Number(o.amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Secondary Modules */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div
          className="p-8"
          style={{ background: '#ffffff', border: '1px solid rgba(118,205,214,0.22)', borderRadius: '4px' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#1E1D22' }}>
            Reviews
          </h3>
          <div className="flex items-center gap-3 text-xs italic" style={{ color: 'rgba(30,29,34,0.45)' }}>
            <Star className="w-4 h-4 shrink-0" style={{ color: '#76CDD6' }} />
            Use the Reviews page to approve / reject pending reviews.
          </div>
        </div>
        <div
          className="p-8"
          style={{ background: '#ffffff', border: '1px solid rgba(118,205,214,0.22)', borderRadius: '4px' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#1E1D22' }}>
            Blogs
          </h3>
          <div className="flex items-center gap-3 text-xs italic" style={{ color: 'rgba(30,29,34,0.45)' }}>
            <Newspaper className="w-4 h-4 shrink-0" style={{ color: '#76CDD6' }} />
            Use the Blogs page to view published posts.
          </div>
        </div>
      </div>

    </div>
  )
}

function KPICard({ c }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="p-8 transition-all duration-300 cursor-default"
      style={{
        background: hovered ? '#76CDD6' : '#ffffff',
        border: `1px solid ${hovered ? '#76CDD6' : 'rgba(118,205,214,0.25)'}`,
        borderRadius: '4px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <c.icon
        className="w-5 h-5 mb-6 transition-colors duration-300"
        style={{ color: hovered ? '#EFF8FE' : '#76CDD6' }}
      />
      <div
        className="text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-300"
        style={{ color: hovered ? 'rgba(239,248,254,0.70)' : 'rgba(30,29,34,0.45)' }}
      >
        {c.label}
      </div>
      <div
        className="text-3xl font-light mt-1 transition-colors duration-300"
        style={{ color: hovered ? '#ffffff' : '#1E1D22' }}
      >
        {c.value}
      </div>
      {c.hint && (
        <div
          className="text-[9px] font-serif italic mt-2 transition-colors duration-300"
          style={{ color: hovered ? 'rgba(239,248,254,0.60)' : 'rgba(30,29,34,0.38)' }}
        >
          {c.hint}
        </div>
      )}
    </div>
  )
}