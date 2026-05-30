const prisma = require('../../shared/utils/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

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

    if (user.is_active === false) {
      throw new Error('Your account has been disabled. Please contact support.')
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

  async forgotPassword(email) {
    const user = await prisma.users.findUnique({ where: { email } })
    console.log('🔍 Forgot password request for:', email)
    console.log('👤 User found:', user ? 'YES' : 'NO')

    if (!user) return

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.users.update({
      where: { email },
      data: { reset_token: token, reset_token_expires: expires }
    })

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    console.log('📧 Sending email to:', email)
    console.log('🔗 Reset URL:', resetUrl)

    try {
      const info = await transporter.sendMail({
        from: `"Velore" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Reset your Velore password',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="font-size: 22px; font-weight: 600;">Reset your password</h2>
            <p style="color: #555;">Hi ${user.name || 'there'},</p>
            <p style="color: #555;">We received a request to reset your password. Click the button below — the link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">Reset my password</a>
            <p style="color: #999; font-size: 13px;">Didn't request this? You can safely ignore this email.</p>
          </div>
        `
      })
      console.log('✅ Email sent successfully:', info.messageId)
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message)
      throw emailError
    }
  },

  async resetPassword(token, newPassword) {
    const user = await prisma.users.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: { gt: new Date() }
      }
    })

    if (!user) {
      throw new Error('Invalid or expired reset token')
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
  }
}

module.exports = authService