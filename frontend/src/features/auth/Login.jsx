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
  const [showPass, setShowPass] = useState(false);

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

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      await authService.login({ email, password });

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
    <div className="bg-white min-h-screen text-gray-900 antialiased selection:bg-black selection:text-white flex flex-col md:flex-row relative overflow-x-hidden">

      {/* LEFT SIDE */}
      <div className="w-full md:w-[50%] lg:w-[48%] xl:w-[45%] bg-gray-50 relative min-h-[40vh] sm:min-h-[45vh] md:min-h-screen overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-neutral-100 rounded-full blur-3xl opacity-60 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="w-full h-full absolute inset-0">
          <img
            src={loginPhoto}
            alt="Fashion model with sunglasses"
            className="w-full h-full object-cover object-[center_top]"
            loading="eager"
          />
        </div>

        <div className="hidden sm:block absolute bottom-6 left-6 bg-black text-white px-4 py-2.5 rounded-sm shadow-xl">
          <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-0.5">Member Access</p>
          <p className="text-xs font-serif italic">Velore Collection</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-[50%] lg:w-[52%] xl:w-[55%] flex flex-col justify-center px-6 py-10 sm:py-14 md:py-24 bg-white relative">

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-100 rounded-full blur-3xl opacity-40 -mr-40 -mt-40 pointer-events-none" />

        <div className="w-full max-w-sm mx-auto relative z-10">

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.3em] text-black bg-gray-100 px-3 py-1 rounded-full uppercase mb-6">
              Welcome Back
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2">
              Sign <span className="font-serif italic font-normal text-black block md:inline">in.</span>
            </h1>
            <p className="text-base font-light text-gray-500 max-w-2xl leading-relaxed">
              Access your Velore account.
            </p>
          </div>

          {/* General Error Message */}
          {error && (
            <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors({ ...fieldErrors, email: '' });
                }}
                className={`w-full border px-3 py-2.5 text-sm font-light text-gray-900 outline-none transition-colors bg-white rounded-sm ${
                  fieldErrors.email ? 'border-red-400' : 'border-gray-300 focus:border-gray-900'
                }`}
                placeholder="you@example.com"
                autoComplete="username"
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  className={`w-full border px-3 py-2.5 pr-14 text-sm font-light text-gray-900 outline-none transition-colors bg-white rounded-sm ${
                    fieldErrors.password ? 'border-red-400' : 'border-gray-300 focus:border-gray-900'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 hover:text-black transition-colors bg-transparent border-0 cursor-pointer"
                >
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
              <Link
                to="/forgot-password"
                className="inline-block mt-2 text-xs font-mono text-gray-400 hover:text-black transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gray-900 text-white hover:bg-gray-700 px-6 py-3 text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 rounded-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-300">01</span>
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">New Customer?</span>
              <Link
                to="/signup"
                className="text-xs font-bold tracking-widest text-gray-900 uppercase underline underline-offset-2 hover:text-gray-500 transition-colors"
              >
                Register
              </Link>
            </div>
            <div className="text-sm text-gray-500 font-light">
              Velore · 2026
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}