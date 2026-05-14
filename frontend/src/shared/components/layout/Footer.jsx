import { Link } from 'react-router-dom'
import { Headphones, MapPin, Mail, Phone, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import logo from '../../../assets/logoEye-blue.png'
import { CurrencyMenu } from '../ui'

const PHONE_VALUE = '+961 1 234 567'
const PHONE_HREF = 'tel:+9611234567'
const EMAIL_VALUE = 'hello@velore.com'
const EMAIL_HREF = 'mailto:hello@velore.com'
const MAPS_HREF = 'https://www.google.com/maps/search/?api=1&query=Beirut%2C%20Lebanon'
const LOCATION_VALUE = 'Beirut, Lebanon'

function FooterTile({ href, label, value, icon, ariaLabel, newTab = false }) {
  const props = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a
      href={href}
      {...props}
      className="v-icon-tile v-hover-lift v-motion focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--velore-ring),0.16)]"
      aria-label={ariaLabel}
    >
      <span className="v-icon-circle" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-[rgba(var(--velore-fg),0.55)]">{label}</span>
        <span className="block text-sm font-semibold text-[rgb(var(--velore-fg))] truncate">{value}</span>
      </span>
    </a>
  )
}

export default function Footer({ onContactOpen }) {
  return (
    <footer className="v-section v-section-muted border-t border-[rgba(var(--velore-border-soft),0.85)]">
      <div className="v-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          <div className="space-y-4">
            <img src={logo} alt="Velore" className="w-28 h-auto" />
            <p className="v-caption max-w-sm">
              Premium eyewear with a calm finish—designed for fit, comfort, and clarity.
            </p>
            <button
              type="button"
              onClick={() => onContactOpen?.()}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--velore-fg))] hover:opacity-80 v-motion bg-transparent border-none cursor-pointer p-0"
              aria-label="Open contact dialog"
            >
              <Headphones size={16} aria-hidden="true" />
              Contact support
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="v-label mb-3">Shop</div>
              <ul className="space-y-2 text-sm text-[rgba(var(--velore-fg),0.72)]">
                <li>
                  <Link to="/shop" className="hover:opacity-80 v-motion">Shop all</Link>
                </li>
                <li>
                  <Link to="/shop?type=bestsellers" className="hover:opacity-80 v-motion">Bestsellers</Link>
                </li>
                <li>
                  <Link to="/shop?type=limited" className="hover:opacity-80 v-motion">Limited collection</Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="v-label mb-3">Company</div>
              <ul className="space-y-2 text-sm text-[rgba(var(--velore-fg),0.72)]">
                <li>
                  <Link to="/about" className="hover:opacity-80 v-motion">Our story</Link>
                </li>
                <li>
                  <Link to="/blogs" className="hover:opacity-80 v-motion">Journal</Link>
                </li>
                <li>
                  <Link to="/shipping-policy" className="hover:opacity-80 v-motion">Shipping policy</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div className="v-label">Contact</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <FooterTile
                href={PHONE_HREF}
                label="Phone"
                value={PHONE_VALUE}
                icon={<Phone size={16} aria-hidden="true" />}
                ariaLabel={`Call Velore at ${PHONE_VALUE}`}
              />
              <FooterTile
                href={EMAIL_HREF}
                label="Email"
                value={EMAIL_VALUE}
                icon={<Mail size={16} aria-hidden="true" />}
                ariaLabel={`Email Velore at ${EMAIL_VALUE}`}
              />
              <FooterTile
                href={MAPS_HREF}
                label="Location"
                value={LOCATION_VALUE}
                icon={<MapPin size={16} aria-hidden="true" />}
                ariaLabel="Open Velore location in Google Maps"
                newTab
              />
            </div>
          </div>
        </div>

        <div className="mt-10 v-divider" />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: <ShieldCheck size={16} aria-hidden="true" />, label: 'Secure checkout' },
            { icon: <Truck size={16} aria-hidden="true" />, label: 'Fast support & shipping' },
            { icon: <RotateCcw size={16} aria-hidden="true" />, label: 'Easy returns' },
          ].map((p) => (
            <div key={p.label} className="v-surface p-4 flex items-center gap-3">
              <span className="v-icon-circle" aria-hidden="true">{p.icon}</span>
              <span className="text-sm font-semibold text-[rgb(var(--velore-fg))]">{p.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 v-divider" />

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[rgba(var(--velore-fg),0.62)]">
          <p>© 2026 Velore</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/refund-policy" className="hover:opacity-80 v-motion">Refund policy</Link>
            <Link to="/privacy-policy" className="hover:opacity-80 v-motion">Privacy policy</Link>
            <Link to="/terms-of-service" className="hover:opacity-80 v-motion">Terms of service</Link>
            <Link to="/shipping-policy" className="hover:opacity-80 v-motion">Shipping policy</Link>
          </div>
          <div className="flex items-center gap-3">
            <CurrencyMenu ariaLabel="Select currency" align="right" />
            <select className="v-select !w-[120px] !py-2 !px-3 text-sm" aria-label="Select language">
              <option>English</option>
              <option>Arabic</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  )
}