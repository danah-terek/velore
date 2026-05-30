import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Testimonials from '../../shared/components/eyewear/Testimonials'
import { EyewearCard } from '../../shared/components/eyewear'
import sketchImage from '../../assets/Veloresketch.jpeg'
import heroVideo from '../../assets/herovideo.mp4'
import { resolveImageUrl } from '../../shared/utils/imageUrl'
import shopService from '../shop/shopService'
import apiClient from '../../shared/services/apiClient'

import girlMirror from "../../assets/girlmirror.jpg"
import girlSunglasses from "../../assets/girlsunglasses.jpg"
import manLaptop from "../../assets/manlaptop.jpg"
import manTryon from "../../assets/mantryon.jpg"

const SCAN_STATES = [
  {
    id: 0,
    badge: "AI-Powered",
    headline: "Frames that fit",
    accent: "your face",
    subline: "Upload a selfie. Our AI analyzes your facial geometry in seconds.",
    cta: "Try Virtual Try-On",
    bgColor: "#FFFFFF",
    accentColor: "#76CDD6",
    textColor: "#1E1D22",
    bgImage: girlMirror,
    overlayColor: "rgba(255,255,255,0.55)",
  },
  {
    id: 1,
    badge: "Real-time AR",
    headline: "See them on",
    accent: "you instantly",
    subline: "No app, no download. Just turn on your camera and try dozens of frames.",
    cta: "Try Virtual Try-On",
    bgColor: "#1E1D22",
    accentColor: "#76CDD6",
    textColor: "#FFFFFF",
    bgImage: girlSunglasses,
    overlayColor: "rgba(30,29,34,0.52)",
  },
  {
    id: 2,
    badge: "No Guesswork",
    headline: "Order with",
    accent: "confidence",
    subline: "You already saw how they look. No returns, no surprises.",
    cta: "Try Virtual Try-On",
    bgColor: "#F5F5F5",
    accentColor: "#1E1D22",
    textColor: "#1E1D22",
    bgImage: manLaptop,
    overlayColor: "rgba(245,245,245,0.58)",
  },
  {
    id: 3,
    badge: "Your Privacy",
    headline: "Your data,",
    accent: "your rules",
    subline: "We never store your images. What happens on your camera, stays with you.",
    cta: "Try Virtual Try-On",
    bgColor: "#1E1D22",
    accentColor: "#76CDD6",
    textColor: "#FFFFFF",
    bgImage: manTryon,
    overlayColor: "rgba(30,29,34,0.52)",
  },
]

function mindfulEase(t) {
  if (t < 0.42) {
    return 0.5 * Math.pow(t / 0.42, 1.6) * 0.88
  } else if (t < 0.58) {
    const mid = (t - 0.42) / 0.16
    return 0.88 * 0.5 + mid * 0.5 * 0.04
  } else {
    const tail = (t - 0.58) / 0.42
    return 0.46 + tail * 0.54
  }
}

