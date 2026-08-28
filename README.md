# DIGITAL CARD PLATFORM (ĐA DANH MỤC: WEDDING / BIRTHDAY / NEWBORN)

Hệ thống nền tảng tạo và quản lý thiệp điện tử (Thiệp cưới, Thiệp sinh nhật, Thiệp báo hỷ & thôi nôi) với hiệu ứng phong bì sáp nến 3D, nhạc nền, quản lý RSVP realtime và thanh toán VietQR tự động.

---

## 📁 CẤU TRÚC DỰ ÁN

```
WebsiteThiep/
├── be/                 # BACKEND SERVICE (Node.js/Express + Prisma + PostgreSQL + Redis + BullMQ)
│   ├── prisma/         # Schema, Migrations, Seed data
│   └── src/
│       ├── controllers/
│       ├── lib/        # Prisma, Redis, BullMQ, VietQR, Zod Validators
│       ├── queues/     # BullMQ Worker xử lý thông báo Telegram ngầm
│       ├── routes/     # API Endpoints
│       ├── services/   # Business logic (Card, RSVP, Wish, Order/SePay Webhook)
│       └── server.ts   # Express server entry point
│
└── fe/                 # FRONTEND APP (Next.js 15 App Router + React 19 + Tailwind CSS v4)
    └── src/
        ├── app/        # Public routes (/thiep/[slug]) & Dashboard routes
        ├── components/ # Shared effects (OpeningEffect, FallingEffect, RSVP, Guestbook)
        ├── config/     # Plans (FREE/BASIC/VIP), Card Categories
        └── types/      # TypeScript Discriminated Unions
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY

### 1. Khởi động Backend (`be/`)
```bash
cd be
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Sinh Prisma Client & đẩy schema lên DB
npm run prisma:generate
npm run prisma:push

# Gieo dữ liệu mẫu (Plans FREE/BASIC/VIP, Mẫu thiệp)
npm run prisma:seed

# Chạy Backend API (Port 5000)
npm run dev

# Chạy Worker xử lý thông báo ngầm (Terminal riêng)
npm run worker:rsvp
```

### 2. Khởi động Frontend (`fe/`)
```bash
cd fe
npm install
npm run dev
# Truy cập http://localhost:3000
```
