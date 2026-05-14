
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Testimonials from '../../shared/components/eyewear/Testimonials'
import { EyewearCard } from '../../shared/components/eyewear'
import sketchImage from '../../assets/Veloresketch.jpeg'
import heroImage from '../../assets/heropic.jpg'
import { resolveImageUrl } from '../../shared/utils/imageUrl'
import shopService from '../shop/shopService'
import apiClient from '../../shared/services/apiClient'

export default function Home() {
  const [newProducts, setNewProducts] = useState([])
  const [approvedReviews, setApprovedReviews] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNewCollection()
    loadApprovedReviews()
    loadBlogs()
  }, [])

  const loadNewCollection = async () => {
    try {
      const result = await shopService.getProducts({ limit: 5 })
      setNewProducts((result?.data || []).slice(0, 5))
    } catch (error) {
      console.error('Failed to load new collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadApprovedReviews = async () => {
    try {
      const result = await apiClient.get('/reviews/approved')
      const data = result?.data || []
      const mapped = Array.isArray(data)
        ? data.map((item) => ({
            name: item.users?.name || 'Velore Customer',
            rating: item.rating || 0,
            review: item.comment || ''
          }))
        : []
      setApprovedReviews(mapped)
    } catch (error) {
      console.error('Failed to load approved reviews:', error)
      setApprovedReviews([])
    }
  }

  const loadBlogs = async () => {
    try {
      const result = await apiClient.get('/blogs')
      const data = result?.data || []
      const mapped = Array.isArray(data)
        ? data
            .filter((blog) => blog.is_published === true)
            .map((blog) => ({
              id: blog.post_id,
              image: blog.image || null,
              title: blog.title,
            }))
        : []
      setBlogs(mapped)
    } catch (error) {
      console.error('Failed to load blogs:', error)
      setBlogs([])
    }
  }

  return (
    <div>
      {/* HERO SECTION — unchanged */}
      <section className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden -mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
        <img
          src={heroImage}
          alt="Eyewear"
          className="w-full h-full object-cover object-[center_25%]"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 pb-0">
          <h1 className="text-3xl md:text-6xl font-bold text-white leading-tight mb-4 max-w-md">
            Eyewear that fits you before you buy
          </h1>
          <p className="text-white/70 text-sm md:text-base mb-8 max-w-sm">
            Discover frames crafted for your unique face shape
          </p>
          <div className="flex gap-3">
            <Link to="/shop" className="bg-white text-gray-900 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition">
              Shop now
            </Link>
            <Link to="/ai-advisor" className="border border-white text-white px-5 py-2.5 text-sm font-medium hover:bg-white hover:text-gray-900 transition">
              Try Virtual Try-On
            </Link>
          </div>
        </div>
      </section>

      {/* NEW COLLECTION SECTION — UPDATED */}
      <section className="px-6 md:px-16 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-1">New collection</h2>
          <Link to="/shop" className="text-xs text-gray-400 hover:text-black tracking-widest uppercase flex items-center gap-1 transition-colors w-fit">
            view all <span className="text-base">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading new collection...</div>
        ) : (
          <>
            {/* Mobile — horizontal scroll */}
            <div className="flex md:hidden gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {newProducts.map((product) => (
                <div key={product.product_id} className="w-[45vw] flex-shrink-0">
                  <EyewearCard {...product} />
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <EyewearCard key={product.product_id} {...product} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* AI ASSISTANT SECTION — unchanged */}
      <section className="px-6 md:px-16 py-16 bg-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
              Hello, this is your AI assistant say
            </h2>
            <Link
              to="/ai-advisor"
              className="inline-block bg-gray-900 text-white text-sm px-8 py-4 hover:bg-gray-700 transition-colors"
            >
              Chat with VELORE-AI!
            </Link>
          </div>
          <div className="flex gap-6 items-end justify-center mr-0 md:mr-16">
            <div className="w-24 md:w-44 h-44 md:h-80 border-4 border-gray-300 rounded-3xl bg-white opacity-50 -mb-4" />
            <div className="w-28 md:w-52 h-52 md:h-96 border-4 border-gray-900 rounded-3xl bg-white flex flex-col">
              <div className="w-12 md:w-16 h-1.5 bg-gray-900 rounded-full mx-auto mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials, About us, Latest News — unchanged */}
      {approvedReviews.length > 0 ? (
        <Testimonials testimonials={approvedReviews} />
      ) : (
        <section className="px-6 md:px-16 py-16">
          <h2 className="text-2xl font-semibold mb-12">Testimonials</h2>
          <div className="bg-gray-100 rounded-sm p-8 text-center text-sm text-gray-500">
            Be the first to leave a review!
          </div>
        </section>
      )}

      <section id="about-us" className="px-6 md:px-16 py-16 scroll-mt-20">
  <h2 className="text-2xl font-semibold mb-8">About us</h2>
  <div className="flex flex-col md:flex-row items-center gap-12">
    {/* Left — images grid */}
    <div className="grid grid-cols-2 gap-3 flex-1">
      {[1,2,3,4].map(i => (
        <div key={i} className="aspect-square rounded-2xl bg-gray-100 overflow-hidden">
          <img src={sketchImage} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>

    {/* Center — text */}
    <div className="flex-1 text-center">
      <h2 className="text-7xl md:text-9xl font-bold text-black leading-none mb-4">20+</h2>
      <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
        years, we've refined our craft, not just in frame design
      </p>
      <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
        but in understanding the unique geometry of every face. Every Velore frame is born from obsessive attention to fit, balance, and comfort. We combine precision engineering with timeless aesthetics to create eyewear that doesn't just sit on your face.
      </p>
    </div>

    {/* Right — images grid */}
    <div className="grid grid-cols-2 gap-3 flex-1">
      {[5,6,7,8].map(i => (
        <div key={i} className="aspect-square rounded-2xl bg-gray-100 overflow-hidden">
          <img src={sketchImage} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  </div>
</section>

      <section id="latest-news" className="px-6 md:px-16 py-16 scroll-mt-20">
        <h2 className="text-2xl font-semibold mb-8">Latest news</h2>
        <div className="flex md:hidden gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {blogs.map((blog) => (
            <Link key={blog.id} to={`/blogs/${blog.id}`} className="min-w-[70vw] flex-shrink-0 relative group overflow-hidden rounded-sm">
              <img
                src={resolveImageUrl(blog.image) || ''}
                alt={blog.title}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  img.src = ''
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">{blog.title}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="hidden md:grid grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog.id} to={`/blogs/${blog.id}`} className="relative group overflow-hidden rounded-sm">
              <img
                src={resolveImageUrl(blog.image) || ''}
                alt={blog.title}
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  img.src = ''
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">{blog.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}