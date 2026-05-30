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

  // Transparent only on homepage when not scrolled
  const isTransparent = isHome && !scrolled

  // Handle About click - scroll to section on homepage or navigate to homepage first
  const handleAboutClick = (e) => {
    e.preventDefault()
    
    if (location.pathname === '/') {
      // Already on homepage, just scroll to about-us section
      const aboutSection = document.getElementById('about-us')
      if (aboutSection) {
        const offset = 80 // Account for sticky navbar height
        const elementPosition = aboutSection.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.scrollY - offset
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
      setMenuOpen(false)
    } else {
      // Navigate to homepage with hash
      navigate('/#about-us')
      setMenuOpen(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [location.pathname])

  // Handle hash navigation after route change
  useEffect(() => {
    if (location.hash === '#about-us') {
      setTimeout(() => {
        const aboutSection = document.getElementById('about-us')
        if (aboutSection) {
          const offset = 80
          const elementPosition = aboutSection.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - offset
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
        }
        // Clean up hash without refreshing
        window.history.replaceState({}, '', location.pathname)
      }, 100)
    }
  }, [location])

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
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Re-evaluate scroll position on route change
  useEffect(() => {
    setScrolled(window.scrollY > 50)
  }, [location.pathname])

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
      'inline-flex items-center gap-2 text-sm font-medium rounded-xl px-2.5 py-1.5 transition-colors duration-200',
      isTransparent
        ? 'text-white/90 hover:text-white hover:bg-white/10'
        : 'text-gray-700 hover:text-gray-900 hover:bg-black/5',
      isActive
        ? (isTransparent ? 'bg-white/10 text-white' : 'bg-black/5 text-gray-900')
        : '',
    ].join(' ')

  const iconClass = isTransparent
    ? 'text-white hover:text-white/70'
    : 'text-gray-600 hover:text-gray-900'

  return (
    <>
      <style>{`
        .velore-nav {
          position: sticky;
          top: 0;
          z-index: 40;
          transition: background 0.35s ease, backdrop-filter 0.35s ease;
        }
        .velore-nav.transparent {
          background: transparent;
          box-shadow: none;
          
        }
        .velore-nav.solid {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          
          
        }
      `}</style>

      <nav className={`velore-nav ${isTransparent ? 'transparent' : 'solid'}`}>
        <div className="flex items-center justify-between px-6 py-3">

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-1 bg-transparent border-none cursor-pointer transition-colors ${iconClass}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-1 flex-1">
            <NavLink to="/shop" className={navItemClass}>
              <Glasses size={16} aria-hidden="true" />
              <span>Shop</span>
            </NavLink>
            <button
              type="button"
              onClick={handleAboutClick}
              className={[
                'inline-flex items-center gap-2 text-sm font-medium rounded-xl px-2.5 py-1.5 bg-transparent border-none cursor-pointer transition-colors duration-200',
                isTransparent
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-black/5',
              ].join(' ')}
            >
              <BadgeInfo size={16} aria-hidden="true" />
              <span>About</span>
            </button>
            <NavLink to="/blogs" className={navItemClass}>
              <BookOpen size={16} aria-hidden="true" />
              <span>Journal</span>
            </NavLink>
            <button
              type="button"
              onClick={handleContactClick}
              className={[
                'inline-flex items-center gap-2 text-sm font-medium rounded-xl px-2.5 py-1.5 bg-transparent border-none cursor-pointer transition-colors duration-200',
                isTransparent
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-black/5',
              ].join(' ')}
            >
              <Headphones size={16} aria-hidden="true" />
              <span>Contact</span>
            </button>
          </div>

          {/* Logo — centered */}
          <Link to="/" className="flex-1 md:flex-none flex justify-center">
            <img src={logo} alt="Velore" className="h-13 object-contain" />
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="hidden md:block">
              <CurrencyMenu
                ariaLabel="Select currency"
                align="right"
                triggerClassName={isTransparent ? 'text-white border-white/30 hover:bg-white/10' : ''}
              />
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className={`p-1 bg-transparent border-none cursor-pointer transition-colors ${iconClass}`}
              aria-label="Open search"
            >
              <Search size={18} />
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => setProfileOpen(true)}
                className={`hidden md:flex p-1 bg-transparent border-none cursor-pointer relative transition-colors ${iconClass}`}
                aria-label="My Profile"
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
                className={`hidden md:flex p-1 transition-colors ${iconClass}`}
              >
                <User size={18} />
              </Link>
            )}

            <Link
              to="/favorite"
              className={`hidden md:flex p-1 relative transition-colors ${iconClass}`}
            >
              <Heart size={18} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            <button
              onClick={handleCartClick}
              className={`hidden md:flex p-1 bg-transparent border-none cursor-pointer transition-colors ${iconClass}`}
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
            </button>

            <button
              onClick={handleCartClick}
              className={`md:hidden p-1 bg-transparent border-none cursor-pointer transition-colors ${iconClass}`}
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
            </button>

            <Link
              to="/ar"
              className={`text-xs font-semibold rounded-lg px-2.5 py-1 tracking-wide transition-colors ${
                isTransparent
                  ? 'bg-white/20 text-white hover:bg-white/35'
                  : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
            >
              AR
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className={`md:hidden flex flex-col px-6 pb-4 gap-3 ${
              isTransparent
                ? 'bg-black/30 backdrop-blur-md border-t border-white/10'
                : 'bg-white/95 backdrop-blur border-t border-black/5'
            }`}
          >
            <NavLink to="/shop" onClick={() => setMenuOpen(false)} className={navItemClass}>
              <Glasses size={16} aria-hidden="true" />
              <span>Shop</span>
            </NavLink>
            <button
              type="button"
              onClick={handleAboutClick}
              className={navItemClass({ isActive: false })}
            >
              <BadgeInfo size={16} aria-hidden="true" />
              <span>About</span>
            </button>
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

            <div className="flex items-center gap-4 pt-2 border-t border-black/5">
              {isLoggedIn ? (
                <button
                  onClick={() => { setMenuOpen(false); setProfileOpen(true) }}
                  className={`relative bg-transparent border-none cursor-pointer ${iconClass}`}
                >
                  <User size={18} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {notifCount}
                    </span>
                  )}
                </button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className={iconClass}>
                  <User size={18} />
                </Link>
              )}

              <Link to="/favorite" onClick={() => setMenuOpen(false)} className={`relative ${iconClass}`}>
                <Heart size={18} />
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
                triggerClassName={isTransparent ? 'text-white border-white/30 hover:bg-white/10' : ''}
              />
            </div>
          </div>
        )}
      </nav>

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