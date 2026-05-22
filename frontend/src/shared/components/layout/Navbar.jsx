import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BadgeInfo,
  BookOpen,
  Glasses,
  Headphones,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from 'lucide-react'

import logo from '../../../assets/logoEye-blue.png'
import { useFavorites } from '../../contexts'
import ProfileSidebar from '../../../features/profile/ProfileSidebar'
import { CurrencyMenu } from '../ui'
import SearchPanel from './SearchPanel'

export default function Navbar({ onCartOpen, onContactOpen }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const location = useLocation()

  const { favorites } = useFavorites()
  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [location.pathname])

  useEffect(() => {
    if (!isLoggedIn) return
    const fetchNotifs = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      fetch('/api/v1/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(result => {
          const all = result?.data || []
          const lastRead = localStorage.getItem('notif_last_read')
          const unread = lastRead
            ? all.filter(n => new Date(n.sent_at?.replace('Z', '') + 'Z') > new Date(lastRead))
            : all
          setNotifCount(unread.length)
        })
        .catch(() => {})
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [isLoggedIn])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setScrolled(window.scrollY > 50)
  }, [location.pathname])

  // Lock body scroll when search panel is open
  useEffect(() => {
    document.body.style.overflow = searchOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [searchOpen])

  const handleCartClick = () => onCartOpen?.()

  const handleContactClick = (e) => {
    e.preventDefault()
    onContactOpen?.()
    setMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('guestCart')
    localStorage.removeItem('guestFavorites')
    setIsLoggedIn(false)
    window.location.href = '/'
  }

  const navItemClass = ({ isActive }) =>
    [
      'inline-flex items-center gap-2 text-sm font-medium v-motion rounded-xl px-2.5 py-1.5',
      isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-800 hover:text-gray-900 hover:bg-black/5',
      isActive ? (isTransparent ? 'bg-white/10 text-white' : 'bg-black/5') : '',
    ].join(' ')

  return (
    <>
      <nav
        className={[
          'sticky top-0 z-40 v-motion',
          isTransparent
            ? 'bg-transparent'
            : 'bg-[rgb(var(--velore-pearl))]/80 backdrop-blur border-b border-[rgba(var(--velore-border-soft),0.85)]',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <button
            className={`md:hidden p-1 transition-colors ${isTransparent ? 'text-white' : 'text-gray-700'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="hidden md:flex gap-6 flex-1">
            <NavLink to="/shop" className={navItemClass} aria-label="Shop">
              <Glasses size={16} aria-hidden="true" />
              <span>Shop</span>
            </NavLink>
            <NavLink to="/about" className={navItemClass} aria-label="About Velore">
              <BadgeInfo size={16} aria-hidden="true" />
              <span>About</span>
            </NavLink>
            <NavLink to="/blogs" className={navItemClass} aria-label="Velore Journal">
              <BookOpen size={16} aria-hidden="true" />
              <span>Journal</span>
            </NavLink>
            <button
              type="button"
              onClick={handleContactClick}
              className={[
                'inline-flex items-center gap-2 text-sm font-medium v-motion rounded-xl px-2.5 py-1.5 bg-transparent border-none cursor-pointer',
                isTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-800 hover:text-gray-900 hover:bg-black/5',
              ].join(' ')}
              aria-label="Contact Velore"
            >
              <Headphones size={16} aria-hidden="true" />
              <span>Contact</span>
            </button>
          </div>

          <Link to="/" className="flex-1 md:flex-none flex justify-center">
            <img src={logo} alt="Velore" className="h-13 object-contain" />
          </Link>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="hidden md:block">
              <CurrencyMenu
                ariaLabel="Select currency"
                align="right"
                triggerClassName={isTransparent ? "text-white border-white/30 hover:bg-white/10" : ""}
              />
            </div>

            {/* Search trigger — now opens the panel */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-1 transition-colors bg-transparent border-none cursor-pointer ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}
              aria-label="Open search"
            >
              <Search size={18} />
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => setProfileOpen(true)}
                title="My Profile"
                className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer relative ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}
              >
                <User size={18} />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </button>
            ) : (
              <Link
                to="/login"
                className={`hidden md:flex p-1 transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}
              >
                <User size={18} />
              </Link>
            )}

            <Link
              to="/favorite"
              className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer relative ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}
            >
              <Heart size={18} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Desktop cart */}
            <button
              onClick={handleCartClick}
              className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}
            >
              <ShoppingCart size={18} />
            </button>

            {/* Mobile cart */}
            <button
              onClick={handleCartClick}
              className={`md:hidden p-1 transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}
            >
              <ShoppingCart size={18} />
            </button>

            <Link
              to="/ar"
              className={`text-xs font-bold rounded px-2 py-1 tracking-wide transition-colors ${isTransparent ? "bg-white/20 text-white hover:bg-white/40" : "bg-gray-900 text-white hover:bg-gray-700"}`}
            >
              AR
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className={`md:hidden flex flex-col px-6 pb-4 gap-4 border-t ${
              isTransparent
                ? 'border-white/20 bg-black/20 backdrop-blur-sm'
                : 'border-[rgba(var(--velore-border-soft),0.85)] bg-[rgb(var(--velore-pearl))]/90 backdrop-blur'
            }`}
          >
            <NavLink to="/shop" onClick={() => setMenuOpen(false)} className={navItemClass}>
              <Glasses size={16} aria-hidden="true" />
              <span>Shop</span>
            </NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)} className={navItemClass}>
              <BadgeInfo size={16} aria-hidden="true" />
              <span>About</span>
            </NavLink>
            <NavLink to="/blogs" onClick={() => setMenuOpen(false)} className={navItemClass}>
              <BookOpen size={16} aria-hidden="true" />
              <span>Journal</span>
            </NavLink>
            <button
              type="button"
              onClick={handleContactClick}
              className={navItemClass({ isActive: false })}
            >
              <Headphones size={16} aria-hidden="true" />
              <span>Contact</span>
            </button>

            <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
              {isLoggedIn ? (
                <button
                  onClick={() => { setMenuOpen(false); setProfileOpen(true) }}
                  className="relative bg-transparent border-none cursor-pointer"
                >
                  <User size={18} className={isTransparent ? "text-white" : "text-gray-700"} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {notifCount}
                    </span>
                  )}
                </button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <User size={18} className={isTransparent ? "text-white" : "text-gray-700"} />
                </Link>
              )}

              <Link to="/favorite" onClick={() => setMenuOpen(false)} className="relative">
                <Heart size={18} className={isTransparent ? "text-white" : "text-gray-700"} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </div>

            <div className="pt-1">
              <CurrencyMenu
                ariaLabel="Select currency"
                align="left"
                triggerClassName={isTransparent ? "text-white border-white/30 hover:bg-white/10" : ""}
              />
            </div>
          </div>
        )}
      </nav>

      {/* Search Panel */}
      <SearchPanel isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <ProfileSidebar
        isOpen={profileOpen}
        onClose={() => {
          setProfileOpen(false)
          setNotifCount(0)
          localStorage.setItem('notif_last_read', new Date().toISOString())
        }}
        onLogout={handleLogout}
        onContactOpen={onContactOpen}
        onNotifRead={() => setNotifCount(0)}
        notifCount={notifCount}
      />
    </>
  )
}