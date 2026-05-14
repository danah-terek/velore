import { Link } from 'react-router-dom'

export default function PolicyPlaceholder({ title = 'Policy' }) {
  return (
    <div className="v-page">
      <section className="v-section v-section-muted">
        <div className="v-container">
          <p className="v-eyebrow mb-3">Velore policies</p>
          <h1 className="v-h1 mb-4">{title}</h1>
          <p className="v-lead max-w-2xl">
            This page is being finalized. If you need help right now, contact us and we’ll respond
            promptly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop" className="v-btn-primary">
              Continue shopping
            </Link>
            <Link to="/about" className="v-btn-secondary">
              About Velore
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

