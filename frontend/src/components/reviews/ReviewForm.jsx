import { useState, useEffect } from 'react'
import { X, Star } from 'lucide-react'
import apiClient from '../../shared/services/apiClient'
import { resolveImageUrl } from '../../shared/utils/imageUrl'

export default function ReviewForm({ isOpen, onClose, orderId, productId, productName, productImage, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(t)
  }, [toast])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) {
      setError('Please select a rating')
      return
    }
    if (!comment.trim()) {
      setError('Please add a comment')
      return
    }

    let userId = null
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null')
      userId = u?.user_id ?? u?.id
    } catch {
      userId = null
    }
    if (!userId) {
      setError('You must be logged in to submit a review')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await apiClient.post('/reviews', {
        order_id: orderId,
        product_id: productId,
        user_id: userId,
        rating,
        comment: comment.trim()
      })
      setRating(0)
      setComment('')
      setToast('Thank you! Your review was submitted.')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setError(err?.message || err?.error || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-gray-900 text-white text-sm px-5 py-3 rounded-sm shadow-lg">
          {toast}
        </div>
      )}
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} role="presentation" />
        <div className="relative bg-white w-full max-w-lg mx-4 p-6 rounded-sm shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Write a review</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors duration-300">
              <X size={20} />
            </button>
          </div>

          {productName && (
            <div className="flex items-center gap-3 mb-5 p-3 border border-gray-200 rounded-sm">
              <img
                src={resolveImageUrl(productImage) || ''}
                alt={productName}
                className="w-14 h-14 object-cover rounded-sm bg-gray-100"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  img.src = ''
                }}
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Product</p>
                <p className="text-sm font-medium text-gray-900">{productName}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Rating</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1
                  const active = value <= rating
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="text-yellow-400 transition-colors duration-300"
                    >
                      <Star size={22} fill={active ? 'currentColor' : 'none'} />
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Comment</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors duration-300"
                placeholder="Share your experience…"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 text-white py-3 text-sm font-medium transition-colors duration-300 hover:bg-gray-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
