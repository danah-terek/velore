import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trash2, Search, ArrowRight, ArrowLeft } from 'lucide-react'

import { useAdminAuth } from '../auth/AdminAuthContext'
import { adminCustomerService } from '../services/adminCustomerService'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMSearchInput from '../shared/CRMSearchInput'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'
import CRMDataTable from '../shared/CRMDataTable'

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

  useEffect(() => { load() }, [load])

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Customer Identity',
      cell: (u) => (
        <div className="flex flex-col">
          <span className="font-bold text-black">{u.name || 'Anonymous'}</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-500">{u.email}</span>
        </div>
      ),
    },
    { key: 'role', header: 'Role', cell: (u) => <span className="text-[10px] font-bold uppercase tracking-widest">{u.role || 'customer'}</span> },
    { key: 'orders_count', header: 'Orders', cell: (u) => <span className="tabular-nums font-bold">{u.orders_count ?? '0'}</span> },
    { key: 'loyalty_points', header: 'Points', cell: (u) => <span className="tabular-nums font-bold">{u.loyalty_points ?? '0'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (u) => (
        <div className="flex items-center gap-4">
          <button
            className="text-[9px] font-bold uppercase tracking-[0.2em] hover:underline"
            disabled={busyId === u.id}
            onClick={async () => {
              setBusyId(u.id)
              try {
                const res = await adminCustomerService.toggleStatus({ userId: u.id })
                setState(s => ({ ...s, rows: s.rows.map(x => x.id === u.id ? { ...x, is_active: res?.data?.is_active } : x) }))
              } finally { setBusyId(null) }
            }}
          >
            {u.is_active ? 'Disable' : 'Enable'}
          </button>
          <button
            className={`text-[9px] font-bold uppercase tracking-[0.2em] ${confirmDeleteId === u.id ? 'text-rose-600' : 'text-black'}`}
            disabled={!isSuper || busyId === u.id}
            onClick={async () => {
              if (!isSuper) return
              if (confirmDeleteId !== u.id) {
                setConfirmDeleteId(u.id)
                setTimeout(() => setConfirmDeleteId(null), 4000)
                return
              }
              setBusyId(u.id)
              try {
                await adminCustomerService.delete({ userId: u.id })
                setState(s => ({ ...s, rows: s.rows.filter(x => x.id !== u.id) }))
              } finally { setBusyId(null); setConfirmDeleteId(null) }
            }}
          >
            {confirmDeleteId === u.id ? 'Confirm?' : <Trash2 size={14} />}
          </button>
        </div>
      ),
    },
  ], [busyId, confirmDeleteId, isSuper])

  return (
    <div className="space-y-12 bg-white min-h-screen">
      <CRMPageHeader title="Customer Directory" subtitle="Administrative control for user accounts." />

      <CRMSectionCard title="Database" right={
        <div className="flex items-center border border-black px-2">
          <Search size={14} className="text-black" />
          <input className="px-3 py-2 text-sm outline-none" placeholder="Search..." value={search} onChange={e => { setPage(1); setSearch(e.target.value) }} />
        </div>
      }>
        {state.loading ? <CRMLoadingState /> : 
         state.error ? <CRMErrorState message={state.error} onRetry={load} /> :
         state.rows.length === 0 ? <CRMEmptyState title="No matches found" /> :
         (
           <div className="space-y-6">
             <CRMDataTable columns={columns} rows={state.rows} rowKey={(r) => r.id} />
             {state.pagination && (
               <div className="flex items-center justify-between border-t border-black pt-6">
                 <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" disabled={state.pagination.page <= 1} onClick={() => setPage(p => p - 1)}><ArrowLeft size={12} /> Prev</button>
                 <span className="text-[10px] font-bold">Page {state.pagination.page} / {state.pagination.pages}</span>
                 <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" disabled={state.pagination.page >= state.pagination.pages} onClick={() => setPage(p => p + 1)}>Next <ArrowRight size={12} /></button>
               </div>
             )}
           </div>
         )}
      </CRMSectionCard>
    </div>
  )
}