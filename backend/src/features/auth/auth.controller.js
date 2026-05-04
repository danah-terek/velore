const { validationResult } = require('express-validator')
const authService = require('./auth.service')
const prisma = require('../../shared/utils/database')

const authController = {
  async register(req, res, next) {
    try {
      // ✅ Check validation results
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map(e => e.msg)
        })
      }

      const result = await authService.register(req.body)
      res.status(201).json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  },

  async login(req, res, next) {
    try {
      // ✅ Check validation results
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map(e => e.msg)
        })
      }

      const { email, password } = req.body
      const result = await authService.login(email, password)
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      })
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await prisma.users.findUnique({
        where: { user_id: Number(req.user.userId) },
        include: { roles: true }
      })

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }

      res.json({
        success: true,
        data: { 
          id: user.user_id, 
          email: user.email, 
          name: user.name, 
          role: user.roles?.name 
        }
      })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },

  // ─── NEW: Forgot Password ─────────────────────────────────────────
  async forgotPassword(req, res) {
    try {
      const { email } = req.body
      if (!email) return res.status(400).json({ success: false, error: 'Email is required' })
      const result = await authService.forgotPassword(email)
      res.json({ success: true, ...result })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },

  // ─── NEW: Reset Password ──────────────────────────────────────────
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body
      if (!token || !password) return res.status(400).json({ success: false, error: 'Token and password are required' })
      if (password.length < 6) return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
      const result = await authService.resetPassword(token, password)
      res.json({ success: true, ...result })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

}

module.exports = authController