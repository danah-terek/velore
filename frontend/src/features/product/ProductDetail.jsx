import { useParams, Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Check } from 'lucide-react'
import shopService from "../shop/shopService"
import useCurrency from '../../shared/hooks/useCurrency'
import cartService from "../cart/cartService"
import sizeguide from '../../assets/sizeguide.png'
import { resolveImageUrl } from '../../shared/utils/imageUrl'
import ProductReviews from './ProductReviews'

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

function SizeGuideModal({ onClose }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

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
      <div>
        <p className="text-sm font-medium text-gray-900 mb-0.5">SPH (Sphere / Power)</p>
        <p className="text-xs text-gray-400 mb-2">The main lens power to correct nearsightedness or farsightedness</p>
        <div className="grid grid-cols-2 gap-3">
          <PrescriptionField label="R" value={prescription.sph_r} onChange={val => setPrescription(p => ({ ...p, sph_r: val }))} />
          <PrescriptionField label="L" value={prescription.sph_l} onChange={val => setPrescription(p => ({ ...p, sph_l: val }))} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 mb-0.5">CYL (Cylinder)</p>
        <p className="text-xs text-gray-400 mb-2">Only used if you have astigmatism</p>
        <div className="grid grid-cols-2 gap-3">
          <PrescriptionField label="R" value={prescription.cyl_r} onChange={val => setPrescription(p => ({ ...p, cyl_r: val }))} />
          <PrescriptionField label="L" value={prescription.cyl_l} onChange={val => setPrescription(p => ({ ...p, cyl_l: val }))} />
        </div>
      </div>
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
      {!isLenses && (
        <div>
          <p className="text-sm font-medium text-gray-900 mb-0.5">PD (Pupillary Distance)</p>
          <p className="text-xs text-gray-400 mb-2">Distance between the centers of your two pupils in mm</p>
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

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [stockMessage, setStockMessage] = useState('')
  const [cartError, setCartError] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [prescription, setPrescription] = useState({
    sph_r: '', sph_l: '',
    cyl_r: '', cyl_l: '',
    axis: '',
    pd: '',
  })
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  useEffect(() => {
    const stockQty = selectedVariant?.stock_quantity
    if (typeof stockQty === 'number' && stockQty >= 0) {
      if (stockQty === 0) setQuantity(1)
      else if (quantity > stockQty) setQuantity(stockQty)
    }
  }, [selectedVariant, quantity])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const result = await shopService.getProduct(id)
      setProduct(result.data)
      if (result.data?.product_variants?.length > 0) {
        setSelectedVariant(result.data.product_variants[0])
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
    setCartError('')

    if (token) {
      setAddingToCart(true)
      try {
        await cartService.addItem({
          productId,
          variantId: selectedVariant?.variant_id,
          quantity,
          prescriptionData: prescription
        })
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 1200)
      } catch (error) {
        const msg = error?.response?.data?.message || error?.message || 'Failed to add to cart.'
        setCartError(msg)
      } finally {
        setAddingToCart(false)
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      const variantId = selectedVariant?.variant_id || null
      const stockQty = selectedVariant?.stock_quantity
      const maxQty = typeof stockQty === 'number' ? stockQty : null
      if (maxQty !== null && quantity > maxQty) {
        setCartError(`Only ${maxQty} units available for ${product.name}.`)
        return
      }

      const existing = localCart.find(item => item.productId === productId && (item.variantId || null) === (variantId || null))
      if (existing) {
        const nextQty = existing.quantity + quantity
        if (maxQty !== null && nextQty > maxQty) {
          setCartError(`Only ${maxQty} units available for ${product.name}.`)
          existing.quantity = maxQty
        } else {
          existing.quantity = nextQty
        }
        existing.prescriptionData = prescription
        existing.variantId = variantId
        existing.availableStock = maxQty
      } else {
        const firstImage = product.product_variants?.[0]?.images?.[0] || null
        localCart.push({
          productId,
          variantId,
          name: product.name,
          price: product.price,
          image: firstImage || '',
          quantity,
          availableStock: maxQty,
          prescriptionData: prescription,
        })
      }
      localStorage.setItem('guestCart', JSON.stringify(localCart))
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1200)
    }
  }

  const handleTryOn = () => {
    const tryOnImage = selectedVariant?.tryon_images?.[0] || selectedVariant?.images?.[0] || ''
    const name = encodeURIComponent(product.name)
    const imageParam = encodeURIComponent(tryOnImage)
    navigate(`/try-on?image=${imageParam}&name=${name}`)
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!product) {
    return <div className="p-10 text-sm text-gray-500">Product not found</div>
  }

  const images = selectedVariant?.images?.filter(Boolean) || []
  const sizes = [...new Set(product.product_variants?.map(v => v.size).filter(Boolean))]
  const colors = product.product_variants?.filter(v => v.color_name) || []
  const basePrice = parseFloat(product.price)
  const adjustment = parseFloat(selectedVariant?.price_adjustment || 0)
  const finalPrice = (basePrice + adjustment).toFixed(2)
  const stockQty = selectedVariant?.stock_quantity ?? null
  const canAdd = stockQty === null ? true : stockQty > 0
  const maxQty = stockQty === null ? null : Math.max(0, Number(stockQty))

  // Category detection
  const categoryName = product.categories?.name?.toLowerCase()
  const isLenses = categoryName === 'lenses' || categoryName === 'blue light glasses'
  const isGlasses = categoryName === 'eyeglasses' || categoryName === 'glasses' || categoryName === 'optical glasses'
  const isSunglasses = categoryName === 'sunglasses'

  return (
    <div className="px-4 md:px-16 py-8 max-w-6xl mx-auto">
      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}

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
                <img
                  src={resolveImageUrl(img) || ''}
                  alt=""
                  className="w-full h-full object-cover bg-gray-100"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '' }}
                />
              </button>
            ))}
          </div>
          <div className="flex-1 border border-gray-100">
            <img
              src={resolveImageUrl(images[selectedImage]) || ''}
              alt={product.name}
              className="w-full h-80 md:h-[520px] object-cover bg-gray-100"
              decoding="async"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '' }}
            />
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug mb-2">{product.name}</h1>
            <p className="text-lg font-medium text-gray-900">{formatPrice(finalPrice)}</p>
            {product.compare_price && (
              <p className="text-sm text-gray-400 line-through">{formatPrice(product.compare_price)}</p>
            )}
          </div>

          {product.brands && (
            <p className="text-sm text-gray-600">Brand: <span className="font-medium">{product.brands.name}</span></p>
          )}
          {product.categories && (
            <p className="text-sm text-gray-600">Category: <span className="font-medium">{isLenses ? 'Lenses' : product.categories.name}</span></p>
          )}

          {/* Only show frame shape and face shape for glasses and sunglasses - NOT for lenses */}
          {!isLenses && product.specifications?.frame_shape && (
            <p className="text-sm text-gray-600">Frame Shape: <span className="font-medium">{product.specifications.frame_shape}</span></p>
          )}
          {!isLenses && product.specifications?.face_shape && (
            <p className="text-sm text-gray-600">Face Shape: <span className="font-medium">{product.specifications.face_shape}</span></p>
          )}

          {product.specifications?.material && (
            <p className="text-sm text-gray-600">Material: <span className="font-medium">{product.specifications.material}</span></p>
          )}
          {product.gender && (
            <p className="text-sm text-gray-600">Gender: <span className="font-medium capitalize">{product.gender}</span></p>
          )}

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
                      setSelectedImage(0)
                      console.log('Switched to:', v.color_name, 'tryon_images:', v.tryon_images)
                    }}
                    title={v.color_name}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${selectedVariant?.variant_id === v.variant_id ? 'border-gray-900 scale-110' : 'border-gray-300'}`}
                    style={{ backgroundColor: v.color_hex || '#ccc' }}
                  />
                ))}
              </div>
            </div>
          )}

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

          {stockQty !== null && (
            <p className={`text-xs ${stockQty <= (selectedVariant?.low_stock_alert || 5) ? 'text-orange-500' : 'text-green-600'}`}>
              {stockQty === 0 ? 'Out of stock' : stockQty <= (selectedVariant?.low_stock_alert || 5) ? `Only ${stockQty} left` : 'In stock'}
            </p>
          )}

          {stockMessage && (
            <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-3 py-2">{stockMessage}</div>
          )}
          {cartError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{cartError}</div>
          )}

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

          {/* Prescription section - shows for BOTH Glasses AND Lenses */}
          {(isGlasses || isLenses) && (
            <PrescriptionSection
              isLenses={isLenses}
              prescription={prescription}
              setPrescription={setPrescription}
            />
          )}

          <div>
            <AccordionItem title="Description">
              <p>{product.description}</p>
            </AccordionItem>

            {/* Size & Fit - only for Glasses (not sunglasses, not lenses) */}
            {isGlasses && (product.specifications?.lens_width || product.specifications?.bridge_width || product.specifications?.temple_length) && (
              <AccordionItem title="Size & Fit">
                {product.specifications?.lens_width && <p>Lens Width: {product.specifications.lens_width} mm</p>}
                {product.specifications?.bridge_width && <p>Bridge Width: {product.specifications.bridge_width} mm</p>}
                {product.specifications?.temple_length && <p>Temple Length: {product.specifications.temple_length} mm</p>}
              </AccordionItem>
            )}

            {/* Size Guide - for Glasses AND Sunglasses with photo icon */}
            {(isGlasses || isSunglasses) && (
              <AccordionItem title="Size Guide">
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>View Size Guide</span>
                </button>
              </AccordionItem>
            )}

            {/* Lens Specifications - only for Lenses (Blue Light Glasses) */}
            {isLenses && (product.specifications?.diameter || product.specifications?.base_curve || product.specifications?.water_content) && (
              <AccordionItem title="Lens Specifications">
                {product.specifications?.diameter && <p>Diameter: {product.specifications.diameter} mm</p>}
                {product.specifications?.base_curve && <p>Base Curve: {product.specifications.base_curve} mm</p>}
                {product.specifications?.water_content && <p>Water Content: {product.specifications.water_content}%</p>}
              </AccordionItem>
            )}

            {/* Materials - for all product types */}
            {(product.frame_material || product.lens_material || product.water_content || product.lens_type) && (
              <AccordionItem title="Materials">
                {product.frame_material && <p>Frame: {product.frame_material}</p>}
                {product.lens_material && <p>Lenses: {product.lens_material}</p>}
                {product.water_content && <p>Water Content: {product.water_content}%</p>}
                {product.lens_type && <p>Lens Type: {product.lens_type}</p>}
              </AccordionItem>
            )}

            {/* How to Use - only for lenses */}
            {isLenses && product.how_to_use && (
              <AccordionItem title="How to Use">
                <p>{product.how_to_use}</p>
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

          {/* ── Add to Cart + Try On ── */}
          <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex border border-gray-300">
                <button
                  onClick={() => { setStockMessage(''); setQuantity(q => Math.max(1, q - 1)) }}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >−</button>
                <span className="px-4 py-2 text-sm">{quantity}</span>
                <button
                  onClick={() => {
                    setStockMessage('')
                    if (maxQty !== null && quantity >= maxQty) {
                      setStockMessage(`Only ${maxQty} left.`)
                      return
                    }
                    setQuantity(q => q + 1)
                  }}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  disabled={maxQty !== null && quantity >= maxQty}
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !canAdd}
                className="flex-1 bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {addingToCart ? 'Adding...' : justAdded ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Check size={16} aria-hidden="true" />
                    Added
                  </span>
                ) : !canAdd ? 'Out of Stock' : 'Add to cart'}
              </button>
            </div>

            <button
              onClick={handleTryOn}
              className="w-full border-2 border-black text-black py-2.5 text-sm font-medium hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              👓 Virtual Try-On
            </button>
          </div>
        </div>
      </div>

      {/* ── REVIEWS SECTION ── */}
      <ProductReviews productId={product.product_id} />

    </div>
  )
}