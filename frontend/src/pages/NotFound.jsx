import { Link } from 'react-router-dom'
import { Glasses } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased selection:bg-black selection:text-white overflow-hidden flex items-center justify-center relative">
      
      {/* High-end decorative background blurs matching the Velore philosophy */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-100 rounded-full blur-3xl opacity-40 -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gray-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <section className="relative z-10 w-full max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="flex flex-col items-center">
          
          {/* Tag Header */}
          <span className="inline-block text-[10px] font-extrabold tracking-[0.3em] text-black bg-gray-100 px-4 py-1.5 rounded-full uppercase mb-8">
            Error 404
          </span>

          {/* Minimalist Icon Ring */}
          <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <Glasses size={22} aria-hidden="true" strokeWidth={1.5} />
          </div>

          {/* Editorial Title Statement */}
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 mb-4 leading-tight">
            Lost your <span className="font-serif italic font-normal text-black">way?</span>
          </h1>

          {/* Calming Body Copy */}
          <p className="text-sm md:text-base font-light text-gray-500 max-w-sm leading-relaxed mb-10">
            The frame or page you are looking for doesn't exist. Let's get your vision back on track.
          </p>

          {/* Clean Interactive Call-To-Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link 
              to="/shop" 
              className="w-full sm:w-40 bg-black text-white text-center py-3 rounded-xl text-xs font-semibold tracking-widest uppercase border border-black hover:bg-neutral-800 transition-all active:scale-[0.98]"
            >
              Explore Shop
            </Link>
            <Link 
              to="/" 
              className="w-full sm:w-40 bg-white text-black text-center py-3 rounded-xl text-xs font-semibold tracking-widest uppercase border border-gray-200 hover:border-black transition-colors"
            >
              Go Home
            </Link>
          </div>

        </div>
      </section>
    </div>
  )
}