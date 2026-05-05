const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: { name: 'super_admin', description: 'Full access' }
  });
  console.log('Role ready:', role.name, 'ID:', role.role_id.toString());

  const hash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@velore.com' },
    update: { password_hash: hash },
    create: {
      email: 'admin@velore.com',
      password_hash: hash,
      name: 'Super Admin',
      role_id: role.role_id
    }
  });
  console.log('Admin created:', admin.email);
  console.log('Password: admin123');
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect());