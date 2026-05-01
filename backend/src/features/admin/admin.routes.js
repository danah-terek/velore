const router = require('express').Router()
const adminController = require('./admin.controller')
const { adminAuthMiddleware } = require('../../shared/middleware/middleware')
const rbac = require('../rbac')

// ─── Public ────────────────────────────────────────────────────
router.post('/login', adminController.login)

// ─── All routes below require admin JWT ────────────────────────
router.use(adminAuthMiddleware)

// Dashboard
router.get('/dashboard', rbac.requirePermission('read:dashboard'), adminController.getDashboard)

// Users
router.get('/users', rbac.requirePermission('read:users'), adminController.getUsers)
router.get('/users/:userId', rbac.requirePermission('read:users'), adminController.getUser)
router.patch('/users/:userId/toggle-status', rbac.requirePermission('update:users'), adminController.toggleUserStatus)
router.delete('/users/:userId', rbac.requirePermission('delete:users'), adminController.deleteUser)

// Products
router.get('/products', rbac.requirePermission('read:products'), adminController.getProducts)
router.patch('/products/:productId/toggle-status', rbac.requirePermission('update:products'), adminController.toggleProductStatus)
router.delete('/products/:productId', rbac.requirePermission('delete:products'), adminController.deleteProduct)

// Orders
router.get('/orders', rbac.requirePermission('read:orders'), adminController.getOrders)
router.patch('/orders/:orderId/status', rbac.requirePermission('update:orders'), adminController.updateOrderStatus)

// Audit Logs
router.get('/audit-logs', rbac.requirePermission('read:audit_logs'), adminController.getAuditLogs)

// Super Admin only — create new admin
router.post('/admins', rbac.requireSuperAdmin, adminController.createAdmin)

module.exports = router