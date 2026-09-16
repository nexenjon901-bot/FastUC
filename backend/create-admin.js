const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const passwordHash = await argon2.hash('admin123'); // Password will be admin123
    const admin = await prisma.adminUser.upsert({
      where: { email: 'admin@fastuc.uz' },
      update: {
        passwordHash,
      },
      create: {
        email: 'admin@fastuc.uz',
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('Admin user created successfully!');
    console.log('Email: admin@fastuc.uz');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
