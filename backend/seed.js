const { PrismaClient } = require('./node_modules/.prisma/client');
const prisma = new PrismaClient();

const ucProducts = [
  { amount: 60, price: 12900 }, { amount: 120, price: 25900 }, { amount: 180, price: 38900 },
  { amount: 325, price: 65100 }, { amount: 385, price: 78100 }, { amount: 660, price: 130300 },
  { amount: 720, price: 143200 }, { amount: 985, price: 195400 }, { amount: 1320, price: 260500 },
  { amount: 1800, price: 325600 }, { amount: 2125, price: 390800 }, { amount: 2460, price: 455900 },
  { amount: 3850, price: 651300 }, { amount: 8100, price: 1302500 }
];

const starsProducts = [
  { amount: 50, price: 11000 }, { amount: 100, price: 21950 }, { amount: 150, price: 32950 },
  { amount: 250, price: 54900 }, { amount: 350, price: 76850 }, { amount: 500, price: 109750 },
  { amount: 750, price: 164650 }, { amount: 1000, price: 219500 }
];

async function seed() {
  await prisma.product.deleteMany({});
  let order = 0;
  for (const uc of ucProducts) {
    await prisma.product.create({ data: { id: 'uc_' + uc.amount, category: 'UC', label: uc.amount + ' UC', amount: uc.amount, priceUzs: uc.price, sortOrder: order++, isFeatured: [60, 325, 660].includes(uc.amount) } });
  }
  order = 0;
  for (const star of starsProducts) {
    await prisma.product.create({ data: { id: 'stars_' + star.amount, category: 'STARS', label: star.amount + ' Stars', amount: star.amount, priceUzs: star.price, sortOrder: order++, isFeatured: [50, 100, 250, 500].includes(star.amount) } });
  }
  console.log('Seeded successfully!');
}

seed().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
