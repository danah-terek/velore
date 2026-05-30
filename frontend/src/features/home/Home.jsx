import { useState, useEffect, useRef, useCallback } from "react"
import { Link } from 'react-router-dom'
import Testimonials from '../../shared/components/eyewear/Testimonials'
import { EyewearCard } from '../../shared/components/eyewear'
import sketchImage from '../../assets/Veloresketch.jpeg'
import heroVideo from '../../assets/herovideo.mp4'
import { resolveImageUrl } from '../../shared/utils/imageUrl'
import shopService from '../shop/shopService'
import apiClient from '../../shared/services/apiClient'

/* ─── Image Imports for About Us Section ─────────────────────────────────── */
import d1 from '../../assets/d1.jpg'
import d2 from '../../assets/d2.jpg'
import d3 from '../../assets/d3.jpg'
import d4 from '../../assets/d4.jpg'
import d5 from '../../assets/d5.jpg'
import d6 from '../../assets/d6.jpg'
import d7 from '../../assets/d7.jpg'
import d8 from '../../assets/d8.jpg'
import pic2 from '../../assets/pic2.jpg'
import spimage from '../../assets/spimage.png'
import loginphoto from '../../assets/loginphoto.jpg'
import loginA from '../../assets/loginA.png'
import nigImage from '../../assets/nig.jpg'

/* ─── AI Section — Diagonal Scan Morph Concept with Background Images ────── */

const SCAN_STATES = [
  {
    id: 0,
    headline: "Frames that fit",
    accent: "your face",
    subline: "Upload a selfie. Our AI analyzes your facial geometry in seconds.",
    accentColor: "#76CDD6",
    textColor: "#1E1D22",
    gradient: "linear-gradient(135deg, #EAF9FB 0%, #C8EEF3 50%, #A8E4EC 100%)",
  },
  {
    id: 1,
    headline: "See them on",
    accent: "you instantly",
    subline: "No app, no download. Just turn on your camera and try dozens of frames.",
    accentColor: "#76CDD6",
    textColor: "#FFFFFF",
    gradient: "linear-gradient(135deg, #1E1D22 0%, #2A3A3D 50%, #1a3038 100%)",
  },
  {
    id: 2,
    headline: "Order with",
    accent: "confidence",
    subline: "You already saw how they look. No returns, no surprises.",
    accentColor: "#1E1D22",
    textColor: "#1E1D22",
    gradient: "linear-gradient(135deg, #F7F7F5 0%, #ECECEA 50%, #E0E0DC 100%)",
  },
  {
    id: 3,
    headline: "Your data,",
    accent: "your rules",
    subline: "We never store your images. What happens on your camera, stays with you.",
    accentColor: "#76CDD6",
    textColor: "#FFFFFF",
    gradient: "linear-gradient(135deg, #141318 0%, #1E2A2C 50%, #0f1f24 100%)",
  },
]

function scanEase(t) {
  if (t < 0.25) {
    return Math.pow(t / 0.25, 0.45) * 0.55
  } else {
    const tail = (t - 0.25) / 0.75
    return 0.55 + (1 - Math.pow(1 - tail, 1.6)) * 0.45
  }
}

