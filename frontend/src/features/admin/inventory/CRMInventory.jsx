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
                className="w-10 h-10 rounded-xl border border-[rgba(var(--velore-border-soft),0.95)] object-cover bg-[rgba(var(--velore-accent),0.05)] ring-1 ring-[rgba(var(--velore-border-soft),0.5)]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[rgb(var(--velore-fg))] text-white flex items-center justify-center text-xs font-semibold ring-1 ring-[rgba(var(--velore-border-soft),0.35)]">
                V
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-xs text-[rgba(var(--velore-fg),0.52)] truncate">#{p.id}</div>
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
              <span className="font-semibold tabular-nums">{stock}</span>
              {low ? <CRMStatusBadge tone="warning">Low</CRMStatusBadge> : null}
            </div>
          )
        }
      },
      {
        key: 'status',
        header: 'Status',
        cell: (p) => (p.is_active ? <CRMStatusBadge tone="success">Active</CRMStatusBadge> : <CRMStatusBadge tone="danger">Inactive</CRMStatusBadge>)
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (p) => (
          <CRMActionButton tone="secondary" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
            Manage variants
          </CRMActionButton>
        )
      }
    ],
    [navigate]
  )

  return (
    <div className="space-y-6">
      <CRMPageHeader title="Inventory" subtitle="Product-level stock summary from real admin product list. Detailed variant stock is managed per product." />

      <CRMSectionCard title="Stock summary" subtitle="This view avoids heavy N+1 variant fetching. Open a product to manage per-variant stock.">
        {state.loading ? <CRMLoadingState label="Loading inventory summary…" /> : null}
        {!state.loading && state.error ? <CRMErrorState message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.rows.length === 0 ? (
          <CRMEmptyState title="No products" message="Create a product to see inventory." />
        ) : null}
        {!state.loading && !state.error && state.rows.length > 0 ? (
          <CRMDataTable columns={columns} rows={state.rows} rowKey={(r) => r.id} />
        ) : null}
      </CRMSectionCard>
    </div>
  )
}

