import { Outlet } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import CRMAccessDenied from '../shared/CRMAccessDenied'

function normalizeAdminRole(role) {
  if (!role) return null
  // Legacy role treated as staff-equivalent.
  if (role === 'admin') return 'staff_admin'
  return role
}

export default function AdminRoleGuard({ allow }) {
  const { admin } = useAdminAuth()
  const role = normalizeAdminRole(admin?.role)

  const allowedRoles = Array.isArray(allow) ? allow : [allow]
  if (!role || !allowedRoles.includes(role)) return <CRMAccessDenied />
  return <Outlet />
}

