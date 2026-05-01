const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: { name: 'super_admin', description: 'Full access' }
  })

  await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Admin access' }
  })

  const hash = await bcrypt.hash('SuperAdmin123!', 10)

  const admin = await prisma.admin.upsert({
    where: { email: 'superadmin@velore.com' },
    update: {},
    create: {
      email: 'superadmin@velore.com',
      password_hash: hash,
      name: 'Super Admin',
      role_id: superAdminRole.role_id
    }
  })

  console.log('✅ Super admin created:', admin.email)
  console.log('📧 Email: superadmin@velore.com')
  console.log('🔑 Password: SuperAdmin123!')
}

main().catch(console.error).finally(() => prisma.$disconnect())