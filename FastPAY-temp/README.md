# FastPAY — PUBG Account Marketplace

**Telegram Mini App** | PUBG Mobile akkauntlarini xavfsiz sotib olish va sotish platformasi.

## Texnologiyalar
- **Backend**: NestJS (TypeScript) + Prisma ORM + PostgreSQL + Redis
- **Frontend**: React 18 + Vite + Tailwind CSS v4 + Telegram WebApp SDK
- **Auth**: Telegram initData (HMAC-SHA256) + JWT
- **Security**: AES-256-GCM shifrlash, Escrow tizimi, Rate limiting

## Tez Ishga Tushirish

```bash
# 1. .env faylni tayyorlash
cp .env.example .env

# 2. Docker (Postgres + Redis)
docker compose up -d

# 3. Backend
cd backend && npm install && npm run start:dev

# 4. Frontend
cd frontend && npm install && npm run dev
```

Frontend: `http://localhost:5173/` | Backend API: `http://localhost:3000/`

## Asosiy Funksiyalar
- 🛡️ **Escrow tizimi** — pul admin tekshirguncha xavfsiz saqlanadi
- 🤖 **Telegram auth** — initData orqali xavfsiz autentifikatsiya
- 🌐 **Ko'p tilli** — UZ / RU / EN
- 💳 **Pul kiritish** — Uzcard/Humo, Click, Payme (qo'lda tasdiq)
- 📱 **Dark mode UI** — tezPIN uslubidagi zamonaviy dizayn
