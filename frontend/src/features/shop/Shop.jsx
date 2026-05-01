import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EyewearCard } from '../../shared/components/eyewear'
import shopService from './shopService'

const MAX_PRICE = 450
const BRANDS = ['Velore', 'Ray-Ban', 'MIU MIU']
const FRAME_SHAPES = ['Round', 'Square', 'Rectangle', 'Cat eye', 'Aviator']
const FACE_SHAPES = ['Round Face', 'Oval Face', 'Square Face', 'Heart Face', 'Diamond Face']
const LENS_COLORS = ['Clear', 'Green', 'Blue', 'Grey', 'Gradient']
const PURPOSES = ['Driving', 'Screen Use', 'Outdoor', 'Sports', 'Night Driving']
const LENS_FEATURES = ['Polarized', 'UV 400 Protection', 'Blue Light Blocking', 'Anti-Reflective', 'Scratch Resistant', 'Anti-Fog']

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
    isBundle: false,
    brands: [], sizes: [], frameShapes: [], faceShapes: [],
    lensColors: [], purposes: [], lensFeatures: [], genders: [],
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-900"
      >
        {title}
        <span className="text-lg leading-none text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1" onClick={onChange}>
      <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${checked ? 'bg-gray-900 border-gray-900' : 'border-gray-300 group-hover:border-gray-500'}`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
    </label>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState('default')
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState(initFilters())
  const [appliedFilters, setAppliedFilters] = useState(initFilters())
  
  // ✅ NEW: Real data from API
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const activeCategory = searchParams.get('category') || 'all'
  const isLenses = activeCategory === 'lenses'
  const showFrameFilters = activeCategory === 'glasses' || activeCategory === 'sunglasses'
  const showFilterBtn = activeCategory !== 'all'

  // ✅ NEW: Fetch products from backend
  useEffect(() => {
    loadProducts(activeCategory)
  }, [activeCategory])

  const loadProducts = async (category) => {
  setLoading(true)
  setError(null)
  try {
    const params = {}
    if (activeCategory !== 'all') {
      const categoryMap = {
        glasses: 1,
        sunglasses: 2,
        lenses: 4,
      }
      params.category_id = categoryMap[activeCategory]
    }
    const response = await shopService.getProducts(params)
console.log('API response:', response.data)  // ← add this
setAllProducts(response.data)

  } catch (err) {
    setError('Failed to load products')
    console.error('Shop error:', err)
  } finally {
    setLoading(false)
  }
}

  const setCategory = (key) => {
    setSearchParams(key === 'all' ? {} : { category: key })
    const reset = initFilters()
    setFilters(reset)
    setAppliedFilters(reset)
    setFilterOpen(false)
        window.scrollTo(0, 0)  // ← add this

  }

  const toggle = (key, value) => {
    setFilters(prev => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  const applyFilters = () => { setAppliedFilters({ ...filters }); setFilterOpen(false) }
  const resetFilters = () => { const r = initFilters(); setFilters(r); setAppliedFilters(r) }

  const activeFilterCount = [
    appliedFilters.isBundle,
    appliedFilters.brands.length > 0,
    appliedFilters.sizes.length > 0,
    appliedFilters.frameShapes.length > 0,
    appliedFilters.faceShapes.length > 0,
    appliedFilters.lensColors.length > 0,
    appliedFilters.purposes.length > 0,
    appliedFilters.lensFeatures.length > 0,
    appliedFilters.genders.length > 0,
    appliedFilters.priceMin > 0 || appliedFilters.priceMax < MAX_PRICE,
  ].filter(Boolean).length

  // ✅ UPDATED: Filter from API data
  const baseProducts = allProducts

  const filtered = baseProducts.filter(p => {
    const f = appliedFilters
    if (p.price < f.priceMin || p.price > f.priceMax) return false
    if (f.isBundle && !p.isBundle) return false
    if (f.brands.length && !f.brands.includes(p.brand)) return false
    if (f.genders.length && !f.genders.includes(p.gender)) return false
    if (f.sizes.length && !f.sizes.includes(p.size)) return false
    if (f.frameShapes.length && !f.frameShapes.includes(p.frameShape)) return false
    if (f.faceShapes.length && !f.faceShapes.includes(p.faceShape)) return false
    if (f.lensColors.length && !f.lensColors.includes(p.lensColor)) return false
    if (f.purposes.length && !f.purposes.includes(p.purpose)) return false
    if (f.lensFeatures.length && !f.lensFeatures.includes(p.lensFeature)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <div>
      {/* ── Category Tab Bar ── */}
      <div className="sticky top-[60px] z-40 bg-white border-b border-gray-200">
        <div className="px-6 md:px-16 flex items-center gap-8 overflow-x-auto scrollbar-hide">
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`relative py-4 text-sm whitespace-nowrap transition-colors flex-shrink-0 ${activeCategory === key ? 'text-gray-900 font-semibold' : 'text-gray-400 hover:text-gray-700'}`}
            >
              {label}
              {activeCategory === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-6 md:px-16 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `Showing ${sorted.length} of ${baseProducts.length} results`}
          </p>
          {showFilterBtn && (
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 hover:border-gray-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
              </svg>
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-gray-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          )}
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="text-xs text-gray-400 hover:text-gray-700 underline">Clear all</button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
            </svg>
            Sort by
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-lg z-50 min-w-[180px]">
              {sortOptions.map(({ key, label }) => (
                <button key={key} onClick={() => { setSortBy(key); setSortOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${sortBy === key ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="px-6 md:px-16 pb-16">
        {loading ? (
          <div className="text-center py-24 text-gray-400 text-sm">Loading products...</div>
        ) : error ? (
          <div className="text-center py-24 text-red-400 text-sm">
            {error}
            <button onClick={() => loadProducts(activeCategory)} className="block mx-auto mt-3 text-gray-900 underline text-sm">Try again</button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-sm">
            No products match your filters.
            <button onClick={resetFilters} className="block mx-auto mt-3 text-gray-900 underline text-sm">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sorted.map(product => <EyewearCard key={product.product_id || product.id} {...product} />)}
          </div>
        )}
      </div>

      {/* ── Backdrop ── */}
      {filterOpen && <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setFilterOpen(false)} />}

      {/* ── Filter Panel ── */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${filterOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <h2 className="font-semibold text-gray-900">Filter</h2>
          <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* Price */}
          <FilterSection title="Price">
            <p className="text-xs text-gray-400 mb-3">The highest price is ${MAX_PRICE}</p>
            <input
              type="range" min={0} max={MAX_PRICE} value={filters.priceMax}
              onChange={e => setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }))}
              className="w-full accent-gray-900 mb-3"
            />
            <div className="flex gap-3">
              {['priceMin', 'priceMax'].map((key, i) => (
                <div key={key} className="flex items-center border border-gray-200 px-2 py-1.5 flex-1">
                  <span className="text-gray-400 text-sm mr-1">$</span>
                  <input
                    type="number" value={filters[key]}
                    onChange={e => setFilters(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="w-full outline-none text-sm text-gray-700"
                  />
                </div>
              ))}
            </div>
          </FilterSection>

          {/* isBundle */}
          <FilterSection title="Is Bundle">
            <Checkbox label="Bundle deals only" checked={filters.isBundle}
              onChange={() => setFilters(prev => ({ ...prev, isBundle: !prev.isBundle }))} />
          </FilterSection>

          {/* Brand */}
          <FilterSection title="Brand">
            {BRANDS.map(b => <Checkbox key={b} label={b} checked={filters.brands.includes(b)} onChange={() => toggle('brands', b)} />)}
          </FilterSection>

          {/* ── Glasses / Sunglasses only ── */}
          {showFrameFilters && (
            <>
              <FilterSection title="Size">
                <div className="flex gap-2 mt-1 flex-wrap">
                  {['Small', 'Medium', 'Large'].map(s => (
                    <button key={s} onClick={() => toggle('sizes', s)}
                      className={`px-3 py-1.5 text-xs border transition-colors ${filters.sizes.includes(s) ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}>
                      {s === 'Small' ? 'S' : s === 'Medium' ? 'M' : 'L'}
                    </button>
                  ))}
                  <button className="px-3 py-1.5 text-xs border border-gray-200 text-gray-400 hover:border-gray-400 transition-colors">
                    Size Guide
                  </button>
                </div>
              </FilterSection>

              <FilterSection title="Frame Shape">
                {FRAME_SHAPES.map(s => <Checkbox key={s} label={s} checked={filters.frameShapes.includes(s)} onChange={() => toggle('frameShapes', s)} />)}
              </FilterSection>

              <FilterSection title="Face Shape">
                {FACE_SHAPES.map(s => <Checkbox key={s} label={s} checked={filters.faceShapes.includes(s)} onChange={() => toggle('faceShapes', s)} />)}
              </FilterSection>
            </>
          )}

          {/* ── Lenses only ── */}
          {isLenses && (
            <>
              <FilterSection title="Lens Color">
                {LENS_COLORS.map(c => <Checkbox key={c} label={c} checked={filters.lensColors.includes(c)} onChange={() => toggle('lensColors', c)} />)}
              </FilterSection>

              <FilterSection title="Purpose">
                {PURPOSES.map(p => <Checkbox key={p} label={p} checked={filters.purposes.includes(p)} onChange={() => toggle('purposes', p)} />)}
              </FilterSection>

              <FilterSection title="Lens Feature">
                {LENS_FEATURES.map(f => <Checkbox key={f} label={f} checked={filters.lensFeatures.includes(f)} onChange={() => toggle('lensFeatures', f)} />)}
              </FilterSection>
            </>
          )}

          {/* Gender — always shown for specific categories */}
          {(showFrameFilters || isLenses) && (
            <FilterSection title="Gender">
              {['Female', 'Male'].map(g => <Checkbox key={g} label={g} checked={filters.genders.includes(g)} onChange={() => toggle('genders', g)} />)}
            </FilterSection>
          )}
        </div>

        {/* Apply */}
        <div className="px-6 py-5 border-t border-gray-200 flex-shrink-0">
          <button onClick={applyFilters} className="w-full bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-700 transition-colors">
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}