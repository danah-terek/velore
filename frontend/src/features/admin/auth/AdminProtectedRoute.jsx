import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

export default function AdminProtectedRoute() {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) return null
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

