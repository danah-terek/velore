import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../shared/services/apiClient'

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/blogs')
      .then(res => setBlogs(res?.data || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <section className="px-6 md:px-16 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Velore Journal
          </h1>
          <p className="text-gray-600 text-lg">
            Insights on eyewear trends, eye health, and style inspiration
          </p>
        </div>
      </section>

      <section className="px-6 md:px-16 py-16">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : blogs.length === 0 ? (
          <p className="text-center text-gray-500">No blog posts yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <Link key={blog.post_id} to={`/blogs/${blog.post_id}`} className="group">
                <div className="aspect-[4/3] rounded-sm overflow-hidden mb-4">
                  <img 
                    src={blog.image || 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600'} 
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span>{new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span>•</span>
                  <span>{blog.read_time || '5 min read'}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-gray-600 transition-colors mb-2">
                  {blog.title}
                </h2>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}