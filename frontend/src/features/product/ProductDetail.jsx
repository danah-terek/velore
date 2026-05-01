import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import shopService from "../shop/shopService"
import cartService from "../cart/cartService"
import sizeguide from '../../assets/sizeguide.png'
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

// ── NEW: Size Guide Modal ─────────────────────────────────────────────────────
function SizeGuideModal({ onClose }) {
  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div className="relative bg-white w-full max-w-lg md:max-w-2xl rounded-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Size Guide</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors p-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Image */}
        <div className="p-4">
          <img
            src={sizeguide}
            alt="Size Guide"
            className="w-full h-auto object-contain max-h-[70vh]"
          />
        </div>
      </div>
    </div>
  )
}
// ── END: Size Guide Modal ─────────────────────────────────────────────────────

// ── NEW: Prescription Section ─────────────────────────────────────────────────
function PrescriptionField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="number"
        step="0.25"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0.00"
        className="border border-gray-300 px-2 py-1.5 text-sm text-gray-700 w-full outline-none focus:border-gray-500 transition-colors"
      />
    </div>
  )
}

function PrescriptionSection({ isLenses, prescription, setPrescription }) {
  return (
    <div className="border border-gray-200 p-4 flex flex-col gap-4">

      {/* SPH */}
      <div>
        <p className="text-sm font-medium text-gray-900 mb-0.5">SPH (Sphere / Power)</p>
        <p className="text-xs text-gray-400 mb-2">The main lens power to correct nearsightedness (myopia) or farsightedness (hyperopia)</p>
        <div className="grid grid-cols-2 gap-3">
          <PrescriptionField
            label="R"
            value={prescription.sph_r}
            onChange={val => setPrescription(p => ({ ...p, sph_r: val }))}
          />
          <PrescriptionField
            label="L"
            value={prescription.sph_l}
            onChange={val => setPrescription(p => ({ ...p, sph_l: val }))}
          />
        </div>
      </div>

      {/* CYL */}
      <div>
        <p className="text-sm font-medium text-gray-900 mb-0.5">CYL (Cylinder)</p>
        <p className="text-xs text-gray-400 mb-2">Only used if you have astigmatism (irregular curvature of the cornea)</p>
        <div className="grid grid-cols-2 gap-3">
          <PrescriptionField
            label="R"
            value={prescription.cyl_r}
            onChange={val => setPrescription(p => ({ ...p, cyl_r: val }))}
          />
          <PrescriptionField
            label="L"
            value={prescription.cyl_l}
            onChange={val => setPrescription(p => ({ ...p, cyl_l: val }))}
          />
        </div>
      </div>

      {/* Axis */}
      <div>
        <p className="text-sm font-medium text-gray-900 mb-0.5">Axis</p>
        <p className="text-xs text-gray-400 mb-2">Only used if you have astigmatism</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="180"
            step="1"
            value={prescription.axis}
            onChange={e => setPrescription(p => ({ ...p, axis: e.target.value }))}
            placeholder="0"
            className="border border-gray-300 px-2 py-1.5 text-sm text-gray-700 w-20 outline-none focus:border-gray-500 transition-colors"
          />
          <span className="text-xs text-gray-400">°</span>
        </div>
      </div>

      {/* PD — glasses/sunglasses only */}
      {!isLenses && (
        <div>
          <p className="text-sm font-medium text-gray-900 mb-0.5">PD (Pupillary Distance)</p>
          <p className="text-xs text-gray-400 mb-2">The distance between the centers of your two pupils, measured in millimeters (mm)</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="40"
              max="80"
              step="0.5"
              value={prescription.pd}
              onChange={e => setPrescription(p => ({ ...p, pd: e.target.value }))}
              placeholder="63"
              className="border border-gray-300 px-2 py-1.5 text-sm text-gray-700 w-20 outline-none focus:border-gray-500 transition-colors"
            />
            <span className="text-xs text-gray-400">mm</span>
          </div>
        </div>
      )}
    </div>
  )
}
// ── END: Prescription Section ─────────────────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  // ✅ Track selected variant
  const [selectedVariant, setSelectedVariant] = useState(null)

  // ── NEW: Prescription state ───────────────────────────────────────────────
  const [prescription, setPrescription] = useState({
    sph_r: '', sph_l: '',
    cyl_r: '', cyl_l: '',
    axis: '',
    pd: '',
  })
  // ── END: Prescription state ───────────────────────────────────────────────

  // ── NEW: Size guide modal state ───────────────────────────────────────────
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  // ── END ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const response = await shopService.getProduct(id)
      setProduct(response.data)
      // ✅ Auto-select first variant if available
      if (response.data?.product_variants?.length > 0) {
        setSelectedVariant(response.data.product_variants[0])
      }
    } catch (error) {
      console.error('Failed to load product:', error)
      try {
        const allProducts = await shopService.getProducts()
        const found = allProducts.data.find(p =>
          p.product_id == id || p.productId == id || p.id == id
        )
        if (found) {
          setProduct(found)
          if (found?.product_variants?.length > 0) {
            setSelectedVariant(found.product_variants[0])
          }
        } else setProduct(null)
      } catch {
        setProduct(null)
      }
    } finally {
      setLoading(false)
    }
  }

