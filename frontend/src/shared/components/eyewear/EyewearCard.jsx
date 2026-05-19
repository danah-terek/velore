import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Heart } from 'lucide-react'
import { useFavorites } from '../../contexts'
import useCurrency from '../../hooks/useCurrency'
import { resolveImageUrl } from '../../utils/imageUrl'
import cartService from '../../../features/cart/cartService'

export default function EyewearCard({
  id,
  productId,
  product_id,
  image,
  product_variants,
  productVariants,
  name,
  price,
  description,
  colors,
}) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const { formatPrice } = useCurrency()
  const [addingToCart, setAddingToCart] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  
  const productIdFinal = product_id || productId || id
  const favorited = isFavorite(productIdFinal)
  const variantImages =
    product_variants?.[0]?.images ||
    productVariants?.[0]?.images ||
    null
  const firstVariantId =
    product_variants?.[0]?.variant_id ||
    productVariants?.[0]?.variant_id ||
    null
  const firstVariantStock =
    product_variants?.[0]?.stock_quantity ??
    productVariants?.[0]?.stock_quantity ??
    null
  const imageRaw = image || variantImages?.[0] || null
  const imageUrl = resolveImageUrl(imageRaw) || ''

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
  
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  
    // Guest mode: localStorage only
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      const existing = localCart.find((item) => item.productId === productIdFinal && (item.variantId || null) === (firstVariantId || null))
    
      if (existing) {
        const maxQty = typeof firstVariantStock === 'number' ? firstVariantStock : null
        const nextQty = existing.quantity + 1
        existing.quantity = maxQty !== null ? Math.min(nextQty, maxQty) : nextQty
      } else {
        localCart.push({
          productId: productIdFinal,
          variantId: firstVariantId,
          name,
          price: parseFloat(price),
          image: image || '',
          quantity: 1,
          availableStock: typeof firstVariantStock === 'number' ? firstVariantStock : null,
        })
      }
    
      localStorage.setItem('guestCart', JSON.stringify(localCart))
    
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1200)
      return
    }
  
    // Logged in: API only
    setAddingToCart(true)
    try {
      await cartService.addItem({
        productId: Number(productIdFinal),
        variantId: firstVariantId ? Number(firstVariantId) : undefined,
        quantity: 1,
      })
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1200)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className="v-card-luxury v-hover-lift v-motion relative flex flex-col w-full overflow-hidden">
      <Link
        to="/ai-advisor"
        className="absolute top-3 right-3 bg-[rgb(var(--velore-pearl))]/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-[rgba(var(--velore-fg),0.7)] hover:bg-[rgb(var(--velore-pearl))] v-motion z-10"
      >
        Virtual Try-on
      </Link>

      <Link to={`/product/${productIdFinal}`} className="block">
        <div className="p-3 md:p-6">
          <div className="v-card-media p-3 md:p-4">
            <div className="aspect-[4/3] w-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  img.src = ''
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-1 md:gap-2 px-3 md:px-4 mb-2 md:mb-3">
          {colors?.map((color, index) => (
            <div
              key={index}
              className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="px-3 md:px-4 mb-3 md:mb-4">
          <h3 className="font-medium text-xs md:text-sm text-[rgb(var(--velore-fg))] mb-1 line-clamp-2">{name}</h3>
<p className="text-xs md:text-sm v-price mb-1">{formatPrice(price)}</p>          
<p className="text-xs text-[rgba(var(--velore-fg),0.6)] hidden md:block line-clamp-2">{description}</p>
        </div>
      </Link>

      <div className="flex items-center gap-2 px-3 md:px-4 pb-3 md:pb-4 mt-auto">
        <button 
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="flex-1 v-btn-primary text-xs md:text-sm py-2 disabled:opacity-60"
        >
          {addingToCart ? 'Adding…' : justAdded ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Check size={16} aria-hidden="true" />
              Added
            </span>
          ) : (
            'Add to cart'
          )}
        </button>

        <button
          onClick={() => toggleFavorite({ id: productIdFinal, image, name, price, description, colors })}
          className="v-icon-btn v-motion"
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            aria-hidden="true"
            className={favorited ? 'text-red-500 fill-red-500' : 'text-[rgba(var(--velore-fg),0.75)]'}
          />
        </button>
      </div>
    </div>
  )
}