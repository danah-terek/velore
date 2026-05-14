import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'

import { useAdminAuth } from '../auth/AdminAuthContext'
import { adminCustomerService } from '../services/adminCustomerService'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMSearchInput from '../shared/CRMSearchInput'
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

export default function CRMCustomers() {
  const { admin } = useAdminAuth()
  const role = normalizeRole(admin?.role)
  const isSuper = role === 'super_admin'

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [state, setState] = useState({ loading: true, error: null, rows: [], pagination: null })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await adminCustomerService.list({ page, limit: 20, search })
      setState({ loading: false, error: null, rows: res.data || [], pagination: res.pagination || null })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e?.message || e?.error || 'Failed to load customers' }))
    }
  }, [page, search])

  useEffect(() => {
    load()
  }, [load])

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Customer',
        cell: (u) => (
          <div className="min-w-[260px]">
            <div className="font-semibold">{u.name || '—'}</div>
            <div className="text-xs text-slate-500">{u.email}</div>
          </div>
        ),
      },
      { key: 'role', header: 'Role', cell: (u) => <span className="text-slate-700">{u.role || 'customer'}</span> },
      { key: 'orders_count', header: 'Orders', cell: (u) => <span className="tabular-nums">{u.orders_count ?? '—'}</span> },
      { key: 'loyalty_points', header: 'Points', cell: (u) => <span className="tabular-nums">{u.loyalty_points ?? '—'}</span> },
      {
        key: 'is_active',
        header: 'Status',
        cell: (u) =>
          u.is_active ? (
            <CRMStatusBadge tone="success">Active</CRMStatusBadge>
          ) : (
            <CRMStatusBadge tone="danger">Disabled</CRMStatusBadge>
          ),
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (u) => (
          <div className="flex items-center gap-2">
            <CRMActionButton
              tone="secondary"
              disabled={busyId === u.id}
              onClick={async () => {
                setBusyId(u.id)
                try {
                  const res = await adminCustomerService.toggleStatus({ userId: u.id })
                  const isActive = res?.data?.is_active
                  setState((s) => ({
                    ...s,
                    rows: s.rows.map((x) => (x.id === u.id ? { ...x, is_active: isActive } : x)),
                  }))
                } finally {
                  setBusyId(null)
                }
              }}
            >
              {u.is_active ? 'Disable' : 'Enable'}
            </CRMActionButton>

            <CRMActionButton
              tone="danger"
              disabled={!isSuper || busyId === u.id}
              title={!isSuper ? 'Super Admin only' : confirmDeleteId === u.id ? 'Click again to confirm' : 'Delete customer'}
              onClick={async () => {
                if (!isSuper) return
                if (confirmDeleteId !== u.id) {
                  setConfirmDeleteId(u.id)
                  window.setTimeout(() => setConfirmDeleteId(null), 4000)
                  return
                }
                setBusyId(u.id)
                try {
                  await adminCustomerService.delete({ userId: u.id })
                  setState((s) => ({ ...s, rows: s.rows.filter((x) => x.id !== u.id) }))
                } finally {
                  setBusyId(null)
                  setConfirmDeleteId(null)
                }
              }}
            >
              {confirmDeleteId === u.id ? 'Confirm' : <Trash2 className="w-4 h-4" />}
            </CRMActionButton>
          </div>
        ),
      },
    ],
    [busyId, confirmDeleteId, isSuper]
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
      <CRMPageHeader title="Customers" subtitle="Customer accounts from the real admin users endpoint." />

      <CRMSectionCard
        title="Customer list"
        subtitle="Search by name or email"
        right={
          <div className="w-80 max-w-full">
            <CRMSearchInput
              value={search}
              onChange={(v) => {
                setPage(1)
                setSearch(v)
              }}
              placeholder="Search customers…"
            />
          </div>
        }
      >
        {state.loading ? <CRMLoadingState label="Loading customers…" /> : null}
        {!state.loading && state.error ? <CRMErrorState message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.rows.length === 0 ? (
          <CRMEmptyState title="No customers found" message="Try adjusting your search." />
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

