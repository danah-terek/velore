const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function seed() {
  const messages = [
    { slot: 1, message: '🕶️ Free shipping on orders over $100', is_active: true },
    { slot: 2, message: '✨ New summer collection just dropped', is_active: true },
    { slot: 3, message: '🎓 15% student discount — verify with .edu email', is_active: true },
    { slot: 4, message: '📦 Buy 2 pairs, get 1 free on selected frames', is_active: true },
  ]

  for (const msg of messages) {
    await p.top_banner.create({ data: msg })
  }

  console.log('Banner seeded!')
  await p.$disconnect()
}

seed()