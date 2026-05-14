const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.admin.findMany({ include: { roles: true } }).then(r => {
  const safe = r.map(a => ({
    id: a.admin_id.toString(),
    email: a.email,
    name: a.name,
    role: a.roles?.name,
    role_id: a.role_id?.toString()
  }));
  console.log(safe);
  p.$disconnect();
});