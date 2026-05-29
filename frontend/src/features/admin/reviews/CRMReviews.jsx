import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Trash2, Star } from 'lucide-react'

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

// ── Inline styled action buttons (CRMActionButton not yet restyled) ──────────
function ActionBtn({ children, tone = 'secondary', disabled, title, onClick }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
    whiteSpace: 'nowrap',
    border: '1.5px solid transparent',
  }
  const themes = {
    approve: {
      background: 'transparent',
      color: '#22a55b',
      borderColor: '#22a55b',
    },
    approveHover: { background: '#22a55b', color: '#fff', borderColor: '#22a55b' },
    reject: {
      background: 'transparent',
      color: '#e05555',
      borderColor: '#e05555',
    },
    rejectHover: { background: '#e05555', color: '#fff', borderColor: '#e05555' },
    danger: {
      background: 'transparent',
      color: '#e05555',
      borderColor: 'rgba(224,85,85,0.45)',
    },
    dangerHover: { background: 'rgba(224,85,85,0.08)', color: '#c0392b', borderColor: '#e05555' },
  }

  const getStyle = () => {
    if (tone === 'approve') return { ...base, ...themes.approve }
    if (tone === 'reject')  return { ...base, ...themes.reject }
    if (tone === 'danger')  return { ...base, ...themes.danger }
    return { ...base, ...themes.approve }
  }

  const handleEnter = (e) => {
    if (disabled) return
    if (tone === 'approve') Object.assign(e.currentTarget.style, themes.approveHover)
    if (tone === 'reject')  Object.assign(e.currentTarget.style, themes.rejectHover)
    if (tone === 'danger')  Object.assign(e.currentTarget.style, themes.dangerHover)
  }
  const handleLeave = (e) => {
    if (disabled) return
    if (tone === 'approve') Object.assign(e.currentTarget.style, { ...base, ...themes.approve })
    if (tone === 'reject')  Object.assign(e.currentTarget.style, { ...base, ...themes.reject })
    if (tone === 'danger')  Object.assign(e.currentTarget.style, { ...base, ...themes.danger })
  }

  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      style={getStyle()}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// ── Star rating display ──────────────────────────────────────────────────────
function StarRating({ value }) {
  const num = Number(value)
  if (!num) return <span style={{ color: 'rgba(30,29,34,0.35)' }}>—</span>
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          style={{
            fill: i <= num ? '#f59e0b' : 'none',
            color: i <= num ? '#f59e0b' : 'rgba(30,29,34,0.18)',
          }}
        />
      ))}
      <span
        className="ml-1 tabular-nums text-xs font-semibold"
        style={{ color: '#1E1D22' }}
      >
        {num}
      </span>
    </div>
  )
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
          <div className="min-w-[200px]">
            <div
              className="font-semibold text-sm leading-snug"
              style={{ color: '#1E1D22' }}
            >
              {r.users?.name || '—'}
            </div>
            <div
              className="text-[11px] mt-0.5"
              style={{ color: 'rgba(30,29,34,0.50)' }}
            >
              {r.users?.email || ''}
            </div>
          </div>
        ),
      },
      {
        key: 'product',
        header: 'Product',
        cell: (r) => (
          <div className="min-w-[160px] text-sm">
            {r.products?.name
              ? <span style={{ color: '#1E1D22' }}>{r.products.name}</span>
              : <span style={{ color: 'rgba(30,29,34,0.35)' }}>—</span>
            }
          </div>
        ),
      },
      {
        key: 'rating',
        header: 'Rating',
        cell: (r) => <StarRating value={r.rating} />,
      },
      {
        key: 'comment',
        header: 'Comment',
        cell: (r) => (
          <div
            className="min-w-[260px] max-w-xs text-sm leading-relaxed line-clamp-2"
            style={{ color: r.comment ? 'rgba(30,29,34,0.78)' : 'rgba(30,29,34,0.35)' }}
            title={r.comment || undefined}
          >
            {r.comment || '—'}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (r) => (
          <CRMStatusBadge tone={statusTone(r.status)}>
            {r.status || '—'}
          </CRMStatusBadge>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        cell: (r) => (
          <span
            className="text-sm tabular-nums"
            style={{ color: 'rgba(30,29,34,0.60)' }}
          >
            {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (r) => (
          <div className="flex items-center gap-2">
            {tab === 'pending' ? (
              <>
                <ActionBtn
                  tone="approve"
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
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </ActionBtn>
                <ActionBtn
                  tone="reject"
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
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </ActionBtn>
              </>
            ) : null}

            <ActionBtn
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
              {confirmDeleteId === r.review_id
                ? 'Confirm'
                : <Trash2 className="w-3.5 h-3.5" />
              }
            </ActionBtn>
          </div>
        ),
      },
    ]
  }, [busyId, confirmDeleteId, isSuper, load, tab])

  return (
    <div className="space-y-6">
      <CRMPageHeader
        title="Reviews"
        subtitle="Moderate real pending reviews and view approved reviews."
      />

      <CRMSectionCard
        title="Review moderation"
        subtitle="Approve/reject pending reviews. Approved list is public data."
        right={
          /* ── Tab switcher ── */
          <div
            className="inline-flex p-1"
            style={{
              background: '#EFF8FE',
              border: '1px solid rgba(118,205,214,0.28)',
              borderRadius: '6px',
            }}
          >
            {['pending', 'approved'].map((t) => {
              const active = tab === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="px-4 py-1.5 text-sm font-semibold capitalize"
                  style={{
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
                    background: active ? '#76CDD6' : 'transparent',
                    color: active ? '#ffffff' : 'rgba(30,29,34,0.55)',
                    boxShadow: active ? '0 1px 4px rgba(118,205,214,0.35)' : 'none',
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              )
            })}
          </div>
        }
      >
        {state.loading ? <CRMLoadingState label="Loading reviews…" /> : null}
        {!state.loading && state.error ? <CRMErrorState message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.rows.length === 0 ? (
          <CRMEmptyState title="No reviews found" message="Try switching tabs." />
        ) : null}
        {!state.loading && !state.error && state.rows.length > 0 ? (
          <div
            className="overflow-hidden"
            style={{
              border: '1px solid rgba(118,205,214,0.28)',
              borderRadius: '6px',
              background: '#ffffff',
              boxShadow: '0 1px 6px rgba(118,205,214,0.10), 0 1px 2px rgba(30,29,34,0.04)',
            }}
          >
            <CRMDataTable columns={columns} rows={state.rows} rowKey={(r) => r.review_id || r.feedback_id} />
          </div>
        ) : null}
      </CRMSectionCard>
    </div>
  )
}