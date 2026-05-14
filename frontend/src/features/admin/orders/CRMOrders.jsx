import { useCallback, useEffect, useMemo, useState } from 'react'

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

export default function CRMOrders() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [state, setState] = useState({ loading: true, error: null, rows: [], pagination: null })

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

  const columns = useMemo(
    () => [
      { key: 'id', header: 'Order', cell: (o) => <span className="font-mono text-[rgb(var(--velore-fg))]">#{o.id}</span> },
      {
        key: 'user',
        header: 'Customer',
        cell: (o) => (
          <div className="min-w-[220px]">
            <div className="font-semibold">{o.user?.name || '—'}</div>
            <div className="text-xs text-[rgba(var(--velore-fg),0.52)]">{o.user?.email || ''}</div>
          </div>
        ),
      },
      { key: 'items_count', header: 'Items', cell: (o) => <span className="tabular-nums">{o.items_count}</span> },
      {
        key: 'amount',
        header: 'Total',
        cell: (o) => <span className="font-semibold tabular-nums">${Number(o.payment?.amount || 0).toFixed(2)}</span>,
      },
      {
        key: 'payment',
        header: 'Payment',
        cell: (o) => (
          <div className="text-xs">
            <div className="text-[rgba(var(--velore-fg),0.78)]">{o.payment?.payment_meth || '—'}</div>
            <div className="text-[rgba(var(--velore-fg),0.52)]">{o.payment?.status || ''}</div>
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        cell: (o) => (
          <span className="text-[rgba(var(--velore-fg),0.72)]">{o.date ? new Date(o.date).toLocaleDateString() : '—'}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (o) => (
          <div className="flex items-center gap-3">
            <CRMStatusBadge tone={statusTone(o.status)}>{o.status}</CRMStatusBadge>
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
              className="crm-select crm-select-sm max-w-[10rem]"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ),
      },
    ],
    [updatingId]
  )

  const paginationUi = state.pagination ? (
    <div className="flex items-center justify-between gap-3 text-xs text-[rgba(var(--velore-fg),0.58)]">
      <div>
        Page <span className="font-semibold">{state.pagination.page}</span> of{' '}
        <span className="font-semibold">{state.pagination.pages}</span> ·{' '}
        <span className="font-semibold">{state.pagination.total}</span> total
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="crm-btn-secondary px-3 py-2 disabled:opacity-45"
          disabled={state.pagination.page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <button
          type="button"
          className="crm-btn-secondary px-3 py-2 disabled:opacity-45"
          disabled={state.pagination.page >= state.pagination.pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="space-y-6">
      <CRMPageHeader title="Orders" subtitle="Admin order tracking with real payment + status data." />

      <CRMSectionCard
        title="Order list"
        subtitle="Filter by status and update status when needed"
        right={
          <select
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value)
            }}
            className="crm-select min-w-[11rem]"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
      >
        {state.loading ? <CRMLoadingState label="Loading orders…" /> : null}
        {!state.loading && state.error ? <CRMErrorState message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.rows.length === 0 ? (
          <CRMEmptyState title="No orders found" message="Try changing the status filter." />
        ) : null}
        {!state.loading && !state.error && state.rows.length > 0 ? (
          <div className="space-y-4">
            <CRMDataTable columns={columns} rows={state.rows} rowKey={(r) => r.id} />
            {paginationUi}
          </div>
        ) : null}
      </CRMSectionCard>
    </div>
  )
}