function AiFeaturesSection() {
  const [currentState, setCurrentState] = useState(0)
  const [scanProgress, setScanProgress] = useState(0)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const ANIMATION_DURATION = 9000

    const animate = (timestamp) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1)
      const easedProgress = mindfulEase(rawProgress)
      setScanProgress(easedProgress)

      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        startTimeRef.current = null
        setScanProgress(0)
        setCurrentState(prev => (prev + 1) % SCAN_STATES.length)
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [])

  const state = SCAN_STATES[currentState]
  const nextState = SCAN_STATES[(currentState + 1) % SCAN_STATES.length]
  const rev = Math.min(scanProgress, 1)

  const Panel = ({ s, side }) => {
    const clipLeft  = `polygon(0% 0%, ${rev * 100}% 0%, ${rev * 100}% 100%, 0% 100%)`
    const clipRight = `polygon(${rev * 100}% 0%, 100% 0%, 100% 100%, ${rev * 100}% 100%)`
    const clip = side === "left" ? clipLeft : clipRight

    return (
      <div className="absolute inset-0" style={{ clipPath: clip }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${s.bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: s.overlayColor }} />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-6 md:px-16 w-full">
            <div className="max-w-3xl">
              <div className="mb-6">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase"
                  style={{ backgroundColor: `${s.accentColor}22`, color: s.accentColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.accentColor }} />
                  {s.badge}
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1]">
                  <span style={{ color: s.textColor }}>{s.headline} </span>
                  <span style={{ color: s.accentColor, fontWeight: 500 }}>{s.accent}</span>
                </h2>
              </div>
              <div className="mb-10">
                <p className="text-base md:text-lg leading-relaxed max-w-md" style={{ color: `${s.textColor}BB` }}>
                  {s.subline}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
      <Panel s={state} side="left" />
      <Panel s={nextState} side="right" />

      <div
        className="absolute top-0 bottom-0 pointer-events-none z-30"
        style={{
          left: `calc(${rev * 100}% - 1.5px)`,
          width: "3px",
          background: `linear-gradient(to bottom,
            transparent 0%,
            ${state.accentColor}80 15%,
            ${state.accentColor} 40%,
            ${state.accentColor} 60%,
            ${state.accentColor}80 85%,
            transparent 100%
          )`,
          boxShadow: `0 0 24px ${state.accentColor}DD, 0 0 8px ${state.accentColor}`,
        }}
      />

      <div
        className="absolute top-0 bottom-0 pointer-events-none z-20"
        style={{
          left: `calc(${rev * 100}% - 70px)`,
          width: "140px",
          background: `linear-gradient(to right,
            transparent,
            ${state.accentColor}0A,
            ${state.accentColor}25,
            ${state.accentColor}0A,
            transparent
          )`,
        }}
      />

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40">
        <Link
          to="/try-on"
          className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-500 hover:gap-3 hover:scale-[1.02]"
          style={{
            backgroundColor: state.accentColor,
            color: "#FFFFFF",
            boxShadow: `0 4px 28px ${state.accentColor}70`,
          }}
        >
          {state.cta}
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {SCAN_STATES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentState(idx)
              setScanProgress(0)
              startTimeRef.current = null
            }}
            className="transition-all duration-500 rounded-full cursor-pointer"
            style={{
              width: currentState === idx ? "32px" : "6px",
              height: "3px",
              backgroundColor: currentState === idx ? state.accentColor : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const [newProducts, setNewProducts] = useState([])
  const [frameProducts, setFrameProducts] = useState([])
  const [approvedReviews, setApprovedReviews] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingFrames, setLoadingFrames] = useState(true)

  useEffect(() => {
    loadNewCollection()
    loadFrames()
    loadApprovedReviews()
    loadBlogs()
  }, [])

  const loadNewCollection = async () => {
    try {
      const result = await shopService.getProducts({ limit: 50 })
      setNewProducts(result?.data || [])
    } catch (error) {
      console.error('Failed to load new collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFrames = async () => {
    try {
      const result = await shopService.getProducts({ limit: 50 })
      const allProducts = result?.data || []
      const frames = allProducts.filter(product =>
        product.categories?.name === 'Optical Glasses'
      )
      setFrameProducts(frames.slice(0, 4))
    } catch (error) {
      console.error('Failed to load frames:', error)
      setFrameProducts([])
    } finally {
      setLoadingFrames(false)
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
            review: item.comment || '',
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
              date: blog.created_at
                ? new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : ''
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
      {/* HERO SECTION */}
      <section className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden -mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-[center_25%]"
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

      {/* SUNGLASSES SECTION */}
      <section className="px-6 md:px-16 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block w-8 h-px bg-[#76CDD6]" />
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em]">Featured</span>
            </div>
            <div className="flex justify-between items-end">
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E1D22]">Sunglasses</h2>
              <Link to="/shop?category=Sunglasses" className="group hidden md:flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-[#1E1D22] transition-all">
                Shop all <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 md:hidden">
                {newProducts.filter(p => p.categories?.name === 'Sunglasses').slice(0, 4).map((product) => (
                  <div key={product.product_id}><EyewearCard {...product} /></div>
                ))}
              </div>
              <div className="hidden md:flex gap-5 overflow-x-auto pb-2 scroll-smooth hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {newProducts.filter(p => p.categories?.name === 'Sunglasses').slice(0, 4).map((product) => (
                  <div key={product.product_id} className="w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[21vw] flex-shrink-0">
                    <EyewearCard {...product} />
                  </div>
                ))}
                <Link to="/shop?category=Sunglasses" className="group w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[21vw] flex-shrink-0">
                  <div className="h-full aspect-[3/4] bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 border border-gray-100 hover:border-[#76CDD6] transition-all duration-300 hover:shadow-lg group-hover:scale-[0.98]">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm group-hover:bg-[#76CDD6]/10 flex items-center justify-center transition-all duration-300">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#76CDD6] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-[#1E1D22] transition-colors">View all</p>
                    <p className="text-xs text-gray-400">Sunglasses</p>
                  </div>
                </Link>
              </div>
            </div>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link to="/shop?category=Sunglasses" className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-[#1E1D22] transition-colors">
              Shop all sunglasses <span className="text-base">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* AI FEATURES SECTION */}
      <AiFeaturesSection />

      {/* FRAMES SECTION - OPTICAL GLASSES */}
      <section className="px-6 md:px-16 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block w-8 h-px bg-[#76CDD6]" />
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em]">Optical Collection</span>
            </div>
            <div className="flex justify-between items-end">
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E1D22]">Frames</h2>
              <Link to="/shop?category=Optical%20Glasses" className="group hidden md:flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-[#1E1D22] transition-all">
                Shop all <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </div>

          {loadingFrames ? (
            <div className="text-center py-16 text-gray-400">Loading frames...</div>
          ) : frameProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No frames available yet.</div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 md:hidden">
                {frameProducts.slice(0, 4).map((product) => (
                  <div key={product.product_id}><EyewearCard {...product} /></div>
                ))}
              </div>
              <div className="hidden md:flex gap-5 overflow-x-auto pb-2 scroll-smooth hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {frameProducts.map((product) => (
                  <div key={product.product_id} className="w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[21vw] flex-shrink-0">
                    <EyewearCard {...product} />
                  </div>
                ))}
                <Link to="/shop?category=Optical%20Glasses" className="group w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[21vw] flex-shrink-0">
                  <div className="h-full aspect-[3/4] bg-white rounded-xl flex flex-col items-center justify-center gap-2 border border-gray-200 hover:border-[#76CDD6] transition-all duration-300 hover:shadow-lg group-hover:scale-[0.98]">
                    <div className="w-12 h-12 rounded-full bg-gray-100 shadow-sm group-hover:bg-[#76CDD6]/10 flex items-center justify-center transition-all duration-300">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#76CDD6] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-[#1E1D22] transition-colors">View all</p>
                    <p className="text-xs text-gray-400">All frames</p>
                  </div>
                </Link>
              </div>
            </div>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link to="/shop?category=Optical%20Glasses" className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-[#1E1D22] transition-colors">
              Shop all frames <span className="text-base">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {approvedReviews.length > 0 ? (
        <section className="px-6 md:px-16 py-20 bg-[#EFF8FE]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="inline-block w-8 h-px bg-[#76CDD6]" />
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em]">Testimonials</span>
                <span className="inline-block w-8 h-px bg-[#76CDD6]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E1D22]">What our <span className="font-medium">customers say</span></h2>
              <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">Real stories from people who found their perfect fit</p>
            </div>
            <Testimonials testimonials={approvedReviews} />
          </div>
        </section>
      ) : (
        <section className="px-6 md:px-16 py-20 bg-[#EFF8FE]">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="inline-block w-8 h-px bg-[#76CDD6]" />
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em]">Testimonials</span>
              <span className="inline-block w-8 h-px bg-[#76CDD6]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E1D22] mb-6">What our <span className="font-medium">customers say</span></h2>
            <div className="bg-white/50 rounded-xl p-8 text-center text-sm text-gray-400 max-w-md mx-auto">Be the first to leave a review!</div>
          </div>
        </section>
      )}

      {/* CONTACT LENSES SECTION */}
      <section className="px-6 md:px-16 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block w-8 h-px bg-[#76CDD6]" />
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em]">Essentials</span>
            </div>
            <div className="flex justify-between items-end">
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E1D22]">Contact Lenses</h2>
              <Link to="/shop?category=Lenses" className="group hidden md:flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-[#1E1D22] transition-all">
                Shop all <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 md:hidden">
                {newProducts.filter(p => p.categories?.name === 'Lenses').slice(0, 4).map((product) => (
                  <div key={product.product_id}><EyewearCard {...product} /></div>
                ))}
              </div>
              <div className="hidden md:flex gap-5 overflow-x-auto pb-2 scroll-smooth hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {newProducts.filter(p => p.categories?.name === 'Lenses').slice(0, 4).map((product) => (
                  <div key={product.product_id} className="w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[21vw] flex-shrink-0">
                    <EyewearCard {...product} />
                  </div>
                ))}
                <Link to="/shop?category=Lenses" className="group w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[21vw] flex-shrink-0">
                  <div className="h-full aspect-[3/4] bg-white rounded-xl flex flex-col items-center justify-center gap-2 border border-gray-200 hover:border-[#76CDD6] transition-all duration-300 hover:shadow-lg group-hover:scale-[0.98]">
                    <div className="w-12 h-12 rounded-full bg-gray-100 shadow-sm group-hover:bg-[#76CDD6]/10 flex items-center justify-center transition-all duration-300">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#76CDD6] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-[#1E1D22] transition-colors">View all</p>
                    <p className="text-xs text-gray-400">Contact Lenses</p>
                  </div>
                </Link>
              </div>
            </div>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link to="/shop?category=Lenses" className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-[#1E1D22] transition-colors">
              Shop all contact lenses <span className="text-base">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about-us" className="scroll-mt-20 py-20 overflow-hidden bg-gray-50" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="flex md:hidden flex-col items-center gap-16 px-6 w-full">
          <div style={{ position: 'relative', width: '100%', height: 320 }}>
            {[
              { w: '48%', h: 150, top: 0, left: '2%', rot: -5, z: 2 },
              { w: '52%', h: 170, top: 0, left: '48%', rot: 4, z: 1 },
              { w: '44%', h: 140, top: 155, left: '6%', rot: 3, z: 3 },
              { w: '50%', h: 160, top: 145, left: '48%', rot: -4, z: 2 },
              { w: '40%', h: 130, top: 260, left: '30%', rot: 2, z: 1 },
            ].map((p, i) => (
              <div key={i} style={{ position: 'absolute', width: p.w, height: p.h, top: p.top, left: p.left, transform: `rotate(${p.rot}deg)`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', zIndex: p.z }}>
                <img src={sketchImage} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="text-center px-2">
            <p style={{ fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: '-2px' }} className="text-gray-950 mb-3">20+</p>
            <p className="text-lg font-semibold text-gray-900 mb-3 leading-snug">years, we've refined our craft, not just in frame design</p>
            <p className="text-sm text-gray-500 leading-relaxed">but in understanding the unique geometry of every face. Every Velore frame is born from obsessive attention to fit, balance, and comfort.</p>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center w-full max-w-7xl mx-auto">
          <div style={{ position: 'relative', width: '380px', flexShrink: 0, height: '600px', marginRight: '-30px' }}>
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
              <div key={i} style={{ position: 'absolute', width: p.w, height: p.h, top: p.top, left: p.left, transform: `rotate(${p.rot}deg)`, zIndex: p.z, borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} className="hover:scale-105 hover:shadow-2xl">
                <img src={sketchImage} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>

          <div style={{ flex: 1, maxWidth: 440, textAlign: 'center', padding: '0 2rem', zIndex: 10 }}>
            <p style={{ fontSize: 'clamp(88px, 10vw, 128px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-3px', marginBottom: '1.5rem' }} className="text-gray-950">20+</p>
            <p className="text-2xl md:text-3xl font-semibold text-gray-900 mb-5 leading-snug">years, we've refined our craft, not just in frame design</p>
            <p className="text-base text-gray-500 leading-relaxed max-w-sm mx-auto">but in understanding the unique geometry of every face. Every Velore frame is born from obsessive attention to fit, balance, and comfort. We combine precision engineering with timeless aesthetics to create eyewear that doesn't just sit on your face — it becomes part of your expression.</p>
          </div>

          <div style={{ position: 'relative', width: '380px', flexShrink: 0, height: '600px', marginLeft: '-30px' }}>
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
              <div key={i} style={{ position: 'absolute', width: p.w, height: p.h, top: p.top, right: p.right, transform: `rotate(${p.rot}deg)`, zIndex: p.z, borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} className="hover:scale-105 hover:shadow-2xl">
                <img src={sketchImage} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST NEWS SECTION */}
      <section id="latest-news" className="px-6 md:px-16 py-20 scroll-mt-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block w-12 h-px bg-[#76CDD6] mb-4" />
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-[#1E1D22]">Latest Stories</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">Insights, trends, and stories from the world of eyewear</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {blogs.slice(0, 3).map((blog) => (
              <Link key={blog.id} to={`/blogs/${blog.id}`} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img src={resolveImageUrl(blog.image) || ''} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    {blog.date && <span className="uppercase tracking-wider">{blog.date}</span>}
                    <span className="w-1 h-1 rounded-full bg-[#76CDD6]/50" />
                    <span className="uppercase tracking-wider">Reading</span>
                  </div>
                  <h3 className="text-base md:text-lg font-medium text-gray-800 leading-relaxed line-clamp-2 group-hover:text-[#76CDD6] transition-colors duration-300">{blog.title}</h3>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-[#76CDD6] transition-all duration-300">Read story <span className="group-hover:translate-x-1 transition-transform duration-200">→</span></div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1E1D22] border-b border-gray-300 hover:border-[#76CDD6] transition-all duration-300 pb-0.5">View all articles <span className="text-lg">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  )
}