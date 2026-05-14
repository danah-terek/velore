import sketchImage from '../assets/Veloresketch.jpeg'

export default function About() {
  return (
    <div className="v-page">
      <section className="v-section v-section-muted">
        <div className="v-container">
          <p className="v-eyebrow mb-3">Velore</p>
          <h1 className="v-h1 mb-4">A quieter kind of luxury.</h1>
          <p className="v-lead max-w-2xl">
            We craft eyewear with calm materials, refined lines, and a fit-first approach—so you can
            choose confidently before you buy.
          </p>
        </div>
      </section>

      <section className="v-section">
        <div className="v-container grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="v-card-luxury p-6 md:p-8">
            <h2 className="v-h2 mb-3">Our story</h2>
            <p className="v-body">
              Velore is designed around clarity—clear pricing, clear sizing, and clear service.
              Whether you’re browsing new frames or returning to a classic shape, we focus on the
              details that make eyewear feel effortless.
            </p>
            <div className="mt-6 v-divider" />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Fit-first', value: 'Guided selection' },
                { label: 'Refined', value: 'Premium finishes' },
                { label: 'Support', value: 'Human help' },
              ].map((item) => (
                <div key={item.label} className="v-surface p-4">
                  <div className="v-label">{item.label}</div>
                  <div className="mt-1 text-sm text-[rgba(var(--velore-fg),0.78)]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="v-card-luxury p-3 md:p-4">
            <div className="v-card-media overflow-hidden">
              <img
                src={sketchImage}
                alt="Velore design sketches"
                className="w-full h-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

