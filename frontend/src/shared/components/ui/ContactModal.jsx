import { useEffect, useRef, useState } from 'react'
import { Mail, MapPin, Phone, Send, X } from 'lucide-react'

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
      className="v-icon-tile v-hover-lift v-motion focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--velore-ring),0.16)] cursor-pointer"
      aria-label={ariaLabel}
    >
      <span className="v-icon-circle" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-[rgba(var(--velore-fg),0.55)]">{label}</span>
        <span className="block text-sm font-semibold text-[rgb(var(--velore-fg))] truncate">{value}</span>
      </span>
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
      }, 1800)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/35 z-[60] transition-opacity" onClick={onClose} role="presentation" />

      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Contact Velore"
          className="w-full max-w-3xl max-h-[92vh] overflow-y-auto v-card-luxury v-soft-enter"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(var(--velore-border-soft),0.85)]">
            <div>
              <div className="v-eyebrow">Support</div>
              <h2 className="text-lg font-semibold text-[rgb(var(--velore-fg))]">Contact Velore</h2>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="v-icon-btn v-motion focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--velore-ring),0.16)]"
              aria-label="Close contact dialog"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="px-6 py-6">
            {submitted ? (
              <div className="v-empty p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 mb-4">
                  <Send size={20} className="text-emerald-700" aria-hidden="true" />
                </div>
                <div className="text-base font-semibold text-[rgb(var(--velore-fg))]">Message sent</div>
                <div className="v-caption mt-1">We’ll get back to you within 24 hours.</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 pb-6 border-b border-[rgba(var(--velore-border-soft),0.85)]">
                  <ContactTile
                    href={PHONE_HREF}
                    label="Call us"
                    value={PHONE_VALUE}
                    icon={<Phone size={16} aria-hidden="true" />}
                    ariaLabel={`Call Velore at ${PHONE_VALUE}`}
                  />
                  <ContactTile
                    href={EMAIL_HREF}
                    label="Email us"
                    value={EMAIL_VALUE}
                    icon={<Mail size={16} aria-hidden="true" />}
                    ariaLabel={`Email Velore at ${EMAIL_VALUE}`}
                  />
                  <ContactTile
                    href={MAPS_HREF}
                    label="Visit us"
                    value={LOCATION_VALUE}
                    icon={<MapPin size={16} aria-hidden="true" />}
                    ariaLabel="Open Velore location in Google Maps"
                    newTab
                  />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="v-input"
                      autoComplete="name"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="v-input"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="v-input"
                    required
                  />
                  <textarea
                    name="message"
                    placeholder="How can we help?"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="v-input resize-none"
                    required
                  />

                  {error && <p className="v-field-error">{error}</p>}

                  <button type="submit" className="v-btn-primary w-full" disabled={loading}>
                    {loading ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}