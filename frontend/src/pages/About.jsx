// src/components/AboutUs.jsx
import sketchImage from '../assets/Veloresketch.jpeg'

export default function AboutUs() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-12 md:px-10 md:py-16">
      {/* Label */}
      <h2 className="text-xl font-bold text-black mb-8">About us</h2>

      {/* Content row — always side by side */}
      <div className="flex flex-row items-center gap-6 md:gap-10">
        
        {/* Text block */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-bold text-black leading-none mb-3">
            20+
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-black text-center">
            years of experience, Velore has been dedicated to selecting only the finest
            quality products for our customers. Our journey began with a simple mission: to
            bring craftsmanship, durability, and timeless style together under one roof.
          </p>
        </div>

        {/* Sketch image */}
        <div className="flex-1 min-w-0">
          <img
            src={sketchImage}
            alt="Eyewear design sketches"
            className="w-full h-auto object-contain"
          />
        </div>

      </div>
    </section>
  )
}