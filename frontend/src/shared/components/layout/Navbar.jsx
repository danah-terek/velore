import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../../assets/logoEye-blue.png"; 
import { Search, User, Heart, ShoppingCart, Menu, X, LogOut } from "lucide-react";
import { useFavorites } from "../../contexts";
import apiClient from "../../../shared/services/apiClient";

export default function Navbar({ onCartOpen, onContactOpen }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const location = useLocation();

  const { favorites } = useFavorites();
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [location.pathname]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setSearchResults([]);
        setSearchQuery('');
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > 50);
  }, [location.pathname]);

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => res.json())
      .then((data) => setRates(data.rates))
      .catch((err) => console.log(err));
  }, []);

  const handleSearchClick = () => {
    if (!searchOpen) {
      setSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // ✅ Search function with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await apiClient.get(`/products/search?q=${encodeURIComponent(value)}`);
        setSearchResults(response.data || []);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleCartClick = () => {
    if (onCartOpen) {
      onCartOpen();
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    if (onContactOpen) {
      onContactOpen();
    }
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guestCart');
    localStorage.removeItem('guestFavorites');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const handleAboutClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const aboutSection = document.getElementById('about-us');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  const handleBlogsClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const latestNewsSection = document.getElementById('latest-news');
      if (latestNewsSection) {
        latestNewsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-40 transition-all duration-500 ${
        isTransparent ? "bg-transparent" : "bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-3">
        <button
          className={`md:hidden p-1 transition-colors ${
            isTransparent ? "text-white" : "text-gray-700"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="hidden md:flex gap-6 flex-1">
          <NavLink to="/shop" className={({ isActive }) => `text-sm transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-800 hover:text-gray-500"} ${isActive ? "font-semibold" : "font-normal"}`}>Shop</NavLink>
          <NavLink to="/#about-us" onClick={handleAboutClick} className={({ isActive }) => `text-sm transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-800 hover:text-gray-500"} ${isActive ? "font-semibold" : "font-normal"}`}>About</NavLink>
          <NavLink to="/#latest-news" onClick={handleBlogsClick} className={({ isActive }) => `text-sm transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-800 hover:text-gray-500"} ${isActive ? "font-semibold" : "font-normal"}`}>Blogs</NavLink>
          <button onClick={handleContactClick} className={`text-sm transition-colors bg-transparent border-none cursor-pointer ${isTransparent ? "text-white hover:text-white/70" : "text-gray-800 hover:text-gray-500"}`}>Contact</button>
        </div>

        <Link to="/" className="flex-1 md:flex-none flex justify-center">
          <img src={logo} alt="Velore" className="h-13 object-contain" />
        </Link>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`hidden md:block bg-transparent border-none text-xs cursor-pointer outline-none transition-colors ${isTransparent ? "text-white" : "text-gray-500"}`}>
            <option value="USD">UNITED STATES (USD $)</option>
            <option value="EUR">EUROPE (EUR €)</option>
            <option value="LBP">LEBANON (LBP ل.ل)</option>
          </select>

          {/* ✅ UPDATED SEARCH WITH DROPDOWN */}
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

            {/* Dropdown Search Results */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-sm shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchResults.map(product => (
                  <Link
                    key={product.product_id}
                    to={`/product/${product.product_id}`}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <img 
                      src={product.product_variants?.[0]?.images?.[0] || 'https://via.placeholder.com/40'} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-sm"
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
              <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-sm shadow-lg z-50 p-4 text-center text-sm text-gray-500">
                No products found
              </div>
            )}
          </div>

          {/* User Icon */}
          {isLoggedIn ? (
            <button onClick={handleLogout} title="Logout" className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}>
              <LogOut size={18} />
            </button>
          ) : (
            <Link to="/login" className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}>
              <User size={18} />
            </Link>
          )}
          
          <Link to="/favorite" className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer relative ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}>
            <Heart size={18} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{favorites.length}</span>
            )}
          </Link>

          <button onClick={handleCartClick} className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}><ShoppingCart size={18} /></button>
          <button onClick={handleCartClick} className={`md:hidden p-1 transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-700 hover:text-black"}`}><ShoppingCart size={18} /></button>

          <Link to="/ar" className={`text-xs font-bold rounded px-2 py-1 tracking-wide transition-colors ${isTransparent ? "bg-white/20 text-white hover:bg-white/40" : "bg-gray-900 text-white hover:bg-gray-700"}`}>AR</Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`md:hidden flex flex-col px-6 pb-4 gap-4 border-t ${isTransparent ? "border-white/20 bg-black/20 backdrop-blur-sm" : "border-gray-200 bg-white"}`}>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-800 hover:text-gray-500"} ${isActive ? "font-semibold" : "font-normal"}`}>Shop</NavLink>
          <NavLink to="/#about-us" onClick={handleAboutClick} className={({ isActive }) => `text-sm transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-800 hover:text-gray-500"} ${isActive ? "font-semibold" : "font-normal"}`}>About</NavLink>
          <NavLink to="/#latest-news" onClick={handleBlogsClick} className={({ isActive }) => `text-sm transition-colors ${isTransparent ? "text-white hover:text-white/70" : "text-gray-800 hover:text-gray-500"} ${isActive ? "font-semibold" : "font-normal"}`}>Blogs</NavLink>
          <button onClick={handleContactClick} className={`text-left text-sm transition-colors bg-transparent border-none cursor-pointer ${isTransparent ? "text-white hover:text-white/70" : "text-gray-800 hover:text-gray-500"}`}>Contact</button>

          <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
            {isLoggedIn ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="relative">
                <LogOut size={18} className={isTransparent ? "text-white" : "text-gray-700"} />
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <User size={18} className={isTransparent ? "text-white" : "text-gray-700"} />
              </Link>
            )}
            
            <Link to="/favorite" onClick={() => setMenuOpen(false)} className="relative">
              <Heart size={18} className={isTransparent ? "text-white" : "text-gray-700"} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{favorites.length}</span>
              )}
            </Link>
          </div>

          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`bg-transparent border-none text-xs cursor-pointer outline-none w-fit ${isTransparent ? "text-white" : "text-gray-500"}`}>
            <option value="USD">UNITED STATES (USD $)</option>
            <option value="EUR">EUROPE (EUR €)</option>
            <option value="LBP">LEBANON (LBP ل.ل)</option>
          </select>
        </div>
      )}
    </nav>
  );
}