function AiFeaturesSection() {
  const [currentState, setCurrentState] = useState(0)
  const [scanProgress, setScanProgress] = useState(0)
  const [textKey, setTextKey] = useState(0)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const ANIMATION_DURATION = 7000

    const animate = (timestamp) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1)
      const easedProgress = scanEase(rawProgress)
      setScanProgress(easedProgress)

      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        startTimeRef.current = null
        setScanProgress(0)
        setCurrentState(prev => (prev + 1) % SCAN_STATES.length)
        setTextKey(prev => prev + 1)
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [])

  const state = SCAN_STATES[currentState]
  const nextState = SCAN_STATES[(currentState + 1) % SCAN_STATES.length]
  const rev = Math.min(scanProgress, 1)

  return (
    <>
      <style>{`
        @keyframes heroTextIn {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
      `}</style>

      <section
        className="relative w-full overflow-hidden"
        style={{ height: "52vh", minHeight: "320px", maxHeight: "480px" }}
      >
        {/* Current slide bg */}
        <div
          className="absolute inset-0"
          style={{
            background: state.gradient,
            clipPath: `polygon(0% 0%, ${rev * 100}% 0%, ${rev * 100}% 100%, 0% 100%)`,
            zIndex: 0,
          }}
        />

        {/* Next slide bg */}
        <div
          className="absolute inset-0"
          style={{
            background: nextState.gradient,
            clipPath: `polygon(${rev * 100}% 0%, 100% 0%, 100% 100%, ${rev * 100}% 100%)`,
            zIndex: 0,
          }}
        />

        {/* Text — never clipped, centered */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 10 }}
        >
          <div
            key={textKey}
            style={{
              animation: "heroTextIn 0.65s cubic-bezier(0.22,1,0.36,1) both",
              textAlign: "center",
            }}
          >
            {/* Headline + accent on one line */}
            <p style={{
              fontFamily: "'Lato', 'Helvetica Neue', sans-serif",
              fontSize: "clamp(32px, 4.5vw, 58px)",
              fontWeight: 300,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              margin: "0 0 14px 0",
              whiteSpace: "nowrap",
            }}>
              <span style={{ color: state.textColor }}>{state.headline} </span>
              <span style={{ color: state.accentColor, fontWeight: 600 }}>{state.accent}</span>
            </p>

            {/* Subline — single line below */}
            <p style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "clamp(13px, 1.2vw, 15px)",
              fontWeight: 300,
              lineHeight: 1,
              color: `${state.textColor}99`,
              margin: 0,
              whiteSpace: "nowrap",
            }}>
              {state.subline}
            </p>
          </div>
        </div>

        {/* Scan line */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `calc(${rev * 100}% - 1.5px)`,
            width: "3px",
            zIndex: 20,
            background: `linear-gradient(to bottom,
              transparent 0%,
              ${state.accentColor}70 12%,
              ${state.accentColor} 35%,
              ${state.accentColor} 65%,
              ${state.accentColor}70 88%,
              transparent 100%
            )`,
            boxShadow: `0 0 22px ${state.accentColor}CC, 0 0 6px ${state.accentColor}`,
          }}
        />

        {/* Bloom halo */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `calc(${rev * 100}% - 70px)`,
            width: "140px",
            zIndex: 19,
            background: `linear-gradient(to right,
              transparent,
              ${state.accentColor}08,
              ${state.accentColor}22,
              ${state.accentColor}08,
              transparent
            )`,
          }}
        />

        {/* Dots */}
        <div style={{
          position: "absolute", bottom: "16px", left: "50%",
          transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 30,
        }}>
          {SCAN_STATES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentState(idx)
                setScanProgress(0)
                setTextKey(prev => prev + 1)
                startTimeRef.current = null
              }}
              style={{
                width: currentState === idx ? "28px" : "5px",
                height: "2.5px",
                borderRadius: "999px",
                backgroundColor: currentState === idx ? state.accentColor : "rgba(150,150,150,0.35)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.5s ease",
              }}
            />
          ))}
        </div>
      </section>
    </>
  )
}

//---------------------------hero------------------

const HERO_STATES = [
  {
    id: "video",
    headline: "Eyewear that fits you",
    accent: "before you buy",
    sub: "Discover frames crafted for your unique face shape",
    primaryLabel: "Shop the Collection",
    primaryTo: "/shop",
    showTryOn: false,
  },
  {
    id: "photo",
    headline: "See yourself in",
    accent: "every frame",
    sub: "Try on many styles — no app, no download",
    primaryLabel: "Shop Now",
    primaryTo: "/shop",
    showTryOn: true,
  },
]