const handleAddToCart = async () => {
  const productId = product.product_id
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  if (token) {
    setAddingToCart(true)
    try {
      console.log('Sending to cart:', { 
        productId, 
        variantId: selectedVariant?.variant_id,
        quantity,
        prescriptionData: prescription
      })
      await cartService.addItem({ 
        productId, 
        variantId: selectedVariant?.variant_id,
        quantity,
        prescriptionData: prescription
      })
      alert('Added to cart!')
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  } else {
    const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    const existing = localCart.find(item => item.productId === productId)
    if (existing) {
      existing.quantity += quantity
      existing.prescriptionData = prescription
    } else {
      const firstImage = product.product_variants?.[0]?.images?.[0] || 'https://via.placeholder.com/80'
      localCart.push({
        productId,
        name: product.name,
        price: product.price,
        image: firstImage,
        quantity,
        prescriptionData: prescription,
      })
    }
    localStorage.setItem('guestCart', JSON.stringify(localCart))
    alert('Added to cart!')
  }
}

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!product) {
    return <div className="p-10 text-sm text-gray-500">Product not found</div>
  }

  // ✅ Pull images from product_variants instead of non-existent product.image
  const allImages = product.product_variants?.flatMap(v => v.images || []).filter(Boolean)
  const images = allImages?.length > 0 ? allImages : ['https://via.placeholder.com/400']

  // ✅ Get unique sizes from variants
  const sizes = [...new Set(product.product_variants?.map(v => v.size).filter(Boolean))]

  // ✅ Get unique colors from variants
  const colors = product.product_variants?.filter(v => v.color_name) || []

  // ✅ Compute final price with variant adjustment
  const basePrice = parseFloat(product.price)
  const adjustment = parseFloat(selectedVariant?.price_adjustment || 0)
  const finalPrice = (basePrice + adjustment).toFixed(2)

  // ✅ Stock from selected variant
  const stockQty = selectedVariant?.stock_quantity ?? null

  // Category-aware flags
  const categoryName = product.categories?.name?.toLowerCase()
  const isLenses = categoryName === 'lenses'
  const isGlasses = ['eyeglasses', 'glasses', 'sunglasses'].includes(categoryName)

  return (
    <div className="px-4 md:px-16 py-8 max-w-6xl mx-auto">

      {/* ── NEW: Size Guide Modal ── */}
      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
      {/* ── END ── */}

      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        {/* LEFT — Images */}
        <div className="flex gap-3">
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
          <div className="flex-1 border border-gray-100">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-80 md:h-[520px] object-cover" />
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug mb-2">{product.name}</h1>
            <p className="text-lg font-medium text-gray-900">${finalPrice}</p>
            {/* ✅ Show compare price if available */}
            {product.compare_price && (
              <p className="text-sm text-gray-400 line-through">${parseFloat(product.compare_price).toFixed(2)}</p>
            )}
          </div>

          {/* ✅ Brand from brands relation */}
          {product.brands && (
            <p className="text-sm text-gray-600">Brand: <span className="font-medium">{product.brands.name}</span></p>
          )}

          {/* ✅ Category from categories relation */}
          {product.categories && (
            <p className="text-sm text-gray-600">Category: <span className="font-medium">{product.categories.name}</span></p>
          )}

          {product.frame_shape && (
            <p className="text-sm text-gray-600">Frame Shape: <span className="font-medium">{product.frame_shape}</span></p>
          )}

          {product.face_shape && (
            <p className="text-sm text-gray-600">Face Shape: <span className="font-medium">{product.face_shape}</span></p>
          )}

          {product.material && (
            <p className="text-sm text-gray-600">Material: <span className="font-medium">{product.material}</span></p>
          )}

          {product.gender && (
            <p className="text-sm text-gray-600">Gender: <span className="font-medium capitalize">{product.gender}</span></p>
          )}

          {/* ✅ Colors from variants (replaces hardcoded size & fit) */}
          {colors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">
                Color: <span className="font-normal text-gray-600">{selectedVariant?.color_name || colors[0].color_name}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {colors.map(v => (
                  <button
                    key={v.variant_id}
                    onClick={() => {
                      setSelectedVariant(v)
                      // Switch to the first image of this variant if it has images
                      if (v.images?.length > 0) {
                        const idx = images.indexOf(v.images[0])
                        if (idx !== -1) setSelectedImage(idx)
                      }
                    }}
                    title={v.color_name}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${selectedVariant?.variant_id === v.variant_id ? 'border-gray-900 scale-110' : 'border-gray-300'}`}
                    style={{ backgroundColor: v.color_hex || '#ccc' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ✅ Sizes from variants */}
          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Size</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(size => {
                  const variantForSize = product.product_variants.find(v => v.size === size)
                  const isSelected = selectedVariant?.size === size
                  return (
                    <button
                      key={size}
                      onClick={() => variantForSize && setSelectedVariant(variantForSize)}
                      className={`px-3 py-1.5 text-xs border transition-colors ${isSelected ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ✅ Stock info from selected variant */}
          {stockQty !== null && (
            <p className={`text-xs ${stockQty <= (selectedVariant?.low_stock_alert || 5) ? 'text-orange-500' : 'text-green-600'}`}>
              {stockQty === 0 ? 'Out of stock' : stockQty <= (selectedVariant?.low_stock_alert || 5) ? `Only ${stockQty} left` : 'In stock'}
            </p>
          )}

          {/* ✅ Badges */}
          <div className="flex gap-2 flex-wrap">
            {product.prescription_ready && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1">Prescription Ready</span>
            )}
            {product.virtual_try_on && (
              <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1">Virtual Try-On</span>
            )}
            {product.is_bundle && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1">Bundle Deal</span>
            )}
          </div>

          {/* ── NEW: Prescription Section ─────────────────────────────────────
              Always visible for both glasses/sunglasses and lenses.
              PD shown for glasses/sunglasses only (isLenses=false).
          ─────────────────────────────────────────────────────────────────── */}
          {(isGlasses || isLenses) && (
            <PrescriptionSection
              isLenses={isLenses}
              prescription={prescription}
              setPrescription={setPrescription}
            />
          )}
          {/* ── END: Prescription Section ──────────────────────────────────── */}

          <div>
            <AccordionItem title="Description">
              <p>{product.description}</p>
            </AccordionItem>

            {isGlasses && (product.lens_width || product.bridge_width || product.temple_length) && (
              <AccordionItem title="Size & Fit">
                {product.lens_width && <p>Lens Width: {product.lens_width} mm</p>}
                {product.bridge_width && <p>Bridge Width: {product.bridge_width} mm</p>}
                {product.temple_length && <p>Temple Length: {product.temple_length} mm</p>}
                {/* ── NEW: Size Guide button ── */}
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="mt-3 text-xs text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
                >
                  View Size Guide
                </button>
                {/* ── END ── */}
              </AccordionItem>
            )}

            {isLenses && (product.diameter || product.base_curve || product.water_content) && (
              <AccordionItem title="Lens Specifications">
                {product.diameter && <p>Diameter: {product.diameter} mm</p>}
                {product.base_curve && <p>Base Curve: {product.base_curve} mm</p>}
                {product.water_content && <p>Water Content: {product.water_content}%</p>}
              </AccordionItem>
            )}

            {product.details && (
              <AccordionItem title="Details">
                <p>{product.details}</p>
              </AccordionItem>
            )}

            <AccordionItem title="Shipping & exchange">
              <p>Free shipping on orders over $50. Returns accepted within 30 days.</p>
            </AccordionItem>
          </div>

          {/* Add to Cart */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
            <div className="flex border border-gray-300">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">−</button>
              <span className="px-4 py-2 text-sm">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || stockQty === 0}
              className="flex-1 bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {addingToCart ? 'Adding...' : stockQty === 0 ? 'Out of Stock' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
