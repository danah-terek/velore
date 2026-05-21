import { useState, useEffect } from 'react'
import { Cookie } from 'lucide-react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted')
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    setVisible(false)
  }

  const decline = () => {
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 animate-fadeIn">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Card */}
      <div className="relative bg-white shadow-2xl p-8 max-w-[440px] w-full animate-scaleIn">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
            <Cookie size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Cookie Preferences</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
              <a href="/privacy-policy" className="underline underline-offset-2 text-gray-900 hover:text-gray-600 ml-1">
                Learn more
              </a>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={accept}
            className="flex-1 bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={decline}
            className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition-colors border border-gray-200"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}