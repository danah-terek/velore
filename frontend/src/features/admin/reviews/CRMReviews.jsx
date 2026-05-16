import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react'

import { useAdminAuth } from '../auth/AdminAuthContext'
import { adminReviewService } from '../services/adminReviewService'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'
import CRMDataTable from '../shared/CRMDataTable'
import CRMStatusBadge from '../shared/CRMStatusBadge'
import CRMActionButton from '../shared/CRMActionButton'

function normalizeRole(role) {
  if (!role) return null
  if (role === 'admin') return 'staff_admin'
  return role
}

function statusTone(status) {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  if (status === 'pending') return 'warning'
  return 'neutral'
}

export default function CRMReviews() {
  const { admin } = useAdminAuth()
  const role = normalizeRole(admin?.role)
  const isSuper = role === 'super_admin'

  const [tab, setTab] = useState('pending') // pending | approved
  const [busyId, setBusyId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [state, setState] = useState({ loading: true, error: null, rows: [] })

  const load = useCallback(async () => {
    setState({ loading: true, error: null, rows: [] })
    try {
      const res = tab === 'pending' ? await adminReviewService.listPending() : await adminReviewService.listApproved()
      setState({ loading: false, error: null, rows: res.data || [] })
    } catch (e) {
      setState({ loading: false, error: e?.message || e?.error || 'Failed to load reviews', rows: [] })
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  const columns = useMemo(() => {
    return [
      {
        key: 'customer',
        header: 'Customer',
        cell: (r) => (
          <div className="min-w-[220px]">
            <div className="font-semibold">{r.users?.name || '—'}</div>
            <div className="text-xs text-slate-500">{r.users?.email || ''}</div>
          </div>
        ),
      },
      {
        key: 'product',
        header: 'Product',
        cell: (r) => (
          <div className="min-w-[180px] text-slate-700">
            {r.products?.name || <span className="text-slate-400">—</span>}
          </div>
        ),
      },
      {
        key: 'rating',
        header: 'Rating',
        cell: (r) => <span className="tabular-nums">{r.rating ?? '—'}</span>,
      },
      {
        key: 'comment',
        header: 'Comment',
        cell: (r) => <div className="min-w-[320px] text-slate-700">{r.comment || '—'}</div>,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (r) => <CRMStatusBadge tone={statusTone(r.status)}>{r.status || '—'}</CRMStatusBadge>,
      },
      {
        key: 'date',
        header: 'Date',
        cell: (r) => <span className="text-slate-700">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</span>,
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (r) => (
          <div className="flex items-center gap-2">
            {tab === 'pending' ? (
              <>
                <CRMActionButton
                  tone="secondary"
                  disabled={busyId === r.review_id}
                  onClick={async () => {
                    setBusyId(r.review_id)
                    try {
                      await adminReviewService.approve({ id: r.review_id })
                      await load()
                    } finally {
                      setBusyId(null)
                    }
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </CRMActionButton>
                <CRMActionButton
                  tone="secondary"
                  disabled={busyId === r.review_id}
                  onClick={async () => {
                    setBusyId(r.review_id)
                    try {
                      await adminReviewService.reject({ id: r.review_id })
                      await load()
                    } finally {
                      setBusyId(null)
                    }
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </CRMActionButton>
              </>
            ) : null}

            <CRMActionButton
              tone="danger"
              disabled={!isSuper || busyId === r.review_id}
              title={!isSuper ? 'Super Admin only' : confirmDeleteId === r.review_id ? 'Click again to confirm' : 'Delete review'}
              onClick={async () => {
                if (!isSuper) return
                if (confirmDeleteId !== r.review_id) {
                  setConfirmDeleteId(r.review_id)
                  window.setTimeout(() => setConfirmDeleteId(null), 4000)
                  return
                }
                setBusyId(r.review_id)
                try {
                  await adminReviewService.delete({ id: r.review_id })
                  await load()
                } finally {
                  setBusyId(null)
                  setConfirmDeleteId(null)
                }
              }}
            >
              {confirmDeleteId === r.review_id ? 'Confirm' : <Trash2 className="w-4 h-4" />}
            </CRMActionButton>
          </div>
        ),
      },
    ]
  }, [busyId, confirmDeleteId, isSuper, load, tab])

  return (
    <div className="space-y-6">
      <CRMPageHeader title="Reviews" subtitle="Moderate real pending reviews and view approved reviews." />

      <CRMSectionCard
        title="Review moderation"
        subtitle="Approve/reject pending reviews. Approved list is public data."
        right={
          <div className="inline-flex rounded-[0.85rem] border border-[rgba(var(--velore-border-soft),0.95)] bg-[rgba(var(--velore-pearl),0.88)] p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab('pending')}
              className={`px-3 py-2 text-sm rounded-[0.65rem] font-medium transition-colors duration-[180ms] ${
                tab === 'pending'
                  ? 'bg-[rgb(var(--velore-fg))] text-white shadow-sm'
                  : 'text-[rgba(var(--velore-fg),0.72)] hover:bg-[rgba(var(--velore-accent),0.07)]'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setTab('approved')}
              className={`px-3 py-2 text-sm rounded-[0.65rem] font-medium transition-colors duration-[180ms] ${
                tab === 'approved'
                  ? 'bg-[rgb(var(--velore-fg))] text-white shadow-sm'
                  : 'text-[rgba(var(--velore-fg),0.72)] hover:bg-[rgba(var(--velore-accent),0.07)]'
              }`}
            >
              Approved
            </button>
          </div>
        }
      >
        {state.loading ? <CRMLoadingState label="Loading reviews…" /> : null}
        {!state.loading && state.error ? <CRMErrorState message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.rows.length === 0 ? (
          <CRMEmptyState title="No reviews found" message="Try switching tabs." />
        ) : null}
        {!state.loading && !state.error && state.rows.length > 0 ? (
          <CRMDataTable columns={columns} rows={state.rows} rowKey={(r) => r.review_id || r.feedback_id} />
        ) : null}
      </CRMSectionCard>
    </div>
  )
}