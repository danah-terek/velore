import { Link } from 'react-router-dom'
import logo from '../../../assets/logoEye-blue.png'

const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const TikTokIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>
)

const MastercardBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, width: 42, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'rgba(255,255,255,0.06)' }}>
    <svg width="28" height="18" viewBox="0 0 34 22">
      <circle cx="13" cy="11" r="9" fill="#EB001B" />
      <circle cx="21" cy="11" r="9" fill="#F79E1B" opacity="0.95" />
      <path d="M17,4.5 a9,9 0 0 1 0,13 a9,9 0 0 1 0,-13z" fill="#FF5F00" />
    </svg>
  </div>
)

const WhishBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, padding: '0 8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'rgba(255,255,255,0.06)', gap: 4 }}>
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L1 5l2 7h8l2-7z" fill="#D0021B" />
      <path d="M7 1l2 4H5z" fill="#FF4444" />
    </svg>
    <span style={{ fontSize: 10, fontWeight: 700, color: '#ff6b6b', letterSpacing: '-0.02em' }}>whish</span>
    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>money</span>
  </div>
)

const PayPalBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, width: 42, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'rgba(255,255,255,0.06)' }}>
    <svg width="20" height="14" viewBox="0 0 24 28" fill="none">
      <path d="M11.65 1.5C8.32 1.5 5.56 3.96 5.56 7.63c0 1.63.53 3.1 1.48 4.23l-2.6 11.23c-.11.47.25.91.73.91h3.76c.4 0 .74-.27.83-.66l1.04-4.5c.09-.4.44-.68.85-.68h2.08c4.68 0 7.9-2.28 7.9-6.9 0-4.32-3.15-6.26-7.98-6.26z" fill="#001C64" opacity="0.3" />
      <path d="M10.15 0C6.82 0 4.06 2.46 4.06 6.13c0 4.2 3.03 6.47 6.94 6.47h2.15c.4 0 .74-.28.83-.68l1.32-5.71.04-.21c.09-.4.44-.68.85-.68h.42c2.72 0 4.8-.97 4.8-4.14C21.41 1.18 18.26 0 13.43 0H10.15z" fill="#5b9bd5" />
      <path d="M13.24 6.13c0 4.2-3.03 6.47-6.94 6.47H4.15c-.4 0-.74.28-.83.68L2.01 19c-.11.46.25.9.73.9h3.76c.4 0 .74-.28.83-.68l1.04-4.51.04-.17c.09-.4.44-.68.85-.68h.42c4.68 0 7.9-2.28 7.9-6.9 0-4.32-3.15-6.26-7.98-6.26h-2.4c.42 1.7.99 3.56.99 5.33z" fill="#76CDD6" />
    </svg>
  </div>
)

export default function Footer({ onContactOpen }) {
  return (
    <footer style={{ background: '#1E1D22', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Top accent line */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #76CDD6 30%, #76CDD6 70%, transparent 100%)', opacity: 0.5 }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px 0' }}>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>

          {/* Brand column */}
          <div>
            <img src={logo} alt="Velore" style={{ height: 36, width: 'auto', objectFit: 'contain', marginBottom: 20, filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
            <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.75, color: 'rgba(255,255,255,0.42)', maxWidth: 260, margin: '0 0 28px 0', fontFamily: "'Lato', sans-serif" }}>
              Eyewear crafted for your unique face. Precision-engineered frames, virtually tried on before you buy.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { href: 'https://instagram.com', icon: <InstagramIcon /> },
                { href: 'https://facebook.com', icon: <FacebookIcon /> },
                { href: 'https://tiktok.com', icon: <TikTokIcon /> },
              ].map(({ href, icon }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    transition: 'color 0.25s, border-color 0.25s, background 0.25s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#76CDD6'
                    e.currentTarget.style.borderColor = '#76CDD6'
                    e.currentTarget.style.background = 'rgba(118,205,214,0.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 20, fontFamily: "'Lato', sans-serif" }}>
              Shop
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'All Products', to: '/shop' },
                { label: 'Sunglasses', to: '/shop?category=Sunglasses' },
                { label: 'Optical Frames', to: '/shop?category=Optical%20Glasses' },
                { label: 'Contact Lenses', to: '/shop?category=Lenses' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: "'Lato', sans-serif", transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#76CDD6'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 20, fontFamily: "'Lato', sans-serif" }}>
              Company
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li>
                <Link to="/about" style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: "'Lato', sans-serif", transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#76CDD6'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                  Our Story
                </Link>
              </li>
              <li>
                <button
                  onClick={() => onContactOpen?.()}
                  style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Lato', sans-serif", transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#76CDD6'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                  Contact
                </button>
              </li>
              <li>
                <Link to="/blogs" style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: "'Lato', sans-serif", transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#76CDD6'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                  Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 20, fontFamily: "'Lato', sans-serif" }}>
              Policies
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Refund Policy', to: '/refund-policy' },
                { label: 'Privacy Policy', to: '/privacy-policy' },
                { label: 'Terms of Service', to: '/terms-of-service' },
                { label: 'Shipping Policy', to: '/shipping-policy' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: "'Lato', sans-serif", transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#76CDD6'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '20px 0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'Lato', sans-serif", letterSpacing: '0.04em' }}>
            © 2026 Velore. All rights reserved.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MastercardBadge />
            <WhishBadge />
            <PayPalBadge />
          </div>
        </div>
      </div>
    </footer>
  )
}