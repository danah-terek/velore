// src/components/ui/ContactModal.jsx
import { useState } from 'react'
import { X, Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError(null)

  // Manual validation
  if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
    setError('Please fill in all fields before submitting.')
    return
  }

  setLoading(true)

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (!res.ok) throw new Error('Failed to send message.')

    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
      onClose()
    }, 2000)
  } catch (err) {
    console.error(err)
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
        className="fixed inset-0 bg-black/30 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-2xl max-h-[95vh] overflow-y-auto bg-white rounded-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-sm text-gray-500">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <>
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-gray-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Call us</p>
                    <p className="text-sm font-medium text-gray-900">+961 1 234 567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-gray-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email us</p>
                    <p className="text-sm font-medium text-gray-900 truncate">hello@velore.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-gray-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Visit us</p>
                    <p className="text-sm font-medium text-gray-900">Beirut, Lebanon</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 transition-colors"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 transition-colors"
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 transition-colors resize-none"
                />

                {/* Error message */}
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}