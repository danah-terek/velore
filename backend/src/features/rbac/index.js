const rbac = {
  roles: {
    super_admin: ['*'],
    admin: [
      'read:users', 'update:users', 'delete:users',
      'read:products', 'create:products', 'update:products', 'delete:products',
      'read:orders', 'update:orders',
      'read:brands', 'create:brands', 'update:brands', 'delete:brands',
      'read:categories', 'create:categories', 'update:categories', 'delete:categories',
      'read:reviews', 'delete:reviews',
      'read:dashboard', 'read:audit_logs'
    ],
    customer: []
  },

  hasPermission(role, permission) {
    const permissions = this.roles[role] || []
    return permissions.includes('*') || permissions.includes(permission)
  },

  requirePermission(permission) {
    return (req, res, next) => {
      const role = req.admin?.role
      if (!role) {
        return res.status(403).json({ success: false, error: 'Access denied' })
      }
      if (!this.hasPermission(role, permission)) {
        return res.status(403).json({ success: false, error: `Missing permission: ${permission}` })
      }
      next()
    }
  },

  requireSuperAdmin(req, res, next) {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Super admin access required' })
    }
    next()
  }
}

module.exports = rbac