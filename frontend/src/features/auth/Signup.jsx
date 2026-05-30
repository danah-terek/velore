import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupPhoto from "../../assets/spimage.png";
import authService from "./authService";

export default function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email (e.g., user@gmail.com)";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = "Password must contain at least one number";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!agreed) {
      alert("You must agree to the terms.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      await authService.register({
        email,
        password,
        name: `${firstName} ${lastName}`
      });

      navigate('/login');
    } catch (err) {
      setError(err.error || "Registration failed. Please try again.");
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
            src={signupPhoto}
            alt="Fashion model"
            className="w-full h-full object-cover object-[center_top]"
            loading="eager"
          />
        </div>

        <div className="hidden sm:block absolute bottom-6 left-6 bg-black text-white px-4 py-2.5 rounded-sm shadow-xl">
          <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-0.5">New Member</p>
          <p className="text-xs font-serif italic">Velore Collection</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-[50%] lg:w-[52%] xl:w-[55%] flex flex-col justify-center px-6 py-10 sm:py-14 md:py-16 bg-white relative">

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-100 rounded-full blur-3xl opacity-40 -mr-40 -mt-40 pointer-events-none" />

        <div className="w-full max-w-sm mx-auto relative z-10">

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.3em] text-black bg-gray-100 px-3 py-1 rounded-full uppercase mb-6">
              Join Velore
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2">
              Create <span className="font-serif italic font-normal text-black block md:inline">account.</span>
            </h1>
            <p className="text-base font-light text-gray-500 max-w-2xl leading-relaxed">
              Become part of the Velore experience.
            </p>
          </div>

          {/* General Error */}
          {error && (
            <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">

            {/* FIRST + LAST NAME */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors({ ...fieldErrors, firstName: '' });
                  }}
                  className={`w-full border px-3 py-2.5 text-sm font-light text-gray-900 outline-none transition-colors bg-white rounded-sm ${
                    fieldErrors.firstName ? 'border-red-400' : 'border-gray-300 focus:border-gray-900'
                  }`}
                  placeholder="John"
                />
                {fieldErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>
                )}
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setFieldErrors({ ...fieldErrors, lastName: '' });
                  }}
                  className={`w-full border px-3 py-2.5 text-sm font-light text-gray-900 outline-none transition-colors bg-white rounded-sm ${
                    fieldErrors.lastName ? 'border-red-400' : 'border-gray-300 focus:border-gray-900'
                  }`}
                  placeholder="Doe"
                />
                {fieldErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* EMAIL */}
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
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors({ ...fieldErrors, password: '' });
                }}
                className={`w-full border px-3 py-2.5 text-sm font-light text-gray-900 outline-none transition-colors bg-white rounded-sm ${
                  fieldErrors.password ? 'border-red-400' : 'border-gray-300 focus:border-gray-900'
                }`}
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
              <p className="text-xs font-mono text-gray-400 mt-1">
                Min 8 characters, uppercase, lowercase, and a number
              </p>
            </div>

            {/* CHECKBOX */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-black"
              />
              <p className="text-xs font-light text-gray-500 leading-relaxed">
                I have read and agree to the{" "}
                <span className="text-gray-900 font-medium underline underline-offset-2 cursor-pointer hover:text-gray-500 transition-colors">
                  Terms of Use
                </span>
              </p>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white hover:bg-gray-700 px-6 py-3 text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 rounded-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-300">01</span>
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Have an account?</span>
              <Link
                to="/login"
                className="text-xs font-bold tracking-widests text-gray-900 uppercase underline underline-offset-2 hover:text-gray-500 transition-colors"
              >
                Sign in
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