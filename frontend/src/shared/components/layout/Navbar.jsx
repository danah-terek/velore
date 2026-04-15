import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/logoEye-blue.png";
import { Search, User, Heart, ShoppingCart, Menu, X } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";


export default function Navbar({ onCartOpen, onContactOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);
  const location = useLocation();

const{ favorites } = useFavorites();

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

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
    setSearchOpen(!searchOpen);
    setTimeout(() => inputRef.current?.focus(), 100);
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

  // Handle About click - scroll to about section on home page
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

  // Handle Blogs click - scroll to latest news on home page
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
      {/* ===== Top Bar ===== */}
      <div className="flex items-center justify-between px-6 py-3">

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-1 transition-colors ${
            isTransparent ? "text-white" : "text-gray-700"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Left Links - Desktop */}
        <div className="hidden md:flex gap-6 flex-1">
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isTransparent
                  ? "text-white hover:text-white/70"
                  : "text-gray-800 hover:text-gray-500"
              } ${isActive ? "font-semibold" : "font-normal"}`
            }
          >
            Shop
          </NavLink>
          
          {/* About - scrolls to about section on home */}
          <NavLink
            to="/#about-us"
            onClick={handleAboutClick}
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isTransparent
                  ? "text-white hover:text-white/70"
                  : "text-gray-800 hover:text-gray-500"
              } ${isActive ? "font-semibold" : "font-normal"}`
            }
          >
            About
          </NavLink>
          
          {/* Blogs - scrolls to latest news on home */}
          <NavLink
            to="/#latest-news"
            onClick={handleBlogsClick}
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isTransparent
                  ? "text-white hover:text-white/70"
                  : "text-gray-800 hover:text-gray-500"
              } ${isActive ? "font-semibold" : "font-normal"}`
            }
          >
            Blogs
          </NavLink>
          
          {/* Contact - opens modal */}
          <button
            onClick={handleContactClick}
            className={`text-sm transition-colors bg-transparent border-none cursor-pointer ${
              isTransparent
                ? "text-white hover:text-white/70"
                : "text-gray-800 hover:text-gray-500"
            }`}
          >
            Contact
          </button>
        </div>

        {/* Logo */}
        <Link to="/" className="flex-1 md:flex-none flex justify-center">
          <img src={logo} alt="Velore" className="h-13 object-contain" />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-1 justify-end">

          {/* Currency */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={`hidden md:block bg-transparent border-none text-xs cursor-pointer outline-none transition-colors ${
              isTransparent ? "text-white" : "text-gray-500"
            }`}
          >
            <option value="USD">UNITED STATES (USD $)</option>
            <option value="EUR">EUROPE (EUR €)</option>
            <option value="LBP">LEBANON (LBP ل.ل)</option>
          </select>

          {/* Search */}
          <div className="flex items-center relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className={`transition-all duration-300 ease-in-out bg-transparent outline-none text-sm border-b ${
                isTransparent
                  ? "border-white text-white placeholder:text-white/70"
                  : "border-gray-400 text-gray-800"
              } ${searchOpen ? "w-40 opacity-100 ml-2" : "w-0 opacity-0 ml-0"}`}
            />
            <button
              onClick={handleSearchClick}
              className={`p-1 transition-colors ${
                isTransparent
                  ? "text-white hover:text-white/70"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <Search size={18} />
            </button>
          </div>

          {/* Desktop Icons */}
          <Link
            to="/login"
            className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer ${
              isTransparent
                ? "text-white hover:text-white/70"
                : "text-gray-700 hover:text-black"
            }`}
          >
            <User size={18} />
          </Link>
          
         <Link
  to="/favorite"
  className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer relative ${
    isTransparent
      ? "text-white hover:text-white/70"
      : "text-gray-700 hover:text-black"
  }`}
>
  <Heart size={18} />
  {favorites.length > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
      {favorites.length}
    </span>
  )}
</Link>

          {/* Desktop Cart */}
          <button
            onClick={handleCartClick}
            className={`hidden md:flex p-1 transition-colors bg-transparent border-none cursor-pointer ${
              isTransparent
                ? "text-white hover:text-white/70"
                : "text-gray-700 hover:text-black"
            }`}
          >
            <ShoppingCart size={18} />
          </button>

          {/* Mobile Cart */}
          <button
            onClick={handleCartClick}
            className={`md:hidden p-1 transition-colors ${
              isTransparent
                ? "text-white hover:text-white/70"
                : "text-gray-700 hover:text-black"
            }`}
          >
            <ShoppingCart size={18} />
          </button>

          {/* AR button */}
          <Link
            to="/ar"
            className={`text-xs font-bold rounded px-2 py-1 tracking-wide transition-colors ${
              isTransparent
                ? "bg-white/20 text-white hover:bg-white/40"
                : "bg-gray-900 text-white hover:bg-gray-700"
            }`}
          >
            AR
          </Link>
        </div>
      </div>

      {/* ===== Mobile Menu ===== */}
      {menuOpen && (
        <div
          className={`md:hidden flex flex-col px-6 pb-4 gap-4 border-t ${
            isTransparent
              ? "border-white/20 bg-black/20 backdrop-blur-sm"
              : "border-gray-200 bg-white"
          }`}
        >
          <NavLink
            to="/shop"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isTransparent
                  ? "text-white hover:text-white/70"
                  : "text-gray-800 hover:text-gray-500"
              } ${isActive ? "font-semibold" : "font-normal"}`
            }
          >
            Shop
          </NavLink>
          
          <NavLink
            to="/#about-us"
            onClick={handleAboutClick}
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isTransparent
                  ? "text-white hover:text-white/70"
                  : "text-gray-800 hover:text-gray-500"
              } ${isActive ? "font-semibold" : "font-normal"}`
            }
          >
            About
          </NavLink>
          
          <NavLink
            to="/#latest-news"
            onClick={handleBlogsClick}
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isTransparent
                  ? "text-white hover:text-white/70"
                  : "text-gray-800 hover:text-gray-500"
              } ${isActive ? "font-semibold" : "font-normal"}`
            }
          >
            Blogs
          </NavLink>
          
          <button
            onClick={handleContactClick}
            className={`text-left text-sm transition-colors bg-transparent border-none cursor-pointer ${
              isTransparent
                ? "text-white hover:text-white/70"
                : "text-gray-800 hover:text-gray-500"
            }`}
          >
            Contact
          </button>

          <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <User
                size={18}
                className={isTransparent ? "text-white" : "text-gray-700"}
              />
            </Link>
            
            <Link to="/favorite" onClick={() => setMenuOpen(false)} className="relative">
  <Heart
    size={18}
    className={isTransparent ? "text-white" : "text-gray-700"}
  />
  {favorites.length > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
      {favorites.length}
    </span>
  )}
</Link>
          
          
          </div>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={`bg-transparent border-none text-xs cursor-pointer outline-none w-fit ${
              isTransparent ? "text-white" : "text-gray-500"
            }`}
          >
            <option value="USD">UNITED STATES (USD $)</option>
            <option value="EUR">EUROPE (EUR €)</option>
            <option value="LBP">LEBANON (LBP ل.ل)</option>
          </select>
        </div>
      )}
    </nav>
  );
}