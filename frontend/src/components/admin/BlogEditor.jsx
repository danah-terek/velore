import { useEffect, useState } from 'react'
import apiClient from '../../shared/services/apiClient'

const initialForm = {
  title: '',
  author: '',
  category: '',
  image: '',
  content: ''
}

export default function BlogEditor() {
  const [form, setForm] = useState(initialForm)
  const [blogs, setBlogs] = useState([])
  const [editingId, setEditingId] = useState(null)

  const loadBlogs = async () => {
    try {
      const response = await apiClient.get('/blogs?published=all')
      const list = response?.data || response || []
      setBlogs(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Failed to fetch blogs', error)
      setBlogs([])
    }
  }

  useEffect(() => {
    loadBlogs()
  }, [])

  const handleSubmit = async (isPublished) => {
    const payload = {
      ...form,
      is_published: isPublished
    }

    try {
      if (editingId) {
        await apiClient.put(`/blogs/${editingId}`, payload)
      } else {
        await apiClient.post('/blogs', payload)
      }
      setForm(initialForm)
      setEditingId(null)
      loadBlogs()
    } catch (error) {
      console.error('Failed to save blog', error)
    }
  }

  const handleEdit = (blog) => {
    setEditingId(blog.post_id)
    setForm({
      title: blog.title || '',
      author: blog.author || '',
      category: blog.category || '',
      image: blog.image || '',
      content: blog.content || ''
    })
  }

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/blogs/${id}`)
      loadBlogs()
      if (editingId === id) {
        setEditingId(null)
        setForm(initialForm)
      }
    } catch (error) {
      console.error('Failed to delete blog', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="border border-gray-200 p-5 rounded-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Blog' : 'Create Blog'}</h3>
        <input className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <input className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <textarea className="w-full border border-gray-300 px-3 py-2 text-sm min-h-[150px]" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />

        <div className="flex gap-2">
          <button
            onClick={() => handleSubmit(true)}
            className="bg-gray-900 text-white px-4 py-2 text-sm font-medium transition-colors duration-300 hover:bg-gray-700"
          >
            Publish
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="border border-gray-900 text-gray-900 px-4 py-2 text-sm font-medium transition-colors duration-300 hover:bg-gray-100"
          >
            Save Draft
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Existing Blogs</h3>
        {blogs.length === 0 ? (
          <p className="text-sm text-gray-500">No blogs found.</p>
        ) : (
          blogs.map((blog) => (
            <div key={blog.post_id} className="border border-gray-200 p-4 rounded-sm flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{blog.title}</p>
                <p className="text-xs text-gray-500 mt-1">{blog.author} • {blog.category || 'Uncategorized'} • {blog.is_published ? 'Published' : 'Draft'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(blog)} className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white transition-colors duration-300 hover:bg-gray-700">Edit</button>
                <button onClick={() => handleDelete(blog.post_id)} className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white transition-colors duration-300 hover:bg-red-700">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
