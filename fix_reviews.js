const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_order');
  await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS reviews_order_id_key');
  await prisma.$executeRawUnsafe('ALTER TABLE reviews ALTER COLUMN order_id DROP NOT NULL');
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_id_product_id_key ON reviews(user_id, product_id)');
  console.log('All done!');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
