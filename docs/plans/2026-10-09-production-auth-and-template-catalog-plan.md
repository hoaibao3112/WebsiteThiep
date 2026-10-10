# Kế Hoạch Chuẩn Hóa Production: Module Đăng Nhập / Đăng Ký (Auth) & Danh Mục Thiệp Mẫu (Template Catalog)

- **Trạng thái:** Bản thảo đề xuất (Draft Proposal)
- **Ngày tạo:** 2026-10-09
- **Tác giả:** Antigravity AI Assistant & Engineering Team
- **Dự án:** WebsiteThiep (Digital Card Platform)

---

## 1. Bối cảnh & Mục tiêu (Context & Objectives)

### 1.1. Hiện trạng Codebase
Sau khi kiểm tra chi tiết cấu trúc `be/src` và `fe/src`:
1. **Module Đăng Nhập / Đăng Ký (Auth)**:
   - Đã có nền tảng tốt: OTP email (BullMQ + Redis), Google OAuth (idToken verify), Email/Password (bcrypt), CSRF double-submit protection, Rate limit theo IP và Email.
   - **Tồn tại kỹ thuật chưa chuẩn Production**:
     - *Single Long-Lived Token*: Dùng 1 JWT duy nhất hạn 7 ngày (`JWT_EXPIRES_IN = "7d"`). Không có Refresh Token trong Redis/DB để thu hồi chủ động. Nếu user bị đánh cắp token, không thể revoke đơn lẻ.
     - *Thiếu Quên & Đổi Mật Khẩu*: Chưa có API `forgot-password`, `reset-password` qua OTP email, và chưa có API `change-password` cho tài khoản đã đăng nhập.
     - *Client Session Resilience*: Chưa có cơ chế Silent Refresh khi token hết hạn; nếu token hết hạn người dùng sẽ bị đá văng ra màn hình đăng nhập.
2. **Module Thiệp Mẫu (Template Catalog)**:
   - Database Prisma đã có bảng `Template` và file seed nạp một số mẫu cơ bản.
   - **Tồn tại kỹ thuật chưa chuẩn Production**:
     - Backend **chưa có REST API công khai** `GET /api/templates` và `GET /api/templates/:slug`.
     - Frontend `collections/page.tsx` và `cards/new/page.tsx` đang đọc cứng từ file `fe/src/lib/templates-data.ts` (`MASTER_TEMPLATES`).
     - Khi user tạo thiệp (`POST /api/cards`), `CardService.createDraft` tự động `upsert` tạo bản ghi mẫu tạm nếu slug chưa có trong database, dẫn tới nguy cơ trôi lệch dữ liệu (Data Drift).
     - Chưa có cơ chế đồng bộ danh mục thiệp mẫu động giữa Admin / Database và Frontend.

### 1.2. Mục tiêu mong muốn (Objectives)
- Đưa **Authentication** đạt chuẩn Production-Grade bảo mật cao: Dual-Token (Access Token 15m + Refresh Token 7d lưu Redis), đầy đủ luồng Quên mật khẩu & Đổi mật khẩu, cơ chế Silent Token Refresh trên Frontend.
- Xây dựng **Template Catalog Service & REST API**: Cung cấp API danh mục thiệp mẫu động, cache Redis 1 giờ (có cơ chế stale-while-revalidate), đồng bộ dữ liệu hạt giống (Seed Data) đầy đủ 12 mẫu thiệp cao cấp vào PostgreSQL, liên kết chặt chẽ kiểm tra quyền hạn gói cước (`allowPremiumTemplates`).

---

## 2. Quyết định Kiến trúc & Thiết kế Kỹ thuật (Key Architectural Decisions)

### Quyết định 1: Cơ chế Dual-Token với Redis-backed Refresh Token Rotation
- **Access Token:** Ký JWT thời hạn ngắn (**15 phút**), chứa `{ userId, accountId, email, role }`. Gửi qua cả `auth_token` cookie (httpOnly) và Authorization Header.
- **Refresh Token:** Ký JWT thời hạn dài (**7 ngày**), mang mã định danh UUID phiên (`tokenId`).
- **Lưu trữ Redis:** Lưu key `auth:refresh:<userId>:<tokenId>` với TTL 7 ngày.
- **Cơ chế Token Rotation:** Mỗi lần gọi `POST /api/auth/refresh-token`:
  1. Verify refresh token và kiểm tra sự tồn tại trong Redis.
  2. Xóa token cũ khỏi Redis (chống replay attack).
  3. Cấp một cặp Access Token + Refresh Token mới và lưu token mới vào Redis.
- **Cơ chế Thu hồi (Revocation):** Khi user gọi `POST /api/auth/logout` hoặc đổi mật khẩu: Xóa sạch toàn bộ key refresh token của user trong Redis.

