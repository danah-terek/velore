import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginPhoto from "../../assets/loginphoto.jpg";
import authService from "./authService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login({ email, password });
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to home
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

          {/* Error Message */}
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