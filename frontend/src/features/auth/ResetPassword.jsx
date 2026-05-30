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

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const allRulesMet = Object.values(rules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) return setError("Password is required");
    if (!allRulesMet) return setError("Password does not meet all requirements");
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

  const RuleItem = ({ met, text }) => (
    <li className={`flex items-center gap-2 text-xs ${met ? "text-green-600" : "text-gray-400"}`}>
      <span>{met ? "✓" : "○"}</span>
      {text}
    </li>
  );

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
              Account Recovery
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2">
              New <span className="font-serif italic font-normal text-black block md:inline">password.</span>
            </h1>
            <p className="text-base font-light text-gray-500 max-w-2xl leading-relaxed">
              Choose a strong new password for your account.
            </p>
          </div>

          {!success ? (
            <>
              {error && (
                <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full border border-gray-300 focus:border-gray-900 px-3 py-2.5 text-sm font-light text-gray-900 outline-none transition-colors bg-white rounded-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {password.length > 0 && (
                    <ul className="mt-2 space-y-1 pl-1">
                      <RuleItem met={rules.length} text="At least 8 characters" />
                      <RuleItem met={rules.uppercase} text="One uppercase letter" />
                      <RuleItem met={rules.lowercase} text="One lowercase letter" />
                      <RuleItem met={rules.number} text="One number" />
                    </ul>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    className="w-full border border-gray-300 focus:border-gray-900 px-3 py-2.5 text-sm font-light text-gray-900 outline-none transition-colors bg-white rounded-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="w-full bg-gray-900 text-white hover:bg-gray-700 px-6 py-3 text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 rounded-sm cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating…</span>
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>

              </form>
            </>
          ) : (
            <div className="py-6">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Password updated!</p>
              <p className="text-sm font-light text-gray-500 leading-relaxed">Redirecting you to login...</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-300">01</span>
              <Link
                to="/login"
                className="text-xs font-bold tracking-widest text-gray-900 uppercase underline underline-offset-2 hover:text-gray-500 transition-colors"
              >
                ← Back to login
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