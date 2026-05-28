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
        hint: 'Completed payments',
        icon: BarChart3,
      },
      {
        label: 'Orders',
        value: Number(d.orders?.total || 0).toLocaleString(),
        hint: 'Aggregated units',
        icon: ShoppingCart,
      },
      {
        label: 'Customers',
        value: Number(d.customers?.total || 0).toLocaleString(),
        hint: 'Total registered',
        icon: Users,
      },
    ]
  }, [state.data])

  if (state.loading) return <CRMLoadingState label="Loading analytics…" />
  if (state.error) return <CRMErrorState message={state.error} onRetry={load} />
  if (!state.data) return <CRMEmptyState title="No analytics data" message="Analytics did not return any data." />

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 min-h-screen" style={{ background: '#EFF8FE' }}>

      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}>
        <span
          className="text-[10px] font-bold tracking-[0.3em] uppercase"
          style={{ color: '#76CDD6' }}
        >
          Control Center
        </span>
        <h1 className="text-4xl font-light mt-2" style={{ color: '#1E1D22' }}>
          Analytical Overview
        </h1>
        <p className="text-sm mt-2 font-light" style={{ color: 'rgba(30,29,34,0.50)' }}>
          Real-time performance metrics.
        </p>
      </div>

      {/* KPI Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="group relative p-8 transition-all duration-300 cursor-default"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(118,205,214,0.25)',
              borderRadius: '4px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#76CDD6'
              e.currentTarget.style.borderColor = '#76CDD6'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.borderColor = 'rgba(118,205,214,0.25)'
            }}
          >
            <KPICard c={c} />
          </div>
        ))}
      </div>

      {/* Section Card */}
      <div
        className="p-8"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(118,205,214,0.25)',
          borderRadius: '4px',
        }}
      >
        <h2
          className="text-xs font-bold tracking-[0.2em] uppercase mb-6"
          style={{ color: '#1E1D22' }}
        >
          System Terminal
        </h2>
        <div
          className="p-8 flex flex-col items-center justify-center text-center"
          style={{ border: '1px solid rgba(118,205,214,0.20)', background: '#EFF8FE' }}
        >
          <p className="text-sm font-light italic" style={{ color: 'rgba(30,29,34,0.60)' }}>
            Visual data processing modules are currently inactive.
          </p>
          <p
            className="text-[10px] uppercase tracking-[0.1em] mt-2"
            style={{ color: '#76CDD6' }}
          >
            Standing by for data integration
          </p>
        </div>
      </div>

    </div>
  )
}

// Inner component so hover state can toggle child colors cleanly via CSS group
function KPICard({ c }) {
  return (
    <>
      <style>{`
        .kpi-card-wrap:hover .kpi-icon { color: #ffffff; }
        .kpi-card-wrap:hover .kpi-badge { color: #EFF8FE; }
        .kpi-card-wrap:hover .kpi-label { color: rgba(239,248,254,0.70); }
        .kpi-card-wrap:hover .kpi-value { color: #ffffff; }
        .kpi-card-wrap:hover .kpi-hint  { color: rgba(239,248,254,0.60); }
      `}</style>
      <div className="kpi-card-wrap" style={{ pointerEvents: 'none' }}>
        <div className="flex justify-between items-start mb-6">
          <c.icon
            className="kpi-icon w-5 h-5 transition-colors duration-300"
            style={{ color: '#76CDD6' }}
          />
          <span
            className="kpi-badge text-[9px] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
            style={{ color: 'rgba(30,29,34,0.35)' }}
          >
            KPI
          </span>
        </div>
        <div className="space-y-1">
          <h3
            className="kpi-label text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
            style={{ color: 'rgba(30,29,34,0.50)' }}
          >
            {c.label}
          </h3>
          <p
            className="kpi-value text-3xl font-light tracking-tight transition-colors duration-300"
            style={{ color: '#1E1D22' }}
          >
            {c.value}
          </p>
          <p
            className="kpi-hint text-[10px] font-serif italic pt-2 transition-colors duration-300"
            style={{ color: 'rgba(30,29,34,0.38)' }}
          >
            {c.hint}
          </p>
        </div>
      </div>
    </>
  )
}