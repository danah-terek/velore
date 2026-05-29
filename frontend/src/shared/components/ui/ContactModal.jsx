import { useEffect, useRef, useState } from 'react'
import { Mail, MapPin, Phone, Send, X, CheckCircle } from 'lucide-react'

const PHONE_VALUE = '+961 1 234 567'
const PHONE_HREF = 'tel:+9611234567'
const EMAIL_VALUE = 'hello@velore.com'
const EMAIL_HREF = 'mailto:hello@velore.com'
const MAPS_HREF = 'https://www.google.com/maps/search/?api=1&query=Beirut%2C%20Lebanon'
const LOCATION_VALUE = 'Beirut, Lebanon'

function ContactTile({ href, label, value, icon, newTab = false, ariaLabel }) {
  const props = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a
      href={href}
      {...props}
      className="group flex items-center gap-3 p-3 bg-stone-50/50 rounded-xl border border-stone-100 hover:border-[#76CDD6] hover:bg-stone-50 transition-all duration-300 hover:shadow-md"
      aria-label={ariaLabel}
    >
      <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 group-hover:text-[#76CDD6] transition-colors duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-medium text-stone-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-medium text-stone-800">{value}</p>
      </div>
    </a>
  )
}

export default function ContactModal({ isOpen, onClose }) {
  const closeBtnRef = useRef(null)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    closeBtnRef.current?.focus?.()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all fields before submitting.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to send message.')

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', subject: '', message: '' })
        onClose?.()
      }, 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-all duration-300" 
        onClick={onClose} 
        role="presentation" 
      />

      {/* Modal - fixed height, no scroll */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Contact Velore"
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scaleIn overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-block w-5 h-px bg-[#76CDD6]" />
                <span className="text-[9px] font-medium text-stone-400 uppercase tracking-[0.2em]">Get in touch</span>
              </div>
              <h2 className="text-lg font-light tracking-tight text-[#1E1D22]">Contact Velore</h2>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-all duration-300"
              aria-label="Close contact dialog"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content - compact, no scroll */}
          <div className="px-5 py-5">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={22} className="text-emerald-500" />
                </div>
                <h3 className="text-base font-medium text-[#1E1D22] mb-1">Message sent</h3>
                <p className="text-xs text-stone-400">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                {/* Contact Tiles - compact */}
                <div className="grid grid-cols-3 gap-2 mb-5 pb-4 border-b border-stone-100">
                  <ContactTile
                    href={PHONE_HREF}
                    label="Call us"
                    value={PHONE_VALUE}
                    icon={<Phone size={13} />}
                    ariaLabel={`Call Velore at ${PHONE_VALUE}`}
                  />
                  <ContactTile
                    href={EMAIL_HREF}
                    label="Email us"
                    value={EMAIL_VALUE}
                    icon={<Mail size={13} />}
                    ariaLabel={`Email Velore at ${EMAIL_VALUE}`}
                  />
                  <ContactTile
                    href={MAPS_HREF}
                    label="Visit us"
                    value={LOCATION_VALUE}
                    icon={<MapPin size={13} />}
                    ariaLabel="Open Velore location in Google Maps"
                    newTab
                  />
                </div>

                {/* Form - compact */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-medium text-stone-400 uppercase tracking-wider mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#76CDD6] focus:ring-2 focus:ring-[#76CDD6]/20 transition-all duration-300 text-sm text-stone-800 placeholder:text-stone-300"
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-medium text-stone-400 uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="hello@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#76CDD6] focus:ring-2 focus:ring-[#76CDD6]/20 transition-all duration-300 text-sm text-stone-800 placeholder:text-stone-300"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-medium text-stone-400 uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#76CDD6] focus:ring-2 focus:ring-[#76CDD6]/20 transition-all duration-300 text-sm text-stone-800 placeholder:text-stone-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-medium text-stone-400 uppercase tracking-wider mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      placeholder="Tell us more..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#76CDD6] focus:ring-2 focus:ring-[#76CDD6]/20 transition-all duration-300 text-sm text-stone-800 placeholder:text-stone-300 resize-none"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                      <p className="text-[11px] text-rose-600">{error}</p>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E1D22] text-white text-sm font-medium rounded-full hover:bg-stone-700 transition-all duration-300 hover:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send message
                        <Send size={13} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
}