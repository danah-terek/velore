import { useCallback, useEffect, useState, useRef } from 'react'
import { ImageOff, Pencil, Trash2, Eye, EyeOff, Plus, Upload, X } from 'lucide-react'

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

// Shared field style
const fieldStyle = {
  width: '100%',
  border: '1px solid rgba(118,205,214,0.30)',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
  background: '#ffffff',
  color: '#1E1D22',
  borderRadius: '4px',
  transition: 'border-color 0.16s ease',
}

function PaletteInput({ className = '', style = {}, ...props }) {
  return (
    <input
      {...props}
      style={{ ...fieldStyle, ...style }}
      onFocus={e => e.target.style.borderColor = '#76CDD6'}
      onBlur={e => e.target.style.borderColor = 'rgba(118,205,214,0.30)'}
      className={className}
    />
  )
}

function PaletteTextarea({ style = {}, ...props }) {
  return (
    <textarea
      {...props}
      style={{ ...fieldStyle, height: '192px', resize: 'vertical', ...style }}
      onFocus={e => e.target.style.borderColor = '#76CDD6'}
      onBlur={e => e.target.style.borderColor = 'rgba(118,205,214,0.30)'}
    />
  )
}

export default function CRMBlogs() {
  const [state, setState] = useState({ loading: true, error: null, rows: [] })
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  const fileInputRef = useRef(null)

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
    setForm({ ...blog })
    setEditingId(blog.post_id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!form.title?.trim() || !form.content?.trim() || !form.author?.trim()) {
      setFormError('Title, content, and author are required.')
      return
    }
    setSaving(true)
    try {
      if (editingId) await adminBlogService.update(editingId, form)
      else await adminBlogService.create(form)
      setFormSuccess('Post saved successfully!')
      resetForm()
      load()
    } catch (e) { setFormError(e?.message || 'Failed to save.') }
    finally { setSaving(false) }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('files', file)
      const res = await adminBlogService.uploadImage(formData)
      const path = res?.data?.paths?.[0] || res?.data?.path || res?.data?.url
      if (path) {
        setForm(f => ({ ...f, image: path }))
        setFormSuccess('Image uploaded!')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setFormError('Failed to upload image')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 min-h-screen p-6" style={{ background: '#EFF8FE' }}>

      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}>
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#76CDD6' }}>
          Content
        </span>
        <h1 className="text-4xl font-light mt-2" style={{ color: '#1E1D22' }}>Blogs</h1>
        <p className="text-sm mt-2 font-light" style={{ color: 'rgba(30,29,34,0.50)' }}>
          Write and manage blog posts.
        </p>
      </div>

      {/* Form Card */}
      <div
        className="p-8 space-y-6"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(118,205,214,0.22)',
          borderRadius: '4px',
        }}
      >
        <h2
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: '#1E1D22' }}
        >
          {editingId ? 'Edit Post' : 'New Post'}
        </h2>

        {formError && (
          <div
            className="p-4 text-[10px] font-bold tracking-widest uppercase"
            style={{ border: '1px solid #e05555', color: '#e05555', borderRadius: '4px', background: 'rgba(224,85,85,0.04)' }}
          >
            {formError}
          </div>
        )}
        {formSuccess && (
          <div
            className="p-4 text-[10px] font-bold tracking-widest uppercase"
            style={{ border: '1px solid #76CDD6', color: '#76CDD6', borderRadius: '4px', background: 'rgba(118,205,214,0.06)' }}
          >
            {formSuccess}
          </div>
        )}

        <PaletteInput
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Title *"
        />

        <div className="grid grid-cols-2 gap-4">
          <PaletteInput
            value={form.author}
            onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
            placeholder="Author *"
          />
          <PaletteInput
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            placeholder="Category"
          />
        </div>

        <PaletteInput
          value={form.excerpt}
          onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
          placeholder="Excerpt"
        />

        {/* File Upload */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ border: '1px solid rgba(118,205,214,0.25)', borderRadius: '4px', background: '#EFF8FE' }}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 text-[10px] font-bold uppercase px-4 py-2 transition-all duration-200"
            style={{ border: '1px solid #76CDD6', color: '#76CDD6', background: 'transparent', borderRadius: '4px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#76CDD6'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#76CDD6' }}
          >
            <Upload size={14} /> Select Max 1 Image
          </button>
          {form.image ? (
            <span className="text-[10px]" style={{ color: 'rgba(30,29,34,0.45)' }}>
              {typeof form.image === 'string' ? form.image.split('/').pop() : ''}
            </span>
          ) : null}
        </div>

        <PaletteTextarea
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder="Content *"
        />

        <label
          className="flex items-center gap-4 cursor-pointer text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(30,29,34,0.55)' }}
        >
          <input
            type="checkbox"
            className="w-4 h-4"
            style={{ accentColor: '#76CDD6' }}
            checked={form.is_published}
            onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
          />
          {form.is_published ? 'Publish immediately' : 'Save as draft'}
        </label>

        <div className="flex gap-4">
          <ActionBtn onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </ActionBtn>
          {editingId && (
            <ActionBtn variant="secondary" onClick={resetForm}>
              Cancel
            </ActionBtn>
          )}
        </div>
      </div>

      {/* Posts List Card */}
      <div
        className="p-8"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(118,205,214,0.22)',
          borderRadius: '4px',
        }}
      >
        <h2
          className="text-xs font-bold tracking-[0.2em] uppercase mb-6"
          style={{ color: '#1E1D22' }}
        >
          All Posts
        </h2>

        <div style={{ borderTop: '1px solid rgba(118,205,214,0.20)' }}>
          {state.rows.map(blog => (
            <div
              key={blog.post_id}
              className="flex items-center justify-between py-4"
              style={{ borderBottom: '1px solid rgba(118,205,214,0.15)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 overflow-hidden shrink-0"
                  style={{ border: '1px solid rgba(118,205,214,0.25)', borderRadius: '4px' }}
                >
                  {blog.image && (
                    <img src={resolveImageUrl(blog.image)} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#1E1D22' }}>{blog.title}</div>
                  <div
                    className="text-[9px] uppercase tracking-widest mt-0.5"
                    style={{ color: 'rgba(30,29,34,0.40)' }}
                  >
                    {blog.category || '—'} · {blog.author}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status badge */}
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1"
                  style={{
                    border: `1px solid ${blog.is_published ? 'rgba(118,205,214,0.40)' : 'rgba(30,29,34,0.15)'}`,
                    color: blog.is_published ? '#76CDD6' : 'rgba(30,29,34,0.40)',
                    background: blog.is_published ? 'rgba(118,205,214,0.08)' : 'rgba(30,29,34,0.04)',
                    borderRadius: '4px',
                  }}
                >
                  {blog.is_published ? 'Published' : 'Draft'}
                </span>

                <IconBtn
                  onClick={() => adminBlogService.update(blog.post_id, { is_published: !blog.is_published }).then(load)}
                >
                  <Eye size={14} />
                </IconBtn>
                <IconBtn onClick={() => handleEdit(blog)}>
                  <Pencil size={14} />
                </IconBtn>
                <IconBtn danger onClick={() => adminBlogService.remove(blog.post_id).then(load)}>
                  <Trash2 size={14} />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function ActionBtn({ onClick, disabled, variant = 'primary', children }) {
  const isPrimary = variant === 'primary'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-3 transition-all duration-200 disabled:opacity-50"
      style={{
        background: isPrimary ? '#76CDD6' : 'transparent',
        color: isPrimary ? '#ffffff' : '#76CDD6',
        border: '1px solid #76CDD6',
        borderRadius: '4px',
      }}
      onMouseEnter={e => {
        if (disabled) return
        e.currentTarget.style.background = isPrimary ? '#5bb8c2' : '#76CDD6'
        e.currentTarget.style.color = '#ffffff'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isPrimary ? '#76CDD6' : 'transparent'
        e.currentTarget.style.color = isPrimary ? '#ffffff' : '#76CDD6'
      }}
    >
      {children}
    </button>
  )
}

function IconBtn({ onClick, danger = false, children }) {
  return (
    <button
      onClick={onClick}
      className="p-2 transition-colors duration-150"
      style={{ color: danger ? 'rgba(224,85,85,0.55)' : 'rgba(30,29,34,0.35)' }}
      onMouseEnter={e => e.currentTarget.style.color = danger ? '#e05555' : '#76CDD6'}
      onMouseLeave={e => e.currentTarget.style.color = danger ? 'rgba(224,85,85,0.55)' : 'rgba(30,29,34,0.35)'}
    >
      {children}
    </button>
  )
}