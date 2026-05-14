import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import apiClient from '../../shared/services/apiClient'

function Stars({ rating }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className="text-yellow-400" fill={i < rating ? 'currentColor' : 'none'} />
      ))}
    </div>
  )
}

export default function ReviewApproval() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPending = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/reviews/pending')
      const list = response?.data || response || []
      setReviews(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Failed to load pending reviews', err)
      setError(err?.message || err?.error || 'Failed to load reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPending()
  }, [])

  const updateStatus = async (id, action) => {
    try {
      await apiClient.put(`/reviews/${id}/${action}`)
      loadPending()
    } catch (error) {
      console.error(`Failed to ${action} review`, error)
    }
  }

  if (loading) return <p className="text-sm text-gray-500 py-8">Loading pending reviews…</p>

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto bg-white rounded-sm shadow-sm border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-700">User</th>
            <th className="px-4 py-3 font-medium text-gray-700">Rating</th>
            <th className="px-4 py-3 font-medium text-gray-700">Comment</th>
            <th className="px-4 py-3 font-medium text-gray-700">Date</th>
            <th className="px-4 py-3 font-medium text-gray-700">Order ID</th>
            <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No pending reviews</td>
            </tr>
          ) : (
            reviews.map((review) => (
              <tr key={String(review.review_id)} className="border-t border-gray-200">
                <td className="px-4 py-3">{review.users?.name || 'Unknown User'}</td>
                <td className="px-4 py-3"><Stars rating={review.rating || 0} /></td>
                <td className="px-4 py-3 text-gray-700">{review.comment}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(review.created_at || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-600">#{review.order_id || review.orders?.order_id || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(String(review.review_id), 'approve')}
                      className="bg-green-600 text-white px-3 py-1.5 text-sm font-medium transition-colors duration-300 hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(String(review.review_id), 'reject')}
                      className="bg-red-600 text-white px-3 py-1.5 text-sm font-medium transition-colors duration-300 hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
