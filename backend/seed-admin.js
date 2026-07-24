const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('admin123');
  await prisma.adminUser.upsert({
    where: { email: 'admin@fastpay.uz' },
    update: { passwordHash, isActive: true, role: 'SUPERADMIN' },
    create: { email: 'admin@fastpay.uz', passwordHash, role: 'SUPERADMIN', isActive: true, totpSecret: '' }
  });
  console.log('Admin created!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
