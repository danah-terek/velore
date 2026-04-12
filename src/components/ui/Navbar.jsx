import { useState, useEffect, useRef } from "react";
import logo from "../../assets/logoEye-blue.png";
import { Link, NavLink } from "react-router-dom";
import { Search, User, Heart, ShoppingCart, Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔥 currency system
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState({});

  // 🔥 search animation
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => res.json())
      .then((data) => setRates(data.rates))
      .catch((err) => console.log(err));
  }, []);

  const handleSearchClick = () => {
    setSearchOpen(!searchOpen);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const navItems = ["Shop", "About", "Blogs", "Contact"];

  return (
    <nav className="bg-transparent border-b border-gray-200 sticky top-0 z-50">

      {/* ===== Top Bar ===== */}
      <div className="flex items-center justify-between px-6 py-3">

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-1 text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Left Links */}
        <div className="hidden md:flex gap-6 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item}
              to={`/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm text-gray-800 hover:text-gray-500 transition-colors ${
                  isActive ? "font-semibold" : "font-normal"
                }`
              }
            >
              {item}
            </NavLink>
          ))}
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
            className="hidden md:block bg-transparent border-none text-xs text-gray-500 cursor-pointer outline-none"
          >
            <option value="USD">UNITED STATES (USD $)</option>
            <option value="EUR">EUROPE (EUR €)</option>
            <option value="LBP">LEBANON (LBP ل.ل)</option>
          </select>

          {/* 🔥 SEARCH */}
          <div className="flex items-center relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className={`transition-all duration-300 ease-in-out bg-transparent border-b border-gray-400 outline-none text-sm
              focus:border-black
              ${searchOpen ? "w-40 opacity-100 ml-2" : "w-0 opacity-0 ml-0"}`}
            />

            <button
              onClick={handleSearchClick}
              className="p-1 text-gray-700 hover:text-black transition-colors"
            >
              <Search size={18} />
            </button>
          </div>

          {/* ✅ Desktop Icons with navigation */}
          {[
            { icon: User, path: "/login" },
            { icon: Heart, path: "/favorite" },
            { icon: ShoppingCart, path: "/checkout" }
          ].map(({ icon: Icon, path }, index) => (
            <Link
              to={path}
              key={index}
              className="hidden md:flex p-1 text-gray-700 hover:text-black transition-colors bg-transparent border-none cursor-pointer"
            >
              <Icon size={18} />
            </Link>
          ))}

          {/* ✅ Mobile Cart */}
          <Link
            to="/checkout"
            className="md:hidden p-1 text-gray-700 hover:text-black transition-colors"
          >
            <ShoppingCart size={18} />
          </Link>

          {/* Language */}
          <Link
            to="/ar"
            className="text-xs font-bold text-gray-900 border-2 border-gray-900 rounded px-1.5 py-0.5 tracking-wide hover:bg-gray-900 hover:text-white transition-colors"
          >
            AR
          </Link>
        </div>
      </div>

      {/* ===== Mobile Menu ===== */}
      {menuOpen && (
        <div className="md:hidden flex flex-col px-6 pb-4 gap-4 border-t border-gray-200 bg-transparent">

          {navItems.map((item) => (
            <NavLink
              key={item}
              to={`/${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm text-gray-800 hover:text-gray-500 transition-colors ${
                  isActive ? "font-semibold" : "font-normal"
                }`
              }
            >
              {item}
            </NavLink>
          ))}

          {/* ✅ Mobile Icons with navigation */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-200">

            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <User size={18} className="text-gray-700" />
            </Link>

            <Link to="/favorite" onClick={() => setMenuOpen(false)}>
              <Heart size={18} className="text-gray-700" />
            </Link>

            {/* <Link to="/checkout" onClick={() => setMenuOpen(false)}>
              <ShoppingCart size={18} className="text-gray-700" />
            </Link> */}

          </div>

          {/* Mobile Currency */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent border-none text-xs text-gray-500 cursor-pointer outline-none w-fit"
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