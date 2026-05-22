import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, TrendingUp } from 'lucide-react'
import apiClient from '../../../shared/services/apiClient'
import { resolveImageUrl } from '../../utils/imageUrl'

const TRENDING_TAGS = ['Glasses', 'Hot', 'Rounded', 'Sunglasses', 'Unisex']

export default function SearchPanel({ isOpen, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [popularProducts, setPopularProducts] = useState([])
  const [popularLoading, setPopularLoading] = useState(false)

  // Fetch popular products when panel opens
  useEffect(() => {
    if (!isOpen) return
    setTimeout(() => inputRef.current?.focus(), 150)

    if (popularProducts.length > 0) return
    setPopularLoading(true)
    apiClient.get('/products/recommended?limit=4')
      .then(res => setPopularProducts(res?.data || []))
      .catch(() => setPopularProducts([]))
      .finally(() => setPopularLoading(false))
  }, [isOpen])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [isOpen])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (value.length < 2) { setSearchResults([]); return }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const result = await apiClient.get(`/products/search?q=${encodeURIComponent(value)}`)
        setSearchResults(result?.data || [])
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      onClose()
    }
  }

  const handleTagClick = (tag) => {
    navigate(`/shop?search=${encodeURIComponent(tag)}`)
    onClose()
  }

  const handleProductClick = () => onClose()

  const showResults = searchQuery.length >= 2
  const displayProducts = showResults ? searchResults : popularProducts
  const sectionTitle = showResults ? 'SEARCH RESULTS' : 'POPULAR PRODUCTS'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          width: 'min(420px, 100vw)',
          background: 'rgb(var(--velore-pearl, 248 247 244))',
          borderLeft: '1px solid rgba(var(--velore-border-soft, 200 195 185), 0.6)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* Search Input Header */}
        <div
          style={{
            borderBottom: '1px solid rgba(var(--velore-border-soft, 200 195 185), 0.6)',
            background: 'rgba(var(--velore-accent, 90 110 140), 0.06)',
          }}
          className="flex items-center gap-3 px-5 py-4"
        >
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
              style={{ fontFamily: 'inherit', letterSpacing: '0.01em' }}
            />
          </form>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">

          {/* Trending Tags — only show when not searching */}
          {!showResults && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="text-gray-400" />
                <p className="text-xs font-bold tracking-widest text-gray-400">TRENDING SEARCH</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 text-xs font-semibold tracking-wider border transition-all duration-150 rounded-sm hover:bg-gray-900 hover:text-white hover:border-gray-900"
                    style={{
                      borderColor: 'rgba(var(--velore-border-soft, 200 195 185), 1)',
                      color: '#555',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {tag.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section Title */}
          <div className="mb-4">
            <p className="text-xs font-bold tracking-widest text-gray-400">{sectionTitle}</p>
          </div>

          {/* Loading State */}
          {(searchLoading || popularLoading) && (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-square rounded-xl bg-gray-200 mb-2" />
                  <div className="h-2.5 bg-gray-200 rounded w-2/3 mb-1.5" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
                  <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {showResults && !searchLoading && searchResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">No products found for "{searchQuery}"</p>
              <button
                onClick={() => handleTagClick(searchQuery)}
                className="mt-3 text-xs underline text-gray-500 hover:text-gray-800"
              >
                Browse all results in shop →
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!searchLoading && !popularLoading && displayProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              {displayProducts.map((product) => {
                const imageUrl = resolveImageUrl(
                  product.product_variants?.[0]?.images?.[0] || product.image || null
                )
                const brandName = product.brands?.name || null

                return (
                  <Link
                    key={product.product_id}
                    to={`/product/${product.product_id}`}
                    onClick={handleProductClick}
                    className="group flex flex-col"
                  >
                    {/* Image */}
                    <div
                      className="w-full aspect-square rounded-xl overflow-hidden mb-2.5 flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]"
                      style={{
                        background: 'rgba(var(--velore-accent, 90 110 140), 0.05)',
                        border: '1px solid rgba(var(--velore-border-soft, 200 195 185), 0.7)',
                      }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={e => { e.currentTarget.style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="opacity-20">
                            <rect x="0" y="8" width="16" height="10" rx="5" stroke="#666" strokeWidth="1.5"/>
                            <rect x="24" y="8" width="16" height="10" rx="5" stroke="#666" strokeWidth="1.5"/>
                            <path d="M16 13h8" stroke="#666" strokeWidth="1.5"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-0.5">
                      {brandName && (
                        <p className="text-[10px] font-semibold tracking-widest uppercase"
                          style={{ color: 'rgba(var(--velore-accent, 90 110 140), 0.7)' }}>
                          {brandName}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 uppercase tracking-wide"
                        style={{ fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-gray-700 mt-0.5">
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* View all link when searching */}
          {showResults && !searchLoading && searchResults.length > 0 && (
            <button
              onClick={() => { navigate(`/shop?search=${encodeURIComponent(searchQuery)}`); onClose() }}
              className="w-full mt-6 py-3 text-xs font-bold tracking-widest border border-gray-300 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-150"
            >
              VIEW ALL RESULTS
            </button>
          )}
        </div>
      </div>
    </>
  )
}