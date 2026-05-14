import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../../shared/contexts';

const ProductCard = ({ product, onViewProduct }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const productId = product.product_id?.toString();
  const favorited = isFavorite(productId);
  const firstVariant = product.variants?.[0];
  const image = product.image || firstVariant?.images?.[0];
  const colors = product.variants?.map(v => v.color_hex) || [];

  return (
    <div className="bg-blue-100 rounded-sm relative flex flex-col w-full">
      {product.virtual_try_on && (
        <Link
          to="/ai-advisor"
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-gray-600 hover:bg-white transition z-10"
        >
          Virtual Try-on
        </Link>
      )}

      <Link to={`/product/${productId}`} className="block">
        <div className="p-3 md:p-4">
          {image ? (
            <img src={image} alt={product.name} className="w-full object-contain h-24 md:h-32" />
          ) : (
            <div className="w-full h-24 md:h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {colors.length > 0 && (
          <div className="flex gap-1 md:gap-2 px-3 md:px-4 mb-2">
            {colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[10px] text-gray-500">+{colors.length - 4}</span>
            )}
          </div>
        )}

        <div className="px-3 md:px-4 mb-3">
          <h3 className="font-medium text-xs md:text-sm text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-xs md:text-sm font-semibold text-gray-900">
              ${parseFloat(product.price).toFixed(2)}
            </p>
            {product.compare_price && (
              <p className="text-[10px] md:text-xs text-gray-400 line-through">
                ${parseFloat(product.compare_price).toFixed(2)}
              </p>
            )}
          </div>
          {product.brand && (
            <p className="text-[10px] text-gray-500 mt-0.5">{product.brand}</p>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-2 px-3 md:px-4 pb-3 md:pb-4 mt-auto">
        <button
          onClick={() => onViewProduct?.(productId)}
          className="flex-1 bg-black text-white text-xs md:text-sm py-1.5 md:py-2 px-2 md:px-4 hover:bg-gray-800 transition-colors"
        >
          View Product
        </button>

        <button
          onClick={() => toggleFavorite({
            id: productId,
            image,
            name: product.name,
            price: product.price,
            description: product.description,
            colors,
          })}
          className="transition-colors flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 md:w-5 md:h-5"
            fill={favorited ? 'red' : 'none'}
            viewBox="0 0 24 24"
            stroke={favorited ? 'red' : 'currentColor'}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;