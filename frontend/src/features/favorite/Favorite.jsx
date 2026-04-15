import { Link } from 'react-router-dom'
import { useFavorites } from '../../shared/contexts'  // ← FIXED
import { EyewearCard } from '../../shared/components/eyewear'  // ← FIXED

const Favorite = () => {
  const { favorites, clearFavorites } = useFavorites()

  return (
    <div className="px-6 md:px-16 py-12 min-h-screen">
<div className="flex items-center justify-between mb-8">
  <h1 className="text-2xl font-semibold">Your Favorites</h1>
  <button
    onClick={clearFavorites}
    className="text-sm text-gray-400 hover:text-red-500 transition-colors underline"
  >
    Clear all
  </button>
</div>




      {favorites.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-sm mb-4">You haven't added any items to your favorites yet.</p>
          <Link to="/shop" className="bg-gray-900 text-white text-sm px-6 py-2.5 hover:bg-gray-700 transition-colors">
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {favorites.map(product => (
            <EyewearCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorite