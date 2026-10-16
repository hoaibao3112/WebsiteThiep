# Kế Hoạch Triển Khai Backend: Tên Miền Riêng (Custom Domain) & Quản Lý Link Thiệp

> **Tài liệu tham chiếu:** docs/plans/2026-10-16-custom-domains-and-slug-management-backend-plan.md  
> **Áp dụng tiêu chuẩn:** `cau-truc-production-master`, `planning`, `docker-devops`, `vercel-deploy-integration`  
> **Ngày khởi tạo:** 16/10/2026  
> **Trạng thái:** Chờ phê duyệt (Ready for Review)

---

## 1. Mục Tiêu & Phạm Vi (Scope & Objectives)

Cung cấp tính năng **Tên miền** tương tự nền tảng mẫu (Zenlove) với 2 phân hệ cốt lõi:
1. **Phân hệ 1 - Tên miền mặc định & Quản lý Slug:**
   - Hiển thị tên miền mặc định của hệ thống: `domain-mac-dinh/s/<slug-thiệp>`.
   - Cho phép người dùng chỉnh sửa `<slug-thiệp>` theo ý thích (VD: `long-ngoc`, `damcuoilongngoc`).
   - Kiểm tra trùng lặp slug trong thời gian thực.
2. **Phân hệ 2 - Tên miền riêng (Custom Domain - Tính năng VIP):**
   - Cho phép cặp đôi kết nối tên miền riêng họ đã sở hữu (VD: `damcuoilongngoc.com`, `hoanglongbaongoc.vn`).
   - Kiểm tra quyền hạn theo gói cước (`allowCustomDomain` trong `AccountEntitlementService`). Chỉ gói VIP mới được kết nối; gói FREE/BASIC hiển thị icon khóa và thông báo nâng cấp.
   - Hướng dẫn cấu hình DNS (bản ghi CNAME / A và TXT xác minh quyền sở hữu).
   - Tích hợp **Vercel Domains API** (tự động đăng ký domain, tự động xác minh và tự động cấp chứng chỉ SSL Let's Encrypt qua Vercel).
   - Cơ chế fallback: Nếu chưa cấu hình `VERCEL_TOKEN`, hệ thống sử dụng Node.js `dns/promises` để xác thực DNS độc lập.
   - Endpoint tra cứu công khai `GET /api/domains/lookup/:domain` phục vụ cho Next.js Middleware định tuyến không gián đoạn.

---

## 2. Kiến Trúc Dữ Liệu (Database Schema - Prisma)

Cập nhật file `be/prisma/schema.prisma` với model `CustomDomain`:

```prisma
enum DomainStatus {
  PENDING_DNS   // Đang chờ người dùng trỏ bản ghi DNS
  VERIFYING     // Đang xác thực DNS và cấp chứng chỉ SSL
  ACTIVE        // Đã hoạt động bình thường, sẵn sàng đón khách
  FAILED        // Quá hạn hoặc trỏ sai bản ghi
}

model CustomDomain {
  id              String       @id @default(cuid())
  accountId       String
  account         Account      @relation(fields: [accountId], references: [id], onDelete: Cascade)
  cardId          String       @unique // Mỗi thiệp liên kết với tối đa 1 tên miền riêng
  card            Card         @relation(fields: [cardId], references: [id], onDelete: Cascade)

  domain          String       @unique // Tên miền sạch (VD: damcuoilongngoc.com)
  status          DomainStatus @default(PENDING_DNS)

  // Cấu hình bản ghi DNS yêu cầu
  targetType      String       @default("CNAME") // CNAME | A
  targetValue     String       @default("cname.vercel-dns.com") // Hoặc IP VPS / server
  verificationTxt String?      // Mã token xác minh quyền sở hữu: wst-verify=xxxx

  // Trạng thái SSL / HTTPS
  sslStatus       String       @default("PENDING") // PENDING | ISSUED | ERROR
  lastCheckedAt   DateTime?
  errorMessage    String?

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([accountId])
  @@index([domain, status])
  @@map("custom_domains")
}
```

Cập nhật quan hệ trong model `Account` và `Card`:
- `Account.customDomains CustomDomain[]`
- `Card.customDomain CustomDomain?`

---

## 3. Kiến Trúc Backend Service & Module

```
be/src/
├── lib/validators/
│   └── domain.validator.ts          # Zod schema validate tên miền & slug
├── services/
│   ├── vercel-domain.service.ts     # Wrapper gọi Vercel Domains API (nếu có VERCEL_TOKEN)
│   └── domain.service.ts            # Xử lý logic nghiệp vụ, quyền gói cước, DNS lookup
├── controllers/
│   └── domain.controller.ts         # Controller xử lý request từ client
└── routes/
    └── api.router.ts                # Khai báo các API routes
```

### 3.1. Zod Validation (`domain.validator.ts`)
- **Tên miền hợp lệ:**
  - Chuẩn hóa: `domain.trim().toLowerCase()`
  - Regex domain: `/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/`
  - Loại trừ (Blacklist): `localhost`, `vercel.app`, `websitethiep.com`, `zenlove.me`, v.v.
- **Slug hợp lệ:**
  - Tối thiểu 3 ký tự, tối đa 60 ký tự.
  - Regex: `/^[a-z0-9-]+$/` (không dấu, không khoảng trắng, không ký tự đặc biệt).

### 3.2. Dịch vụ Vercel Integration (`vercel-domain.service.ts`)
Đọc biến môi trường từ `.env`:
- `VERCEL_TOKEN`: Token API từ tài khoản Vercel cá nhân hoặc team.
- `VERCEL_PROJECT_ID`: ID dự án Next.js trên Vercel.
- `VERCEL_TEAM_ID`: ID Team (nếu tài khoản dạng Team).

Các hàm cốt lõi:
1. `addDomain(domain: string)`:
   - Gọi `POST https://api.vercel.com/v10/projects/${projectId}/domains`
   - Nhận về thông tin cấu hình DNS được khuyến nghị từ Vercel (`verified`, `verification`).
2. `verifyDomain(domain: string)`:
   - Gọi `POST https://api.vercel.com/v9/projects/${projectId}/domains/${domain}/verify`
3. `getDomainConfig(domain: string)`:
   - Gọi `GET https://api.vercel.com/v6/domains/${domain}/config` để kiểm tra trạng thái SSL và DNS.
4. `removeDomain(domain: string)`:
   - Gọi `DELETE https://api.vercel.com/v9/projects/${projectId}/domains/${domain}` khi người dùng xóa tên miền.
5. **Cơ chế Graceful Fallback:** Nếu `VERCEL_TOKEN` chưa được thiết lập (chẳng hạn lúc chạy local dev hoặc tự host VPS), service tự động chuyển sang sử dụng module Node.js `dns/promises` để resolve CNAME/A mà không gây crash app.

### 3.3. Dịch vụ Nghiệp Vụ (`domain.service.ts`)
Tuân thủ nghiêm ngặt **Multi-tenant Isolation**: Mọi câu lệnh truy vấn đều bắt buộc filter `accountId`.

1. **`listDomains(accountId)`**:
   - Trả về danh sách tên miền của account kèm thông tin thiệp đang gán (`card.slug`, `card.template.name`, `status`, `targetValue`).
   - Kèm thông tin tên miền mặc định của hệ thống.
2. **`createDomain(accountId, input)`**:
   - Kiểm tra `AccountEntitlementService.getEffectivePlan(accountId)`.
   - Nếu `!effectivePlan.capabilities.allowCustomDomain` -> Throw `HttpError(403, "Gói hiện tại không hỗ trợ tên miền riêng", "PLAN_ENTITLEMENT_REQUIRED")`.
   - Kiểm tra `cardId` thuộc về `accountId`.
   - Kiểm tra trùng lặp domain trong database.
   - Tạo mã xác minh `verificationTxt: wst-verify=${randomBytes(8).toString('hex')}`.
   - Thêm vào Vercel (nếu có cấu hình).
   - Lưu vào bảng `custom_domains`.
3. **`verifyDomain(accountId, domainId)`**:
   - Lấy domain từ DB, gọi Vercel Verify hoặc `dns.promises.resolveCname`.
   - Cập nhật `status = ACTIVE` khi DNS trỏ đúng, hoặc `PENDING_DNS` nếu chưa nhận.
4. **`deleteDomain(accountId, domainId)`**:
   - Xóa khỏi Vercel và xóa record trong DB.
5. **`updateCardSlug(accountId, cardId, newSlug)`**:
   - Kiểm tra tính duy nhất của slug mới qua `CardService.isSlugAvailable(newSlug, cardId)`.
   - Cập nhật slug thiệp.

---

## 4. Chi Tiết API Endpoints (REST API Specification)

| Phương thức | Đường dẫn | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/domains` | `authGuard` | Lấy danh sách tên miền & thông tin cấu hình mặc định |
| `POST` | `/api/domains` | `authGuard` | Thêm tên miền riêng mới (yêu cầu Gói VIP) |
| `POST` | `/api/domains/:id/verify` | `authGuard` | Kích hoạt kiểm tra DNS & SSL ngay lập tức |
| `DELETE` | `/api/domains/:id` | `authGuard` | Hủy kết nối tên miền riêng |
| `PATCH` | `/api/cards/:id/slug` | `authGuard` | Đổi slug đường dẫn mặc định của thiệp |
| `GET` | `/api/domains/lookup/:domain` | Public | Tra cứu thiệp theo domain phục vụ Next.js Rewrite |

---

## 5. Kế Hoạch Kiểm Thử & Đảm Bảo Chất Lượng (Testability & QA)

1. **Unit & Integration Test:**
   - `be/tests/domain/domain-service.test.ts`: Test kiểm tra quyền gói cước (FREE bị chặn 403, VIP tạo thành công).
   - Test chống trùng lặp domain giữa các tài khoản khác nhau.
   - Test cập nhật slug và kiểm tra ký tự không hợp lệ.
2. **Build Verification:**
   - Chạy `prisma generate && tsc` đảm bảo 0 lỗi biên dịch.
3. **Rollback Plan:**
   - Việc thêm bảng `custom_domains` không làm ảnh hưởng đến dữ liệu hiện hữu của bảng `cards`.
   - Nếu xảy ra sự cố, chỉ cần xóa bảng `custom_domains` mà không gây downtime.

---

## 6. Bước Kế Tiếp Sang Frontend UI (Next Step)

Sau khi backend hoàn tất, Frontend sẽ xây dựng:
1. Trang **`/dashboard/domains/page.tsx`** với giao diện giống hệt mẫu Zenlove:
   - Thẻ Tên miền mặc định (`/s/<slug>`) + nút **Đổi >**.
   - Thẻ Tên miền riêng + nút **`+ Tạo tên miền`** (có icon khóa cho gói FREE).
   - Modal hiển thị bảng chỉ dẫn cấu hình DNS (Type: CNAME, Target: `cname.vercel-dns.com`).
   - Nút **Kiểm tra kết nối** với hiệu ứng loading và badge trạng thái sinh động.
2. Cập nhật `fe/src/middleware.ts` để tự động nhận diện và rewrite domain riêng về trang xem thiệp.
