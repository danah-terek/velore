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
import apiClient from '../../../shared/services/apiClient'
import { resolveImageUrl } from '../../utils/imageUrl'
import { useFavorites } from '../../contexts'
import ProfileSidebar from '../../../features/profile/ProfileSidebar'
import { CurrencyMenu } from '../ui'

export default function Navbar({ onCartOpen, onContactOpen }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const inputRef = useRef(null)
  const searchTimeoutRef = useRef(null)
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
? all.filter(n => new Date(n.sent_at?.replace('Z', '') + 'Z') > new Date(lastRead))          : all
        setNotifCount(unread.length)
      })
      .catch(() => {})
  }
  fetchNotifs()
  const interval = setInterval(fetchNotifs, 30000)
  return () => clearInterval(interval)
}, [isLoggedIn])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setSearchResults([])
        setSearchQuery('')
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setScrolled(window.scrollY > 50)
  }, [location.pathname])

  const handleSearchClick = () => {
    if (!searchOpen) {
      setSearchOpen(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchOpen(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (value.length < 2) {
      setSearchResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const result = await apiClient.get(`/products/search?q=${encodeURIComponent(value)}`)
        setSearchResults(result?.data || [])
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleCartClick = () => {
    onCartOpen?.()
  }

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

            <div className="flex items-center relative search-container">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={`transition-all duration-300 ease-in-out bg-transparent outline-none text-sm border-b ${
                    isTransparent
                      ? "border-white text-white placeholder:text-white/70"
                      : "border-gray-400 text-gray-800"
                  } ${searchOpen ? "w-40 md:w-56 opacity-100 ml-2" : "w-0 opacity-0 ml-0"}`}
                />
                <button
                  type={searchOpen ? "submit" : "button"}
                  onClick={searchOpen ? undefined : handleSearchClick}
                  className={`p-1 transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}
                >
                  <Search size={18} />
                </button>
              </form>

              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-80 z-50 max-h-96 overflow-y-auto v-popover v-popover-anim">
                  {searchResults.map((product) => (
                    <Link
                      key={product.product_id}
                      to={`/product/${product.product_id}`}
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="flex items-center gap-3 p-3 border-b border-[rgba(var(--velore-border-soft),0.7)] last:border-b-0 hover:bg-[rgba(var(--velore-accent),0.06)]"
                    >
                      <img
                        src={resolveImageUrl(product.product_variants?.[0]?.images?.[0]) || ''}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-xl bg-[rgba(var(--velore-accent),0.04)] border border-[rgba(var(--velore-border-soft),0.85)]"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const img = e.currentTarget
                          img.onerror = null
                          img.src = ''
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.brands?.name} • {product.categories?.name}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {searchOpen && searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
                <div className="absolute top-full right-0 mt-2 w-80 z-50 p-4 text-center text-sm text-gray-500 v-popover v-popover-anim">
                  No products found
                </div>
              )}
            </div>

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