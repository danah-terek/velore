import { useParams, Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Check, Sliders, Info, ShieldCheck, HelpCircle, X } from 'lucide-react'
import shopService from "../shop/shopService"
import useCurrency from '../../shared/hooks/useCurrency'
import cartService from "../cart/cartService"
import sizeguide from '../../assets/sizeguide.png'
import { resolveImageUrl } from '../../shared/utils/imageUrl'
import ProductReviews from './ProductReviews'

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-sm font-medium text-neutral-900 text-left transition-colors hover:text-neutral-500"
      >
        {title}
        <span className="text-lg text-neutral-400 font-light ml-4">{open ? '−' : '+'}</span>
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100 pb-4' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="text-sm text-neutral-600 leading-relaxed space-y-1">
            {children}
          </div>
        </div>
      </div>
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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
    >
      <div className="relative bg-white w-full max-w-lg md:max-w-2xl rounded-2xl shadow-xl border border-neutral-100 overflow-hidden transform transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-neutral-400" />
            <h3 className="text-base font-semibold text-neutral-900">Size Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 transition-colors p-1.5 rounded-full hover:bg-neutral-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 bg-neutral-50/50 flex items-center justify-center">
          <div className="bg-white p-4 border border-neutral-100 shadow-sm rounded-xl w-full">
            <img
              src={sizeguide}
              alt="Size Guide"
              className="w-full h-auto object-contain max-h-[60vh] mx-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function PrescriptionField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-neutral-500 font-medium">{label}</label>
      <div className="relative">
        <input
          type="number"
          step="0.25"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0.00"
          className="border border-neutral-200 px-3 py-2 text-sm text-neutral-800 w-full rounded-md outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-neutral-50/50 focus:bg-white"
        />
      </div>
    </div>
  )
}

function PrescriptionSection({ isLenses, prescription, setPrescription }) {
  return (
    <div className="border border-neutral-200/80 bg-neutral-50/30 rounded-2xl p-5 md:p-6 flex flex-col gap-5 my-2 shadow-sm">
      <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
        <ShieldCheck size={16} className="text-neutral-500" />
        <span className="text-sm font-semibold text-neutral-800">Prescription Configuration</span>
      </div>
      
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-sm font-medium text-neutral-900">SPH (Sphere)</p>
          <HelpCircle size={14} className="text-neutral-300" title="Main lens power correction" />
        </div>
        <p className="text-xs text-neutral-400 mb-3">Main correction metric for vision variance.</p>
        <div className="grid grid-cols-2 gap-3">
          <PrescriptionField label="Right Eye (OD)" value={prescription.sph_r} onChange={val => setPrescription(p => ({ ...p, sph_r: val }))} />
          <PrescriptionField label="Left Eye (OS)" value={prescription.sph_l} onChange={val => setPrescription(p => ({ ...p, sph_l: val }))} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-sm font-medium text-neutral-900">CYL (Cylinder)</p>
        </div>
        <p className="text-xs text-neutral-400 mb-3">Astigmatism correction framework.</p>
        <div className="grid grid-cols-2 gap-3">
          <PrescriptionField label="Right Eye (OD)" value={prescription.cyl_r} onChange={val => setPrescription(p => ({ ...p, cyl_r: val }))} />
          <PrescriptionField label="Left Eye (OS)" value={prescription.cyl_l} onChange={val => setPrescription(p => ({ ...p, cyl_l: val }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-neutral-100/70 pt-4">
        <div>
          <p className="text-sm font-medium text-neutral-900 mb-1">Axis</p>
          <p className="text-xs text-neutral-400 mb-2">Required if CYL is specified.</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                max="180"
                step="1"
                value={prescription.axis}
                onChange={e => setPrescription(p => ({ ...p, axis: e.target.value }))}
                placeholder="0"
                className="border border-neutral-200 px-3 py-2 text-sm text-neutral-800 w-full rounded-md outline-none focus:border-neutral-900 transition-all bg-neutral-50/50 focus:bg-white"
              />
            </div>
            <span className="text-sm text-neutral-400">°</span>
          </div>
        </div>

        {!isLenses && (
          <div>
            <p className="text-sm font-medium text-neutral-900 mb-1">PD (Pupillary Distance)</p>
            <p className="text-xs text-neutral-400 mb-2">Center-to-center pupil metric.</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="40"
                  max="80"
                  step="0.5"
                  value={prescription.pd}
                  onChange={e => setPrescription(p => ({ ...p, pd: e.target.value }))}
                  placeholder="63"
                  className="border border-neutral-200 px-3 py-2 text-sm text-neutral-800 w-full rounded-md outline-none focus:border-neutral-900 transition-all bg-neutral-50/50 focus:bg-white"
                />
              </div>
              <span className="text-sm text-neutral-400">mm</span>
            </div>
          </div>
        )}
      </div>
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
          return
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
  const getFirstImage = (img) => {
    if (!img) return ''
    if (Array.isArray(img)) return img[0] || ''
    if (typeof img === 'string') return img.trim().split(' ')[0] || ''
    return ''
  }
  const tryOnImage = getFirstImage(selectedVariant?.tryon_images) || getFirstImage(selectedVariant?.images) || ''
  const name = encodeURIComponent(product.name)
  const imageParam = encodeURIComponent(tryOnImage)
  navigate(`/try-on?image=${imageParam}&name=${name}`)
}

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
        <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-neutral-400">Loading product details...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="text-sm font-medium text-neutral-400">Product not found</p>
        <p className="text-base text-neutral-600 mt-2">The specified product profile could not be loaded.</p>
      </div>
    )
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

  const categoryName = product.categories?.name?.toLowerCase()
  const isLenses = categoryName === 'lenses' || categoryName === 'blue light glasses'
  const isGlasses = categoryName === 'eyeglasses' || categoryName === 'glasses' || categoryName === 'optical glasses'
  const isSunglasses = categoryName === 'sunglasses'

  return (
    <div className="px-4 md:px-8 lg:px-12 py-10 max-w-6xl mx-auto bg-white text-neutral-900">
      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* REFINED 50/50 BALANCED GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-start">
        
        {/* LEFT — COMPACT PICTURE CANVAS */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 w-full max-w-xl mx-auto lg:mx-0">
          
          {/* Main Visual Node (Kept proportionate and max-height optimized) */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden relative group aspect-square max-h-[520px]">
            <img
              src={resolveImageUrl(images[selectedImage]) || ''}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-102"
              decoding="async"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '' }}
            />
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md border border-neutral-200/40 text-xs px-2.5 py-1 rounded-full shadow-sm text-neutral-500">
              {selectedImage + 1} / {images.length}
            </div>
          </div>

          {/* Under-Image Micro Horizontal Thumb Array */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 relative transition-all duration-300 bg-neutral-50 border p-0.5 ${
                  selectedImage === i 
                    ? 'border-neutral-900 shadow-sm scale-[1.02]' 
                    : 'border-neutral-100 hover:border-neutral-300'
                }`}
              >
                <img
                  src={resolveImageUrl(img) || ''}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '' }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — DETAILED DESIGN SPECIFICATIONS */}
        <div className="flex flex-col gap-5 w-full">
          
          {/* Header Typography Group */}
          <div className="border-b border-neutral-100 pb-4">
            <div className="mb-1.5">
              <span className="text-xs bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded text-neutral-500">
                Collection Edition
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-950 mb-2">{product.name}</h1>
            
            <div className="flex items-baseline gap-2.5">
              <span className="text-xl font-bold text-neutral-950">{formatPrice(finalPrice)}</span>
              {product.compare_price && (
                <span className="text-sm text-neutral-400 line-through font-light">{formatPrice(product.compare_price)}</span>
              )}
            </div>
          </div>

          {/* Technical Blueprint Layout */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm bg-neutral-50/40 p-4 rounded-xl border border-neutral-100">
            {product.brands && (
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Brand</span>
                <span className="font-medium text-neutral-800">{product.brands.name}</span>
              </div>
            )}
            {product.categories && (
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Category</span>
                <span className="font-medium text-neutral-800">{isLenses ? 'Lenses' : product.categories.name}</span>
              </div>
            )}
            {!isLenses && product.specifications?.frame_shape && (
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Frame Shape</span>
                <span className="font-medium text-neutral-800">{product.specifications.frame_shape}</span>
              </div>
            )}
            {!isLenses && product.specifications?.face_shape && (
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Face Shape</span>
                <span className="font-medium text-neutral-800">{product.specifications.face_shape}</span>
              </div>
            )}
            {product.specifications?.material && (
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Material</span>
                <span className="font-medium text-neutral-800">{product.specifications.material}</span>
              </div>
            )}
            {product.gender && (
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Gender</span>
                <span className="font-medium text-neutral-800 capitalize">{product.gender}</span>
              </div>
            )}
          </div>

          {/* Color Matrix Controls */}
          {colors.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500 block">
                Color: <span className="text-neutral-850 font-normal">{selectedVariant?.color_name || colors[0].color_name}</span>
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {colors.map(v => (
                  <button
                    key={v.variant_id}
                    onClick={() => {
                      setSelectedVariant(v)
                      setSelectedImage(0)
                    }}
                    title={v.color_name}
                    className={`w-6 h-6 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      selectedVariant?.variant_id === v.variant_id 
                        ? 'ring-2 ring-neutral-900 border-white ring-offset-1 scale-105' 
                        : 'border-neutral-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: v.color_hex || '#ccc' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Profiles Matrix */}
          {sizes.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500 block">Select Size</label>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(size => {
                  const variantForSize = product.product_variants.find(v => v.size === size)
                  const isSelected = selectedVariant?.size === size
                  return (
                    <button
                      key={size}
                      onClick={() => variantForSize && setSelectedVariant(variantForSize)}
                      className={`px-4 py-2 text-sm border rounded-lg transition-all ${
                        isSelected 
                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm scale-[1.02]' 
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Status Badges Row */}
          <div className="flex gap-1.5 flex-wrap">
            {product.prescription_ready && (
              <span className="text-xs bg-neutral-950 text-white border border-neutral-900 px-2.5 py-0.5 rounded font-medium">Prescription Ready</span>
            )}
            {product.virtual_try_on && (
              <span className="text-xs bg-white text-neutral-800 border border-neutral-200 px-2.5 py-0.5 rounded font-medium">Virtual Try-On</span>
            )}
            {product.is_bundle && (
              <span className="text-xs bg-neutral-100 text-neutral-600 border border-neutral-200 px-2.5 py-0.5 rounded font-medium">Bundle Package</span>
            )}
          </div>

          {/* Stock Monitor Alert System */}
          {stockQty !== null && (
            <div className="flex items-center gap-2 border-t border-neutral-100 pt-3">
              <span className={`w-2 h-2 rounded-full ${stockQty === 0 ? 'bg-red-500' : stockQty <= (selectedVariant?.low_stock_alert || 5) ? 'bg-orange-400 animate-pulse' : 'bg-green-500'}`} />
              <p className={`text-xs ${stockQty === 0 ? 'text-red-500 font-medium' : stockQty <= (selectedVariant?.low_stock_alert || 5) ? 'text-orange-500 font-semibold' : 'text-neutral-400'}`}>
                {stockQty === 0 ? 'Out of stock' : stockQty <= (selectedVariant?.low_stock_alert || 5) ? `Low Stock: Only ${stockQty} remaining` : 'In Stock'}
              </p>
            </div>
          )}

          {stockMessage && (
            <div className="text-sm text-orange-600 bg-orange-50/60 border border-orange-100 px-4 py-2 rounded-xl">{stockMessage}</div>
          )}
          {cartError && (
            <div className="text-sm text-red-600 bg-red-50/60 border border-red-100 px-4 py-2 rounded-xl">{cartError}</div>
          )}

          {/* Adaptive Prescription Drawer Injection */}
          {(isGlasses || (isLenses && product.specifications?.prescription_applies !== false)) && (
            <PrescriptionSection
              isLenses={isLenses}
              prescription={prescription}
              setPrescription={setPrescription}
            />
          )}

          {/* DOCK TRANSACTION SYSTEM */}
          <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100">
            <div className="flex gap-3">
              {/* Counter */}
              <div className="flex items-center border border-neutral-200 bg-neutral-50/50 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => { setStockMessage(''); setQuantity(q => Math.max(1, q - 1)) }}
                  className="px-4 h-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-lg"
                >
                  −
                </button>
                <span className="px-2 text-sm font-semibold text-neutral-800 w-8 text-center select-none">{quantity}</span>
                <button
                  onClick={() => {
                    setStockMessage('')
                    if (maxQty !== null && quantity >= maxQty) {
                      setStockMessage(`Only ${maxQty} left.`)
                      return
                    }
                    setQuantity(q => q + 1)
                  }}
                  className="px-4 h-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-lg disabled:opacity-30"
                  disabled={maxQty !== null && quantity >= maxQty}
                >
                  +
                </button>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !canAdd}
                className="flex-1 bg-neutral-950 text-white py-3.5 px-6 rounded-xl text-sm font-medium hover:bg-neutral-800 active:scale-[0.99] transition-all duration-300 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:transform-none shadow-sm flex items-center justify-center"
              >
                {addingToCart ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : justAdded ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Check size={16} className="animate-bounce" />
                    Added to Cart
                  </span>
                ) : !canAdd ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>

            {/* Virtual Try-On Link */}
            {product.virtual_try_on && (
              <button
                onClick={handleTryOn}
                className="w-full border border-neutral-200 text-neutral-900 bg-white py-3.5 px-6 rounded-xl text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>✨</span> Launch Virtual Try-On
              </button>
            )}
          </div>

          {/* Disclosure Navigation Dropdowns */}
          <div className="border-t border-neutral-100 pt-2 mt-2">
            <AccordionItem title="Description">
              <p>{product.description}</p>
            </AccordionItem>

            {isGlasses && (product.specifications?.lens_width || product.specifications?.bridge_width || product.specifications?.temple_length) && (
              <AccordionItem title="Dimensions & Proportions">
                {product.specifications?.lens_width && <p className="flex justify-between py-1"><span className="text-neutral-400">Lens Width</span> <span className="text-neutral-800 font-medium">{product.specifications.lens_width} mm</span></p>}
                {product.specifications?.bridge_width && <p className="flex justify-between py-1"><span className="text-neutral-400">Bridge Width</span> <span className="text-neutral-800 font-medium">{product.specifications.bridge_width} mm</span></p>}
                {product.specifications?.temple_length && <p className="flex justify-between py-1"><span className="text-neutral-400">Temple Arm Length</span> <span className="text-neutral-800 font-medium">{product.specifications.temple_length} mm</span></p>}
              </AccordionItem>
            )}

            {(isGlasses || isSunglasses) && (
              <AccordionItem title="Sizing Information">
                <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-neutral-400" />
                    <span className="text-neutral-600 text-xs">Calibration chart ready.</span>
                  </div>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-neutral-900 hover:underline text-xs font-semibold"
                  >
                    View Size Guide
                  </button>
                </div>
              </AccordionItem>
            )}

            {isLenses && (product.specifications?.diameter || product.specifications?.base_curve || product.specifications?.water_content) && (
              <AccordionItem title="Curvature Specifications">
                {product.specifications?.diameter && <p className="flex justify-between py-1"><span className="text-neutral-400">Diameter</span> <span className="text-neutral-800 font-medium">{product.specifications.diameter} mm</span></p>}
                {product.specifications?.base_curve && <p className="flex justify-between py-1"><span className="text-neutral-400">Base Curve</span> <span className="text-neutral-800 font-medium">{product.specifications.base_curve} mm</span></p>}
                {product.specifications?.water_content && <p className="flex justify-between py-1"><span className="text-neutral-400">Water Content</span> <span className="text-neutral-800 font-medium">{product.specifications.water_content}%</span></p>}
              </AccordionItem>
            )}

            {(product.frame_material || product.lens_material || product.water_content || product.lens_type) && (
              <AccordionItem title="Material & Composition">
                {product.frame_material && <p className="flex justify-between py-1"><span className="text-neutral-400">Frame Material</span> <span className="text-neutral-800 font-medium">{product.frame_material}</span></p>}
                {product.lens_material && <p className="flex justify-between py-1"><span className="text-neutral-400">Lens Material</span> <span className="text-neutral-800 font-medium">{product.lens_material}</span></p>}
                {product.lens_type && <p className="flex justify-between py-1"><span className="text-neutral-400">Lens Type</span> <span className="text-neutral-800 font-medium">{product.lens_type}</span></p>}
              </AccordionItem>
            )}
          </div>

        </div>
      </div>

      {/* FEEDBACK & REVIEWS */}
      <div className="mt-14 md:mt-20 pt-10 border-t border-neutral-100">
        <ProductReviews productId={product.product_id} />
      </div>
    </div>
  )
}