function HeroSection() {
  const videoRef = useRef(null)
  const [phase, setPhase] = useState("video")
  const [contentIdx, setContentIdx] = useState(0)
  const [textVisible, setTextVisible] = useState(true)
  const timeoutsRef = useRef([])

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  const schedule = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  const handleVideoEnd = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    setTextVisible(false)
    schedule(() => { setPhase("photo"); setContentIdx(1) }, 450)
    schedule(() => setTextVisible(true), 950)
    schedule(() => setTextVisible(false), 7200)
    schedule(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(() => { })
      }
      setContentIdx(0)
    }, 7650)
    schedule(() => { setPhase("video"); setTextVisible(true) }, 8100)
  }, [])

  const content = HERO_STATES[contentIdx]
  const showPhoto = phase === "photo"

  return (
    <section className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden -mt-20">

      {/* Video */}
      <video
        ref={videoRef}
        src={heroVideo}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
        style={{ opacity: showPhoto ? 0 : 1, transition: "opacity 0.65s ease-in-out", zIndex: 1 }}
      />

      {/* Photo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${nigImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 25%",
          opacity: showPhoto ? 1 : 0,
          transition: "opacity 0.65s ease-in-out",
          zIndex: showPhoto ? 2 : 0,
        }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(110deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 55%, transparent 100%)",
          zIndex: 3,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16" style={{ zIndex: 5 }}>
        <div style={{
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0px)" : "translateY(8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
          <h1 style={{
            fontFamily: "'Lato', 'Helvetica Neue', sans-serif",
            fontSize: "clamp(32px, 4.5vw, 58px)",
            fontWeight: 300,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            color: "#FFFFFF",
            margin: "0 0 6px 0",
            maxWidth: "540px",
          }}>
            {content.headline}
          </h1>

          <h1 style={{
            fontFamily: "'Lato', 'Helvetica Neue', sans-serif",
            fontSize: "clamp(32px, 4.5vw, 58px)",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            color: "#76CDD6",
            margin: "0 0 22px 0",
            maxWidth: "540px",
          }}>
            {content.accent}
          </h1>

          <p style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "clamp(13px, 1.2vw, 15px)",
            fontWeight: 300,
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.60)",
            margin: "0 0 34px 0",
            maxWidth: "360px",
          }}>
            {content.sub}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link
              to={content.primaryTo}
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#1E1D22",
                background: "#ffffff",
                padding: "13px 28px",
                borderRadius: "2px",
                textDecoration: "none",
                display: "inline-block",
                transition: "background 0.25s, color 0.25s, box-shadow 0.25s",
                boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#76CDD6"
                e.currentTarget.style.color = "#fff"
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(118,205,214,0.4)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#ffffff"
                e.currentTarget.style.color = "#1E1D22"
                e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.15)"
              }}
            >
              {content.primaryLabel}
            </Link>

            {/* Try-On link — only shown on photo slide */}
            {content.showTryOn && (
              <Link
                to="/try-on"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "12px",
                  fontWeight: 400,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.50)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  borderBottom: "1px solid rgba(255,255,255,0.18)",
                  paddingBottom: "1px",
                  transition: "color 0.25s, border-color 0.25s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#76CDD6"
                  e.currentTarget.style.borderBottomColor = "#76CDD6"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.50)"
                  e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)"
                }}
              >
                Virtual Try-On
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Phase dots */}
      <div style={{ position: "absolute", bottom: "24px", right: "32px", zIndex: 6, display: "flex", gap: "6px", alignItems: "center" }}>
        {[0, 1].map(i => {
          const active = phase === "video" ? i === 0 : i === 1
          return (
            <div key={i} style={{
              width: active ? "22px" : "5px",
              height: "2px",
              borderRadius: "999px",
              background: active ? "#76CDD6" : "rgba(255,255,255,0.25)",
              transition: "all 0.5s ease",
            }} />
          )
        })}
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
  const [sunglassesProducts, setSunglassesProducts] = useState([])
  const [loadingSunglasses, setLoadingSunglasses] = useState(true)

  useEffect(() => {
    loadNewCollection()
    loadFrames()
    loadSunglasses()
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

  const loadSunglasses = async () => {
    try {
      const result = await shopService.getProducts({ limit: 50 })
      const all = result?.data || []
      const sunglasses = all.filter(p => p.categories?.name === 'Sunglasses')
      setSunglassesProducts(sunglasses.slice(0, 4))
    } catch (error) {
      console.error('Failed to load sunglasses:', error)
      setSunglassesProducts([])
    } finally {
      setLoadingSunglasses(false)
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
      <HeroSection />

      {/* SUNGLASSES SECTION */}
      <section className="px-6 md:px-16 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block w-8 h-px bg-[#76CDD6]" />
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em]">Sun Collection</span>
            </div>
            <div className="flex justify-between items-end">
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E1D22]">Sunglasses</h2>
              <Link to="/shop?category=Sunglasses" className="group hidden md:flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-[#1E1D22] transition-all">
                Shop all <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </div>

          {loadingSunglasses ? (
            <div className="text-center py-16 text-gray-400">Loading sunglasses...</div>
          ) : sunglassesProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No sunglasses available yet.</div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 md:hidden">
                {sunglassesProducts.slice(0, 4).map((product) => (
                  <div key={product.product_id}><EyewearCard {...product} /></div>
                ))}
              </div>
              <div className="hidden md:flex gap-5 overflow-x-auto pb-2 scroll-smooth hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {sunglassesProducts.map((product) => (
                  <div key={product.product_id} className="w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[21vw] flex-shrink-0">
                    <EyewearCard {...product} />
                  </div>
                ))}
                <Link to="/shop?category=Sunglasses" className="group w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[21vw] flex-shrink-0">
                  <div className="h-full aspect-[3/4] bg-white rounded-xl flex flex-col items-center justify-center gap-2 border border-gray-200 hover:border-[#76CDD6] transition-all duration-300 hover:shadow-lg group-hover:scale-[0.98]">
                    <div className="w-12 h-12 rounded-full bg-gray-100 shadow-sm group-hover:bg-[#76CDD6]/10 flex items-center justify-center transition-all duration-300">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#76CDD6] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-[#1E1D22] transition-colors">View all</p>
                    <p className="text-xs text-gray-400">All sunglasses</p>
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
        <section className="px-6 md:px-16 py-20 bg-[#EFF8FE] overflow-visible">
    <div className="max-w-7xl mx-auto overflow-visible">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="inline-block w-8 h-px bg-[#76CDD6]" />
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em]">Testimonials</span>
          <span className="inline-block w-8 h-px bg-[#76CDD6]" />
        </div>
        <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E1D22]">What our <span className="font-medium">customers say</span></h2>
        <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">Real stories from people who found their perfect fit</p>
      </div>
      <div className="overflow-visible py-8">
        <Testimonials testimonials={approvedReviews} />
      </div>
    </div>
  </section>
) : (
  <section className="px-6 md:px-16 py-20 bg-[#EFF8FE] overflow-visible">
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
                  <div key={product.product_id}>
                    <EyewearCard {...product} />
                  </div>
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
      <section id="about-us" className="scroll-mt-20 py-20 overflow-hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #EAF9FB 0%, #D4F0F5 50%, #EAF9FB 100%)' }}>

        {/* Mobile layout */}
        <div className="flex md:hidden flex-col items-center gap-16 px-6 w-full">
          <div style={{ position: 'relative', width: '100%', height: 320 }}>
            {[
              { w: '48%', h: 150, top: 0, left: '2%', rot: -5, z: 2, img: d1 },
              { w: '52%', h: 170, top: 0, left: '48%', rot: 4, z: 1, img: d2 },
              { w: '44%', h: 140, top: 155, left: '6%', rot: 3, z: 3, img: d3 },
              { w: '50%', h: 160, top: 145, left: '48%', rot: -4, z: 2, img: pic2 },
              { w: '40%', h: 130, top: 260, left: '30%', rot: 2, z: 1, img: spimage },
            ].map((p, i) => (
              <div key={i} style={{
                position: 'absolute', width: p.w, height: p.h,
                top: p.top, left: p.left,
                transform: `rotate(${p.rot}deg)`,
                borderRadius: 16, overflow: 'hidden', zIndex: p.z,
                boxShadow: '0 8px 24px rgba(118,205,214,0.25), 0 20px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
              }}>
                <img src={p.img} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="text-center px-2">
            <p style={{ fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: '-2px', color: '#1E1D22' }} className="mb-3">20+</p>
            <p className="text-lg font-semibold mb-3 leading-snug" style={{ color: '#1E1D22' }}>years, we've refined our craft, not just in frame design</p>
            <p className="text-sm leading-relaxed" style={{ color: '#5a7a82' }}>but in understanding the unique geometry of every face. Every Velore frame is born from obsessive attention to fit, balance, and comfort.</p>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex items-center justify-center w-full max-w-7xl mx-auto">

          {/* Left photo cluster */}
          <div style={{ position: 'relative', width: '380px', flexShrink: 0, height: '600px', marginRight: '-30px' }}>
            {[
              { w: 140, h: 140, top: 15, left: 20, rot: -6, z: 3, img: d1 },
              { w: 165, h: 190, top: 0, left: 150, rot: 5, z: 2, img: d2 },
              { w: 150, h: 150, top: 130, left: 0, rot: 4, z: 4, img: d3 },
              { w: 130, h: 170, top: 170, left: 160, rot: -4, z: 5, img: d4 },
              { w: 165, h: 140, top: 290, left: 10, rot: -5, z: 2, img: d5 },
              { w: 148, h: 165, top: 340, left: 170, rot: 6, z: 3, img: d6 },
              { w: 135, h: 135, top: 450, left: 40, rot: 3, z: 4, img: d7 },
              { w: 155, h: 130, top: 480, left: 185, rot: -4, z: 3, img: d8 },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute', width: p.w, height: p.h,
                  top: p.top, left: p.left,
                  transform: `rotate(${p.rot}deg)`,
                  zIndex: p.z, borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(118,205,214,0.30), 0 24px 56px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                }}
                className="hover:scale-105"
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 32px rgba(118,205,214,0.45), 0 32px 64px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.10)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(118,205,214,0.30), 0 24px 56px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)'}
              >
                <img src={p.img} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>

          {/* Center text */}
          <div style={{ flex: 1, maxWidth: 440, textAlign: 'center', padding: '0 2rem', zIndex: 10 }}>
            <p style={{ fontSize: 'clamp(88px, 10vw, 128px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-3px', marginBottom: '1.5rem', color: '#1E1D22' }}>20+</p>
            <p className="text-2xl md:text-3xl font-semibold mb-5 leading-snug" style={{ color: '#1E1D22' }}>
              years, we've refined our craft, not just in frame design
            </p>
            <p className="text-base leading-relaxed max-w-sm mx-auto" style={{ color: '#5a7a82' }}>
              but in understanding the unique geometry of every face. Every Velore frame is born from obsessive attention to fit, balance, and comfort. We combine precision engineering with timeless aesthetics to create eyewear that doesn't just sit on your face — it becomes part of your expression.
            </p>
          </div>

          {/* Right photo cluster */}
          <div style={{ position: 'relative', width: '380px', flexShrink: 0, height: '600px', marginLeft: '-30px' }}>
            {[
              { w: 140, h: 140, top: 10, right: 15, rot: 6, z: 3, img: pic2 },
              { w: 160, h: 185, top: 0, right: 155, rot: -5, z: 2, img: spimage },
              { w: 148, h: 148, top: 125, right: 0, rot: -4, z: 4, img: loginphoto },
              { w: 130, h: 170, top: 165, right: 160, rot: 5, z: 5, img: loginA },
              { w: 165, h: 138, top: 290, right: 10, rot: 5, z: 2, img: d7 },
              { w: 150, h: 165, top: 340, right: 170, rot: -6, z: 3, img: d8 },
              { w: 135, h: 135, top: 450, right: 35, rot: -3, z: 4, img: d5 },
              { w: 155, h: 130, top: 480, right: 185, rot: 4, z: 3, img: d6 },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute', width: p.w, height: p.h,
                  top: p.top, right: p.right,
                  transform: `rotate(${p.rot}deg)`,
                  zIndex: p.z, borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(118,205,214,0.30), 0 24px 56px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                }}
                className="hover:scale-105"
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 32px rgba(118,205,214,0.45), 0 32px 64px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.10)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(118,205,214,0.30), 0 24px 56px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)'}
              >
                <img src={p.img} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" decoding="async" />
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