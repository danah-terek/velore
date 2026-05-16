import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

export default function AdminProtectedRoute() {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  // Show a plain loader while sessionStorage is being read on mount.
  // Returning null here caused the flicker — the route would briefly
  // render as unauthenticated before the token was rehydrated.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}