import { useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

const testimonials = [
  { name: "Danah Terek", rating: 4, review: "it was amazing ahaha meow, it fits perfectly ahaaah meow meow meow ahahaah very good meow mewo ahahaa i was wondering if i can go with my lenses" },
  { name: "Léa Mazmanian", rating: 4, review: "it was amazing ahaha meow, it fits perfectly ahaaah meow meow meow ahahaah very good meow mewo ahahaa i was wondering if i can go with my lenses" },
  { name: "Cookie Meow", rating: 5, review: "it was amazing ahaha meow, it fits perfectly ahaaah meow meow meow ahahaah very good meow mewo ahahaa i was wondering if i can go with my lenses" },
  { name: "Sara Ahmad", rating: 5, review: "Absolutely love my new glasses! The quality is outstanding and the virtual try-on feature made it so easy to find the perfect pair." },
  { name: "Maya Hassan", rating: 4, review: "Great experience overall! The frames are exactly as shown and arrived quickly. Will definitely order again!" },
]

function Stars({ rating }) {
  return (
    <div className="flex gap-1 justify-center my-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  )
}

function TestimonialCard({ name, rating, review }) {
  return (
    <div className="relative bg-gray-100 rounded-sm text-center pt-14 pb-8 px-6 mt-10">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-gray-500">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </div>
      <p className="font-semibold text-sm text-gray-900 mb-1">{name}</p>
      <Stars rating={rating} />
      <p className="text-xs text-gray-500 leading-relaxed">{review}</p>
    </div>
  )
}

export default function Testimonials() {
  const prevRef = useRef(null)
  const nextRef = useRef(null)

  return (
    <section className="px-6 md:px-16 py-16">
      <h2 className="text-2xl font-semibold mb-12">Testimonials</h2>

      {/* MOBILE — 1 card centered, auto scroll */}
      <div className="md:hidden">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i} className="flex justify-center">
              <div className="w-full max-w-sm mx-auto">
                <TestimonialCard {...t} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* DESKTOP — 3 cards, center bigger, draggable, auto scroll */}
      <div className="hidden md:block relative">

        {/* Custom arrows */}
        <button
          ref={prevRef}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors duration-300 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          ref={nextRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors duration-300 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={24}
          slidesPerView={3}
          centeredSlides={true}
          loop={true}
          grabCursor={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          onSwiper={(swiper) => {
  setTimeout(() => {
    if (swiper.params && swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
      swiper.params.navigation.prevEl = prevRef.current
      swiper.params.navigation.nextEl = nextRef.current
      swiper.navigation.init()
      swiper.navigation.update()
    }
  })
}}
          slideActiveClass="swiper-slide-active"
          className="px-12"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              {({ isActive }) => (
                <div
                  className="transition-all duration-700 ease-in-out"
                  style={{
                    transform: isActive ? 'scale(1)' : 'scale(0.88)',
                    opacity: isActive ? 1 : 0.45,
                  }}
                >
                  <TestimonialCard {...t} />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

    </section>
  )
}