import { useEffect, useState } from 'react'
import apiClient from '../../shared/services/apiClient'

function Stars({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'text-xl' : 'text-base'
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`${sz} ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-2 py-5 border-b border-gray-100">
      <div className="flex gap-3 items-center">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded" />
      <div className="h-3 w-3/4 bg-gray-100 rounded" />
    </div>
  )
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="w-3 text-right">{label}</span>
      <span className="text-yellow-400 text-sm">★</span>
      <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right">{count}</span>
    </div>
  )
}

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 5

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    setError(null)
    apiClient
      .get(`/reviews/product/${productId}`)
      .then((res) => setReviews(res?.data?.data || res?.data || []))
      .catch(() => setError('Could not load reviews.'))
      .finally(() => setLoading(false))
  }, [productId])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total = reviews.length
  const avgRating = total > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1)
    : null

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / PER_PAGE)
  const paginated = reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // ── Format date ────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-8">Customer Reviews</h2>

      {/* ── Summary bar ── */}
      {!loading && !error && total > 0 && (
        <div className="flex flex-col md:flex-row gap-8 mb-10 pb-8 border-b border-gray-100">
          {/* Left — big number */}
          <div className="flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-5xl font-bold text-gray-900">{avgRating}</span>
            <Stars rating={Math.round(Number(avgRating))} size="lg" />
            <span className="text-xs text-gray-400 mt-1">{total} review{total !== 1 ? 's' : ''}</span>
          </div>

          {/* Right — breakdown bars */}
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            {ratingCounts.map(({ star, count }) => (
              <RatingBar key={star} label={star} count={count} total={total} />
            ))}
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col">
          {[1, 2, 3].map((i) => <ReviewSkeleton key={i} />)}
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* ── Empty ── */}
      {!loading && !error && total === 0 && (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-400">No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {/* ── Review list ── */}
      {!loading && !error && total > 0 && (
        <>
          <div className="flex flex-col divide-y divide-gray-100">
            {paginated.map((review) => {
              const initials = (review.users?.name || 'A')
                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <div key={review.review_id || review.feedback_id} className="py-5">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600">{initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + date */}
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {review.users?.name || 'Velore Customer'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      {/* Stars */}
                      <Stars rating={review.rating || 0} />

                      {/* Comment */}
                      {review.comment && (
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    page === i + 1
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}