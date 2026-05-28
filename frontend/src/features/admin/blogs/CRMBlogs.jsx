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

  // Handle single file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Logic placeholder: Replace this with your actual upload API call logic
      // e.g., const url = await uploadService.upload(file);
      // setForm(f => ({ ...f, image: url }));
      console.log('File selected:', file.name)
    }
  }

  const field = "w-full border border-black px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"

  return (
    <div className="max-w-5xl mx-auto space-y-12 bg-white min-h-screen p-6">
      <CRMPageHeader title="Blogs" subtitle="Write and manage blog posts." />

      <CRMSectionCard title={editingId ? 'Edit Post' : 'New Post'}>
        <div className="space-y-6 pt-2">
          {formError && <div className="p-4 border border-red-600 text-red-600 text-[10px] font-bold tracking-widest uppercase">{formError}</div>}
          {formSuccess && <div className="p-4 border border-black text-black text-[10px] font-bold tracking-widest uppercase">{formSuccess}</div>}

          <input className={field} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Title *" />
          
          <div className="grid grid-cols-2 gap-4">
            <input className={field} value={form.author} onChange={e => setForm(f => ({...f, author: e.target.value}))} placeholder="Author *" />
            <input className={field} value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} placeholder="Category" />
          </div>

          <input className={field} value={form.excerpt} onChange={e => setForm(f => ({...f, excerpt: e.target.value}))} placeholder="Excerpt" />

          {/* File Upload Component */}
          <div className="border border-black p-4 flex items-center justify-between">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-[10px] font-bold uppercase border border-black px-4 py-2 hover:bg-black hover:text-white transition-all">
              <Upload size={14} /> Select Max 1 Image
            </button>
            {form.image && <span className="text-[10px] text-gray-500">Image selected: {form.image.split('/').pop()}</span>}
          </div>

          <textarea className={`${field} h-48`} value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} placeholder="Content *" />

          <label className="flex items-center gap-4 cursor-pointer text-[10px] font-bold uppercase tracking-widest">
            <input type="checkbox" className="accent-black w-4 h-4" checked={form.is_published} onChange={e => setForm(f => ({...f, is_published: e.target.checked}))} />
            {form.is_published ? 'Publish immediately' : 'Save as draft'}
          </label>

          <div className="flex gap-4">
            <CRMActionButton onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</CRMActionButton>
            {editingId && <CRMActionButton tone="secondary" onClick={resetForm}>Cancel</CRMActionButton>}
          </div>
        </div>
      </CRMSectionCard>

      <CRMSectionCard title="All posts">
        <div className="divide-y divide-black">
          {state.rows.map(blog => (
            <div key={blog.post_id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-black overflow-hidden">{blog.image && <img src={resolveImageUrl(blog.image)} className="w-full h-full object-cover" />}</div>
                <div>
                  <div className="text-sm font-bold">{blog.title}</div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-400">{blog.category || '—'} · {blog.author}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CRMStatusBadge tone={blog.is_published ? 'success' : 'neutral'}>{blog.is_published ? 'Published' : 'Draft'}</CRMStatusBadge>
                <button onClick={() => adminBlogService.update(blog.post_id, { is_published: !blog.is_published }).then(load)} className="p-2"><Eye size={14} /></button>
                <button onClick={() => handleEdit(blog)} className="p-2"><Pencil size={14} /></button>
                <button onClick={() => adminBlogService.remove(blog.post_id).then(load)} className="p-2 text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </CRMSectionCard>
    </div>
  )
}