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

// ── Shared input/select style helpers ───────────────────────────────────────
const INPUT_STYLE = {
  width: '100%',
  border: '1px solid rgba(118,205,214,0.30)',
  borderRadius: '4px',
  padding: '8px 12px',
  fontSize: '14px',
  background: '#ffffff',
  color: '#1E1D22',
  outline: 'none',
  transition: 'border-color 0.15s ease',
}
const onFocus = (e) => (e.target.style.borderColor = '#76CDD6')
const onBlur  = (e) => (e.target.style.borderColor = 'rgba(118,205,214,0.30)')

// ── Icon button ──────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 rounded"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: danger ? '#e05555' : 'rgba(30,29,34,0.55)',
        transition: 'background 0.13s ease, color 0.13s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? 'rgba(224,85,85,0.08)'
          : 'rgba(118,205,214,0.10)'
        e.currentTarget.style.color = danger ? '#c0392b' : '#1E1D22'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = danger ? '#e05555' : 'rgba(30,29,34,0.55)'
      }}
    >
      {children}
    </button>
  )
}

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

  return (
    <div className="space-y-6">
      <CRMPageHeader title="Staff" subtitle="Manage staff accounts. Super Admin only." />

      {/* ── Form ── */}
      <CRMSectionCard
        title={editingId ? 'Edit Staff' : 'Create Staff'}
        subtitle={editingId ? 'Update staff details.' : 'Add a new staff account.'}
      >
        <div className="space-y-4 pt-2">

          {/* Banners */}
          {formError && (
            <div
              className="flex items-start gap-3 px-4 py-3 text-sm rounded"
              style={{
                background: 'rgba(224,85,85,0.05)',
                border: '1px solid #e05555',
              }}
            >
              <span
                className="flex-shrink-0 w-1 self-stretch rounded-full"
                style={{ background: '#e05555', minHeight: '16px' }}
              />
              <span style={{ color: '#b91c1c' }}>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div
              className="flex items-start gap-3 px-4 py-3 text-sm rounded"
              style={{
                background: 'rgba(118,205,214,0.06)',
                border: '1px solid #76CDD6',
              }}
            >
              <span
                className="flex-shrink-0 w-1 self-stretch rounded-full"
                style={{ background: '#76CDD6', minHeight: '16px' }}
              />
              <span style={{ color: '#076d60' }}>{formSuccess}</span>
            </div>
          )}

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-bold tracking-[0.08em] uppercase mb-1.5"
                style={{ color: 'rgba(30,29,34,0.55)' }}
              >
                Email *
              </label>
              <input
                style={INPUT_STYLE}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="staff@velore.com"
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div>
              <label
                className="block text-xs font-bold tracking-[0.08em] uppercase mb-1.5"
                style={{ color: 'rgba(30,29,34,0.55)' }}
              >
                Name
              </label>
              <input
                style={INPUT_STYLE}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div>
              <label
                className="block text-xs font-bold tracking-[0.08em] uppercase mb-1.5"
                style={{ color: 'rgba(30,29,34,0.55)' }}
              >
                {editingId ? 'New Password (leave blank to keep)' : 'Password *'}
              </label>
              <input
                style={INPUT_STYLE}
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div>
              <label
                className="block text-xs font-bold tracking-[0.08em] uppercase mb-1.5"
                style={{ color: 'rgba(30,29,34,0.55)' }}
              >
                Role
              </label>
              <select
                style={INPUT_STYLE}
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                onFocus={onFocus}
                onBlur={onBlur}
              >
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
          <div
            className="overflow-hidden"
            style={{
              border: '1px solid rgba(118,205,214,0.22)',
              borderRadius: '6px',
            }}
          >
            {state.rows.map((staff, i) => {
              const isLast = i === state.rows.length - 1
              return (
                <div key={staff.id}>
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 py-3 px-4"
                    style={{
                      borderBottom: isLast && expandedId !== staff.id
                        ? 'none'
                        : '1px solid rgba(118,205,214,0.15)',
                      background: '#ffffff',
                      transition: 'background 0.13s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#EFF8FE')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-sm truncate"
                        style={{ color: '#1E1D22' }}
                      >
                        {staff.email}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: 'rgba(30,29,34,0.50)' }}
                      >
                        {staff.name || '—'}
                      </div>
                    </div>

                    <CRMStatusBadge tone={staff.role === 'super_admin' ? 'warning' : 'neutral'}>
                      {staff.role}
                    </CRMStatusBadge>

                    <div
                      className="text-xs shrink-0 tabular-nums"
                      style={{ color: 'rgba(30,29,34,0.45)' }}
                    >
                      {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : '—'}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <IconBtn
                        onClick={() => setExpandedId(expandedId === staff.id ? null : staff.id)}
                        title="Details"
                      >
                        {expandedId === staff.id
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                        }
                      </IconBtn>
                      <IconBtn onClick={() => handleEdit(staff)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </IconBtn>
                      {staff.role !== 'super_admin' && (
                        <IconBtn onClick={() => handleDelete(staff)} title="Delete" danger>
                          <Trash2 className="w-4 h-4" />
                        </IconBtn>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === staff.id && (
                    <div
                      className="px-4 py-4 text-sm space-y-2"
                      style={{
                        background: '#EFF8FE',
                        borderBottom: isLast ? 'none' : '1px solid rgba(118,205,214,0.15)',
                      }}
                    >
                      {[
                        ['ID',      staff.id],
                        ['Email',   staff.email],
                        ['Name',    staff.name || '—'],
                        ['Role',    staff.role],
                        ['Created', staff.created_at ? new Date(staff.created_at).toLocaleString() : '—'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span
                            className="text-xs font-bold tracking-[0.06em] uppercase w-16 shrink-0 pt-0.5"
                            style={{ color: 'rgba(30,29,34,0.45)' }}
                          >
                            {k}
                          </span>
                          <span
                            className="text-xs font-mono"
                            style={{
                              color: '#1E1D22',
                              background: 'rgba(118,205,214,0.10)',
                              border: '1px solid rgba(118,205,214,0.20)',
                              borderRadius: '4px',
                              padding: '1px 6px',
                            }}
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CRMSectionCard>
    </div>
  )
}