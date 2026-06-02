import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Package } from 'lucide-react'

import { adminOrderService } from '../services/adminOrderService'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'
import CRMDataTable from '../shared/CRMDataTable'
import CRMStatusBadge from '../shared/CRMStatusBadge'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function statusTone(status) {
  if (status === 'delivered') return 'success'
  if (status === 'pending' || status === 'processing') return 'warning'
  if (status === 'cancelled') return 'danger'
  return 'neutral'
}

function StatusPill({ status }) {
  const styles = {
    delivered:   { background: 'linear-gradient(135deg, #22a55b, #1a8a4a)', color: '#fff' },
    pending:     { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' },
    processing:  { background: 'linear-gradient(135deg, #76CDD6, #5bb8c2)', color: '#fff' },
    shipped:     { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' },
    cancelled:   { background: 'linear-gradient(135deg, #e05555, #c0392b)', color: '#fff' },
  }
  const s = styles[status] || { background: 'rgba(30,29,34,0.10)', color: '#1E1D22' }
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-[0.08em] px-3 py-1.5"
      style={{ borderRadius: '4px', ...s }}
    >
      {status}
    </span>
  )
}

const selectStyle = {
  border: '1px solid rgba(118,205,214,0.30)',
  borderRadius: '4px',
  background: '#EFF8FE',
  color: '#1E1D22',
  fontSize: '12px',
  padding: '6px 10px',
  outline: 'none',
  cursor: 'pointer',
}

// ─── Prescription Display Component ───────────────────────────
function PrescriptionBadge({ prescription }) {
  if (!prescription) return null

  const hasGlassesData = prescription.sph_r || prescription.sph_l || prescription.cyl_r || prescription.cyl_l || prescription.axis || prescription.pd
  const hasContactData = prescription.bc || prescription.dia || prescription.power || prescription.sph

  if (!hasGlassesData && !hasContactData) return null

  const isContactLens = !!(prescription.bc || prescription.dia || prescription.power)

  return (
    <div className="mt-1.5 p-2 rounded-md text-[10px]" style={{ background: 'rgba(118,205,214,0.08)', border: '1px solid rgba(118,205,214,0.18)', color: '#1E1D22' }}>
      <div className="flex items-center gap-1.5 mb-1.5 pb-1.5" style={{ borderBottom: '1px solid rgba(118,205,214,0.15)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#76CDD6', display: 'inline-block' }} />
        <span className="font-semibold uppercase tracking-wider text-[8px]" style={{ color: '#5bb8c2' }}>
          {isContactLens ? 'Contact Lens Specs' : 'Glasses Prescription'}
        </span>
      </div>
      {isContactLens ? (
        <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
          {prescription.power && <span>PWR: <strong>{prescription.power}</strong></span>}
          {prescription.sph && <span>SPH: <strong>{prescription.sph}</strong></span>}
          {prescription.bc && <span>BC: <strong>{prescription.bc}</strong></span>}
          {prescription.dia && <span>DIA: <strong>{prescription.dia}</strong></span>}
          {prescription.cyl && <span>CYL: <strong>{prescription.cyl}</strong></span>}
          {prescription.axis && <span>Axis: <strong>{prescription.axis}°</strong></span>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">OD (R):</span>{' '}
              SPH {prescription.sph_r || '-'} / CYL {prescription.cyl_r || '-'}
            </div>
            <div>
              <span className="font-semibold">OS (L):</span>{' '}
              SPH {prescription.sph_l || '-'} / CYL {prescription.cyl_l || '-'}
            </div>
          </div>
          {(prescription.axis || prescription.pd) && (
            <div className="mt-1 pt-1 flex gap-3" style={{ borderTop: '1px solid rgba(118,205,214,0.15)' }}>
              {prescription.axis && <span>Axis: <strong>{prescription.axis}°</strong></span>}
              {prescription.pd && <span>PD: <strong>{prescription.pd}mm</strong></span>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Expanded Order Items ─────────────────────────────────────
function OrderItemsExpanded({ orderId, onClose }) {
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchItems() {
      setLoading(true)
      setError(null)
      try {
        const res = await adminOrderService.getById(orderId)
        if (!cancelled) setItems(res?.data?.items || [])
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load items')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchItems()
    return () => { cancelled = true }
  }, [orderId])

  if (loading) {
    return (
      <div className="py-4 text-center text-xs" style={{ color: 'rgba(30,29,34,0.45)' }}>
        Loading items...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 text-center text-xs" style={{ color: '#e05555' }}>
        {error}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-4 text-center text-xs" style={{ color: 'rgba(30,29,34,0.35)' }}>
        No items found
      </div>
    )
  }

  return (
    <div className="space-y-2 py-3">
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className="flex gap-3 p-3 rounded-md"
          style={{ background: 'rgba(118,205,214,0.04)', border: '1px solid rgba(118,205,214,0.12)' }}
        >
          {/* Item image */}
          <div
            className="w-10 h-10 flex-shrink-0 rounded overflow-hidden"
            style={{ background: 'rgba(30,29,34,0.05)' }}
          >
            {item.variant?.image ? (
              <img src={item.variant.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={14} style={{ color: 'rgba(30,29,34,0.2)' }} />
              </div>
            )}
          </div>

          {/* Item info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold truncate" style={{ color: '#1E1D22' }}>
                  {item.product?.name || 'Product'}
                </p>
                {item.variant && (
                  <p className="text-[10px]" style={{ color: 'rgba(30,29,34,0.45)' }}>
                    {[item.variant.color, item.variant.size].filter(Boolean).join(' / ') || 'Standard'}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs font-bold" style={{ color: '#1E1D22' }}>
                  ${Number(item.price || 0).toFixed(2)}
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(30,29,34,0.45)' }}>
                  Qty: {item.quantity}
                </p>
              </div>
            </div>

            {/* Prescription */}
            <PrescriptionBadge prescription={item.prescription_data} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CRMOrders() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [state, setState] = useState({ loading: true, error: null, rows: [], pagination: null })
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await adminOrderService.list({ page, limit: 20, status: status || undefined })
      setState({ loading: false, error: null, rows: res.data || [], pagination: res.pagination || null })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e?.message || e?.error || 'Failed to load orders' }))
    }
  }, [page, status])

  useEffect(() => {
    load()
  }, [load])

  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId)
  }

  const columns = useMemo(
    () => [
      {
        key: 'expand',
        header: '',
        cell: (o) => (
          <button
            onClick={() => toggleExpand(o.id)}
            className="p-1 rounded transition-colors hover:opacity-70"
            style={{ color: '#76CDD6' }}
          >
            {expandedOrderId === o.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ),
      },
      {
        key: 'id',
        header: 'Order',
        cell: (o) => (
          <span
            className="font-mono font-bold text-sm px-2 py-1"
            style={{
              background: 'rgba(118,205,214,0.12)',
              color: '#1E1D22',
              border: '1px solid rgba(118,205,214,0.25)',
              borderRadius: '4px',
            }}
          >
            #{o.id}
          </span>
        ),
      },
      {
        key: 'user',
        header: 'Customer',
        cell: (o) => (
          <div className="min-w-[220px]">
            <div className="font-semibold text-sm" style={{ color: '#1E1D22' }}>{o.user?.name || '—'}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'rgba(30,29,34,0.45)' }}>{o.user?.email || ''}</div>
          </div>
        ),
      },
      {
        key: 'items_count',
        header: 'Items',
        cell: (o) => (
          <span className="tabular-nums font-bold text-sm" style={{ color: '#1E1D22' }}>
            {o.items_count}
          </span>
        ),
      },
      {
        key: 'amount',
        header: 'Total',
        cell: (o) => (
          <span className="font-bold tabular-nums text-sm" style={{ color: '#1E1D22' }}>
            ${Number(o.payment?.amount || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: 'payment',
        header: 'Payment',
        cell: (o) => (
          <div className="text-xs">
            <div className="font-medium" style={{ color: '#1E1D22' }}>{o.payment?.payment_meth || '—'}</div>
            <div className="mt-0.5" style={{ color: 'rgba(30,29,34,0.45)' }}>{o.payment?.status || ''}</div>
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        cell: (o) => (
          <span className="text-sm" style={{ color: 'rgba(30,29,34,0.55)' }}>
            {o.date ? new Date(o.date).toLocaleDateString() : '—'}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (o) => (
          <div className="flex items-center gap-3">
            <StatusPill status={o.status} />
            <select
              value={o.status || 'pending'}
              disabled={updatingId === o.id}
              onChange={async (e) => {
                const next = e.target.value
                setUpdatingId(o.id)
                try {
                  const res = await adminOrderService.updateStatus({ orderId: o.id, status: next })
                  const updatedStatus = res?.data?.status
                  setState((s) => ({
                    ...s,
                    rows: s.rows.map((x) => (x.id === o.id ? { ...x, status: updatedStatus || next } : x)),
                  }))
                } finally {
                  setUpdatingId(null)
                }
              }}
              style={{ ...selectStyle, maxWidth: '10rem', opacity: updatingId === o.id ? 0.5 : 1 }}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ),
      },
    ],
    [updatingId, expandedOrderId]
  )

  const paginationUi = state.pagination ? (
    <div
      className="flex items-center justify-between gap-3 pt-6"
      style={{ borderTop: '1px solid rgba(118,205,214,0.18)' }}
    >
      <div className="text-[10px] font-medium" style={{ color: 'rgba(30,29,34,0.45)' }}>
        Page <span className="font-bold" style={{ color: '#1E1D22' }}>{state.pagination.page}</span> of{' '}
        <span className="font-bold" style={{ color: '#1E1D22' }}>{state.pagination.pages}</span> ·{' '}
        <span className="font-bold" style={{ color: '#1E1D22' }}>{state.pagination.total}</span> total
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-150 disabled:opacity-40"
          style={{ color: '#76CDD6' }}
          disabled={state.pagination.page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ArrowLeft size={12} /> Prev
        </button>
        <button
          type="button"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-150 disabled:opacity-40"
          style={{ color: '#76CDD6' }}
          disabled={state.pagination.page >= state.pagination.pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next <ArrowRight size={12} />
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="space-y-8 min-h-screen" style={{ background: '#EFF8FE' }}>

      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}>
        <span
          className="text-[10px] font-bold tracking-[0.3em] uppercase"
          style={{ color: '#76CDD6' }}
        >
          Tracking
        </span>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-light" style={{ color: '#1E1D22' }}>Orders</h1>
            <p className="text-sm mt-1 font-light" style={{ color: 'rgba(30,29,34,0.50)' }}>
              Admin order tracking with real payment + status data.
            </p>
          </div>
          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value) }}
            style={{ ...selectStyle, minWidth: '11rem' }}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="p-6 sm:p-8"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(118,205,214,0.22)',
          borderRadius: '4px',
        }}
      >
        <div className="mb-6">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#1E1D22' }}>
            Order List
          </h2>
          <p className="text-[10px] mt-1" style={{ color: '#76CDD6' }}>
            Filter by status and update status when needed · Click arrow to expand items
          </p>
        </div>

        {state.loading ? <CRMLoadingState label="Loading orders…" /> : null}
        {!state.loading && state.error ? <CRMErrorState message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.rows.length === 0 ? (
          <CRMEmptyState title="No orders found" message="Try changing the status filter." />
        ) : null}
        {!state.loading && !state.error && state.rows.length > 0 ? (
          <div className="space-y-4">
            <CRMDataTable
              columns={columns}
              rows={state.rows}
              rowKey={(r) => r.id}
              renderExpanded={(row) =>
                expandedOrderId === row.id ? (
                  <OrderItemsExpanded orderId={row.id} />
                ) : null
              }
            />
            {paginationUi}
          </div>
        ) : null}
      </div>

    </div>
  )
}