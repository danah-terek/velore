import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminSidebar, { getMenuByRole } from '../components/admin/AdminSidebar'
import DashboardOverview from '../components/admin/DashboardOverview'
import StaffManagement from '../components/admin/StaffManagement'
import CustomersList from '../components/admin/CustomersList'
import OrdersManagement from '../components/admin/OrdersManagement'
import ProductsManagement from '../components/admin/ProductsManagement'
import ReviewApproval from '../components/admin/ReviewApproval'
import BlogManager from '../components/admin/BlogManager'
import AnalyticsPage from '../components/admin/AnalyticsPage'
import AuditLogs from '../components/admin/AuditLogs'

function readAdminRole() {
  try {
    const raw = sessionStorage.getItem('velore_admin_user')
    if (!raw) return null
    const u = JSON.parse(raw)
    return u?.role || null
  } catch {
    return null
  }
}

export default function Admin() {
  const navigate = useNavigate()
  const [role, setRole] = useState(() => readAdminRole())
  const [activeTab, setActiveTab] = useState('overview')
  const adminToken = sessionStorage.getItem('admin_token')

  // Clear admin session when leaving the page
  useEffect(() => {
    return () => {
      // Only clear if navigating away from admin (not just re-rendering)
    }
  }, [])

  useEffect(() => {
    setRole(readAdminRole())
  }, [adminToken])

  const menu = useMemo(() => getMenuByRole(role || 'admin'), [role])

  useEffect(() => {
    if (!menu.some((item) => item.id === activeTab)) {
      setActiveTab(menu[0]?.id || 'orders')
    }
  }, [menu, activeTab])

  const logout = () => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('velore_admin_user')
    navigate('/admin/login', { replace: true })
  }

  // Clear session when navigating away from admin
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('admin_token')
      sessionStorage.removeItem('velore_admin_user')
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />
  }

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-sm text-gray-600 mb-4">Could not read admin role. Please sign in again.</p>
        <button type="button" onClick={logout} className="bg-gray-900 text-white hover:bg-gray-700 px-6 py-2.5 text-sm font-medium transition-colors">
          Go to login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 md:px-16 py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Admin dashboard</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <AdminSidebar role={role} activeTab={activeTab} onChange={setActiveTab} onLogout={logout} />
          <main className="flex-1 min-w-0">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'staff' && role === 'super_admin' && <StaffManagement />}
            {activeTab === 'customers' && <CustomersList />}
            {activeTab === 'orders' && <OrdersManagement />}
            {activeTab === 'products' && <ProductsManagement />}
            {activeTab === 'reviews' && <ReviewApproval />}
            {activeTab === 'blogs' && <BlogManager />}
            {activeTab === 'audit' && role === 'super_admin' && <AuditLogs />}
            {activeTab === 'analytics' && role === 'super_admin' && <AnalyticsPage />}
          </main>
        </div>
      </div>
    </div>
  )
}