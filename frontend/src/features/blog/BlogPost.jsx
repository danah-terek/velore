import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Calendar, User, Clock, Tag } from 'lucide-react'
import apiClient from '../../shared/services/apiClient'

export default function BlogPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get(`/blogs/${id}`)
      .then(res => setPost(res?.data || null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Blog post not found</h1>
          <Link to="/blogs" className="text-gray-600 hover:text-gray-900 underline">
            View all blogs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <img 
          src={post.image || 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1200'} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-6 md:px-16 max-w-4xl mx-auto w-full">
            <Link 
              to="/blogs" 
              className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">Back to blogs</span>
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white max-w-3xl">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      <article className="px-6 md:px-16 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2"><User size={16} />{post.author || 'Unknown'}</div>
            <div className="flex items-center gap-2"><Calendar size={16} />{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="flex items-center gap-2"><Clock size={16} />{post.read_time || '5 min read'}</div>
            <div className="flex items-center gap-2"><Tag size={16} />{post.category || 'General'}</div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
            {post.content}
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <Link to="/blogs" className="text-gray-600 hover:text-gray-900 underline text-sm">
              ← Back to all blogs
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}