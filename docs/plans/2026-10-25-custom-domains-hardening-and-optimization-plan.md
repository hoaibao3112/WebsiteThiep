# Kế Hoạch Nâng Cấp & Hoàn Thiện Backend Tên Miền Riêng (Custom Domains Hardening & Optimization)

> **Tài liệu:** docs/plans/2026-10-25-custom-domains-hardening-and-optimization-plan.md  
> **Áp dụng tiêu chuẩn:** `cau-truc-production-master`, `nextjs-fullstack-best-practices`, `planning`, `unit-testing`  
> **Ngày khởi tạo:** 25/10/2026  
> **Trạng thái:** Đã hoàn thành 100% (Completed & Verified)

---

## 1. Bối Cảnh & Mục Tiêu (Context & Objectives)

Hệ thống tên miền riêng (`/dashboard/domains`) đã có cấu trúc nền tảng với Prisma model `CustomDomain`, Vercel Domains API wrapper, và Next.js Middleware rewrite. Tuy nhiên, qua quá trình kiểm tra toàn diện mã nguồn, đã phát hiện 6 điểm nghẽn nghiêm trọng về logic nghiệp vụ, chuẩn mạng DNS và hiệu năng chịu tải trong ngày cưới:

1. **Lỗ hổng Quota / Giới hạn số lượng:** Chưa kiểm tra số domain tối đa mà tài khoản được tạo theo gói + Addon `extraDomains`. Bất kỳ tài khoản VIP nào cũng có thể kết nối vô hạn domain mà không cần mua thêm slot.
2. **Lỗi chuẩn DNS Apex Domain (@ CNAME):** Luôn hướng dẫn CNAME cho `@` vi phạm RFC 1912 khiến mọi nhà đăng ký tên miền tại Việt Nam (Mắt Bão, PA Việt Nam, Tenten, Nhân Hòa) từ chối cấu hình.
3. **Lệch định tuyến giữa `domain.com` và `www.domain.com`:** Chưa hỗ trợ fallback tự động giữa apex domain và subdomain `www.` khiến khách mời gõ `www.` bị báo lỗi "Tên miền chưa được kết nối".
4. **Tắc nghẽn cơ sở dữ liệu (Missing Cache):** Endpoint tra cứu công khai `GET /api/domains/lookup/:domain` truy vấn trực tiếp PostgreSQL trên mỗi lượt khách mở thiệp, có nguy cơ sập DB khi hàng ngàn khách cùng quét mã QR tại hôn trường.
5. **DNS Fallback Resolver bị cache ISP:** Dùng resolver mặc định của hệ điều hành server bị dính negative cache, đồng thời token xác thực `_wst-verify` chưa được kiểm tra trong hàm verify.
6. **Thiếu chặn Reserved Slugs:** Cho phép người dùng đổi slug thiệp thành các từ khóa hệ thống (`api`, `dashboard`, `admin`, `login`...).

**Mục tiêu kế hoạch:** Khắc phục triệt để 6 vấn đề trên, đảm bảo hệ thống đạt độ tin cậy 99.99%, tốc độ phản hồi < 5ms, tương thích 100% với các nhà cung cấp tên miền tại Việt Nam, và có bộ kiểm thử tự động (Unit Tests) bao phủ đầy đủ.

---

## 2. Thiết Kế Kỹ Thuật Chi Tiết (Technical Specifications)

### 2.1. Kiểm tra Quota & Slot Tên Miền Theo Gói + Addon

- **Công thức tính Slot Tối Đa:**
  ```typescript
  const maxAllowedDomains = (effectivePlan.capabilities.allowCustomDomain ? 1 : 0) + (account.extraDomains || 0);
  ```
- **Quy tắc chặn trong `createCustomDomain`:**
  1. Kiểm tra `effectivePlan.capabilities.allowCustomDomain === true`. Nếu false -> `403 FORBIDDEN` (Yêu cầu nâng cấp gói VIP).
  2. Đếm số domain hiện tại của account:
     ```typescript
     const currentCount = await prisma.customDomain.count({ where: { accountId } });
     ```
  3. Nếu `currentCount >= maxAllowedDomains`:
     - Ném lỗi `403 FORBIDDEN` với mã `DOMAIN_QUOTA_EXCEEDED`:
       *"Bạn đã sử dụng hết số lượng tên miền riêng cho phép (Đã dùng: X / Tối đa: Y). Vui lòng mua thêm slot tên miền tại trang Tiện Ích (Addon Store)."*
  4. Trả về thông tin quota trong `listDomains` để Frontend hiển thị thanh tiến độ:
     ```typescript
     quota: {
       used: currentCount,
       max: maxAllowedDomains,
       extraDomains: account.extraDomains,
     }
     ```

