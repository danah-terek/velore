import { lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { AdminAuthProvider, useAdminAuth } from './auth/AdminAuthContext'
import AdminLogin from './auth/AdminLogin'
import AdminProtectedRoute from './auth/AdminProtectedRoute'
import AdminRoleGuard from './auth/AdminRoleGuard'
import CRMLayout from './layout/CRMLayout'

const CRMDashboard    = lazy(() => import('./dashboard/CRMDashboard'))
const CRMProducts     = lazy(() => import('./products/CRMProducts'))
const CRMProductEditor = lazy(() => import('./products/CRMProductEditor'))
const CRMInventory    = lazy(() => import('./inventory/CRMInventory'))
const CRMOrders       = lazy(() => import('./orders/CRMOrders'))
const CRMCustomers    = lazy(() => import('./customers/CRMCustomers'))
const CRMReviews      = lazy(() => import('./reviews/CRMReviews'))
const CRMBlogs        = lazy(() => import('./blogs/CRMBlogs'))
const CRMAnalytics    = lazy(() => import('./analytics/CRMAnalytics'))
const CRMStaff        = lazy(() => import('./staff/CRMStaff'))
const CRMSettings     = lazy(() => import('./settings/CRMSettings'))

// ─── Clears admin session whenever the user leaves /admin entirely ────────────
function AdminSessionGuard() {
  const { logout, isAuthenticated } = useAdminAuth()

  useEffect(() => {
    // When this component unmounts, the user has navigated away from /admin.
    // Force logout so re-entering /admin always requires a fresh login.
    return () => {
      logout()
    }
  }, [logout])

  return null
}

function AdminRoutes() {
  return (
    <>
      <AdminSessionGuard />
      <Routes>
        <Route path="login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route element={<CRMLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"        element={<CRMDashboard />} />
            <Route path="products"         element={<CRMProducts />} />
            <Route path="products/new"     element={<CRMProductEditor mode="create" />} />
            <Route path="products/:id/edit" element={<CRMProductEditor mode="edit" />} />
            <Route path="inventory"        element={<CRMInventory />} />
            <Route path="orders"           element={<CRMOrders />} />
            <Route path="customers"        element={<CRMCustomers />} />
            <Route path="reviews"          element={<CRMReviews />} />
            <Route path="blogs"            element={<CRMBlogs />} />

            <Route element={<AdminRoleGuard allow={['super_admin']} />}>
              <Route path="analytics" element={<CRMAnalytics />} />
              <Route path="staff"     element={<CRMStaff />} />
              <Route path="settings"  element={<CRMSettings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </>
  )
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminRoutes />
    </AdminAuthProvider>
  )
}