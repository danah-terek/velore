import { useParams, Link } from "react-router-dom";
import { useState } from "react";

const products = [
  { id: '1', category: 'glasses', image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400", name: "MIU MIU Eyewear logo-print glasses", price: 264, description: "Contemporary eyewear crafted with premium acetate.", colors: ['#8B0000', '#1E3A8A', '#2D2D2D'], brand: 'MIU MIU', size: 'Medium', frameShape: 'Rectangle', faceShape: 'Oval Face', gender: 'Female', isBundle: false },
  { id: '2', category: 'glasses', image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400", name: "Semi-rimless rectangular eyeglasses", price: 45, description: "Refined silhouette with a clean top line.", colors: ['#000000'], brand: 'Velore', size: 'Small', frameShape: 'Rectangle', faceShape: 'Square Face', gender: 'Male', isBundle: false },
  { id: '3', category: 'glasses', image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400", name: "Classic Round Metal Frames", price: 120, description: "Timeless round shape in lightweight metal.", colors: ['#C0C0C0', '#B8860B'], brand: 'Velore', size: 'Large', frameShape: 'Round', faceShape: 'Heart Face', gender: 'Female', isBundle: true },
  { id: '4', category: 'glasses', image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400", name: "Slim Rectangular Reading Glasses", price: 60, description: "Minimalist design for everyday wear.", colors: ['#000000', '#4B3621'], brand: 'Velore', size: 'Medium', frameShape: 'Rectangle', faceShape: 'Diamond Face', gender: 'Male', isBundle: false },
  { id: '5', category: 'glasses', image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400", name: "Oversized Square Acetate Frames", price: 185, description: "Bold square silhouette in rich acetate.", colors: ['#1C1C1C', '#8B0000', '#2F4F4F'], brand: 'Ray-Ban', size: 'Large', frameShape: 'Square', faceShape: 'Oval Face', gender: 'Female', isBundle: false },
  { id: '6', category: 'glasses', image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400", name: "Vintage Cat-Eye Glasses", price: 95, description: "Retro-inspired cat-eye with modern proportions.", colors: ['#6B0F1A', '#000000'], brand: 'Ray-Ban', size: 'Small', frameShape: 'Cat eye', faceShape: 'Round Face', gender: 'Female', isBundle: true },
  { id: '7', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Quill Round Tortoise Sunglasses", price: 80, description: "Sleek modern sunglasses with tortoise shell finish.", colors: ['#8B0000', '#2F4F4F', '#6B0F1A'], brand: 'Velore', size: 'Medium', frameShape: 'Round', faceShape: 'Oval Face', gender: 'Female', isBundle: false },
  { id: '8', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Aviator Gold UV400 Sunglasses", price: 110, description: "Classic aviator style with full UV protection.", colors: ['#B8860B', '#000000'], brand: 'Ray-Ban', size: 'Large', frameShape: 'Aviator', faceShape: 'Heart Face', gender: 'Male', isBundle: false },
  { id: '9', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Slim Rectangular Wrap Sunglasses", price: 75, description: "Sport-inspired wrap design for active lifestyles.", colors: ['#000000', '#1E3A8A'], brand: 'Velore', size: 'Medium', frameShape: 'Rectangle', faceShape: 'Square Face', gender: 'Male', isBundle: true },
  { id: '10', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Hexagonal Flat-Lens Sunglasses", price: 135, description: "Geometric flat lens for an editorial look.", colors: ['#2D2D2D', '#C0C0C0'], brand: 'MIU MIU', size: 'Small', frameShape: 'Square', faceShape: 'Diamond Face', gender: 'Female', isBundle: false },
  { id: '11', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Oversized Shield Sunglasses", price: 160, description: "One-piece shield lens with wraparound coverage.", colors: ['#000000'], brand: 'MIU MIU', size: 'Large', frameShape: 'Square', faceShape: 'Oval Face', gender: 'Female', isBundle: false },
  { id: '12', category: 'sunglasses', image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Retro Round Mirrored Sunglasses", price: 90, description: "Mirrored round lenses with a bold colour pop.", colors: ['#B8860B', '#8B0000', '#1E3A8A'], brand: 'Ray-Ban', size: 'Medium', frameShape: 'Round', faceShape: 'Square Face', gender: 'Male', isBundle: true },
  { id: '13', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Daily Comfort Clear Lenses", price: 35, description: "Ultra-thin daily disposable lenses for all-day comfort.", colors: ['#ADD8E6'], brand: 'Velore', lensColor: 'Clear', purpose: 'Screen Use', lensFeature: 'Blue Light Blocking', gender: 'Female', isBundle: false },
  { id: '14', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Monthly Toric Astigmatism Lenses", price: 55, description: "Stabilised monthly lenses for astigmatism.", colors: ['#ADD8E6'], brand: 'Velore', lensColor: 'Grey', purpose: 'Driving', lensFeature: 'Anti-Reflective', gender: 'Male', isBundle: false },
  { id: '15', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Blue Light Blocking Lenses", price: 48, description: "Filter harmful blue light from screens all day.", colors: ['#87CEEB'], brand: 'Ray-Ban', lensColor: 'Blue', purpose: 'Screen Use', lensFeature: 'Blue Light Blocking', gender: 'Female', isBundle: true },
  { id: '16', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Extended Wear Silicone Hydrogel", price: 65, description: "High oxygen permeability for extended wear.", colors: ['#ADD8E6'], brand: 'Velore', lensColor: 'Clear', purpose: 'Sports', lensFeature: 'UV 400 Protection', gender: 'Male', isBundle: false },
  { id: '17', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Gradient Color Monthly Lenses", price: 70, description: "Subtle gradient tint for a natural enhanced look.", colors: ['#6B8E23'], brand: 'MIU MIU', lensColor: 'Gradient', purpose: 'Outdoor', lensFeature: 'UV 400 Protection', gender: 'Female', isBundle: true },
  { id: '18', category: 'lenses', image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", name: "Night Drive Anti-Glare Lenses", price: 80, description: "Specially coated to reduce glare on night drives.", colors: ['#2F4F4F'], brand: 'Ray-Ban', lensColor: 'Green', purpose: 'Night Driving', lensFeature: 'Anti-Fog', gender: 'Male', isBundle: false },
]

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-sm font-medium text-gray-900"
      >
        {title}
        <span className="text-lg text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="pb-4 text-sm text-gray-500">{children}</div>}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find((p) => p.id === id)

  const [selectedColor, setSelectedColor] = useState(product?.colors[0])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  // Prescription fields
  const [sphere, setSphere] = useState('')
  const [cylinder, setCylinder] = useState('')
  const [axis, setAxis] = useState('')
  const [pd, setPd] = useState('')

  if (!product) return <div className="p-10 text-sm text-gray-500">Product not found</div>

  const isGlasses = product.category === 'glasses'
  const suggestedProducts = products.filter(p => p.id !== id && p.category === product.category).slice(0, 4)

  const images = [product.image, product.image, product.image]

  return (
    <div className="px-4 md:px-16 py-8 max-w-6xl mx-auto">

      {/* ── Main Grid ── */}
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">

        {/* LEFT — Images */}
        <div className="flex gap-3">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 border-2 overflow-hidden flex-shrink-0 ${selectedImage === i ? 'border-gray-900' : 'border-gray-200'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="flex-1 border border-gray-100">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-80 md:h-[520px] object-cover" />
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="flex flex-col gap-4">

          {/* Name & price */}
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug mb-2">{product.name}</h1>
            <p className="text-lg font-medium text-gray-900">${product.price}.00</p>
          </div>

          {/* Color dots */}
          <div>
            <p className="text-xs text-gray-500 mb-2">{product.colors.length} in stock</p>
            <div className="flex gap-2">
              {product.colors.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? 'border-gray-900' : 'border-transparent'}`}
                  style={{ backgroundColor: color, boxShadow: '0 0 0 1px #ccc' }}
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

          {/* Prescription lenses toggle — glasses only */}
          {isGlasses && (
            <div className="border border-gray-200 p-4 flex flex-col gap-4">
              <p className="text-sm font-medium text-gray-900">Prescription lenses</p>

              {/* SPH */}
              <div>
                <p className="text-xs text-gray-500 mb-1">SPH (Sphere / Power)</p>
                <div className="flex gap-2">
                  {['R', 'L'].map(eye => (
                    <div key={eye} className="flex items-center border border-gray-300 px-2 py-1 gap-1 flex-1">
                      <span className="text-xs text-gray-400">{eye}</span>
                      <input
                        type="number" step="0.25"
                        className="w-full outline-none text-sm"
                        placeholder="0.00"
                        value={sphere}
                        onChange={e => setSphere(e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* CYL */}
              <div>
                <p className="text-xs text-gray-500 mb-1">CYL (Cylinder)</p>
                <p className="text-xs text-gray-400 mb-1">Skip if you have no astigmatism</p>
                <div className="flex gap-2">
                  {['R', 'L'].map(eye => (
                    <div key={eye} className="flex items-center border border-gray-300 px-2 py-1 gap-1 flex-1">
                      <span className="text-xs text-gray-400">{eye}</span>
                      <input type="number" step="0.25" className="w-full outline-none text-sm" placeholder="0.00" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Axis */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Axis</p>
                <p className="text-xs text-gray-400 mb-1">Required if you have astigmatism</p>
                <div className="flex gap-2">
                  {['R', 'L'].map(eye => (
                    <div key={eye} className="flex items-center border border-gray-300 px-2 py-1 gap-1 flex-1">
                      <span className="text-xs text-gray-400">{eye}</span>
                      <input type="number" className="w-full outline-none text-sm" placeholder="1–180" />
                    </div>
                  ))}
                </div>
              </div>

              {/* PD */}
              <div>
                <p className="text-xs text-gray-500 mb-1">PD (Pupillary Distance)</p>
                <p className="text-xs text-gray-400 mb-1">The distance between your pupils in mm. Check your prescription.</p>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-2 py-1.5 text-sm outline-none"
                  placeholder="e.g. 63"
                />
              </div>
            </div>
          )}

          {/* Lens features */}
          <div className="flex flex-col gap-2">
            {['UV Protection (UV400)', 'Blue Light Filter', 'Sunlight Adaptive', 'Scratch-Resistant'].map(f => (
              <label key={f} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" className="accent-gray-900" defaultChecked />
                {f}
              </label>
            ))}
          </div>

          {/* Size & fit */}
          <div className="border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Size & fit</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Lens width: 52 mm</p>
              <p>Bridge width: 18 mm</p>
              <p>Temple length: 145 mm</p>
            </div>
            <button className="mt-3 text-xs border border-gray-900 px-3 py-1.5 hover:bg-gray-900 hover:text-white transition-colors">
              View Size Guide
            </button>
          </div>

          {/* Materials */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Materials</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Frames: Durable acetate material best suited for comfort and longevity. Anti-reflective coating applied for premium glare reduction.
            </p>
          </div>

          {/* Accordions */}
          <div>
            <AccordionItem title="Description">
              <p>{product.description} Premium quality materials with expert craftsmanship for long-lasting wear.</p>
            </AccordionItem>
            <AccordionItem title="Shipping & exchange">
              <p>Free shipping on orders over $100. Returns accepted within 30 days of delivery in original condition.</p>
            </AccordionItem>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
            <div className="flex border border-gray-300">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">−</button>
              <span className="px-4 py-2 text-sm">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
            </div>
            <button className="flex-1 bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors">
              Add to cart
            </button>
          </div>

        </div>
      </div>

      {/* ── You may also like ── */}
      {suggestedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xl font-semibold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedProducts.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="group block">
                <div className="bg-gray-50 border border-gray-100 overflow-hidden mb-2">
                  <img src={p.image} alt={p.name} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex gap-1 mb-1">
                  {p.colors.map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="text-xs text-gray-800 font-medium line-clamp-2 mb-0.5">{p.name}</p>
                <p className="text-xs text-gray-500">${p.price}</p>
                <button className="mt-2 w-full border border-gray-300 text-xs py-1.5 hover:bg-gray-900 hover:text-white transition-colors">
                  Add to cart
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}