# CLAUDE.md — HƯỚNG DẪN DỰ ÁN & BẢN ĐỒ KÝ ỨC CONTEXT (MEMORY LEDGER)
*Dự án: Nền tảng Thiệp Điện Tử Đa Danh Mục (Digital Card Platform: Wedding / Birthday / Newborn / Studio)*
*Cập nhật lần cuối: 2026-08-28*

---

## 1. TỔNG QUAN TECH STACK & CẤU TRÚC REPO

```
WebsiteThiep/
├── be/                 # BACKEND SERVICE (Express.js + TypeScript + Prisma + Supabase PostgreSQL + Redis + BullMQ)
├── fe/                 # FRONTEND APP (Next.js 15 App Router + React 19 + Tailwind CSS v4 + Framer Motion)
├── CLAUDE.md           # [BẮT BUỘC ĐỌC] Bản đồ ký ức & Quy chuẩn code
├── DESIGN.md           # [BẮT BUỘC ĐỌC] Tài liệu thiết kế hệ thống, UI/UX & Database Architecture
├── README.md           # Hướng dẫn cài đặt & khởi động dự án
└── PHAN_TICH_JUNVITE_VA_KE_HOACH_XAY_DUNG.md
```

### Tech Stack Chi Tiết:
- **Trang chủ (`fe/src/app/page.tsx`):** Giao diện Cinematic Fullscreen Hero với Video Background chuyển động mượt mà, Hiệu ứng kính lỏng cao cấp (**Liquid Glass**), Font Google **Instrument Serif** + Inter, và chuỗi chuyển động **Fade-Rise Staggered Animations** (`animate-fade-rise`, `animate-fade-rise-delay`, `animate-fade-rise-delay-2`).
- **Đa Ngôn Ngữ (i18n):** Hỗ trợ chuyển đổi tức thì 3 ngôn ngữ: 🇻🇳 Tiếng Việt (`vi`), 🇬🇧 Tiếng Anh (`en`), 🇨🇳 Tiếng Trung (`zh`).
- **Database:** Supabase Cloud PostgreSQL (`itocljpdcrwwianzhblh.supabase.co`) + Prisma ORM 5.x.
- **Frontend Core:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Howler.js, Canvas Confetti.
- **Backend:** Express.js + TypeScript, Prisma ORM 5.x, Redis (ioredis), BullMQ (Queue & Worker), Zod, ExcelJS, Multer.
- **Thanh toán:** Cổng VietQR động + SePay Webhook tự động kích hoạt gói dịch vụ (Idempotent 100%).

---

## 2. CÁC LỆNH THƯỜNG DÙNG (COMMANDS)

### Khởi động Backend (`be/`):
```bash
cd be
npm run dev                     # Chạy Backend API (Port 5000)
npm run worker:rsvp             # Chạy BullMQ Worker gửi thông báo Telegram ngầm
```

### Khởi động Frontend (`fe/`):
```bash
cd fe
npm run dev                     # Chạy Frontend dev server (Port 3000)
```

---

## 3. NHẬT KÝ TIẾN ĐỘ THỰC TẾ (ARCHITECTURE CONTEXT LEDGER)

### 🟢 CÁC MODULE ĐÃ HOÀN THÀNH 100%:
1. **Trang Chủ Cinematic Video Hero (`fe/src/app/page.tsx`):**
   - Video Background Fullscreen tỉ lệ tràn màn hình `object-cover`.
   - Hiệu ứng `.liquid-glass` viền ánh sáng gradient phản chiếu quang học.
   - Typography Instrument Serif sang trọng, hiển thị H1: *"Where dreams rise through the silence."*
   - Bộ 3 animation so le: `.animate-fade-rise`, `.animate-fade-rise-delay`, `.animate-fade-rise-delay-2`.
   - Nút hành động bo tròn lớn *"Begin Journey"*.
2. **Hệ Thống Đa Ngôn Ngữ (i18n):**
   - Từ điển `fe/src/config/i18n.ts` hỗ trợ Tiếng Việt (VI), Tiếng Anh (EN), Tiếng Trung (ZH).
3. **Cấu hình & Đồng bộ Supabase Cloud Database:**
   - Đã tạo 10 bảng dữ liệu lên `itocljpdcrwwianzhblh.supabase.co`.
   - Đã seed sẵn 3 gói cước (FREE/BASIC/VIP) và 5 mẫu thiệp demo.
4. **Backend Services & REST APIs:**
   - Đăng ký/Đăng nhập JWT, CRUD thiệp, Rate-limit RSVP Redis, Webhook SePay VietQR, Xuất file Excel RSVP `.xlsx`.
5. **Shared Components & Views:**
   - `WaxSealOpening`, `FallingEffect`, `AudioPlayer`, `CountdownTimer`, `GiftQrBoxModal`, `RsvpFormModal`, `GuestbookSection`, `BocDoGame`.
   - `WeddingView`, `BirthdayView`, `NewbornView` (2 nhánh).
   - Live Mobile Preview Builder (`/dashboard/cards/new`).
   - RSVP Analytics Dashboard (`/dashboard/cards/[cardId]/rsvp`).
   - Billing VietQR Auto Activation (`/dashboard/billing`).
