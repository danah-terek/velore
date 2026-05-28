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
            <Link to="/try-on" className="border border-white text-white px-5 py-2.5 text-sm font-medium hover:bg-white hover:text-gray-900 transition">
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

      {/* AI FEATURES SHOWCASE */}
      <section className="relative px-6 md:px-16 py-24 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,white,transparent_70%)]" />

        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-indigo-300 uppercase tracking-[0.2em] mb-6">
              AI-Powered Eyewear
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-4">
              Frames that were<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                made for your face
              </span>
            </h2>
            <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
              Stop guessing. Our AI analyzes your face shape and lets you try on frames in real-time — all before you click buy.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Face Analysis */}
            <div className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-400 uppercase tracking-wider">Step 1</span>
                    <h3 className="text-xl font-semibold text-white">Face Shape Analysis</h3>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Upload a selfie. Our AI maps 468 facial landmarks, identifies your face shape, and matches you with frames that actually flatter you — not just whatever's trending.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Instant', 'Private', '5 face shapes'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Virtual Try-On */}
            <div className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs text-purple-400 uppercase tracking-wider">Step 2</span>
                    <h3 className="text-xl font-semibold text-white">Virtual Try-On</h3>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Turn on your camera. Frames appear on your face in real-time. Move, tilt, smile — the glasses stay locked to your eyes. Try dozens of styles without leaving your couch.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Real-time AR', 'Any device', 'Switch instantly'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-lg shadow-white/10"
            >
              Find your frames
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-white/30 text-xs mt-4">
              AI features available on every product page — look for the ✨ icon
            </p>
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

      {/* ── ABOUT US — scattered photo layout (ENLARGED) ────────────────────────── */}
      <section
        id="about-us"
        className="scroll-mt-20 py-20 overflow-hidden bg-gray-50"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Mobile layout — stacked */}
        <div className="flex md:hidden flex-col items-center gap-8 px-6 w-full">
          {/* Mobile: larger scattered photos */}
          <div style={{ position: 'relative', width: '100%', height: 320 }}>
            {[
              { w: '48%', h: 150, top: 0, left: '2%', rot: -5, z: 2 },
              { w: '52%', h: 170, top: 0, left: '48%', rot: 4, z: 1 },
              { w: '44%', h: 140, top: 155, left: '6%', rot: 3, z: 3 },
              { w: '50%', h: 160, top: 145, left: '48%', rot: -4, z: 2 },
              { w: '40%', h: 130, top: 260, left: '30%', rot: 2, z: 1 },
            ].map((p, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: p.w, height: p.h,
                top: p.top, left: p.left,
                transform: `rotate(${p.rot}deg)`,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                zIndex: p.z,
              }}>
                <img src={sketchImage} alt="" aria-hidden="true"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="text-center px-2">
            <p style={{ fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: '-2px' }} className="text-gray-950 mb-3">20+</p>
            <p className="text-lg font-semibold text-gray-900 mb-3 leading-snug">
              years, we've refined our craft, not just in frame design
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              but in understanding the unique geometry of every face. Every Velore frame is born from obsessive attention to fit, balance, and comfort.
            </p>
          </div>
        </div>

        {/* Desktop layout — ENLARGED scattered clouds */}
        <div className="hidden md:flex items-center justify-center w-full max-w-7xl mx-auto">
          {/* LEFT PHOTOS — bigger */}
          <div
            style={{
              position: 'relative',
              width: '380px',
              flexShrink: 0,
              height: '600px',
              marginRight: '-30px',
            }}
          >
            {[
              { w: 140, h: 140, top: 15, left: 20, rot: -6, z: 3 },
              { w: 165, h: 190, top: 0, left: 150, rot: 5, z: 2 },
              { w: 150, h: 150, top: 130, left: 0, rot: 4, z: 4 },
              { w: 130, h: 170, top: 170, left: 160, rot: -4, z: 5 },
              { w: 165, h: 140, top: 290, left: 10, rot: -5, z: 2 },
              { w: 148, h: 165, top: 330, left: 170, rot: 6, z: 3 },
              { w: 135, h: 135, top: 440, left: 40, rot: 3, z: 4 },
              { w: 155, h: 130, top: 470, left: 185, rot: -4, z: 3 },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: p.w,
                  height: p.h,
                  top: p.top,
                  left: p.left,
                  transform: `rotate(${p.rot}deg)`,
                  zIndex: p.z,
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                className="hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={sketchImage}
                  alt=""
                  aria-hidden="true"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>

          {/* CENTER TEXT */}
          <div style={{ flex: 1, maxWidth: 440, textAlign: 'center', padding: '0 2rem', zIndex: 10 }}>
            <p
              style={{ fontSize: 'clamp(88px, 10vw, 128px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-3px', marginBottom: '1.5rem' }}
              className="text-gray-950"
            >
              20+
            </p>
            <p className="text-2xl md:text-3xl font-semibold text-gray-900 mb-5 leading-snug">
              years, we've refined our craft, not just in frame design
            </p>
            <p className="text-base text-gray-500 leading-relaxed max-w-sm mx-auto">
              but in understanding the unique geometry of every face. Every Velore frame is born from obsessive attention to fit, balance, and comfort. We combine precision engineering with timeless aesthetics to create eyewear that doesn't just sit on your face — it becomes part of your expression.
            </p>
          </div>

          {/* RIGHT PHOTOS — bigger */}
          <div
            style={{
              position: 'relative',
              width: '380px',
              flexShrink: 0,
              height: '600px',
              marginLeft: '-30px',
            }}
          >
            {[
              { w: 140, h: 140, top: 10, right: 15, rot: 6, z: 3 },
              { w: 160, h: 185, top: 0, right: 155, rot: -5, z: 2 },
              { w: 148, h: 148, top: 125, right: 0, rot: -4, z: 4 },
              { w: 130, h: 170, top: 165, right: 160, rot: 5, z: 5 },
              { w: 165, h: 138, top: 285, right: 10, rot: 5, z: 2 },
              { w: 150, h: 165, top: 325, right: 170, rot: -6, z: 3 },
              { w: 135, h: 135, top: 435, right: 35, rot: -3, z: 4 },
              { w: 155, h: 130, top: 465, right: 185, rot: 4, z: 3 },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: p.w,
                  height: p.h,
                  top: p.top,
                  right: p.right,
                  transform: `rotate(${p.rot}deg)`,
                  zIndex: p.z,
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                className="hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={sketchImage}
                  alt=""
                  aria-hidden="true"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST NEWS — ADJUSTED TO MATCH SYSTEM BLOG HANDLING */}
      <section id="latest-news" className="px-6 md:px-16 py-16 scroll-mt-20">
        <h2 className="text-2xl font-semibold mb-8">Latest news</h2>
        
        {/* Mobile — horizontal scroll */}
        <div className="flex md:hidden gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {blogs.map((blog) => (
            <Link key={blog.id} to={`/blogs/${blog.id}`} className="min-w-[70vw] flex-shrink-0 relative group overflow-hidden rounded-sm">
              <img
                src={resolveImageUrl(blog.image) || '/placeholder-blog.jpg'}
                alt={blog.title}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  if(img.src !== window.location.origin + '/placeholder-blog.jpg') {
                    img.src = '/placeholder-blog.jpg'
                  }
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">{blog.title}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog.id} to={`/blogs/${blog.id}`} className="relative group overflow-hidden rounded-sm">
              <img
                src={resolveImageUrl(blog.image) || '/placeholder-blog.jpg'}
                alt={blog.title}
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  if(img.src !== window.location.origin + '/placeholder-blog.jpg') {
                    img.src = '/placeholder-blog.jpg'
                  }
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