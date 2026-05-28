import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Check } from 'lucide-react'
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
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)

  const productIdFinal = product_id || productId || id
  const favorited = isFavorite(productIdFinal)
  const variants = product_variants || productVariants || []

  const swatches = useMemo(() => {
    return variants
      .filter(v => v.color_name || v.color_hex)
      .map(v => ({
        variantId: v.variant_id,
        name: v.color_name,
        hex: v.color_hex || '#ccc',
        image: v.images?.[0] || null,
        stock: v.stock_quantity ?? null,
        adjustment: v.price_adjustment ? parseFloat(v.price_adjustment) : 0,
      }))
  }, [variants])

  const active = swatches[selectedColorIndex]
  const firstVariantId = active?.variantId || variants[0]?.variant_id || null
  const firstVariantStock = active?.stock ?? variants[0]?.stock_quantity ?? null
  const imageRaw = active?.image || image || variants[0]?.images?.[0] || null
  const imageUrl = resolveImageUrl(imageRaw) || ''
  const displayPrice = active?.adjustment
    ? parseFloat(price) + active.adjustment
    : parseFloat(price)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    if (!token) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      const existing = localCart.find(
        item => item.productId === productIdFinal &&
          (item.variantId || null) === (firstVariantId || null)
      )
      if (existing) {
        const maxQty = typeof firstVariantStock === 'number' ? firstVariantStock : null
        const nextQty = existing.quantity + 1
        existing.quantity = maxQty !== null ? Math.min(nextQty, maxQty) : nextQty
      } else {
        localCart.push({
          productId: productIdFinal,
          variantId: firstVariantId,
          name,
          price: displayPrice,
          image: imageUrl,
          quantity: 1,
          availableStock: typeof firstVariantStock === 'number' ? firstVariantStock : null,
        })
      }
      localStorage.setItem('guestCart', JSON.stringify(localCart))
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1400)
      return
    }

    setAddingToCart(true)
    try {
      await cartService.addItem({
        productId: Number(productIdFinal),
        variantId: firstVariantId ? Number(firstVariantId) : undefined,
        quantity: 1,
      })
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1400)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <>
      <style>{`
        .ew-card {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          background: var(--velore-card-bg, #fff);
          border: none;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
          transition:
            transform 0.5s cubic-bezier(0.23, 1, 0.32, 1),
            box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          will-change: transform;
        }

        .ew-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06);
        }

        .ew-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: rgb(var(--velore-canvas-muted, 248 248 246));
        }

        .ew-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 1.5rem;
          transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .ew-card:hover .ew-img-wrap img {
          transform: scale(1.06);
        }

        /* Fav button — hidden until hover on desktop, always visible on touch devices */
        .ew-fav {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 0.5px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transform: scale(0.82);
          transition:
            opacity 0.28s ease,
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            background 0.2s ease;
          z-index: 2;
        }

        .ew-card:hover .ew-fav {
          opacity: 1;
          transform: scale(1);
        }

        .ew-fav:hover {
          background: rgba(255,255,255,1);
        }

        /* On touch screens there's no hover — always show the fav button */
        @media (hover: none) {
          .ew-fav {
            opacity: 1;
            transform: scale(1);
          }
        }

        .ew-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ew-meta {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }

        .ew-name {
          font-size: 13px;
          font-weight: 500;
          color: rgb(var(--velore-fg, 17 17 17));
          line-height: 1.4;
          flex: 1;
        }

        .ew-price {
          font-size: 13px;
          font-weight: 500;
          color: rgb(var(--velore-fg, 17 17 17));
          white-space: nowrap;
        }

        .ew-swatches {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .ew-swatch {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          border: 1.5px solid transparent;
          cursor: pointer;
          padding: 0;
          background: transparent;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease;
          position: relative;
        }

        .ew-swatch:hover {
          transform: scale(1.25);
        }

        .ew-swatch.active {
          border-color: rgb(var(--velore-fg, 17 17 17));
          transform: scale(1.18);
          box-shadow: 0 0 0 1.5px rgb(var(--velore-card-bg-raw, 255 255 255)) inset;
        }

        .ew-swatch-label {
          font-size: 10px;
          color: rgba(var(--velore-fg, 17 17 17), 0.45);
          margin-left: 5px;
          letter-spacing: 0.02em;
        }

        .ew-add-btn {
          width: 100%;
          height: 38px;
          border-radius: 10px;
          border: 0.5px solid rgba(var(--velore-fg, 17 17 17), 0.28);
          background: transparent;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: rgb(var(--velore-fg, 17 17 17));
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition:
            background 0.28s ease,
            border-color 0.28s ease,
            color 0.28s ease,
            transform 0.15s ease;
        }

        .ew-add-btn:hover:not(:disabled),
        .ew-add-btn.added {
          background: rgb(var(--velore-fg, 17 17 17));
          border-color: rgb(var(--velore-fg, 17 17 17));
          color: rgb(var(--velore-card-bg-raw, 255 255 255));
        }

        .ew-add-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .ew-add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="ew-card">
        {/* Image */}
        <Link to={`/product/${productIdFinal}`} className="block">
          <div className="ew-img-wrap">
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = ''
              }}
            />
          </div>
        </Link>

        {/* Favorite */}
        <button
          className="ew-fav"
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite({ id: productIdFinal, image: imageUrl, name, price: displayPrice, description, colors })
          }}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={15}
            aria-hidden="true"
            style={{
              color: favorited ? '#e24b4a' : 'rgba(17,17,17,0.6)',
              fill: favorited ? '#e24b4a' : 'none',
              transition: 'color 0.2s ease, fill 0.2s ease',
            }}
          />
        </button>

        {/* Body */}
        <div className="ew-body">
          {/* Name + Price */}
          <div className="ew-meta">
            <span className="ew-name">{name}</span>
            <span className="ew-price">{formatPrice(displayPrice)}</span>
          </div>

          {/* Swatches */}
          {swatches.length > 0 ? (
            <div className="ew-swatches">
              {swatches.map((s, i) => (
                <button
                  key={s.variantId || i}
                  className={`ew-swatch${selectedColorIndex === i ? ' active' : ''}`}
                  style={{ backgroundColor: s.hex }}
                  title={s.name}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedColorIndex(i)
                  }}
                />
              ))}
              {active?.name && (
                <span className="ew-swatch-label">{active.name}</span>
              )}
            </div>
          ) : colors?.length > 0 ? (
            <div className="ew-swatches">
              {colors.map((color, i) => (
                <div key={i} className="ew-swatch" style={{ backgroundColor: color }} />
              ))}
            </div>
          ) : null}

          {/* Add to cart */}
          <button
            className={`ew-add-btn${justAdded ? ' added' : ''}`}
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              'Adding…'
            ) : justAdded ? (
              <>
                <Check size={14} aria-hidden="true" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag size={14} aria-hidden="true" />
                Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}