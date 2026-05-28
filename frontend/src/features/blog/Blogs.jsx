import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../shared/services/apiClient'
import { resolveImageUrl } from '../../shared/utils/imageUrl'

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
      {/* Editorial Header Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl md:text-4xl font-normal tracking-wide text-gray-900 mb-3">
            VELORE JOURNAL
          </h1>
          <p className="text-sm tracking-wide text-gray-400 max-w-md mx-auto uppercase text-[11px]">
            Insights on eyewear trends, eye health, and style inspiration
          </p>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {loading ? (
          <p className="text-center text-sm text-gray-400 tracking-widest">LOADING...</p>
        ) : blogs.length === 0 ? (
          <p className="text-center text-sm text-gray-400 tracking-widest">NO BLOG POSTS YET.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {blogs.map(blog => (
              <Link key={blog.post_id} to={`/blogs/${blog.post_id}`} className="group flex flex-col">
                {/* Image Wrapper */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-gray-50 border border-gray-100 mb-5">
                  <img 
                    src={resolveImageUrl(blog.image) || ''}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const img = e.currentTarget
                      img.onerror = null
                      img.src = ''
                    }}
                  />
                </div>
                
                {/* Meta details matching footer tracking styling */}
                <div className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-3">
                  <span>{new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{blog.read_time || '5 MIN READ'}</span>
                </div>

                {/* Post Title */}
                <h2 className="text-lg font-normal text-gray-900 group-hover:opacity-60 transition-opacity duration-200 leading-snug">
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