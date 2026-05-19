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

  return (
    <div className="space-y-6">
      <CRMPageHeader
        title="Discount Codes"
        subtitle="Create and manage discount codes for customers"
        right={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition"
          >
            <Plus size={16} />
            New Code
          </button>
        }
      />

      {showForm && (
        <CRMSectionCard title="Create Discount Code">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
              <input
                type="text"
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-900 bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Value</label>
              <input
                type="number"
                placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 10'}
                value={form.value}
                onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Min Order ($)</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={form.min_order}
                onChange={e => setForm(p => ({ ...p, min_order: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Max Uses (leave empty = unlimited)</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={form.max_uses}
                onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expires At</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>
          </div>
          {formError && <p className="text-red-500 text-xs mt-3">{formError}</p>}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Code'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </CRMSectionCard>
      )}

      <CRMSectionCard title="All Discount Codes">
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : codes.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No discount codes yet. Create one above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {codes.map(c => (
              <div key={c.code_id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-sm">{c.code}</span>
                  <div>
                    <p className="text-sm text-gray-700">
                      {c.type === 'percentage' ? `${c.value}% off` : `$${c.value} off`}
                      {c.min_order > 0 ? ` · min $${c.min_order}` : ''}
                    </p>
                    <p className="text-xs text-slate-400">
                      Used {c.used_count || 0}{c.max_uses ? `/${c.max_uses}` : ''} times
                      {c.expires_at ? ` · expires ${new Date(c.expires_at).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(c.code, c.is_active)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition ${c.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDelete(c.code)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CRMSectionCard>
    </div>
  )
}