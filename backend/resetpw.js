const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('SuperAdmin123!Demo', 10)
  const admin = await prisma.admin.update({
    where: { email: 'superadmin@velore.com' },
    data: { password_hash: hash }
  })
  console.log('Password reset for:', admin.email)
}

main().finally(() => prisma.$disconnect())