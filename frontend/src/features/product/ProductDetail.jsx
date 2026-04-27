import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import shopService from "../shop/shopService"

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
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const response = await shopService.getProduct(id)
      setProduct(response.data)
      if (response.data.colors?.length > 0) {
        setSelectedColor(response.data.colors[0])
      }
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!product) {
    return <div className="p-10 text-sm text-gray-500">Product not found</div>
  }

  const images = [product.image, product.image, product.image]

  return (
    <div className="px-4 md:px-16 py-8 max-w-6xl mx-auto">
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
            <p className="text-lg font-medium text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

          {product.brand && (
            <p className="text-sm text-gray-600">Brand: <span className="font-medium">{product.brand.name || product.brand}</span></p>
          )}
          {product.frameShape && (
            <p className="text-sm text-gray-600">Frame Shape: <span className="font-medium">{product.frameShape}</span></p>
          )}
          {product.material && (
            <p className="text-sm text-gray-600">Material: <span className="font-medium">{product.material}</span></p>
          )}

          {/* Size & fit */}
          <div className="border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Size & fit</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Lens width: 52 mm</p>
              <p>Bridge width: 18 mm</p>
              <p>Temple length: 145 mm</p>
            </div>
          </div>

          {/* Accordions */}
          <div>
            <AccordionItem title="Description">
              <p>{product.description}</p>
            </AccordionItem>
            <AccordionItem title="Shipping & exchange">
              <p>Free shipping on orders over $50. Returns accepted within 30 days.</p>
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
    </div>
  )
}