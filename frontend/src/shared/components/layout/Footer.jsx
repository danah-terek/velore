import { Link } from 'react-router-dom'
import logo from '../../../assets/logoEye-blue.png'

// ── Social icons ────────────────────────────────────────────────────────────
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const TikTokIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>
)

// ── Payment badges ───────────────────────────────────────────────────────────
const MastercardBadge = () => (
  <div className="flex items-center justify-center h-8 w-12 border border-gray-200 rounded bg-white overflow-hidden shadow-2xs">
    <svg width="34" height="22" viewBox="0 0 34 22">
      <circle cx="13" cy="11" r="9" fill="#EB001B" />
      <circle cx="21" cy="11" r="9" fill="#F79E1B" opacity="0.95" />
      <path d="M17,4.5 a9,9 0 0 1 0,13 a9,9 0 0 1 0,-13z" fill="#FF5F00" />
    </svg>
  </div>
)

const WhishBadge = () => (
  <div className="flex items-center justify-center h-8 px-2.5 border border-gray-200 rounded bg-white gap-1 shadow-2xs">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L1 5l2 7h8l2-7z" fill="#D0021B" />
      <path d="M7 1l2 4H5z" fill="#FF4444" />
    </svg>
    <span className="text-xs font-bold text-red-600 tracking-tight leading-none">whish</span>
    <span className="text-xs text-gray-400 leading-none">money</span>
  </div>
)

// ── FIXED BRAND-ACCURATE PAYPAL BADGE ────────────────────────────────────────
const PayPalBadge = () => (
  <div className="flex items-center justify-center h-8 w-12 border border-gray-200 rounded bg-white shadow-2xs">
    <svg width="24" height="16" viewBox="0 0 24 28" fill="none" className="-mt-0.5">
      {/* Shadow layer background P */}
      <path
        d="M11.65 1.5C8.32 1.5 5.56 3.96 5.56 7.63c0 1.63.53 3.1 1.48 4.23l-2.6 11.23c-.11.47.25.91.73.91h3.76c.4 0 .74-.27.83-.66l1.04-4.5c.09-.4.44-.68.85-.68h2.08c4.68 0 7.9-2.28 7.9-6.9 0-4.32-3.15-6.26-7.98-6.26z"
        fill="#001C64"
        opacity="0.15"
      />
      {/* Dark blue primary background monogram letter */}
      <path
        d="M10.15 0C6.82 0 4.06 2.46 4.06 6.13c0 4.2 3.03 6.47 6.94 6.47h2.15c.4 0 .74-.28.83-.68l1.32-5.71.04-.21c.09-.4.44-.68.85-.68h.42c2.72 0 4.8-.97 4.8-4.14C21.41 1.18 18.26 0 13.43 0H10.15z"
        fill="#003087"
      />
      {/* Light blue overlapping monogram letter */}
      <path
        d="M13.24 6.13c0 4.2-3.03 6.47-6.94 6.47H4.15c-.4 0-.74.28-.83.68L2.01 19c-.11.46.25.9.73.9h3.76c.4 0 .74-.28.83-.68l1.04-4.51.04-.17c.09-.4.44-.68.85-.68h.42c4.68 0 7.9-2.28 7.9-6.9 0-4.32-3.15-6.26-7.98-6.26h-2.4c.42 1.7.99 3.56.99 5.33z"
        fill="#0079C1"
      />
    </svg>
  </div>
)

// ── Footer ───────────────────────────────────────────────────────────────────
export default function Footer({ onContactOpen }) {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {/* ── Row 1: SHOP · COMPANY · Logo · Newsletter ── */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-8 mb-10 text-center md:text-left">

          {/* Left: SHOP + COMPANY */}
          <div className="flex gap-14 flex-shrink-0 order-2 md:order-1">
            <div>
              <h3 className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-4">SHOP</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/shop?type=bestsellers" className="text-sm text-gray-800 hover:opacity-55 transition-opacity">
                    Bestsellers
                  </Link>
                </li>
                <li>
                  <Link to="/shop?type=limited" className="text-sm text-gray-800 hover:opacity-55 transition-opacity">
                    Limited Collection
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-sm text-gray-800 hover:opacity-55 transition-opacity">
                    Shop All
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-4">COMPANY</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/about" className="text-sm text-gray-800 hover:opacity-55 transition-opacity">
                    Our Story
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onContactOpen?.()}
                    className="text-sm text-gray-800 hover:opacity-55 transition-opacity bg-transparent border-none p-0 cursor-pointer mx-auto md:mx-0 block"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Center: Logo */}
          <div className="w-full md:flex-1 flex justify-center items-start pt-1 order-1 md:order-2">
            <img src={logo} alt="Velore" className="h-16 w-auto object-contain" />
          </div>

          {/* Right: Newsletter */}
          <div className="w-full sm:w-72 md:w-60 flex-shrink-0 order-3">
            <h3 className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-4">
              SUBSCRIBE TO OUR NEWSLETTER
            </h3>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter Your Email"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 transition-colors text-center md:text-left"
                aria-label="Email address"
              />
              <button
                type="button"
                className="w-full py-2.5 text-[11px] font-semibold tracking-widest text-black border border-black bg-white hover:bg-black hover:text-white transition-colors"
              >
                SUBSCRIBE
              </button>
            </div>
          </div>

        </div>

        {/* ── Divider ── */}
        <div className="border-t border-gray-200" />

        {/* ── Row 2: Social · Payment ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">

          {/* Social icons */}
          <div className="flex items-center gap-4 text-gray-700">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-black transition-colors">
              <InstagramIcon />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-black transition-colors">
              <FacebookIcon />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-black transition-colors">
              <TikTokIcon />
            </a>
          </div>

          {/* Payment badges */}
          <div className="flex items-center gap-2">
            <MastercardBadge />
            <WhishBadge />
            <PayPalBadge />
          </div>

        </div>

        {/* ── Divider ── */}
        <div className="border-t border-gray-200" />

        {/* ── Row 3: © · Policies ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-5 text-xs text-gray-500 text-center md:text-left">
          <span>© 2026 Velore</span>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
            <Link to="/refund-policy" className="hover:text-black transition-colors">Refund Policy</Link>
            <Link to="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-black transition-colors">Terms Of Service</Link>
            <Link to="/shipping-policy" className="hover:text-black transition-colors">Shipping Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}