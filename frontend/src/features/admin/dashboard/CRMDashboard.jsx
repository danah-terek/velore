import { useCallback, useEffect, useMemo, useState } from 'react'
import { Package, ShoppingCart, Users, Star, Newspaper, TrendingUp } from 'lucide-react'

import { useAdminAuth } from '../auth/AdminAuthContext'
import { adminDashboardService } from '../services/adminDashboardService'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMStatCard from '../shared/CRMStatCard'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'
import CRMStatusBadge from '../shared/CRMStatusBadge'

function normalizeRole(role) {
  if (!role) return null
  if (role === 'admin') return 'staff_admin'
  return role
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

  useEffect(() => {
    load()
  }, [load])

  const cards = useMemo(() => {
    const d = state.data
    if (!d) return []

    const items = [
      { label: 'Products', value: d.products?.total ?? '—', icon: Package, accent: 'sky' },
      { label: 'Orders', value: d.orders?.total ?? '—', icon: ShoppingCart, accent: 'teal' },
      { label: 'Customers', value: d.users?.total ?? '—', icon: Users, accent: 'amber' },
    ]

    if (isSuper && d.revenue?.total !== undefined) {
      items.unshift({
        label: 'Revenue',
        value: `$${Number(d.revenue.total || 0).toLocaleString()}`,
        icon: TrendingUp,
        accent: 'teal',
        hint: 'From completed payments',
      })
    }

    return items
  }, [state.data, isSuper])

  if (state.loading) return <CRMLoadingState label="Loading dashboard…" />
  if (state.error) return <CRMErrorState message={state.error} onRetry={load} />

  const d = state.data
  if (!d) return <CRMEmptyState title="No dashboard data" message="The dashboard did not return any data." />

  return (
    <div className="space-y-6">
      <CRMPageHeader
        title="Dashboard"
        subtitle={isSuper ? 'Operational overview + analytics access' : 'Operational overview'}
      />

      <div className={`grid gap-4 ${cards.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {cards.map((c) => (
          <CRMStatCard
            key={c.label}
            label={c.label}
            value={typeof c.value === 'number' ? c.value.toLocaleString() : c.value}
            icon={c.icon}
            accent={c.accent}
            hint={c.hint}
          />
        ))}
      </div>

      <CRMSectionCard
        title="Recent orders"
        subtitle="Most recent activity from real order data"
      >
        {!Array.isArray(d.recent_orders) || d.recent_orders.length === 0 ? (
          <CRMEmptyState title="No recent orders" message="Orders will appear here once available." />
        ) : (
          <div className="space-y-2">
            {d.recent_orders.map((o) => (
              <div
                key={o.order_id}
                className="flex items-center justify-between gap-4 rounded-[1.05rem] border border-[rgba(var(--velore-border-soft),0.92)] bg-[rgba(var(--velore-pearl),0.85)] px-4 py-3.5 crm-hover-lift"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{o.user || '—'}</div>
                  <div className="text-xs text-slate-500 truncate">
                    #{o.order_id} · {o.date ? new Date(o.date).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CRMStatusBadge tone={o.status === 'pending' ? 'warning' : o.status === 'cancelled' ? 'danger' : 'neutral'}>
                    {o.status}
                  </CRMStatusBadge>
                  <div className="text-sm font-semibold tabular-nums">
                    ${Number(o.amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CRMSectionCard>

      {/* Placeholder slots: these will become real when endpoints exist */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CRMSectionCard title="Reviews" subtitle="Moderation uses real pending/approved endpoints" right={null}>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Star className="w-4 h-4 text-slate-500" />
            Use the Reviews page to approve/reject pending reviews.
          </div>
        </CRMSectionCard>
        <CRMSectionCard title="Blogs" subtitle="Uses real blogs endpoint (published only)">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Newspaper className="w-4 h-4 text-slate-500" />
            Use the Blogs page to view published posts (admin list-all is not available yet).
          </div>
        </CRMSectionCard>
      </div>
    </div>
  )
}

