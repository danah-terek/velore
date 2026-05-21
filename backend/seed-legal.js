const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function seed() {
  const pages = [
    { slug: 'refund-policy', title: 'Refund Policy', content: '## Refund Policy\n\nWe offer a 30-day return window...' },
    { slug: 'privacy-policy', title: 'Privacy Policy', content: '## Privacy Policy\n\nYour privacy is important to us...' },
    { slug: 'terms-of-service', title: 'Terms of Service', content: '## Terms of Service\n\nBy using Velore you agree to...' },
    { slug: 'shipping-policy', title: 'Shipping Policy', content: '## Shipping Policy\n\nFree shipping on orders over $50...' },
  ]

  for (const page of pages) {
    await p.legal_pages.upsert({
      where: { slug: page.slug },
      update: {},
      create: page
    })
  }

  console.log('Legal pages seeded!')
  await p.$disconnect()
}

seed()