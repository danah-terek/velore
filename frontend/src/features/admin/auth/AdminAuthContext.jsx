import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { adminAuthService } from '../services/adminAuthService'

const AdminAuthContext = createContext(null)

const ADMIN_TOKEN_KEY = 'admin_token'
const ADMIN_USER_KEY = 'velore_admin_user'

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // ─── Rehydrate from sessionStorage on mount ────────────────────────────────
  // sessionStorage is cleared automatically when the tab/browser is closed,
  // so the admin must log in again every new session.
  useEffect(() => {
    const storedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY)
    const storedAdmin = sessionStorage.getItem(ADMIN_USER_KEY)
    if (storedToken && storedAdmin) {
      try {
        setToken(storedToken)
        setAdmin(JSON.parse(storedAdmin))
      } catch {
        sessionStorage.removeItem(ADMIN_USER_KEY)
        sessionStorage.removeItem(ADMIN_TOKEN_KEY)
      }
    }
    setLoading(false)
  }, [])

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const { token: newToken, admin: adminData } = await adminAuthService.login({ email, password })

      // Store in sessionStorage — cleared on tab/browser close
      sessionStorage.setItem(ADMIN_TOKEN_KEY, newToken)
      sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminData))

      // Clean up any old localStorage remnants from previous version
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      localStorage.removeItem(ADMIN_USER_KEY)

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
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
    sessionStorage.removeItem(ADMIN_USER_KEY)
    // Also clear localStorage in case of old data
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

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return ctx
}