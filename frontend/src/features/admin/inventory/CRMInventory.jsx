import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { adminProductService } from '../services/adminProductService'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'
import CRMDataTable from '../shared/CRMDataTable'
import CRMStatusBadge from '../shared/CRMStatusBadge'
import CRMActionButton from '../shared/CRMActionButton'

export default function CRMInventory() {
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, error: null, rows: [] })

  const load = useCallback(async () => {
    setState({ loading: true, error: null, rows: [] })
    try {
      const res = await adminProductService.list({ page: 1, limit: 100 })
      setState({ loading: false, error: null, rows: res.data || [] })
    } catch (e) {
      setState({ loading: false, error: e?.message || e?.error || 'Failed to load inventory summary', rows: [] })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns = useMemo(
    () => [
      {
        key: 'product',
        header: 'Product',
        cell: (p) => (
          <div className="flex items-center gap-3 min-w-[260px]">
            {p.thumbnail ? (
              <img
                src={resolveImageUrl(p.thumbnail) || ''}
                alt=""
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '4px',
                  border: '1px solid rgba(118,205,214,0.25)',
                  objectFit: 'cover',
                  background: 'rgba(118,205,214,0.06)',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '4px',
                  background: '#76CDD6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  flexShrink: 0,
                }}
              >
                V
              </div>
            )}
            <div className="min-w-0">
              <div
                className="font-semibold truncate text-sm"
                style={{ color: '#1E1D22' }}
              >
                {p.name}
              </div>
              <div
                className="text-[10px] truncate mt-0.5"
                style={{ color: 'rgba(30,29,34,0.40)' }}
              >
                #{p.id}
              </div>
            </div>
          </div>
        )
      },
      {
        key: 'total_stock',
        header: 'Total stock',
        cell: (p) => {
          const stock = Number(p.total_stock ?? 0)
          const low = stock > 0 && stock <= 5
          return (
            <div className="flex items-center gap-2">
              <span
                className="font-bold tabular-nums text-sm"
                style={{ color: '#1E1D22' }}
              >
                {stock}
              </span>
              {low ? (
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#ffffff',
                    borderRadius: '4px',
                  }}
                >
                  Low
                </span>
              ) : null}
            </div>
          )
        }
      },
      {
        key: 'status',
        header: 'Status',
        cell: (p) => p.is_active ? (
          <span
            className="text-[9px] font-bold uppercase tracking-[0.08em] px-3 py-1.5"
            style={{
              background: 'linear-gradient(135deg, #22a55b, #1a8a4a)',
              color: '#ffffff',
              borderRadius: '4px',
            }}
          >
            Active
          </span>
        ) : (
          <span
            className="text-[9px] font-bold uppercase tracking-[0.08em] px-3 py-1.5"
            style={{
              background: 'linear-gradient(135deg, #e05555, #c0392b)',
              color: '#ffffff',
              borderRadius: '4px',
            }}
          >
            Inactive
          </span>
        )
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (p) => (
          <button
            onClick={() => navigate(`/admin/products/${p.id}/edit`)}
            className="text-[9px] font-bold uppercase tracking-[0.15em] px-4 py-2 transition-all duration-200"
            style={{
              background: 'transparent',
              color: '#76CDD6',
              border: '1.5px solid #76CDD6',
              borderRadius: '4px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#76CDD6'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#76CDD6'
            }}
          >
            Manage variants
          </button>
        )
      }
    ],
    [navigate]
  )

  return (
    <div className="space-y-8 min-h-screen" style={{ background: '#EFF8FE' }}>

      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}>
        <span
          className="text-[10px] font-bold tracking-[0.3em] uppercase"
          style={{ color: '#76CDD6' }}
        >
          Stock
        </span>
        <h1 className="text-4xl font-light mt-2" style={{ color: '#1E1D22' }}>Inventory</h1>
        <p className="text-sm mt-1 font-light" style={{ color: 'rgba(30,29,34,0.50)' }}>
          Product-level stock summary from real admin product list. Detailed variant stock is managed per product.
        </p>
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
          <h2
            className="text-xs font-bold tracking-[0.2em] uppercase"
            style={{ color: '#1E1D22' }}
          >
            Stock Summary
          </h2>
          <p
            className="text-[10px] mt-1"
            style={{ color: '#76CDD6' }}
          >
            This view avoids heavy N+1 variant fetching. Open a product to manage per-variant stock.
          </p>
        </div>

        {state.loading ? <CRMLoadingState label="Loading inventory summary…" /> : null}
        {!state.loading && state.error ? <CRMErrorState message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.rows.length === 0 ? (
          <CRMEmptyState title="No products" message="Create a product to see inventory." />
        ) : null}
        {!state.loading && !state.error && state.rows.length > 0 ? (
          <CRMDataTable columns={columns} rows={state.rows} rowKey={(r) => r.id} />
        ) : null}
      </div>

    </div>
  )
}