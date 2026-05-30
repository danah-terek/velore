import { useRef, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

function Stars({ rating }) {
  return (
    <div className="flex gap-1 justify-center mb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  )
}

function TestimonialCard({ name, rating, review, isActive }) {
  const initials = name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??"
  
  return (
    <div 
      className={`
        bg-white rounded-xl p-6 text-center transition-all duration-500
        ${isActive ? 'border border-gray-100' : 'border border-gray-50'}
      `}
      style={{
        transform: isActive ? 'scale(1.08)' : 'scale(0.88)',
        opacity: isActive ? 1 : 0.5,
        boxShadow: isActive 
          ? '0 25px 50px -12px rgba(0,0,0,0.25), 0 8px 20px -8px rgba(0,0,0,0.15)' 
          : '0 10px 25px -8px rgba(0,0,0,0.15), 0 4px 10px -6px rgba(0,0,0,0.1)',
      }}
    >
      {/* Avatar */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3
        ${isActive ? 'bg-[#1E1D22]' : 'bg-gray-200'}
      `}>
        <span className={`text-sm font-semibold ${isActive ? 'text-[#76CDD6]' : 'text-gray-500'}`}>
          {initials}
        </span>
      </div>
      
      <p className={`font-semibold text-sm mb-0.5 ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
        {name}
      </p>
      
      <Stars rating={rating} />
      
      <p className={`text-xs leading-relaxed mt-2 ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
        "{review}"
      </p>
    </div>
  )
}

export default function Testimonials({ testimonials = [] }) {
  const prevRef = useRef(null)
  const nextRef = useRef(null)
  const swiperRef = useRef(null)

  // Duplicate testimonials to ensure smooth looping
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials]

  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      if (swiperRef.current.params.navigation) {
        swiperRef.current.params.navigation.prevEl = prevRef.current
        swiperRef.current.params.navigation.nextEl = nextRef.current
        swiperRef.current.navigation.init()
        swiperRef.current.navigation.update()
      }
    }
  }, [])

  // Don't render if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-visible py-6">
      {/* MOBILE — 1 card, continuous loop */}
      <div className="md:hidden px-4">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            stopOnLastSlide: false,
          }}
          speed={800}
          loopAdditionalSlides={2}
        >
          {duplicatedTestimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <TestimonialCard {...t} isActive={true} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* DESKTOP — 3 cards, with extra padding for scaled center card */}
      <div className="hidden md:block relative px-20">
        {/* Left arrow */}
        <button
          ref={prevRef}
          className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-gray-300 hover:text-[#76CDD6] transition-all duration-300 group cursor-pointer bg-transparent border-none"
          aria-label="Previous"
          style={{ background: 'none' }}
        >
          <svg 
            className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right arrow */}
        <button
          ref={nextRef}
          className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-gray-300 hover:text-[#76CDD6] transition-all duration-300 group cursor-pointer bg-transparent border-none"
          aria-label="Next"
          style={{ background: 'none' }}
        >
          <svg 
            className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper
            setTimeout(() => {
              if (swiper.params?.navigation && typeof swiper.params.navigation !== 'boolean') {
                swiper.params.navigation.prevEl = prevRef.current
                swiper.params.navigation.nextEl = nextRef.current
                swiper.navigation.init()
                swiper.navigation.update()
              }
            }, 100)
          }}
          modules={[Autoplay, Navigation]}
          spaceBetween={40}
          slidesPerView={3}
          centeredSlides={true}
          loop={true}
          loopAdditionalSlides={4}
          grabCursor={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            stopOnLastSlide: false,
          }}
          speed={800}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          className="py-10"
          style={{ overflow: "visible" }}
        >
          {duplicatedTestimonials.map((t, i) => (
            <SwiperSlide key={i} style={{ overflow: "visible" }}>
              {({ isActive }) => (
                <div
                  className="transition-all duration-500 overflow-visible"
                  style={{
                    transform: isActive ? 'scale(1)' : 'scale(0.85)',
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  <TestimonialCard {...t} isActive={isActive} />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}