import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, Pencil, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'

import { adminStaffService } from '../services/adminStaffService'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'
import CRMActionButton from '../shared/CRMActionButton'
import CRMStatusBadge from '../shared/CRMStatusBadge'

const EMPTY_FORM = { email: '', password: '', name: '', role: 'staff_admin' }
const ROLES = ['staff_admin', 'admin', 'staff', 'super_admin']

export default function CRMStaff() {
  const [state, setState] = useState({ loading: true, error: null, rows: [] })
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const load = useCallback(async () => {
    setState({ loading: true, error: null, rows: [] })
    try {
      const res = await adminStaffService.list()
      setState({ loading: false, error: null, rows: res.data || [] })
    } catch (e) {
      setState({ loading: false, error: e?.message || 'Failed to load staff', rows: [] })
    }
  }, [])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError(null)
    setFormSuccess(null)
  }

  const handleEdit = (staff) => {
    setForm({ email: staff.email, name: staff.name || '', password: '', role: staff.role || 'staff_admin' })
    setEditingId(staff.id)
    setFormError(null)
    setFormSuccess(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!form.email) { setFormError('Email is required.'); return }
    if (!editingId && !form.password) { setFormError('Password is required for new staff.'); return }
    setSaving(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      if (editingId) {
        const payload = { email: form.email, name: form.name, role: form.role }
        if (form.password) payload.password = form.password
        await adminStaffService.update(editingId, payload)
        setFormSuccess('Staff updated successfully!')
      } else {
        await adminStaffService.create(form)
        setFormSuccess('Staff created successfully!')
      }
      resetForm()
      load()
    } catch (e) {
      setFormError(e?.message || e?.error || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (staff) => {
    if (!window.confirm(`Delete "${staff.email}"? This cannot be undone.`)) return
    try {
      await adminStaffService.remove(staff.id)
      if (editingId === staff.id) resetForm()
      load()
    } catch (e) {
      alert(e?.message || 'Failed to delete.')
    }
  }

  const field = 'w-full border border-[rgba(var(--velore-border-soft),0.7)] rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(var(--velore-accent),0.4)]'

  return (
    <div className="space-y-6">
      <CRMPageHeader title="Staff" subtitle="Manage staff accounts. Super Admin only." />

      {/* ── Form ── */}
      <CRMSectionCard
        title={editingId ? 'Edit Staff' : 'Create Staff'}
        subtitle={editingId ? 'Update staff details.' : 'Add a new staff account.'}
      >
        <div className="space-y-4 pt-2">
          {formError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{formError}</div>
          )}
          {formSuccess && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{formSuccess}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input className={field} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="staff@velore.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className={field} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{editingId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input className={field} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select className={field} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <CRMActionButton onClick={handleSave} disabled={saving}>
              <ShieldCheck className="w-4 h-4 inline mr-1" />
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Staff'}
            </CRMActionButton>
            {editingId && (
              <CRMActionButton tone="secondary" onClick={resetForm}>Cancel</CRMActionButton>
            )}
          </div>
        </div>
      </CRMSectionCard>

      {/* ── Staff List ── */}
      <CRMSectionCard title="Staff accounts" subtitle="All admin and staff accounts">
        {state.loading && <CRMLoadingState label="Loading staff…" />}
        {!state.loading && state.error && <CRMErrorState message={state.error} onRetry={load} />}
        {!state.loading && !state.error && state.rows.length === 0 && (
          <CRMEmptyState title="No staff accounts" message="Create a staff account above." />
        )}
        {!state.loading && !state.error && state.rows.length > 0 && (
          <div className="divide-y divide-[rgba(var(--velore-border-soft),0.4)]">
            {state.rows.map(staff => (
              <div key={staff.id}>
                <div className="flex items-center gap-4 py-3 px-1">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{staff.email}</div>
                    <div className="text-xs text-[rgba(var(--velore-fg),0.52)]">{staff.name || '—'}</div>
                  </div>

                  <CRMStatusBadge tone={staff.role === 'super_admin' ? 'warning' : 'neutral'}>
                    {staff.role}
                  </CRMStatusBadge>

                  <div className="text-xs text-[rgba(var(--velore-fg),0.52)] shrink-0">
                    {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : '—'}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedId(expandedId === staff.id ? null : staff.id)}
                      className="p-2 rounded-lg hover:bg-[rgba(var(--velore-fg),0.06)] transition"
                      title="Details"
                    >
                      {expandedId === staff.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(staff)}
                      className="p-2 rounded-lg hover:bg-[rgba(var(--velore-fg),0.06)] transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {staff.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDelete(staff)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === staff.id && (
                  <div className="px-2 pb-4 pt-1 text-sm space-y-1 text-[rgba(var(--velore-fg),0.72)] bg-[rgba(var(--velore-accent),0.02)] rounded-lg mx-1 mb-2">
                    <div><span className="font-medium">ID:</span> {staff.id}</div>
                    <div><span className="font-medium">Email:</span> {staff.email}</div>
                    <div><span className="font-medium">Name:</span> {staff.name || '—'}</div>
                    <div><span className="font-medium">Role:</span> {staff.role}</div>
                    <div><span className="font-medium">Created:</span> {staff.created_at ? new Date(staff.created_at).toLocaleString() : '—'}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CRMSectionCard>
    </div>
  )
}