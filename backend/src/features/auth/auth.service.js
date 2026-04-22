const prisma = require('../../shared/utils/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
  }
}

module.exports = authService