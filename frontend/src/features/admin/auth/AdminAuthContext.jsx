import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import adminService from '../adminService'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]       = useState(null)   // { id, name, email, role }
  const [token, setToken]       = useState(null)
  const [loading, setLoading]   = useState(true)   // true while we check localStorage
  const [error, setError]       = useState(null)

  // ─── Rehydrate from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedAdmin = localStorage.getItem('velore_admin_user')
    if (storedToken && storedAdmin) {
      try {
        setToken(storedToken)
        setAdmin(JSON.parse(storedAdmin))
      } catch {
        localStorage.removeItem('velore_admin_user')
      }
    }
    setLoading(false)
  }, [])

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const res = await adminService.login(email, password)
      // res is already unwrapped by apiClient interceptor → res.data
      const { token: newToken, admin: adminData } = res.data

      localStorage.setItem('token', newToken)
      localStorage.setItem('velore_admin_user', JSON.stringify(adminData))

      setToken(newToken)
      setAdmin(adminData)
      return true
    } catch (err) {
      setError(err.error || err.message || 'Login failed')
      return false
    }
  }, [])

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('velore_admin_user')
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