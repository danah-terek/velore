import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Calendar, User, Clock, Tag } from 'lucide-react'
import apiClient from '../../shared/services/apiClient'
import { resolveImageUrl } from '../../shared/utils/imageUrl'

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400 tracking-widest">LOADING...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-lg font-normal text-gray-900 mb-3 tracking-wide">BLOG POST NOT FOUND</h1>
          <Link to="/blogs" className="text-xs text-gray-400 hover:text-black uppercase tracking-widest transition-colors underline underline-offset-4">
            View all blogs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Link 
          to="/blogs" 
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          <span>Back to journal</span>
        </Link>
      </div>

      {/* Article Content Area */}
      <article className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Title and Header Elements */}
        <div className="max-w-3xl mb-10">
          <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
            <span className="bg-gray-100 px-2 py-0.5 rounded-sm text-gray-600">{post.category || 'General'}</span>
            <span>•</span>
            <span>{post.read_time || '5 min read'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-normal text-gray-900 tracking-wide leading-tight mb-6">
            {post.title}
          </h1>
          
          {/* Subtle Meta Data Line */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5"><User size={14} className="text-gray-300" /> By {post.author || 'Velore'}</div>
            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-300" /> {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Feature Display Image */}
        <div className="w-full aspect-[16/9] bg-gray-50 border border-gray-100 overflow-hidden mb-12">
          <img 
            src={resolveImageUrl(post.image) || ''}
            alt={post.title} 
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget
              img.onerror = null
              img.src = ''
            }}
          />
        </div>

        {/* Body Paragraph Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line space-y-6 tracking-wide">
            {post.content}
          </div>

          {/* Bottom Return Trigger */}
          <div className="mt-20 pt-8 border-t border-gray-100">
            <Link 
              to="/blogs" 
              className="inline-flex items-center text-xs text-gray-400 hover:text-black uppercase tracking-widest transition-colors gap-1"
            >
              ← Back to all blogs
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}