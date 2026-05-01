import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginPhoto from "../../assets/loginphoto.jpg";
import authService from "./authService";
import cartService from "../cart/cartService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email (e.g., user@gmail.com)";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    // ✅ Validate before submitting
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await authService.login({ email, password });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Merge guest cart
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      if (guestCart.length > 0) {
        for (const item of guestCart) {
          try {
            await cartService.addItem({ productId: item.productId, quantity: item.quantity });
          } catch (err) {
            console.error('Failed to merge cart item:', err);
          }
        }
        localStorage.removeItem('guestCart');
      }

      navigate('/');
    } catch (err) {
      setError(err.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-white font-sans">
      {/* LEFT IMAGE */}
      <div className="relative w-full h-64 md:h-full md:w-[45%] overflow-hidden">
        <img
          src={loginPhoto}
          alt="Fashion model with sunglasses"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/30" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white md:hidden" />
        <div className="hidden md:block absolute inset-y-0 right-0 w-40 bg-gradient-to-r from-transparent to-white" />
      </div>

      {/* RIGHT FORM */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 md:px-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl md:text-5xl font-black tracking-wide uppercase text-black mb-8">
            LOGIN
          </h1>

          {/* General Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-1.5 tracking-wide">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors({ ...fieldErrors, email: '' });
              }}
              className={`w-full border px-3 py-2.5 text-sm text-black outline-none transition duration-200 ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-black'
              }`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-1.5 tracking-wide">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors({ ...fieldErrors, password: '' });
              }}
              className={`w-full border px-3 py-2.5 text-sm text-black outline-none transition duration-200 ${
                fieldErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-black'
              }`}
              placeholder="••••••••"
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
            )}
            <a
              href="#"
              className="inline-block mt-2 text-xs text-gray-500 underline hover:text-black transition"
            >
              Forgot your password?
            </a>
          </div>

          {/* Button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-black text-white py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>

          {/* Link */}
          <p className="mt-5 text-center text-sm text-gray-600">
            New Customer?{" "}
            <Link
              to="/signup"
              className="text-black font-medium underline hover:text-gray-700"
            >
              Create My Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}