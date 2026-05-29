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
          <div className="flex items-center gap-3 min-w-[200px] sm:min-w-[240px]">
            {p.thumbnail ? (
              <img
                src={resolveImageUrl(p.thumbnail) || ''}
                alt=""
                className="flex-shrink-0 w-10 h-10 rounded object-cover"
                style={{
                  border: '1px solid rgba(118,205,214,0.28)',
                  background: 'rgba(118,205,214,0.06)',
                  boxShadow: '0 1px 4px rgba(118,205,214,0.14)',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div
                className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center"
                style={{
                  background: 'rgba(118,205,214,0.10)',
                  border: '1px solid rgba(118,205,214,0.25)',
                }}
              >
                <Package className="w-4 h-4" style={{ color: '#76CDD6' }} />
              </div>
            )}
            <div className="min-w-0">
              <div
                className="font-semibold truncate text-sm leading-snug"
                style={{ color: '#1E1D22' }}
              >
                {p.name}
              </div>
              <div
                className="text-[11px] mt-0.5 font-mono tracking-tight truncate px-1.5 py-0.5 rounded inline-block"
                style={{
                  background: 'rgba(118,205,214,0.10)',
                  color: 'rgba(30,29,34,0.60)',
                  border: '1px solid rgba(118,205,214,0.20)',
                }}
              >
                #{p.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'brand',
        header: 'Brand',
        cell: (p) => (
          <span
            className="text-sm"
            style={{ color: p.brand ? '#1E1D22' : 'rgba(30,29,34,0.35)' }}
          >
            {p.brand || '—'}
          </span>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        cell: (p) => (
          <span
            className="text-sm"
            style={{ color: p.category ? '#1E1D22' : 'rgba(30,29,34,0.35)' }}
          >
            {p.category || '—'}
          </span>
        ),
      },
      {
        key: 'price',
        header: 'Price',
        cell: (p) => (
          <span
            className="font-semibold tabular-nums text-sm"
            style={{ color: '#1E1D22' }}
          >
            ${Number(p.price || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: 'variants_count',
        header: 'Variants',
        cell: (p) => (
          <span
            className="tabular-nums text-sm"
            style={{ color: 'rgba(30,29,34,0.60)' }}
          >
            {p.variants_count ?? '—'}
          </span>
        ),
      },
      {
        key: 'total_stock',
        header: 'Stock',
        cell: (p) => {
          const stock = Number(p.total_stock ?? 0)
          const low = stock > 0 && stock <= 5
          return (
            <div className="flex items-center gap-2">
              <span
                className="tabular-nums font-semibold text-sm"
                style={{ color: '#1E1D22' }}
              >
                {stock}
              </span>
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
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4"
      style={{ borderTop: '1px solid rgba(118,205,214,0.20)' }}
    >
      {/* Page info */}
      <p
        className="text-xs leading-relaxed"
        style={{ color: 'rgba(30,29,34,0.50)' }}
      >
        Page{' '}
        <span className="font-semibold" style={{ color: '#1E1D22' }}>
          {state.pagination.page}
        </span>{' '}
        of{' '}
        <span className="font-semibold" style={{ color: '#1E1D22' }}>
          {state.pagination.pages}
        </span>{' '}
        ·{' '}
        <span className="font-semibold" style={{ color: '#1E1D22' }}>
          {state.pagination.total}
        </span>{' '}
        total
      </p>

      {/* Prev / Next */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="crm-btn-secondary px-3 py-2 disabled:opacity-45"
          disabled={state.pagination.page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            border: '1.5px solid #76CDD6',
            color: '#76CDD6',
            borderRadius: '4px',
            background: 'transparent',
            cursor: state.pagination.page <= 1 ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = '#76CDD6'
              e.currentTarget.style.color = '#fff'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#76CDD6'
          }}
        >
          ← Prev
        </button>
        <button
          type="button"
          className="crm-btn-secondary px-3 py-2 disabled:opacity-45"
          disabled={state.pagination.page >= state.pagination.pages}
          onClick={() => setPage((p) => p + 1)}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            border: '1.5px solid #76CDD6',
            color: '#76CDD6',
            borderRadius: '4px',
            background: 'transparent',
            cursor: state.pagination.page >= state.pagination.pages ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = '#76CDD6'
              e.currentTarget.style.color = '#fff'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#76CDD6'
          }}
        >
          Next →
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
          <button
            type="button"
            onClick={() => navigate('/admin/products/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold tracking-wide"
            style={{
              background: '#76CDD6',
              color: '#ffffff',
              border: '1px solid #76CDD6',
              borderRadius: '4px',
              letterSpacing: '0.02em',
              transition: 'background 0.15s ease',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#5bb8c2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#76CDD6')}
          >
            + Add product
          </button>
        }
      />

      <CRMSectionCard
        title="Product catalog"
        subtitle="Search by product name"
        right={
          <div className="w-full sm:w-72 max-w-full">
            <CRMSearchInput
              value={search}
              onChange={(v) => { setPage(1); setSearch(v) }}
              placeholder="Search products…"
            />
          </div>
        }
      >
        {/* ── Banner ── */}
        {banner ? (
          <div
            className="mb-5 flex items-start gap-3 rounded px-4 py-3.5 text-sm leading-relaxed"
            style={
              banner.tone === 'success'
                ? {
                    background: 'rgba(118,205,214,0.06)',
                    border: '1px solid #76CDD6',
                    color: '#1E1D22',
                  }
                : {
                    background: 'rgba(224,85,85,0.05)',
                    border: '1px solid #e05555',
                    color: '#1E1D22',
                  }
            }
          >
            {/* Accent bar */}
            <span
              className="flex-shrink-0 mt-0.5 w-1 self-stretch rounded-full"
              style={{
                background: banner.tone === 'success' ? '#76CDD6' : '#e05555',
                minHeight: '16px',
              }}
            />
            <span style={{ color: banner.tone === 'success' ? '#076d60' : '#b91c1c' }}>
              {banner.text}
            </span>
          </div>
        ) : null}

        {/* ── States ── */}
        {state.loading ? <CRMLoadingState label="Loading products…" /> : null}
        {!state.loading && state.error ? <CRMErrorState message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.rows.length === 0 ? (
          <CRMEmptyState title="No products found" message="Try adjusting your search." />
        ) : null}

        {/* ── Data ── */}
        {!state.loading && !state.error && state.rows.length > 0 ? (
          <div className="space-y-4">
            <div
              className="overflow-hidden"
              style={{
                border: '1px solid rgba(118,205,214,0.28)',
                borderRadius: '6px',
                background: '#ffffff',
                boxShadow: '0 1px 6px rgba(118,205,214,0.10), 0 1px 2px rgba(30,29,34,0.04)',
              }}
            >
              <CRMDataTable columns={columns} rows={state.rows} rowKey={(r) => r.id} />
            </div>
            {paginationUi}
          </div>
        ) : null}
      </CRMSectionCard>
    </div>
  )
}