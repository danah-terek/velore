const permissionAliases = {
  'read:dashboard': 'read:dashboard_operational',
  'read:users': 'read:customers',
  'update:users': 'write:customers_status',
  'delete:users': 'delete:customers',
  'create:products': 'write:products',
  'update:products': 'write:products',
  'update:orders': 'write:orders',
  'create:brands': 'write:brands',
  'update:brands': 'write:brands',
  'delete:brands': 'write:brands',
  'create:categories': 'write:categories',
  'update:categories': 'write:categories',
  'delete:categories': 'write:categories'
}

function normalizePermission(permission) {
  return permissionAliases[permission] || permission
}

const rbac = {
  roles: {
    super_admin: ['*'],
    staff: [
      'read:dashboard_operational',
      'read:products',
      'write:products',
      'read:orders',
      'write:orders',
      'read:customers',
      'read:reviews',
      'moderate:reviews'
    ],
    staff_admin: [
      'read:dashboard_operational',
      'read:products',
      'write:products',
      'read:inventory',
      'write:inventory',
      'read:orders',
      'write:orders',
      'read:customers',
      'write:customers_status',
      'read:reviews',
      'write:brands',
      'moderate:reviews',
      'read:blogs',
      'write:blogs',
      'read:audit_logs'
    ],
    admin: [
      'read:dashboard_operational',
      'read:products',
      'write:products',
      'read:inventory',
      'write:inventory',
      'read:orders',
      'write:orders',
      'read:customers',
      'write:customers_status',
      'read:reviews',
      'write:brands',
      'moderate:reviews',
      'read:blogs',
      'write:blogs',
      'read:audit_logs'
    ],
    customer: []
  }
}

rbac.requirePermission = function(permission) {
  return (req, res, next) => {
    const role = req.user?.role
    if (!role) return res.status(403).json({ success: false, message: 'No role assigned' })
    const permissions = rbac.roles[role] || []
    if (permissions.includes('*')) return next()
    const normalized = normalizePermission(permission)
    if (permissions.includes(normalized) || permissions.includes(permission)) return next()
    return res.status(403).json({ success: false, message: 'Permission denied' })
  }
}

rbac.requireSuperAdmin = (req, res, next) => {
  const role = req.user?.role
  if (role === 'super_admin') return next()
  return res.status(403).json({ success: false, message: 'Super Admin access required' })
}

module.exports = rbac