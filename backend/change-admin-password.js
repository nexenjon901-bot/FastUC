const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const newPassword = args[0];

  if (!newPassword) {
    console.log("Iltimos, yangi parolni kiriting. Masalan: node change-admin-password.js mening_yangi_parolim");
    process.exit(1);
  }

  const passwordHash = await argon2.hash(newPassword);
  
  await prisma.adminUser.update({
    where: { email: 'admin@fastpay.uz' },
    data: { passwordHash }
  });

  console.log(`\n✅ Parol muvaffaqiyatli o'zgartirildi! Yangi parol: ${newPassword}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
