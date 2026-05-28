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
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 bg-white min-h-screen">
      
      {/* Header - Absolute White */}
      <div className="border-b border-black pb-8">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500">Control Center</span>
        <h1 className="text-4xl font-light text-black mt-2">Analytical Overview</h1>
        <p className="text-sm text-gray-500 mt-2 font-light">Real-time performance metrics.</p>
      </div>

      {/* KPI Stat Grid - Absolute White */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div 
            key={c.label} 
            className="group relative bg-white border border-black p-8 hover:bg-black transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <c.icon className="w-5 h-5 text-black group-hover:text-white transition-colors" />
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-black group-hover:text-white">KPI</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 group-hover:text-gray-300">{c.label}</h3>
              <p className="text-3xl font-light text-black group-hover:text-white tracking-tight">{c.value}</p>
              <p className="text-[10px] font-serif italic text-gray-400 group-hover:text-gray-400 pt-2">{c.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section Card - Absolute White */}
      <div className="bg-white border border-black p-8">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-black mb-6">System Terminal</h2>
        <div className="p-8 border border-black flex flex-col items-center justify-center text-center bg-white">
          <p className="text-sm text-black font-light italic">
            Visual data processing modules are currently inactive.
          </p>
          <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 mt-2">
            Standing by for data integration
          </p>
        </div>
      </div>
      
    </div>
  )
}