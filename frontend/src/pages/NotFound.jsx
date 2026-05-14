import { Link } from 'react-router-dom'
import { Glasses } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="v-page">
      <section className="v-section v-section-muted">
        <div className="v-container">
          <div className="v-empty p-8 md:p-10 flex flex-col items-center text-center">
            <div className="v-icon-circle mb-4">
              <Glasses size={18} aria-hidden="true" />
            </div>
            <h1 className="v-h2 mb-2">Page not found</h1>
            <p className="v-body max-w-md">
              The page you’re looking for doesn’t exist (or it moved). Head back to the store and
              continue browsing.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to="/" className="v-btn-primary">
                Home
              </Link>
              <Link to="/shop" className="v-btn-secondary">
                Shop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

