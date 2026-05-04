const prisma = require('../../shared/utils/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

const authService = {
  async register(userData) {
    const { email, password, name } = userData

    const existingUser = await prisma.users.findUnique({  // 👈 users
      where: { email }
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const customerRole = await prisma.role.findUnique({  // 👈 Role
      where: { name: 'customer' }
    })

    const user = await prisma.users.create({  // 👈 users
      data: {
        email,
        password: hashedPassword,
        name,
        role_id: customerRole.role_id  // 👈 role_id
      }
    })

    await prisma.carts.create({ data: { user_id: user.user_id } })    // 👈 carts
    await prisma.wishlists.create({ data: { user_id: user.user_id } }) // 👈 wishlists

    const token = this.generateToken(user)

    return { user: { id: user.user_id.toString(), email: user.email, name: user.name }, token }
  },

  async login(email, password) {
    const user = await prisma.users.findUnique({  // 👈 users
      where: { email },
      include: { roles: true }  // 👈 roles
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    await prisma.users.update({  // 👈 users
      where: { user_id: user.user_id },  // 👈 user_id
      data: { last_login: new Date() }   // 👈 last_login
    })

    const token = this.generateToken(user)

    return {
      user: {
        id: user.user_id.toString(),
        email: user.email,
        name: user.name,
        role: user.roles.name  // 👈 roles
      },
      token
    }
  },

  generateToken(user) {
    return jwt.sign(
      { userId: user.user_id.toString(), email: user.email, role: user.roles?.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
  },

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET)
  },

  // ─── NEW: Forgot Password ─────────────────────────────────────────
  async forgotPassword(email) {
    const user = await prisma.users.findUnique({ where: { email } })
    if (!user) {
      return { message: 'If this email exists, a reset link has been sent.' }
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.users.update({
      where: { email },
      data: {
        reset_token: token,
        reset_token_expires: expires
      }
    })

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Reset Your Password — Velore',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
          <h2>Reset Your Password</h2>
          <p>Hello ${user.name || ''},</p>
          <p>You requested to reset your password. Click the button below. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:white;border-radius:6px;text-decoration:none;margin:16px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    })

    return { message: 'If this email exists, a reset link has been sent.' }
  },

  // ─── NEW: Reset Password ──────────────────────────────────────────
  async resetPassword(token, newPassword) {
    const user = await prisma.users.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: { gt: new Date() }
      }
    })

    if (!user) {
      throw new Error('Invalid or expired reset token.')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null
      }
    })

    return { message: 'Password reset successfully. You can now log in.' }
  }

}

module.exports = authService