const authService = require('./auth.service')
const prisma = require('../../shared/utils/database')
const authController = {
  async register(req, res, next) {
    try {
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
    const user = await prisma.users.findUnique({  // 👈 users
      where: { user_id: BigInt(req.user.userId) },  // 👈 user_id + BigInt
      include: { roles: true }  // 👈 roles
    })

    res.json({
      success: true,
      data: { id: user.user_id.toString(), email: user.email, name: user.name, role: user.roles.name }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}


}

module.exports = authController