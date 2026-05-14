import { useCallback, useEffect, useState } from 'react'
import { ImageOff, Pencil, Trash2, Eye, EyeOff, Plus } from 'lucide-react'

import { adminBlogService } from '../services/adminBlogService'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import CRMPageHeader from '../shared/CRMPageHeader'
import CRMSectionCard from '../shared/CRMSectionCard'
import CRMLoadingState from '../shared/CRMLoadingState'
import CRMErrorState from '../shared/CRMErrorState'
import CRMEmptyState from '../shared/CRMEmptyState'
import CRMStatusBadge from '../shared/CRMStatusBadge'
import CRMActionButton from '../shared/CRMActionButton'

const EMPTY_FORM = { title: '', content: '', excerpt: '', author: 'Velore Team', category: '', image: '', is_published: false }

export default function CRMBlogs() {
  const [state, setState] = useState({ loading: true, error: null, rows: [] })
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  const load = useCallback(async () => {
    setState({ loading: true, error: null, rows: [] })
    try {
      const res = await adminBlogService.listAll()
      setState({ loading: false, error: null, rows: res.data || [] })
    } catch {
      try {
        const res = await adminBlogService.listPublished()
        setState({ loading: false, error: null, rows: res.data || [] })
      } catch (e) {
        setState({ loading: false, error: e?.message || 'Failed to load blogs', rows: [] })
      }
    }
  }, [])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError(null)
    setFormSuccess(null)
  }

  const handleEdit = (blog) => {
    setForm({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      author: blog.author || '',
      category: blog.category || '',
      image: blog.image || '',
      is_published: blog.is_published || false,
    })
    setEditingId(blog.post_id)
    setFormError(null)
    setFormSuccess(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!form.title?.trim() || !form.content?.trim() || !form.author?.trim()) {
      setFormError('Title, content, and author are required.')
      return
    }
    setSaving(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      if (editingId) {
        await adminBlogService.update(editingId, form)
        setFormSuccess('Post updated successfully!')
      } else {
        await adminBlogService.create(form)
        setFormSuccess('Post created successfully!')
      }
      resetForm()
      load()
    } catch (e) {
      setFormError(e?.message || e?.error || 'Failed to save blog.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"?`)) return
    try {
      await adminBlogService.remove(blog.post_id)
      if (editingId === blog.post_id) resetForm()
      load()
    } catch (e) {
      alert(e?.message || 'Failed to delete.')
    }
  }

  const handleTogglePublish = async (blog) => {
    try {
      await adminBlogService.update(blog.post_id, { is_published: !blog.is_published })
      load()
    } catch (e) {
      alert(e?.message || 'Failed to update.')
    }
  }

  const field = 'w-full border border-[rgba(var(--velore-border-soft),0.7)] rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(var(--velore-accent),0.4)]'

  return (
    <div className="space-y-6">
      <CRMPageHeader title="Blogs" subtitle="Write and manage blog posts." />

      {/* ── Editor ── */}
      <CRMSectionCard
        title={editingId ? 'Edit Post' : 'New Post'}
        subtitle={editingId ? 'Editing an existing post.' : 'Fill in the fields and save.'}
      >
        <div className="space-y-4 pt-2">
          {formError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              {formSuccess}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              className={field}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Post title"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Author *</label>
              <input
                className={field}
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                placeholder="Author name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                className={field}
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Style, Guide, Care"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <input
              className={field}
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="Short description shown on listing page"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              className={field}
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              placeholder="/uploads/blogs/my-image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content *</label>
            <textarea
              className={`${field} resize-none`}
              rows={10}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your blog content here..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
              className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.is_published ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm font-medium">{form.is_published ? 'Publish immediately' : 'Save as draft'}</span>
          </label>

          <div className="flex gap-3 pt-1">
            <CRMActionButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Post'}
            </CRMActionButton>
            {editingId && (
              <CRMActionButton tone="secondary" onClick={resetForm}>
                Cancel Edit
              </CRMActionButton>
            )}
          </div>
        </div>
      </CRMSectionCard>

      {/* ── Blog List ── */}
      <CRMSectionCard title="All posts" subtitle="Real data from your database">
        {state.loading && <CRMLoadingState label="Loading blogs…" />}
        {!state.loading && state.error && <CRMErrorState message={state.error} onRetry={load} />}
        {!state.loading && !state.error && state.rows.length === 0 && (
          <CRMEmptyState title="No posts yet" message="Create your first blog post above." />
        )}
        {!state.loading && !state.error && state.rows.length > 0 && (
          <div className="divide-y divide-[rgba(var(--velore-border-soft),0.4)]">
            {state.rows.map(blog => {
              const url = resolveImageUrl(blog.image)
              return (
                <div key={blog.post_id} className="flex items-center gap-4 py-3 px-1">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(var(--velore-accent),0.06)] border border-[rgba(var(--velore-border-soft),0.95)] overflow-hidden flex items-center justify-center shrink-0">
                    {url ? (
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }} />
                    ) : (
                      <ImageOff className="w-5 h-5 text-[rgba(var(--velore-fg),0.38)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{blog.title}</div>
                    <div className="text-xs text-[rgba(var(--velore-fg),0.52)] truncate">{blog.category || '—'} · {blog.author}</div>
                  </div>

                  <CRMStatusBadge tone={blog.is_published ? 'success' : 'neutral'}>
                    {blog.is_published ? 'Published' : 'Draft'}
                  </CRMStatusBadge>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleTogglePublish(blog)} title={blog.is_published ? 'Unpublish' : 'Publish'} className="p-2 rounded-lg hover:bg-[rgba(var(--velore-fg),0.06)] transition">
                      {blog.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleEdit(blog)} title="Edit" className="p-2 rounded-lg hover:bg-[rgba(var(--velore-fg),0.06)] transition">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(blog)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CRMSectionCard>
    </div>
  )
}