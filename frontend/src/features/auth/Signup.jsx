import { useState } from "react";
import { Link } from "react-router-dom";
import signupPhoto from "../../assets/spimage.png";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();

    if (!agreed) {
      alert("You must agree to the terms.");
      return;
    }

    console.log("Create account:", {
      firstName,
      lastName,
      email,
      password,
    });
  };

  return (
    // ✅ FIX 1: changed min-h-screen → h-screen (prevents full page scroll)
    <div className="flex flex-col md:flex-row w-screen h-screen bg-white overflow-hidden font-sans">

      {/* LEFT IMAGE */}
      {/* ✅ FIX 2: reduced height + better width balance */}
      <div className="relative w-full h-64 md:h-full md:w-[45%] overflow-hidden">
        <img
          src={signupPhoto}
          alt="Fashion model"
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
      {/* ✅ FIX 3: added overflow-y-auto so ONLY form scrolls if needed */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 md:px-12 bg-white overflow-y-auto">
        
        {/* ✅ FIX 4: slightly smaller max width so everything fits nicely */}
        <form
          onSubmit={handleCreate}
          className="w-full max-w-sm"
        >

          {/* TITLE */}
          <h1 className="text-4xl md:text-5xl font-black tracking-wide uppercase text-black mb-7">
            CREATE ACCOUNT
          </h1>

          {/* FIRST + LAST NAME */}
          <div className="flex gap-4 mb-5">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1.5">
                First Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black transition"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1.5">
                Last Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black transition"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1.5">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black transition"
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1.5">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black transition"
            />
          </div>

          {/* CHECKBOX */}
          <div className="flex items-start gap-2 mb-6">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 accent-black"
            />
            <p className="text-xs text-gray-600">
              I have read and agree to the{" "}
              <span className="underline cursor-pointer hover:text-black">
                Terms of Use
              </span>
            </p>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-black text-white py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition"
          >
            CREATE
          </button>

          {/* SIGN IN LINK */}
          <p className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-black font-medium underline hover:text-gray-700"
            >
              Sign in
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}