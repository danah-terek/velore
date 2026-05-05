import { useEffect, useState, useCallback } from 'react'
import apiClient from '../../shared/services/apiClient'

function AddProductModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setSaving(true)
    try {
      await apiClient.post('/products', {
        name,
        price: String(price),
        category_id: Number(categoryId),
        brand_id: Number(brandId),
        description: description || undefined
      })
      onCreated()
      onClose()
      setName('')
      setPrice('')
      setCategoryId('')
      setBrandId('')
      setDescription('')
    } catch (e2) {
      setErr(e2?.error || e2?.message || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/30" aria-label="Close" onClick={onClose} />
      <div className="relative bg-white rounded-sm shadow-lg border border-gray-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Add product</h3>
        {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          <input required placeholder="Price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          <input required placeholder="Category ID" type="number" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          <input required placeholder="Brand ID" type="number" value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm min-h-[80px]" />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="bg-gray-900 text-white hover:bg-gray-700 px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-60">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProductsManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get('/admin/products?page=1&limit=100')
      setProducts(res?.data || [])
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggle = async (p) => {
    try {
      const res = await apiClient.patch(`/admin/products/${p.id}/toggle-status`)
      const active = res?.data?.is_active
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: active } : x)))
    } catch (e) {
      setError(e?.error || e?.message || 'Toggle failed')
    }
  }

  const saveQuickEdit = async () => {
    if (!editId) return
    setSavingEdit(true)
    try {
      await apiClient.put(`/products/${editId}`, { name: editName, price: String(editPrice) })
      setEditId(null)
      load()
    } catch (e) {
      setError(e?.error || e?.message || 'Update failed')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-gray-900 text-white hover:bg-gray-700 px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Add product
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500 py-8">Loading products…</p>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Name', 'Brand', 'Category', 'Price', 'Active', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.brand || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category || '—'}</td>
                  <td className="px-4 py-3">${Number(p.price || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">{p.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => toggle(p)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm transition-colors">
                        Toggle active
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditId(p.id); setEditName(p.name); setEditPrice(String(p.price)) }}
                        className="bg-gray-900 text-white hover:bg-gray-700 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        Quick edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddProductModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={load} />

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30" aria-label="Close" onClick={() => setEditId(null)} />
          <div className="relative bg-white rounded-sm shadow-lg border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Quick edit</h3>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm mb-3" />
            <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm mb-4" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditId(null)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm">Cancel</button>
              <button type="button" disabled={savingEdit} onClick={saveQuickEdit} className="bg-gray-900 text-white hover:bg-gray-700 px-6 py-2.5 text-sm font-medium disabled:opacity-60">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
