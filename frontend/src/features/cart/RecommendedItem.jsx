import { Link } from 'react-router-dom'
import useCurrency from '../../shared/hooks/useCurrency'
import { resolveImageUrl } from '../../shared/utils/imageUrl'

export default function RecommendedItem({ product }) {
  const { formatPrice } = useCurrency()
  
  const productId = product.product_id || product.productId
  const name = product.name || 'Product'
  const price = parseFloat(product.price || 0)
  const imageRaw = product.image || product.product_variants?.[0]?.images?.[0] || null
  const imageUrl = resolveImageUrl(imageRaw) || null
  const brand = product.brand || product.brands?.name || null

  return (
    <Link
      to={`/product/${productId}`}
      className="flex-shrink-0 w-[140px] bg-white b-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group border border-gray-100"
    >
      {/* Image */}
      <div className="w-full aspect-square bg-gray-50 flex items-center justify-center p-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3">
        {brand && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate mb-0.5">
            {brand}
          </p>
        )}
        <p className="text-xs text-gray-900 font-medium truncate mb-1 group-hover:text-gray-700">
          {name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{formatPrice(price)}</p>
          <span className="text-[10px] text-gray-400 group-hover:text-gray-900 transition-colors">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}