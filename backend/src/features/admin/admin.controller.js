const adminService = require('./admin.service')

const adminController = {

  // ─── Auth ──────────────────────────────────────────────────

  async login(req, res) {
    try {
      const { email, password } = req.body
      if (!email || !password)
        return res.status(400).json({ success: false, error: 'Email and password required' })

      const result = await adminService.login(email, password)
      res.json({ success: true, data: result })
    } catch (error) {
      res.status(401).json({ success: false, error: error.message })
    }
  },

  async createAdmin(req, res) {
    try {
      const result = await adminService.createAdmin(req.admin.adminId, req.body)
      res.status(201).json({ success: true, data: result })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  // ─── Dashboard ─────────────────────────────────────────────

  async getDashboard(req, res) {
    try {
      const data = await adminService.getDashboardStats()
      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },

  // ─── Users ─────────────────────────────────────────────────

  async getUsers(req, res) {
    try {
      const { page, limit, search, is_active } = req.query
      const data = await adminService.getAllUsers({
        page,
        limit,
        search,
        is_active: is_active !== undefined ? is_active === 'true' : undefined
      })
      res.json({ success: true, ...data })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },

  async getUser(req, res) {
    try {
      const data = await adminService.getUserById(req.params.userId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(404).json({ success: false, error: error.message })
    }
  },

  async toggleUserStatus(req, res) {
    try {
      const data = await adminService.toggleUserStatus(req.admin.adminId, req.params.userId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async deleteUser(req, res) {
    try {
      const data = await adminService.deleteUser(req.admin.adminId, req.params.userId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  // ─── Products ──────────────────────────────────────────────

  async getProducts(req, res) {
    try {
      const { page, limit, search, is_active } = req.query
      const data = await adminService.getAllProducts({
        page,
        limit,
        search,
        is_active: is_active !== undefined ? is_active === 'true' : undefined
      })
      res.json({ success: true, ...data })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },

  async toggleProductStatus(req, res) {
    try {
      const data = await adminService.toggleProductStatus(req.admin.adminId, req.params.productId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  async deleteProduct(req, res) {
    try {
      const data = await adminService.deleteProduct(req.admin.adminId, req.params.productId)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  // ─── Orders ────────────────────────────────────────────────

  async getOrders(req, res) {
    try {
      const { page, limit, status } = req.query
      const data = await adminService.getAllOrders({ page, limit, status })
      res.json({ success: true, ...data })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const data = await adminService.updateOrderStatus(req.admin.adminId, req.params.orderId, req.body.status)
      res.json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  },

  // ─── Audit Logs ────────────────────────────────────────────

  async getAuditLogs(req, res) {
    try {
      const data = await adminService.getAuditLogs(req.query)
      res.json({ success: true, ...data })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
}

module.exports = adminController