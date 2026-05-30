import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EyewearCard } from '../../shared/components/eyewear'
import shopService from './shopService'

const MAX_PRICE = 450

const categories = [
  { key: 'all', label: 'All' },
  { key: 'glasses', label: 'Glasses' },
  { key: 'sunglasses', label: 'Sunglasses' },
  { key: 'lenses', label: 'Lenses' },
]

const sortOptions = [
  { key: 'default', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name A–Z' },
]

function initFilters() {
  return {
    priceMin: 0, priceMax: MAX_PRICE,
    inStockOnly: false,
    brands: [], sizes: [], frameShapes: [], faceShapes: [],
    lensColors: [], purposes: [], lensFeatures: [], genders: [],
  }
}

function uniqField(products, field) {
  return [...new Set(products.map(p => p[field]).filter(Boolean))].sort()
}

function uniqSizes(products) {
  const all = products.flatMap(p => (p.product_variants ?? []).map(v => v.size).filter(Boolean))
  return [...new Set(all)].sort()
}

// ─── Smooth Filter Pill ─────────────────────────────────────────────────────
function FilterPill({ label, activeCount = 0, children, onClear }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = activeCount > 0

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
          ${isActive
            ? 'bg-[#76CDD6] text-white shadow-sm'
            : 'bg-[#EFF8FE] text-[#1E1D22] hover:bg-[#76CDD6]/10'
          }`}
      >
        {label}
        {isActive && activeCount > 1 && (
          <span className="bg-white text-[#1E1D22] text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg"
          className={`w-3 h-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl p-4 min-w-[240px] z-50 border border-gray-100">
          {children}
          {isActive && onClear && (
            <button
              onClick={() => { onClear(); setOpen(false) }}
              className="mt-3 text-xs text-gray-400 hover:text-[#76CDD6] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1.5" onClick={onChange}>
      <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200
        ${checked ? 'bg-[#76CDD6]' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-600 capitalize group-hover:text-[#1E1D22] transition-colors">{label}</span>
    </label>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState('default')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef(null)
  const [filters, setFilters] = useState(initFilters())

  const [allProducts, setAllProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Refs for underline animation
  const categoryBarRef = useRef(null)
  const buttonRefs = useRef({})
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 })

  const activeCategory = searchParams.get('category') || 'all'
  const isLenses = activeCategory === 'lenses'
  const showFrameFilters = activeCategory === 'glasses' || activeCategory === 'sunglasses'
  const showFilters = activeCategory !== 'all'

  const options = useMemo(() => ({
    sizes:        uniqSizes(allProducts),
    frameShapes:  uniqField(allProducts, 'frame_shape'),
    faceShapes:   uniqField(allProducts, 'face_shape'),
    genders:      uniqField(allProducts, 'gender'),
    lensColors:   uniqField(allProducts, 'lens_color'),
    purposes:     uniqField(allProducts, 'purpose'),
    lensFeatures: uniqField(allProducts, 'lens_feature'),
  }), [allProducts])

  // Update underline position when category changes or window resizes
  const updateUnderlinePosition = useCallback(() => {
    const activeButton = buttonRefs.current[activeCategory]
    if (activeButton && categoryBarRef.current) {
      const buttonRect = activeButton.getBoundingClientRect()
      const containerRect = categoryBarRef.current.getBoundingClientRect()
      setUnderlineStyle({
        width: buttonRect.width,
        left: buttonRect.left - containerRect.left,
      })
    }
  }, [activeCategory])

  useEffect(() => {
    // Update position immediately
    updateUnderlinePosition()
    
    // Update on window resize
    window.addEventListener('resize', updateUnderlinePosition)
    return () => window.removeEventListener('resize', updateUnderlinePosition)
  }, [updateUnderlinePosition])

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    shopService.getBrands()
      .then(res => {
        const list = res?.data ?? res ?? []
        setBrands(Array.isArray(list) ? list : [])
      })
      .catch(err => console.error('Brands fetch error:', err))
  }, [])

  useEffect(() => { loadProducts() }, [activeCategory])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (activeCategory !== 'all') {
        const categoryMap = { sunglasses: 1, glasses: 2, lenses: 3 }
        if (categoryMap[activeCategory]) params.category_id = categoryMap[activeCategory]
      }
      const response = await shopService.getProducts(params)
      setAllProducts(response?.data ?? response ?? [])
    } catch (err) {
      setError('Failed to load products')
      console.error('Shop error:', err)
    } finally {
      setLoading(false)
    }
  }

  const setCategory = (key) => {
    setSearchParams(key === 'all' ? {} : { category: key })
    setFilters(initFilters())
    window.scrollTo(0, 0)
  }

  const toggle = (key, value) => {
    setFilters(prev => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  const clearKey = (key) => setFilters(prev => ({ ...prev, [key]: Array.isArray(prev[key]) ? [] : initFilters()[key] }))
  const resetFilters = () => setFilters(initFilters())

  const totalActiveFilters = [
    filters.inStockOnly,
    filters.brands.length > 0,
    filters.priceMin > 0 || filters.priceMax < MAX_PRICE,
    filters.sizes.length > 0,
    filters.frameShapes.length > 0,
    filters.faceShapes.length > 0,
    filters.lensColors.length > 0,
    filters.purposes.length > 0,
    filters.lensFeatures.length > 0,
    filters.genders.length > 0,
  ].filter(Boolean).length

  const sorted = [...allProducts]
    .filter(p => {
      const f = filters
      const price = parseFloat(p.price) || 0

      if (price < f.priceMin || price > f.priceMax) return false

      if (f.inStockOnly) {
        const hasStock = (p.product_variants ?? []).some(v => (v.stock_quantity ?? 0) > 0)
        if (!hasStock) return false
      }

      if (f.brands.length && !f.brands.includes(p.brands?.brand_id)) return false
      if (f.genders.length && !f.genders.includes(p.gender)) return false

      if (f.sizes.length) {
        const variantSizes = (p.product_variants ?? []).map(v => v.size)
        if (!f.sizes.some(s => variantSizes.includes(s))) return false
      }

      if (f.frameShapes.length && !f.frameShapes.includes(p.frame_shape)) return false
      if (f.faceShapes.length && !f.faceShapes.includes(p.face_shape)) return false
      if (f.lensColors.length && !f.lensColors.includes(p.lens_color)) return false
      if (f.purposes.length && !f.purposes.includes(p.purpose)) return false
      if (f.lensFeatures.length && !f.lensFeatures.includes(p.lens_feature)) return false

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return parseFloat(a.price) - parseFloat(b.price)
      if (sortBy === 'price-desc') return parseFloat(b.price) - parseFloat(a.price)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <div className="bg-white">
      {/* ── Category Tab Bar with Smooth Sliding Underline ── */}
      <div className="sticky top-[60px] z-40 bg-white border-b border-gray-100">
        <div className="px-6 md:px-16 overflow-x-auto scrollbar-hide">
          <div className="relative flex items-center gap-8 min-w-max" ref={categoryBarRef}>
            {categories.map(({ key, label }) => (
              <button
                key={key}
                ref={(el) => { buttonRefs.current[key] = el }}
                onClick={() => setCategory(key)}
                className={`relative py-4 text-sm whitespace-nowrap transition-colors duration-300 flex-shrink-0
                  ${activeCategory === key ? 'text-[#1E1D22] font-medium' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {label}
              </button>
            ))}
            {/* Sliding underline */}
            {underlineStyle.width > 0 && (
              <span
                className="absolute bottom-0 h-0.5 bg-[#76CDD6] rounded-full transition-all duration-300 ease-out"
                style={{
                  width: underlineStyle.width,
                  transform: `translateX(${underlineStyle.left}px)`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Filter Pills Bar + Sort ── */}
      <div
        className={`sticky z-30 bg-[#EFF8FE] ${showFilters ? 'border-b border-[#76CDD6]/10' : ''}`}
        style={{ top: 109 }}
      >
        <div className="px-6 md:px-16 py-4 flex items-center justify-between gap-4 flex-wrap">

          {/* Left: filter pills */}
          <div className={`flex items-center gap-2 flex-wrap ${!showFilters ? 'invisible pointer-events-none' : ''}`}>
            {/* Price */}
            <FilterPill
              label="Price"
              activeCount={(filters.priceMin > 0 || filters.priceMax < MAX_PRICE) ? 1 : 0}
              onClear={() => setFilters(prev => ({ ...prev, priceMin: 0, priceMax: MAX_PRICE }))}
            >
              <p className="text-xs text-gray-500 mb-3">Up to ${MAX_PRICE}</p>
              <input
                type="range" min={0} max={MAX_PRICE} value={filters.priceMax}
                onChange={e => setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }))}
                className="w-full accent-[#76CDD6] mb-3"
              />
              <div className="flex gap-2">
                {['priceMin', 'priceMax'].map(key => (
                  <div key={key} className="flex items-center bg-gray-50 rounded-lg px-3 py-2 flex-1">
                    <span className="text-gray-400 text-sm mr-1">$</span>
                    <input
                      type="number" value={filters[key]}
                      onChange={e => setFilters(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full outline-none bg-transparent text-sm text-gray-700"
                    />
                  </div>
                ))}
              </div>
            </FilterPill>

            {/* Availability */}
            <FilterPill
              label="Availability"
              activeCount={filters.inStockOnly ? 1 : 0}
              onClear={() => setFilters(prev => ({ ...prev, inStockOnly: false }))}
            >
              <Checkbox
                label="In stock only"
                checked={filters.inStockOnly}
                onChange={() => setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
              />
            </FilterPill>

            {/* Brand */}
            {brands.length > 0 && (
              <FilterPill label="Brand" activeCount={filters.brands.length} onClear={() => clearKey('brands')}>
                <div className="max-h-48 overflow-y-auto">
                  {brands.map(b => {
                    const id = b.brand_id ?? b.id
                    const name = b.name ?? b.brand_name ?? String(b)
                    return (
                      <Checkbox
                        key={id}
                        label={name}
                        checked={filters.brands.includes(id)}
                        onChange={() => toggle('brands', id)}
                      />
                    )
                  })}
                </div>
              </FilterPill>
            )}

            {/* Frame Shape */}
            {showFrameFilters && options.frameShapes.length > 0 && (
              <FilterPill label="Frame Shape" activeCount={filters.frameShapes.length} onClear={() => clearKey('frameShapes')}>
                {options.frameShapes.map(s => (
                  <Checkbox key={s} label={s} checked={filters.frameShapes.includes(s)} onChange={() => toggle('frameShapes', s)} />
                ))}
              </FilterPill>
            )}

            {/* Face Shape */}
            {showFrameFilters && options.faceShapes.length > 0 && (
              <FilterPill label="Face Shape" activeCount={filters.faceShapes.length} onClear={() => clearKey('faceShapes')}>
                {options.faceShapes.map(s => (
                  <Checkbox key={s} label={s} checked={filters.faceShapes.includes(s)} onChange={() => toggle('faceShapes', s)} />
                ))}
              </FilterPill>
            )}

            {/* Size */}
            {showFrameFilters && options.sizes.length > 0 && (
              <FilterPill label="Size" activeCount={filters.sizes.length} onClear={() => clearKey('sizes')}>
                <div className="flex gap-2 flex-wrap">
                  {options.sizes.map(s => (
                    <button key={s} onClick={() => toggle('sizes', s)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-all duration-300
                        ${filters.sizes.includes(s) 
                          ? 'bg-[#76CDD6] text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-[#76CDD6]/20'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </FilterPill>
            )}

            {/* Gender */}
            {(showFrameFilters || isLenses) && options.genders.length > 0 && (
              <FilterPill label="Gender" activeCount={filters.genders.length} onClear={() => clearKey('genders')}>
                {options.genders.map(g => (
                  <Checkbox key={g} label={g} checked={filters.genders.includes(g)} onChange={() => toggle('genders', g)} />
                ))}
              </FilterPill>
            )}

            {/* Lens Color */}
            {isLenses && options.lensColors.length > 0 && (
              <FilterPill label="Lens Color" activeCount={filters.lensColors.length} onClear={() => clearKey('lensColors')}>
                {options.lensColors.map(c => (
                  <Checkbox key={c} label={c} checked={filters.lensColors.includes(c)} onChange={() => toggle('lensColors', c)} />
                ))}
              </FilterPill>
            )}

            {/* Purpose */}
            {isLenses && options.purposes.length > 0 && (
              <FilterPill label="Purpose" activeCount={filters.purposes.length} onClear={() => clearKey('purposes')}>
                {options.purposes.map(p => (
                  <Checkbox key={p} label={p} checked={filters.purposes.includes(p)} onChange={() => toggle('purposes', p)} />
                ))}
              </FilterPill>
            )}

            {/* Lens Features */}
            {isLenses && options.lensFeatures.length > 0 && (
              <FilterPill label="Lens Features" activeCount={filters.lensFeatures.length} onClear={() => clearKey('lensFeatures')}>
                {options.lensFeatures.map(f => (
                  <Checkbox key={f} label={f} checked={filters.lensFeatures.includes(f)} onChange={() => toggle('lensFeatures', f)} />
                ))}
              </FilterPill>
            )}

            {/* Clear all */}
            {totalActiveFilters > 0 && (
              <button onClick={resetFilters} className="text-xs text-gray-400 hover:text-[#76CDD6] transition-colors underline-offset-2 hover:underline ml-1">
                Clear all
              </button>
            )}
          </div>

          {/* Right: product count + sort */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <p className="text-sm text-gray-400 hidden md:block whitespace-nowrap">
              {loading ? 'Loading...' : `${sorted.length} Products`}
            </p>

            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF8FE] text-sm font-medium text-[#1E1D22] hover:bg-[#76CDD6]/10 transition-all duration-300"
              >
                {sortOptions.find(o => o.key === sortBy)?.label}
                <svg xmlns="http://www.w3.org/2000/svg"
                  className={`w-3 h-3 transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 min-w-[180px] overflow-hidden">
                  {sortOptions.map(({ key, label }) => (
                    <button key={key} onClick={() => { setSortBy(key); setSortOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200
                        ${sortBy === key 
                          ? 'bg-[#EFF8FE] text-[#76CDD6] font-medium' 
                          : 'text-gray-500 hover:bg-gray-50'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="px-6 md:px-16 py-8 pb-16">
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block w-8 h-8 border-2 border-[#76CDD6] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm mt-3">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm">{error}</p>
            <button onClick={loadProducts} className="mt-3 text-[#76CDD6] underline text-sm">Try again</button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm">No products match your filters.</p>
            <button onClick={resetFilters} className="mt-3 text-[#76CDD6] underline text-sm">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sorted.map(product => (
              <EyewearCard key={product.product_id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}