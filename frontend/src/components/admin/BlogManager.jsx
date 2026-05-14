import { useEffect, useMemo, useState, useCallback } from 'react'
import apiClient from '../../shared/services/apiClient'

const toSlug = (value) =>
  (value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const empty = {
  title: '',
  content: '',
  image: '',
  category: '',
  author: '',
  is_published: false
}

export default function BlogManager() {
  const [form, setForm] = useState({ ...empty })
  const [editingId, setEditingId] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const slug = useMemo(() => toSlug(form.title), [form.title])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get('/blogs')
      // apiClient already unwraps response.data, so res is { success, data }
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setBlogs(list)
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.error || e?.message || 'Failed to load blogs')
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        image: form.image?.trim() || null,
        author: form.author.trim(),
        category: form.category?.trim() || null,
        is_published: form.is_published === true
      }

      if (editingId) {
        await apiClient.put(`/blogs/${editingId}`, payload)
      } else {
        await apiClient.post('/blogs', payload)
      }
      setForm({ ...empty })
      setEditingId(null)
      load()
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.error || e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const editBlog = (blog) => {
    setEditingId(blog.post_id)
    setForm({
      title: blog.title || '',
      content: blog.content || '',
      image: blog.image || '',
      category: blog.category || '',
      author: blog.author || '',
      is_published: Boolean(blog.is_published)
    })
  }

  const deleteBlog = async (id) => {
    if (!window.confirm('Delete this post?')) return
    try {
      await apiClient.delete(`/blogs/${id}`)
      if (editingId === id) {
        setEditingId(null)
        setForm({ ...empty })
      }
      load()
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.error || e?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{editingId ? 'Edit blog' : 'Create blog'}</h2>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={submit} className="space-y-4 max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="border border-gray-300 px-3 py-2 text-sm" />
            <input readOnly placeholder="Slug (auto)" value={slug} className="border border-gray-300 px-3 py-2 text-sm bg-gray-50" />
            <input required placeholder="Author" value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} className="border border-gray-300 px-3 py-2 text-sm" />
            <input placeholder="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="border border-gray-300 px-3 py-2 text-sm" />
            <input placeholder="Image URL" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} className="sm:col-span-2 border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <textarea required placeholder="Content" rows={8} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} className="w-full border border-gray-300 px-3 py-2 text-sm" />
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))} />
            Published
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-gray-900 text-white hover:bg-gray-700 px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ ...empty }) }} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm transition-colors">
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-x-auto">
        <h2 className="text-2xl font-semibold px-6 py-4 border-b border-gray-200">All posts</h2>
        {loading ? (
          <p className="px-6 py-8 text-sm text-gray-500">Loading…</p>
        ) : blogs.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-500">No posts yet.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Author', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.post_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">{blog.title}</td>
                  <td className="px-4 py-3">{blog.author || '—'}</td>
                  <td className="px-4 py-3">{blog.is_published ? 'Published' : 'Draft'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editBlog(blog)} className="bg-gray-900 text-white hover:bg-gray-700 px-4 py-2 text-sm font-medium transition-colors">Edit</button>
                      <button type="button" onClick={() => deleteBlog(blog.post_id)} className="bg-white border border-gray-300 text-red-700 hover:bg-gray-50 px-4 py-2 text-sm transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}