import { PrismaClient, AccountStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { config as loadEnv } from 'dotenv';

// Load root + backend .env
const root = path.resolve(__dirname, '..');
for (const p of [path.join(root, '.env'), path.join(root, 'backend', '.env')]) {
  if (fs.existsSync(p)) loadEnv({ path: p, override: false });
}

const prisma = new PrismaClient();

function encryptText(plain: string): { ciphertext: string; keyVersion: string } {
  const raw = process.env.ENCRYPTION_KEY || 'fastpay-dev-key';
  const key = /^[0-9a-fA-F]{64}$/.test(raw)
    ? Buffer.from(raw, 'hex')
    : crypto.createHash('sha256').update(raw).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([iv, tag, encrypted]).toString('base64'),
    keyVersion: 'v1',
  };
}

async function main() {
  const email = 'admin@fastpay.uz';
  const passwordHash = await argon2.hash('admin123');

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, isActive: true, role: 'SUPERADMIN' },
    create: {
      email,
      passwordHash,
      role: 'SUPERADMIN',
      isActive: true,
    },
  });

  const demoSku = 'PG-1001';
  const existing = await prisma.account.findUnique({ where: { sku: demoSku } });
  if (!existing) {
    const login = encryptText('demo_pubg_login');
    const password = encryptText('demo_pubg_pass');

    await prisma.account.create({
      data: {
        sku: demoSku,
        title: 'Conqueror Account — Demo',
        rank: 'Conqueror',
        level: 70,
        skinsCount: 120,
        ucBalance: 5000,
        price: 450000,
        status: AccountStatus.AVAILABLE,
        description: 'Demo akkaunt — seed orqali yaratilgan.',
        images: [],
        createdByAdminId: admin.id,
        credential: {
          create: {
            encryptedLogin: login.ciphertext,
            encryptedPassword: password.ciphertext,
            encryptionKeyVersion: login.keyVersion,
          },
        },
      },
    });
  }

  const demoSku2 = 'PG-1002';
  const existing2 = await prisma.account.findUnique({ where: { sku: demoSku2 } });
  if (!existing2) {
    const login = encryptText('ace_login');
    const password = encryptText('ace_pass');
    await prisma.account.create({
      data: {
        sku: demoSku2,
        title: 'Ace Dominator — Budget',
        rank: 'Ace',
        level: 55,
        skinsCount: 40,
        ucBalance: 800,
        price: 180000,
        status: AccountStatus.AVAILABLE,
        description: 'Arzon demo akkaunt.',
        images: [],
        createdByAdminId: admin.id,
        credential: {
          create: {
            encryptedLogin: login.ciphertext,
            encryptedPassword: password.ciphertext,
            encryptionKeyVersion: login.keyVersion,
          },
        },
      },
    });
  }

  console.log('Seed OK — admin@fastpay.uz / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
