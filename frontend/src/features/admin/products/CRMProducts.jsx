import { useCallback, useEffect, useMemo, useState } from 'react'
import { Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { adminProductService } from '../services/adminProductService'
import { useAdminAuth } from '../auth/AdminAuthContext'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
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

export default function CRMProducts() {
  const navigate = useNavigate()
  const { admin } = useAdminAuth()
  const role = normalizeRole(admin?.role)
  const isSuper = role === 'super_admin'

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [state, setState] = useState({ loading: true, error: null, rows: [], pagination: null })
  const [busyId, setBusyId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [banner, setBanner] = useState(null) // { tone: 'success'|'error', text }

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await adminProductService.list({ page, limit: 20, search })
      setState({ loading: false, error: null, rows: res.data || [], pagination: res.pagination || null })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e?.message || e?.error || 'Failed to load products' }))
    }
  }, [page, search])

  useEffect(() => {
    load()
  }, [load])

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Product',
        cell: (p) => (
          <div className="flex items-center gap-3 min-w-[240px]">
            {p.thumbnail ? (
              <img
                src={resolveImageUrl(p.thumbnail) || ''}
                alt=""
                className="w-9 h-9 rounded-xl border border-[rgba(var(--velore-border-soft),0.95)] object-cover bg-[rgba(var(--velore-accent),0.05)] ring-1 ring-[rgba(var(--velore-border-soft),0.5)]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[rgb(var(--velore-fg))] text-white flex items-center justify-center ring-1 ring-[rgba(var(--velore-border-soft),0.35)]">
                <Package className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-xs text-[rgba(var(--velore-fg),0.52)] truncate">#{p.id}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'brand',
        header: 'Brand',
        cell: (p) => <span className="text-[rgba(var(--velore-fg),0.78)]">{p.brand || '—'}</span>,
      },
      {
        key: 'category',
        header: 'Category',
        cell: (p) => <span className="text-[rgba(var(--velore-fg),0.78)]">{p.category || '—'}</span>,
      },
      {
        key: 'price',
        header: 'Price',
        cell: (p) => <span className="font-semibold tabular-nums">${Number(p.price || 0).toFixed(2)}</span>,
      },
      {
        key: 'variants_count',
        header: 'Variants',
        cell: (p) => <span className="text-[rgba(var(--velore-fg),0.78)] tabular-nums">{p.variants_count ?? '—'}</span>,
      },
      {
        key: 'total_stock',
        header: 'Stock',
        cell: (p) => {
          const stock = Number(p.total_stock ?? 0)
          const low = stock > 0 && stock <= 5
          return (
            <div className="flex items-center gap-2">
              <span className="text-[rgb(var(--velore-fg))] tabular-nums font-semibold">{stock}</span>
              {low ? <CRMStatusBadge tone="warning">Low</CRMStatusBadge> : null}
            </div>
          )
        },
      },
      {
        key: 'is_active',
        header: 'Status',
        cell: (p) =>
          p.is_active ? (
            <CRMStatusBadge tone="success">Active</CRMStatusBadge>
          ) : (
            <CRMStatusBadge tone="danger">Inactive</CRMStatusBadge>
          ),
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (p) => (
          <div className="flex items-center gap-2">
            <CRMActionButton
              tone="secondary"
              onClick={() => navigate(`/admin/products/${p.id}/edit`)}
            >
              Edit
            </CRMActionButton>

            <CRMActionButton
              tone="danger"
              disabled={!isSuper || busyId === p.id}
              title={!isSuper ? 'Super Admin only' : confirmDeleteId === p.id ? 'Click again to confirm' : 'Delete product'}
              onClick={async () => {
                if (!isSuper) return
                setBanner(null)

                if (confirmDeleteId !== p.id) {
                  setConfirmDeleteId(p.id)
                  window.setTimeout(() => setConfirmDeleteId(null), 4000)
                  return
                }

                setBusyId(p.id)
                try {
                  await adminProductService.delete(p.id)
                  setBanner({ tone: 'success', text: 'Product deleted.' })
                  setConfirmDeleteId(null)
                  await load()
                } catch (e) {
                  setBanner({ tone: 'error', text: e?.message || e?.error || 'Delete failed' })
                } finally {
                  setBusyId(null)
                }
              }}
            >
              {confirmDeleteId === p.id ? 'Confirm' : 'Delete'}
            </CRMActionButton>
          </div>
        ),
      },
    ],
    [busyId, confirmDeleteId, isSuper, load, navigate]
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
      <CRMPageHeader
        title="Products"
        subtitle="Real product data from the backend admin endpoint."
        right={
          <CRMActionButton tone="primary" onClick={() => navigate('/admin/products/new')}>
            Add product
          </CRMActionButton>
        }
      />

      <CRMSectionCard
        title="Product catalog"
        subtitle="Search by product name"
        right={<div className="w-72 max-w-full"><CRMSearchInput value={search} onChange={(v) => { setPage(1); setSearch(v) }} placeholder="Search products…" /></div>}
      >
        {banner ? (
          <div
            className={[
              'mb-4 rounded-[1.1rem] border px-4 py-3.5 text-sm leading-relaxed shadow-sm',
              banner.tone === 'success'
                ? 'bg-emerald-50/95 border-emerald-200/90 text-emerald-900'
                : 'bg-rose-50/95 border-rose-200/90 text-rose-900',
            ].join(' ')}
          >
            {banner.text}
          </div>
        ) : null}
        {state.loading ? <CRMLoadingState label="Loading products…" /> : null}
        {!state.loading && state.error ? <CRMErrorState message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.rows.length === 0 ? (
          <CRMEmptyState title="No products found" message="Try adjusting your search." />
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