### Quyết định 2: Luồng Quên Mật Khẩu qua Email OTP
- Tái sử dụng `OtpService` và `MailService` sẵn có:
  - `POST /api/auth/forgot-password`: Kiểm tra email tồn tại trong DB -> sinh OTP 6 số lưu Redis với key `otp:reset:<email>` (TTL 5 phút) -> gửi email tiêu đề *"Mã xác thực đặt lại mật khẩu của bạn"*.
  - `POST /api/auth/reset-password`: Verify OTP -> hash mật khẩu mới với bcrypt (10 rounds) -> cập nhật `user.password` -> xóa OTP -> thu hồi các phiên đăng nhập cũ trong Redis.

### Quyết định 3: REST API Danh mục Thiệp Mẫu & Redis Caching
- **Endpoint Public:**
  - `GET /api/templates`: Query danh sách template từ database. Hỗ trợ query params: `category` (WEDDING | BIRTHDAY | NEWBORN), `isPremium`, `search`, `page`, `limit`.
  - `GET /api/templates/:slug`: Chi tiết 1 template, bao gồm `configJson`, bảng màu, nhạc mẫu và demo slug.
- **Redis Caching:** Cache response của `GET /api/templates` với key `cache:templates:list:<query_hash>`, TTL = 3600 giây (1 giờ).
- **Frontend Hybrid Resilience:**
  - Frontend gọi hook `useTemplates()`. Khi đang fetch hoặc nếu API backend gặp lỗi mạng, tự động fallback sang `MASTER_TEMPLATES` từ `fe/src/lib/templates-data.ts` mà không làm gián đoạn người dùng (Zero Downtime).

### Quyết định 4: Chống Data Drift khi Tạo Thiệp (`createDraft`)
- Loại bỏ lệnh tự động `upsert` tạo template rỗng trong `CardService.createDraft`.
- Nếu `templateSlug` không tồn tại hoặc `isActive: false` trong DB, trả về lỗi HTTP 404/400 `TEMPLATE_NOT_FOUND` rõ ràng.

---

## 3. Danh sách File Cần Chỉnh Sửa & Tạo Mới (Files to Modify & Create)

### 3.1. Backend Service (`be/`)

