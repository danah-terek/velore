const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'prisma', 'seed.js');
const uploadsRoot = path.join(__dirname, '..', 'uploads');

function extractPaths(seedText) {
  const re = /\/uploads\/(?:products|blogs)\/demo\/[a-z0-9\-]+\.(?:svg|png|jpg|jpeg|webp)/gi;
  const matches = seedText.match(re) || [];
  return Array.from(new Set(matches));
}

function toFsPath(publicPath) {
  const relative = publicPath.replace(/^\/uploads\//, '');
  return path.join(uploadsRoot, relative);
}

function main() {
  const seedText = fs.readFileSync(seedPath, 'utf8');
  const publicPaths = extractPaths(seedText);

  const missing = [];
  for (const p of publicPaths) {
    const fp = toFsPath(p);
    if (!fs.existsSync(fp)) missing.push({ publicPath: p, fsPath: fp });
  }

  // eslint-disable-next-line no-console
  console.log(`verify:images → checked ${publicPaths.length} seeded image paths`);

  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error('Missing files:');
    for (const m of missing) {
      // eslint-disable-next-line no-console
      console.error(`- ${m.publicPath}  (expected: ${m.fsPath})`);
    }
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log('All seeded image files exist ✅');
}

main();

