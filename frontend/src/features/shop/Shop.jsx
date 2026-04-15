import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EyewearCard } from '../../shared/components/eyewear'

// ─── Product Data ─────────────────────────────────────────────────────────────
const allProducts = [
  // Glasses
  { id: '1', category: 'glasses', image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400", name: "MIU MIU Eyewear logo-print glasses", price: 264, description: "Contemporary eyewear crafted with premium acetate.", colors: ['#8B0000', '#1E3A8A', '#2D2D2D'], brand: 'MIU MIU', size: 'Medium', frameShape: 'Rectangle', faceShape: 'Oval Face', gender: 'Female', isBundle: false },
  { id: '2', category: 'glasses', image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400", name: "Semi-rimless rectangular eyeglasses", price: 45, description: "Refined silhouette with a clean top line.", colors: ['#000000'], brand: 'Velore', size: 'Small', frameShape: 'Rectangle', faceShape: 'Square Face', gender: 'Male', isBundle: false },
  { id: '3', category: 'glasses', image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400", name: "Classic Round Metal Frames", price: 120, description: "Timeless round shape in lightweight metal.", colors: ['#C0C0C0', '#B8860B'], brand: 'Velore', size: 'Large', frameShape: 'Round', faceShape: 'Heart Face', gender: 'Female', isBundle: true },
  { id: '4', category: 'glasses', image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400", name: "Slim Rectangular Reading Glasses", price: 60, description: "Minimalist design for everyday wear.", colors: ['#000000', '#4B3621'], brand: 'Velore', size: 'Medium', frameShape: 'Rectangle', faceShape: 'Diamond Face', gender: 'Male', isBundle: false },
  { id: '5', category: 'glasses', image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400", name: "Oversized Square Acetate Frames", price: 185, description: "Bold square silhouette in rich acetate.", colors: ['#1C1C1C', '#8B0000', '#2F4F4F'], brand: 'Ray-Ban', size: 'Large', frameShape: 'Square', faceShape: 'Oval Face', gender: 'Female', isBundle: false },
  { id: '6', category: 'glasses', image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400", name: "Vintage Cat-Eye Glasses", price: 95, description: "Retro-inspired cat-eye with modern proportions.", colors: ['#6B0F1A', '#000000'], brand: 'Ray-Ban', size: 'Small', frameShape: 'Cat eye', faceShape: 'Round Face', gender: 'Female', isBundle: true },

  // Sunglasses
  { id: '7', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Quill Round Tortoise Sunglasses", price: 80, description: "Sleek modern sunglasses with tortoise shell finish.", colors: ['#8B0000', '#2F4F4F', '#6B0F1A'], brand: 'Velore', size: 'Medium', frameShape: 'Round', faceShape: 'Oval Face', gender: 'Female', isBundle: false },
  { id: '8', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Aviator Gold UV400 Sunglasses", price: 110, description: "Classic aviator style with full UV protection.", colors: ['#B8860B', '#000000'], brand: 'Ray-Ban', size: 'Large', frameShape: 'Aviator', faceShape: 'Heart Face', gender: 'Male', isBundle: false },
  { id: '9', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Slim Rectangular Wrap Sunglasses", price: 75, description: "Sport-inspired wrap design for active lifestyles.", colors: ['#000000', '#1E3A8A'], brand: 'Velore', size: 'Medium', frameShape: 'Rectangle', faceShape: 'Square Face', gender: 'Male', isBundle: true },
  { id: '10', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Hexagonal Flat-Lens Sunglasses", price: 135, description: "Geometric flat lens for an editorial look.", colors: ['#2D2D2D', '#C0C0C0'], brand: 'MIU MIU', size: 'Small', frameShape: 'Square', faceShape: 'Diamond Face', gender: 'Female', isBundle: false },
  { id: '11', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Oversized Shield Sunglasses", price: 160, description: "One-piece shield lens with wraparound coverage.", colors: ['#000000'], brand: 'MIU MIU', size: 'Large', frameShape: 'Square', faceShape: 'Oval Face', gender: 'Female', isBundle: false },
  { id: '12', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Retro Round Mirrored Sunglasses", price: 90, description: "Mirrored round lenses with a bold colour pop.", colors: ['#B8860B', '#8B0000', '#1E3A8A'], brand: 'Ray-Ban', size: 'Medium', frameShape: 'Round', faceShape: 'Square Face', gender: 'Male', isBundle: true },

  // Lenses
  { id: '13', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Daily Comfort Clear Lenses", price: 35, description: "Ultra-thin daily disposable lenses for all-day comfort.", colors: ['#ADD8E6'], brand: 'Velore', lensColor: 'Clear', purpose: 'Screen Use', lensFeature: 'Blue Light Blocking', gender: 'Female', isBundle: false },
  { id: '14', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Monthly Toric Astigmatism Lenses", price: 55, description: "Stabilised monthly lenses for astigmatism.", colors: ['#ADD8E6'], brand: 'Velore', lensColor: 'Grey', purpose: 'Driving', lensFeature: 'Anti-Reflective', gender: 'Male', isBundle: false },
  { id: '15', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Blue Light Blocking Lenses", price: 48, description: "Filter harmful blue light from screens all day.", colors: ['#87CEEB'], brand: 'Ray-Ban', lensColor: 'Blue', purpose: 'Screen Use', lensFeature: 'Blue Light Blocking', gender: 'Female', isBundle: true },
  { id: '16', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Extended Wear Silicone Hydrogel", price: 65, description: "High oxygen permeability for extended wear.", colors: ['#ADD8E6'], brand: 'Velore', lensColor: 'Clear', purpose: 'Sports', lensFeature: 'UV 400 Protection', gender: 'Male', isBundle: false },
  { id: '17', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Gradient Color Monthly Lenses", price: 70, description: "Subtle gradient tint for a natural enhanced look.", colors: ['#6B8E23'], brand: 'MIU MIU', lensColor: 'Gradient', purpose: 'Outdoor', lensFeature: 'UV 400 Protection', gender: 'Female', isBundle: true },
  { id: '18', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Night Drive Anti-Glare Lenses", price: 80, description: "Specially coated to reduce glare on night drives.", colors: ['#2F4F4F'], brand: 'Ray-Ban', lensColor: 'Green', purpose: 'Night Driving', lensFeature: 'Anti-Fog', gender: 'Male', isBundle: false },
]

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

  const activeCategory = searchParams.get('category') || 'all'
  const isLenses = activeCategory === 'lenses'
  const showFrameFilters = activeCategory === 'glasses' || activeCategory === 'sunglasses'
  const showFilterBtn = activeCategory !== 'all'

  const setCategory = (key) => {
    setSearchParams(key === 'all' ? {} : { category: key })
    const reset = initFilters()
    setFilters(reset)
    setAppliedFilters(reset)
    setFilterOpen(false)
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

  const baseProducts = allProducts.filter(p => activeCategory === 'all' || p.category === activeCategory)

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
            Showing {sorted.length} of {baseProducts.length} results
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
        {sorted.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-sm">
            No products match your filters.
            <button onClick={resetFilters} className="block mx-auto mt-3 text-gray-900 underline text-sm">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sorted.map(product => <EyewearCard key={product.id} {...product} />)}
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