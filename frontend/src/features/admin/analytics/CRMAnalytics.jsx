import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, ShoppingCart, Users } from 'lucide-react'

import { adminAnalyticsService } from '../services/adminAnalyticsService'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'
import CRMStatCard from '../shared/CRMStatCard'
import CRMSectionCard from '../shared/CRMSectionCard'

export default function CRMAnalytics() {
  const [state, setState] = useState({ loading: true, error: null, data: null })

  const load = useCallback(async () => {
    setState({ loading: true, error: null, data: null })
    try {
      const res = await adminAnalyticsService.getAnalytics()
      setState({ loading: false, error: null, data: res.data })
    } catch (e) {
      setState({ loading: false, error: e?.message || e?.error || 'Failed to load analytics', data: null })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const cards = useMemo(() => {
    const d = state.data
    if (!d) return []
    return [
      {
        label: 'Revenue',
        value: `$${Number(d.revenue?.total || 0).toLocaleString()}`,
        hint: 'Completed payments only',
        icon: BarChart3,
        accent: 'teal',
      },
      {
        label: 'Orders',
        value: Number(d.orders?.total || 0).toLocaleString(),
        hint: 'All orders',
        icon: ShoppingCart,
        accent: 'sky',
      },
      {
        label: 'Customers',
        value: Number(d.customers?.total || 0).toLocaleString(),
        hint: 'Registered users',
        icon: Users,
        accent: 'amber',
      },
    ]
  }, [state.data])

  if (state.loading) return <CRMLoadingState label="Loading analytics…" />
  if (state.error) return <CRMErrorState message={state.error} onRetry={load} />
  if (!state.data) return <CRMEmptyState title="No analytics data" message="Analytics did not return any data." />

  return (
    <div className="space-y-6">
      <CRMPageHeader
        title="Analytics"
        subtitle="Super Admin only. Real aggregated numbers from backend."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <CRMStatCard
            key={c.label}
            label={c.label}
            value={c.value}
            hint={c.hint}
            icon={c.icon}
            accent={c.accent}
          />
        ))}
      </div>

      <CRMSectionCard
        title="Charts"
        subtitle="Charts require a chart library and chart-ready series data."
      >
        <div className="text-sm text-slate-600">
          Charts are intentionally unavailable because Recharts is not installed and the analytics API currently returns KPI aggregates only.
        </div>
      </CRMSectionCard>
    </div>
  )
}

