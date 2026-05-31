import { useEffect, useState } from 'react'
import { Trash2, Plus, Tag } from 'lucide-react'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMSectionCard from '../shared/CRMSectionCard'

export default function CRMDiscounts() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', min_order: '', max_uses: '', expires_at: ''
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')

  const loadCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/discounts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      setCodes(result?.data || [])
    } catch (e) {
      setError('Failed to load discount codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCodes() }, [])

  const handleCreate = async () => {
    if (!form.code || !form.value) {
      setFormError('Code and value are required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const res = await fetch('/api/v1/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: parseFloat(form.value),
          min_order: form.min_order ? parseFloat(form.min_order) : 0,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          expires_at: form.expires_at || null
        })
      })
      const result = await res.json()
      if (!result.success) { setFormError(result.message || 'Failed to create code'); return }
      setForm({ code: '', type: 'percentage', value: '', min_order: '', max_uses: '', expires_at: '' })
      setShowForm(false)
      loadCodes()
    } catch (e) {
      setFormError('Failed to create code')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (code) => {
    if (!confirm(`Delete code "${code}"?`)) return
    try {
      await fetch(`/api/v1/discounts/${code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      loadCodes()
    } catch (e) {
      alert('Failed to delete code')
    }
  }

  const handleToggle = async (code, current) => {
    try {
      await fetch(`/api/v1/discounts/${code}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      loadCodes()
    } catch (e) {
      alert('Failed to toggle code')
    }
  }

  const inputStyle = {
    width: '100%',
    border: '1px solid rgba(118,205,214,0.30)',
    borderRadius: '4px',
    padding: '9px 12px',
    fontSize: '13px',
    outline: 'none',
    background: '#ffffff',
    color: '#1E1D22',
    transition: 'border-color 0.16s ease',
  }

  const handleFocus = e => e.target.style.borderColor = '#76CDD6'
  const handleBlur  = e => e.target.style.borderColor = 'rgba(118,205,214,0.30)'

  return (
    <div className="space-y-8 min-h-screen" style={{ background: '#EFF8FE' }}>

      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}>
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#76CDD6' }}>
          Promotions
        </span>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-light" style={{ color: '#1E1D22' }}>Discount Codes</h1>
            <p className="text-sm mt-1 font-light" style={{ color: 'rgba(30,29,34,0.50)' }}>
              Create and manage discount codes for customers
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-3 transition-all duration-200"
            style={{
              background: '#76CDD6',
              color: '#ffffff',
              border: '1px solid #76CDD6',
              borderRadius: '4px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#5bb8c2'}
            onMouseLeave={e => e.currentTarget.style.background = '#76CDD6'}
          >
            <Plus size={14} />
            New Code
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div
          className="p-6 sm:p-8"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(118,205,214,0.22)',
            borderRadius: '4px',
          }}
        >
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-6" style={{ color: '#1E1D22' }}>
            Create Discount Code
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(30,29,34,0.50)' }}>
                Code
              </label>
              <input
                type="text"
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(30,29,34,0.50)' }}>
                Type
              </label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ ...inputStyle, appearance: 'auto' }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(30,29,34,0.50)' }}>
                Value
              </label>
              <input
                type="number"
                placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 10'}
                value={form.value}
                onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(30,29,34,0.50)' }}>
                Min Order ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={form.min_order}
                onChange={e => setForm(p => ({ ...p, min_order: e.target.value }))}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(30,29,34,0.50)' }}>
                Max Uses (leave empty = unlimited)
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={form.max_uses}
                onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(30,29,34,0.50)' }}>
                Expires At
              </label>
              <input
                type="date" min={new Date().toISOString().split('T')[0]}
                value={form.expires_at}
                onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {formError && (
            <p
              className="text-[10px] font-bold uppercase tracking-widest mt-4"
              style={{ color: '#e05555' }}
            >
              {formError}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-3 transition-all duration-200 disabled:opacity-50"
              style={{
                background: '#76CDD6',
                color: '#ffffff',
                border: '1px solid #76CDD6',
                borderRadius: '4px',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#5bb8c2' }}
              onMouseLeave={e => e.currentTarget.style.background = '#76CDD6'}
            >
              {saving ? 'Saving...' : 'Create Code'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-3 transition-all duration-200"
              style={{
                background: 'transparent',
                color: '#76CDD6',
                border: '1px solid rgba(118,205,214,0.40)',
                borderRadius: '4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EFF8FE' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* All Codes */}
      <div
        className="p-6 sm:p-8"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(118,205,214,0.22)',
          borderRadius: '4px',
        }}
      >
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-6" style={{ color: '#1E1D22' }}>
          All Discount Codes
        </h2>

        {loading ? (
          <p className="text-sm font-light" style={{ color: 'rgba(30,29,34,0.45)' }}>Loading...</p>
        ) : error ? (
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#e05555' }}>{error}</p>
        ) : codes.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(118,205,214,0.40)' }} />
            <p className="text-sm font-light" style={{ color: 'rgba(30,29,34,0.40)' }}>
              No discount codes yet. Create one above!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {codes.map(c => (
              <div
                key={c.code_id}
                className="flex items-center justify-between gap-4 px-4 py-4 flex-wrap"
                style={{
                  background: '#EFF8FE',
                  border: '1px solid rgba(118,205,214,0.18)',
                  borderRadius: '4px',
                }}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="font-mono font-bold text-sm px-3 py-1"
                    style={{
                      background: 'rgba(118,205,214,0.12)',
                      color: '#1E1D22',
                      border: '1px solid rgba(118,205,214,0.35)',
                      borderRadius: '4px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {c.code}
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1E1D22' }}>
                      {c.type === 'percentage' ? `${c.value}% off` : `$${c.value} off`}
                      {c.min_order > 0 ? ` · min $${c.min_order}` : ''}
                    </p>
                    {c.expires_at && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(30,29,34,0.40)' }}>
                        Expires {new Date(c.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(c.code, c.is_active)}
                    className="text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 transition-all duration-200"
                    style={{
                      borderRadius: '4px',
                      border: 'none',
                      color: '#ffffff',
                      background: c.is_active
                        ? 'linear-gradient(135deg, #22a55b, #1a8a4a)'
                        : 'linear-gradient(135deg, #e05555, #c0392b)',
                      padding: '5px 14px',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDelete(c.code)}
                    className="p-2 transition-colors duration-150"
                    style={{ color: 'rgba(224,85,85,0.50)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e05555'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(224,85,85,0.50)'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}