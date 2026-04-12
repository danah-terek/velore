import { Link } from 'react-router-dom'

export default function EyewearCard({ image, name, price, description, colors }) {
    return (
        <div className="bg-gray-50 rounded-sm relative flex flex-col max-w-xs">

            {/* Virtual Try-on badge */}
            <Link to="/ai-advisor" className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-xs px-3 py-1 rounded-full text-gray-600 hover:bg-white transition">
                Virtual Try-on
            </Link>

            {/* Product image */}
            <div className="p-6">
                <img src={image} alt={name} className="w-full object-contain h-48" />
            </div>

            {/* Color dots */}
            <div className="flex gap-2 px-4 mb-3">
                {colors?.map((color, index) => (
                    <button
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>

            {/* Product info */}
            <div className="px-4 mb-4">
                <h3 className="font-medium text-sm text-gray-900 mb-1">{name}</h3>
                <p className="text-sm font-semibold text-gray-900 mb-1">${price}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 px-4 pb-4 mt-auto">
                <button className="flex-1 bg-black text-white text-sm py-2 px-4 hover:bg-gray-800 transition-colors">
                    Add to cart
                </button>
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>

        </div>
    )
}