---

### 2.2. Phân Loại Chuẩn DNS Thông Minh: Apex Domain vs Subdomain

- **Phân tích cấu trúc FQDN:**
  - Viết helper `detectDomainType(domain: string)`:
    - Nếu domain có 2 phần (VD: `damcuoilongngoc.com`, `hoanglongbaongoc.vn`): Là **Apex Domain (Root)**.
    - Nếu domain có >= 3 phần (VD: `wedding.longngoc.com`, `thiep.baomai.vn`): Là **Subdomain**.
- **Hướng dẫn bản ghi chuẩn quốc tế (RFC Compliant):**
  - **Với Apex Domain (`damcuoilongngoc.com`):**
    * Record 1: Loại `A` | Host: `@` | Giá trị: `76.76.21.21` (Vercel Anycast IP)
    * Record 2: Loại `CNAME` | Host: `www` | Giá trị: `cname.vercel-dns.com`
    * Record 3 (Tùy chọn): Loại `TXT` | Host: `_wst-verify` | Giá trị: `customDomain.verificationTxt`
  - **Với Subdomain (`wedding.longngoc.com`):**
    * Record 1: Loại `CNAME` | Host: `wedding` | Giá trị: `cname.vercel-dns.com`
    * Record 2 (Tùy chọn): Loại `TXT` | Host: `_wst-verify` | Giá trị: `customDomain.verificationTxt`
- Lưu vào DB trường `targetType: "A" | "CNAME"` và `targetValue` tương ứng thay vì gán cứng CNAME.

---

### 2.3. Xử Lý Đồng Bộ `www.` và Không Có `www.`

1. **Khi Đăng Ký Vercel (`addDomainToProject`):**
   - Nếu người dùng đăng ký Apex Domain `example.com`: Tự động gọi Vercel API đăng ký cả `example.com` và `www.example.com` để Vercel tự động cấp SSL cert cho cả 2 bản ghi.
2. **Khi Tra Cứu Domain (`lookupCardByDomain`):**
   - Chuẩn hóa:
     ```typescript
     const clean = domain.toLowerCase().trim();
     const altDomain = clean.startsWith("www.") ? clean.slice(4) : `www.${clean}`;
     ```
   - Truy vấn Prisma tìm kiếm theo OR:
     ```typescript
     const record = await prisma.customDomain.findFirst({
       where: {
         domain: { in: [clean, altDomain] },
         status: "ACTIVE",
       },
       include: { card: { select: { id: true, slug: true, status: true, expiredAt: true } } },
     });
     ```
   - Khách mời gõ có `www.` hay không có `www.` đều tự động hiển thị đúng thiệp cưới mà không gặp lỗi.

---

### 2.4. Tích Hợp Redis Cache Cho `lookupCardByDomain`

- **Key Pattern:** `domain:lookup:${cleanDomain}`
- **TTL:** 300 giây (5 phút).
- **Quy trình đọc:**
  ```mermaid
  graph TD
      A[Client / Middleware Request] --> B{Check Redis Cache}
      B -- Cache Hit --> C[Return JSON <2ms]
      B -- Cache Miss --> D[Query PostgreSQL Prisma]
      D --> E{Card Valid & Active?}
      E -- Yes --> F[Set Redis TTL 300s & Return]
      E -- No --> G[Set Redis Null Sentinel TTL 60s & Return 404]
  ```
- **Quy trình Invalidate Cache:**
  - Khi gọi `deleteCustomDomain`: `redis.del(`domain:lookup:${domain}`, `domain:lookup:${altDomain}`)`.
  - Khi gọi `verifyDomain` (trở thành ACTIVE hoặc FAILED): Xóa cache tương ứng để làm mới trạng thái.
  - Khi cập nhật card slug (`updateCardSlug`): Xóa cache của domain liên kết với card đó.

---

### 2.5. Nâng Cấp DNS Fallback Resolver (Public DNS & TXT Ownership)

- Khởi tạo resolver độc lập không phụ thuộc DNS của hệ điều hành VPS:
  ```typescript
  import dns from "node:dns/promises";
  const publicResolver = new dns.Resolver();
  publicResolver.setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);
  ```
- **Quy tắc xác thực kép (Dual Verification):**
  1. Kiểm tra bản ghi `A` (`76.76.21.21`) hoặc `CNAME` (`cname.vercel-dns.com` / `websitethiep.com`).
  2. HOẶC kiểm tra bản ghi `TXT` tại `_wst-verify.${domain}` khớp với chuỗi `verificationTxt` đã cấp.
  3. Bất kỳ bản ghi nào hợp lệ đều xác nhận chủ sở hữu và kích hoạt domain sang trạng thái `ACTIVE`.

---

### 2.6. Chặn Danh Sách Reserved Slugs Hệ Thống

Bổ sung danh sách từ khóa hệ thống vào `domain.validator.ts` và kiểm tra trong `CardService.isSlugAvailable`:
```typescript
export const RESERVED_SLUGS = new Set([
  "api", "app", "admin", "dashboard", "login", "register", "auth",
  "pricing", "collections", "concierge", "thiep", "thiep-domain",
  "s", "robots", "sitemap", "favicon", "null", "undefined",
  "support", "contact", "terms", "privacy", "static", "public"
]);
```

---

## 3. Các Bước Triển Khai (Step-by-step Implementation)

```text
Implementation Steps:
- [x] Bước 1: Cập nhật domain.validator.ts (bổ sung RESERVED_SLUGS và helper phân loại Apex vs Subdomain)
- [x] Bước 2: Nâng cấp vercel-domain.service.ts (Public DNS resolver 1.1.1.1/8.8.8.8, kiểm tra TXT, đăng ký www song song)
- [x] Bước 3: Nâng cấp domain.service.ts (Quota check, hướng dẫn DNS chính xác A/CNAME, Redis cache, www fallback, cache invalidation)
- [x] Bước 4: Cập nhật controller và types nếu có bổ sung quota metadata
- [x] Bước 5: Cập nhật frontend DomainsPage (hiển thị hướng dẫn bản ghi A/CNAME thông minh theo loại tên miền, quota indicator)
- [x] Bước 6: Viết Unit Tests toàn diện cho DomainService và VercelDomainService
- [x] Bước 7: Chạy Next.js build & Vitest test suite xác thực 100%
```

---

## 4. Kế Hoạch Kiểm Thử (Testing & Quality Assurance)

### 4.1. Unit Tests (`be/tests/domain/domain-service.test.ts`)
- **Case 1: Quota Enforcement:** Tài khoản VIP đã dùng 1 domain và chưa mua Addon -> cố tạo domain thứ 2 phải throw `403 DOMAIN_QUOTA_EXCEEDED`.
- **Case 2: Quota with Addon:** Tài khoản có `extraDomains: 2` -> tạo được 3 domains thành công.
- **Case 3: DNS Guidance Generation:**
  - Input `damcuoilongngoc.com` -> Trả về bản ghi `A` trỏ `76.76.21.21` và `CNAME www`.
  - Input `wedding.longngoc.vn` -> Trả về bản ghi `CNAME` host `wedding`.
- **Case 4: Redis Cache Hit/Miss & Invalidation:**
  - Lần 1 query DB và set cache.
  - Lần 2 lấy từ Redis không gọi Prisma.
  - Xóa domain -> Cache bị xóa.
- **Case 5: www Fallback:** Query `www.damcuoibaomai.com` vẫn tìm ra thiệp dù trong DB lưu `damcuoibaomai.com`.
- **Case 6: Reserved Slug Block:** Cố đổi slug thành `admin` hoặc `dashboard` phải ném lỗi 400/409.

### 4.2. Verification Evidence
- Chạy `pnpm test be/tests/domain/domain-service.test.ts` đạt 100% pass.
- Chạy `pnpm build` tại `fe` đảm bảo không có lỗi type hoặc giao diện.

---

## 5. Rủi Ro & Biện Pháp Giảm Thiểu (Risks & Mitigations)

| Rủi ro | Mức độ | Biện pháp giảm thiểu |
| :--- | :---: | :--- |
| Redis gặp sự cố hoặc timeout | Trung bình | Bọc lệnh cache trong `try/catch`, nếu Redis lỗi thì tự động fallback query trực tiếp PostgreSQL (Fail-open). |
| Vercel API hết quota hoặc rate limit | Thấp | Fallback sang `verifyDnsFallback` dùng Public DNS Resolver độc lập. |
| Người dùng nhập tên miền có tiền tố `https://` | Thấp | Tự động làm sạch bằng `cleanDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "")` trước khi lưu. |
| Xung đột tên miền giữa các khách hàng | Thấp | Duy trì ràng buộc `@unique` trên cột `domain` trong DB. |
