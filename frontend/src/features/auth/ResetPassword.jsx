import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import loginPhoto from "../../assets/loginphoto.jpg";
import apiClient from "../../shared/services/apiClient";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) return setError("Password is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    if (!token) return setError("Invalid reset link");

    setLoading(true);

    try {
      await apiClient.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.error || "Invalid or expired reset link. Please request a new one.");
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
          <h1 className="text-4xl md:text-5xl font-black tracking-wide uppercase text-black mb-3">
            NEW PASSWORD
          </h1>

          {!success ? (
            <>
              <p className="text-sm text-gray-500 mb-8">
                Choose a strong new password for your account.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-medium text-black mb-1.5 tracking-wide">
                  New Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black transition duration-200"
                  placeholder="••••••••"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-1.5 tracking-wide">
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                  className="w-full border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black transition duration-200"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-black text-white py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium mb-1">Password updated!</p>
              <p className="text-sm text-gray-500">Redirecting you to login...</p>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="text-black font-medium underline hover:text-gray-700">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}