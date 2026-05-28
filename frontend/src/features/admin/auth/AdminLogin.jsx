import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import phot from '../../../assets/loginA.png'

export default function AdminLogin() {
  const { login, error: authError, isAuthenticated } = useAdminAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    await login(email, password)
    setLoading(false)
  }

  if (isAuthenticated) {
    const from = location.state?.from
    return <Navigate to={typeof from === 'string' ? from : '/admin/dashboard'} replace />
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased selection:bg-black selection:text-white flex flex-col md:flex-row relative overflow-hidden">
      
      {/* LEFT SIDE: Split Brand Image Showcase - Structured Aspect Container */}
      <div className="w-full md:w-[40%] lg:w-[38%] xl:w-[35%] bg-gray-50 relative min-h-[35vh] md:min-h-screen overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-neutral-100 rounded-full blur-3xl opacity-60 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="w-full h-full absolute inset-0">
          <img
            src={phot}
            alt="Velore editorial showcase"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>

        <div className="hidden sm:block absolute bottom-6 left-6 bg-black text-white px-4 py-2.5 rounded-sm shadow-xl">
          <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-0.5">Studio Process</p>
          <p className="text-xs font-serif italic">Velore Workspace</p>
        </div>
      </div>

      {/* RIGHT SIDE: Control Form Container - Pure Original Typography & Structure */}
      <div className="w-full md:w-[60%] lg:w-[62%] xl:w-[65%] flex flex-col justify-center px-6 py-12 md:py-24 bg-white relative">
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-100 rounded-full blur-3xl opacity-40 -mr-40 -mt-40 pointer-events-none" />
        
        <div className="w-full max-w-sm mx-auto relative z-10">
          
          {/* Header */}
          <div className="mb-8">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.3em] text-black bg-gray-100 px-3 py-1 rounded-full uppercase mb-6">
              Internal Access
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2">
              Velore <span className="font-serif italic font-normal text-black block md:inline">control.</span>
            </h1>
            <p className="text-base font-light text-gray-500 max-w-2xl leading-relaxed">
              Sign in to your administration panel.
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm">
              {authError}
            </div>
          )}

          {/* Core Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@velore.com"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm font-light text-gray-900 outline-none focus:border-gray-900 transition-colors bg-white rounded-sm"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 px-3 py-2.5 pr-14 text-sm font-light text-gray-900 outline-none focus:border-gray-900 transition-colors bg-white rounded-sm"
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
            </div>

            {/* Action Submit Button */}
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

          {/* Core Pillars Style Footer Line */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-300">01</span>
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Secure</span>
            </div>
            <div className="text-sm text-gray-500 font-light">
              Velore Admin · 2026
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}