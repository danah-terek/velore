import { useState } from "react";
import { Link } from "react-router-dom";
import loginPhoto from "../assets/loginphoto.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    console.log("Sign in:", { email, password });
  };

  return (
    // ✅ FIX 1: min-h-screen → h-screen (prevents full page scroll)
    <div className="flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-white font-sans">

      {/* LEFT IMAGE */}
      {/* ✅ FIX 2: smaller + balanced like signup */}
      <div className="relative w-full h-64 md:h-full md:w-[45%] overflow-hidden">
        <img
          src={loginPhoto}
          alt="Fashion model with sunglasses"
          className="w-full h-full object-cover object-center"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-white/30" />

        {/* Mobile fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white md:hidden" />

        {/* Desktop fade */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-40 bg-gradient-to-r from-transparent to-white" />
      </div>

      {/* RIGHT FORM */}
      {/* ✅ FIX 3: only form scrolls if needed */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 md:px-12 bg-white overflow-y-auto">
        
        {/* ✅ FIX 4: slightly tighter width */}
        <div className="w-full max-w-sm">

          <h1 className="text-4xl md:text-5xl font-black tracking-wide uppercase text-black mb-8">
            LOGIN
          </h1>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-1.5 tracking-wide">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black transition duration-200"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-1.5 tracking-wide">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black transition duration-200"
            />
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
            className="w-full bg-black text-white py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition"
          >
            SIGN IN
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