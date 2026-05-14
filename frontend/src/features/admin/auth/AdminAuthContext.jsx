import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { adminAuthService } from '../services/adminAuthService'

const AdminAuthContext = createContext(null)

const ADMIN_TOKEN_KEY = 'admin_token'
const ADMIN_USER_KEY = 'velore_admin_user'

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]       = useState(null)   // { id, name, email, role }
  const [token, setToken]       = useState(null)
  const [loading, setLoading]   = useState(true)   // true while we check localStorage
  const [error, setError]       = useState(null)

  // ─── Rehydrate from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY)
    const storedAdmin = localStorage.getItem(ADMIN_USER_KEY)
    if (storedToken && storedAdmin) {
      try {
        setToken(storedToken)
        setAdmin(JSON.parse(storedAdmin))
      } catch {
        localStorage.removeItem(ADMIN_USER_KEY)
      }
    }
    setLoading(false)
  }, [])

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const { token: newToken, admin: adminData } = await adminAuthService.login({ email, password })

      localStorage.setItem(ADMIN_TOKEN_KEY, newToken)
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminData))

      setToken(newToken)
      setAdmin(adminData)
      return true
    } catch (err) {
      setError(err?.message || err?.error || 'Login failed')
      return false
    }
  }, [])

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)
    setToken(null)
    setAdmin(null)
  }, [])

  const isAuthenticated = !!token && !!admin

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, error, login, logout, isAuthenticated }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return ctx
}