| Hành động | File | Mô tả chi tiết |
| :--- | :--- | :--- |
| **Tạo mới** | `be/src/controllers/template.controller.ts` | Controller xử lý `GET /api/templates` và `GET /api/templates/:slug`. |
| **Tạo mới** | `be/src/services/template.service.ts` | Service truy vấn Prisma Template, áp dụng Redis cache và kiểm tra category. |
| **Chỉnh sửa** | `be/src/schemas/auth.schema.ts` | Bổ sung Zod schemas: `ForgotPasswordSchema`, `ResetPasswordSchema`, `ChangePasswordSchema`, `RefreshTokenSchema`. |
| **Chỉnh sửa** | `be/src/services/auth.service.ts` | Bổ sung logic Dual-Token (`generateTokenPair`, `refreshTokens`), `forgotPassword`, `resetPassword`, `changePassword`. |
| **Chỉnh sửa** | `be/src/controllers/auth.controller.ts` | Handler cho các route auth mới: `refreshToken`, `forgotPassword`, `resetPassword`, `changePassword`. |
| **Chỉnh sửa** | `be/src/services/mail.service.ts` | Thêm hàm gửi email OTP khôi phục mật khẩu `sendResetPasswordEmail(email, otp)`. |
| **Chỉnh sửa** | `be/src/services/card.service.ts` | Chuẩn hóa hàm `createDraft`: Validate chặt chẽ template từ DB, loại bỏ upsert tạo template tạm. |
| **Chỉnh sửa** | `be/src/routes/api.router.ts` | Đăng ký route `/templates`, `/templates/:slug`, `/auth/refresh-token`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/change-password`. |
| **Chỉnh sửa** | `be/prisma/seed.ts` | Đồng bộ toàn bộ 12 mẫu thiệp (slug, name, category, thumbnailUrl, configJson, isPremium, style) từ frontend vào database. |

### 3.2. Frontend App (`fe/`)

| Hành động | File | Mô tả chi tiết |
| :--- | :--- | :--- |
| **Chỉnh sửa** | `fe/src/lib/api.ts` | Cải tiến `ApiClient.request`: Khi nhận mã 401, tự động gọi `/auth/refresh-token` 1 lần để renew token rồi retry request gốc (Silent Refresh). |
| **Chỉnh sửa** | `fe/src/context/AuthContext.tsx` | Bổ sung các methods: `forgotPassword(email)`, `resetPassword(payload)`, `changePassword(payload)`. |
| **Chỉnh sửa** | `fe/src/components/auth/AuthModal.tsx` | Bổ sung tab/giao diện "Quên mật khẩu" (bước nhập email -> nhập OTP -> nhập mật khẩu mới). |
| **Tạo mới** | `fe/src/hooks/useTemplates.ts` | Custom hook gọi API `GET /api/templates` kèm offline fallback `MASTER_TEMPLATES`. |
| **Chỉnh sửa** | `fe/src/app/(public)/collections/page.tsx` | Sử dụng hook `useTemplates()`, hiển thị huy hiệu VIP/Khóa theo quyền tài khoản (`allowPremiumTemplates`). |
| **Chỉnh sửa** | `fe/src/app/(dashboard)/dashboard/cards/new/page.tsx` | Sử dụng hook `useTemplates()` cho màn hình chọn mẫu tạo thiệp mới. |

---

## 4. Kế hoạch Triển khai Từng Bước (Step-by-Step Implementation Flow)

### Bước 1: Đồng bộ Database & Xây dựng Template API
1. Cập nhật `be/prisma/seed.ts` với đầy đủ 12 mẫu thiệp cưới & sự kiện chuẩn mực. Chạy seed để đảm bảo PostgreSQL có đủ dữ liệu.
2. Xây dựng `TemplateService` và `TemplateController` với Redis Caching.
3. Thêm route `GET /api/templates` và `GET /api/templates/:slug` vào `api.router.ts`.
4. Refactor `CardService.createDraft` để đọc template hợp lệ từ database.

### Bước 2: Nâng cấp Hệ Thống Auth Chuẩn Production
1. Mở rộng `auth.schema.ts` với các Zod schemas cho refresh token, forgot password, reset password, change password.
2. Nâng cấp `AuthService` với Dual-Token JWT (Access 15m + Refresh 7d) và Redis Token Storage.
3. Thêm các method khôi phục mật khẩu và đổi mật khẩu trong `AuthService` & `OtpService` & `MailService`.
4. Cập nhật `AuthController` và gắn các route vào `api.router.ts`.

### Bước 3: Nâng cấp Frontend Client & UX
1. Bổ sung cơ chế Silent Refresh trong `fe/src/lib/api.ts` để ứng dụng không bị mất phiên làm việc.
2. Mở rộng `AuthContext.tsx` và hoàn thiện giao diện Quên mật khẩu trong `AuthModal.tsx`.
3. Xây dựng hook `useTemplates.ts` và tích hợp vào trang Bộ sưu tập (`/collections`) và Tạo thiệp (`/dashboard/cards/new`).

### Bước 4: Kiểm thử Toàn diện & Nghiệm thu
1. Kiểm tra luồng Đăng nhập / Đăng ký / Quên mật khẩu / Đổi mật khẩu.
2. Kiểm tra Refresh Token Rotation & Thu hồi Token khi Logout.
3. Kiểm tra API Template Catalog, phân quyền gói cước và tạo thiệp với mẫu hợp lệ.
4. Chạy kiểm tra TypeScript và Build trên cả Backend và Frontend.

---

## 5. Kế hoạch Kiểm Thử & Tiêu Chí Nghiệm Thu (Verification & Acceptance Criteria)

### 5.1. Test Cases Cho Module Auth
- [ ] **OTP Đăng ký:** Gửi OTP -> nhận mail -> nhập sai 5 lần bị khóa -> nhập đúng cấp Access Token + Refresh Token.
- [ ] **Google OAuth:** Đăng nhập với ID Token hợp lệ -> tự động tạo User + Account FREE -> trả về token pair.
- [ ] **Refresh Token:** Gọi `/api/auth/refresh-token` với cookie hợp lệ -> nhận Access Token mới, token cũ trong Redis bị thay thế.
- [ ] **Quên mật khẩu:** Gọi `/api/auth/forgot-password` -> nhận OTP -> gọi `/api/auth/reset-password` -> đăng nhập lại bằng mật khẩu mới thành công, các phiên cũ bị revoke.
- [ ] **Đổi mật khẩu:** Gọi `/api/auth/change-password` -> kiểm tra mật khẩu cũ -> cập nhật thành công.

### 5.2. Test Cases Cho Module Templates
- [ ] **Public List:** Gọi `GET /api/templates?category=WEDDING` -> trả về đúng danh sách mẫu cưới từ DB.
- [ ] **Cache Redis:** Lần gọi thứ 2 phản hồi nhanh < 20ms từ Redis cache.
- [ ] **Tạo thiệp an toàn:** Tạo thiệp với slug hợp lệ -> thành công; tạo thiệp với slug không tồn tại -> báo lỗi `400 TEMPLATE_UNAVAILABLE` thay vì tự tạo rác trong DB.
- [ ] **Frontend Fallback:** Khi tắt backend, frontend `/collections` vẫn render mượt mà từ hằng số offline mà không crash trắng màn hình.

---

## 6. STOP Conditions (Điều kiện Dừng & Hỏi Ý Kiến)
Nếu trong quá trình triển khai gặp các trường hợp sau, agent phải dừng lại và báo cáo:
1. `DATABASE_URL` hoặc Redis không kết nối được trong môi trường cục bộ.
2. Biến môi trường SMTP / Gmail credentials chưa được cấu hình, khiến MailService không gửi được mail thật (khi đó sẽ kích hoạt log OTP ra console cho môi trường dev).
