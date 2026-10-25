# Kế Hoạch Nâng Cấp & Chuẩn Hóa Backend Phân Hệ Tiện Ích (Addons Store Hardening & Entitlement Harmonization)

> **Tài liệu:** docs/plans/2026-10-26-addons-store-hardening-and-entitlement-harmonization-plan.md  
> **Áp dụng tiêu chuẩn:** `cau-truc-production-master`, `nextjs-fullstack-best-practices`, `planning`, `unit-testing`  
> **Ngày khởi tạo:** 26/10/2026  
> **Trạng thái:** Đã hoàn thành 100% (Completed & Verified)

---

## 1. Bối Cảnh & Mục Tiêu (Context & Objectives)

Trang Tiện Ích Mở Rộng (`/dashboard/addons`) cho phép người dùng mua thêm các tài nguyên bổ trợ (thêm thiệp, thêm ảnh, gia hạn thời gian, tên miền riêng). Mặc dù cấu trúc khởi tạo đơn hàng VietQR và duyệt đơn thủ công đã hoạt động, quá trình kiểm tra toàn diện mã nguồn backend đã phát hiện **5 điểm nghẽn và mâu thuẫn nghiệp vụ nghiêm trọng**:

1. **Mâu thuẫn quyền Tên Miền Riêng (Custom Domain Block on BASIC):**
   - Trong `addon-catalog.ts`, các gói `ADDON_DOMAIN_X` cho phép tài khoản gói `BASIC` mua (`requiredPlanCode: "BASIC"`, `isEligible = true`).
   - Khách hàng gói BASIC chuyển khoản mua thêm slot tên miền thành công (`account.extraDomains > 0`).
   - Nhưng khi sang `/dashboard/domains`, `DomainService.createCustomDomain` lại kiểm tra cứng `if (!effectivePlan.capabilities.allowCustomDomain)` -> ném lỗi `403 FORBIDDEN` (bắt nâng cấp VIP) vì gói BASIC trong database có `allowCustomDomain = false`. Khách hàng bị mất tiền mà không kết nối được domain!
2. **Lỗ hổng gói Gia Hạn 6 Tháng (`ADDON_EXTEND_6M`) cho tài khoản FREE & VIP:**
   - Gói này không có ràng buộc gói tối thiểu (`requiredPlanCode = undefined`).
   - Tài khoản `FREE` mua 59.000đ thì backend chỉ cộng 180 ngày vào `planExpiresAt`, nhưng tài khoản vẫn là gói `FREE` (vẫn bị watermark, vẫn chỉ có 1 thiệp, không tải được nhạc).
   - Tài khoản `VIP` (vốn là gói Vĩnh viễn / Lifetime không bao giờ hết hạn) vẫn nhìn thấy nút "Mua ngay" và vẫn mua được gói này.
3. **Bán các tiện ích chưa có logic thực thi ở backend (Phantom Addons):**
   - *Tăng lượt xem (`ADDON_VIEWS_1K`, `ADDON_VIEWS_2K`):* Backend không có logic đếm hay chặn lượt xem thiệp theo quota.
   - *Hồ sơ cưới (`ADDON_PROFILE_1`):* Bảng `User` chỉ có 1 cột JSON `weddingProfile`, không có bảng hay API để lưu hồ sơ thứ 2.
   - *Tên miền hệ thống (`invy.vn`, `motdoi.vn`, `rsvp.vn`):* Backend chỉ tăng `extraDomains`, không có cơ chế cấu hình subdomain hay UI lựa chọn.
4. **Thiếu Middleware Zod Validation & Dọn dẹp đơn hàng quá hạn:**
   - Endpoint `POST /addons/orders` chưa dùng `validateBody(...)`.
   - `AddonService.createAddonOrder` không dọn dẹp các đơn PENDING cũ quá hạn 48 giờ như `OrderService`.
5. **Chưa có Unit Test Coverage:**
   - Toàn bộ thư mục `be/tests/` chưa có bất kỳ test nào cho phân hệ Addons.

**Mục tiêu kế hoạch:** Giải quyết triệt để 5 vấn đề trên, đảm bảo tính công bằng và toàn vẹn dữ liệu thanh toán 100%, bảo vệ khách hàng không mua nhầm tài nguyên không sử dụng được, và có bộ Unit Test bao phủ đạt chuẩn CI/CD.

---

## 2. Thiết Kế Kỹ Thuật Chi Tiết (Technical Specifications)

### 2.1. Đồng Bộ Quyền Tên Miền Riêng (Harmonize Custom Domain Entitlement)

- **Quy tắc mới:** Quyền kết nối tên miền riêng được kích hoạt nếu:
  1. Tài khoản đang ở gói **VIP** (`effectivePlan.capabilities.allowCustomDomain === true`), **HOẶC**
  2. Tài khoản đã mua thêm ít nhất 1 slot tên miền riêng (`account.extraDomains > 0`).

- **Cập nhật `DomainService.createCustomDomain`:**
  ```typescript
  // Cho phép kết nối nếu gói hỗ trợ HOẶC đã mua thêm slot tên miền
  const hasDomainEntitlement = effectivePlan.capabilities.allowCustomDomain || (account.extraDomains > 0);
  if (!hasDomainEntitlement) {
    throw new HttpError(
      403,
      `Gói hiện tại (${effectivePlan.planName}) không hỗ trợ tên miền riêng. Vui lòng nâng cấp lên gói VIP hoặc mua thêm slot tên miền tại trang Tiện Ích.`,
      "PLAN_ENTITLEMENT_REQUIRED"
    );
  }
  ```
- **Cập nhật `AccountEntitlementService.toPlanDTO`:**
  Nếu `account.extraDomains > 0`, thuộc tính `capabilities.allowCustomDomain` sẽ trả về `true` để frontend tự động mở khóa giao diện kết nối domain mà không cần can thiệp logic gói gốc.

---

### 2.2. Kiểm Soát Điều Kiện & Logic Gói Gia Hạn Thời Gian (`ADDON_EXTEND_6M`)

- Cập nhật hàm `AddonService.getCatalog`:
  ```typescript
  if (item.category === "time") {
    if (entitlement.planCode === "VIP") {
      isEligible = false;
      ineligibilityReason = "Gói VIP có thời hạn vĩnh viễn, không cần gia hạn thời gian";
    } else if (entitlement.planCode === "FREE") {
      isEligible = false;
      ineligibilityReason = "Gói gia hạn chỉ áp dụng cho Gói Tiêu Chuẩn (BASIC). Vui lòng nâng cấp gói";
    }
  }
  ```
- Thêm kiểm tra chặn tương ứng trong `AddonService.createAddonOrder`: Ném lỗi `400 BAD_REQUEST` (`PLAN_INELIGIBLE_FOR_ADDON`) nếu tài khoản FREE hoặc VIP cố tình gọi API tạo đơn mua gia hạn.

---

### 2.3. Tinh Gọn Danh Mục Catalog: Tạm Ẩn Các Gói Chưa Hoàn Thiện Backend

- Trong `ADDON_CATALOG` ([addon-catalog.ts](file:///d:/freelancer/WebsiteThiep/be/src/config/addon-catalog.ts)):
  - Tạm thời comment / ẩn các nhóm chưa có logic tiêu thụ backend:
    - Nhóm `view` (`ADDON_VIEWS_1K`, `ADDON_VIEWS_2K`)
    - Nhóm `profile` (`ADDON_PROFILE_1`)
    - Nhóm `system_domain` (`ADDON_SYS_INVY`, `ADDON_SYS_MOTDOI`, `ADDON_SYS_RSVP`)
  - **Tập trung tối đa vào 3 nhóm chủ lực có giá trị thực tế cao nhất:**
    1. **Thêm thiệp cưới:** `ADDON_CARDS_1`, `ADDON_CARDS_2`, `ADDON_CARDS_5`, `ADDON_CARDS_10` (tiêu thụ qua `allowedMaxCards = 2 + account.extraCards`).
    2. **Tăng dung lượng kho ảnh:** `ADDON_PHOTOS_10`, `ADDON_PHOTOS_20` (tiêu thụ qua `maxPhotos = plan.maxPhotos + account.extraPhotos`).
    3. **Thêm slot tên miền riêng:** `ADDON_DOMAIN_1`, `ADDON_DOMAIN_3`, `ADDON_DOMAIN_5`, `ADDON_DOMAIN_10`, `ADDON_DOMAIN_20` (tiêu thụ qua `quota.max = (allowCustomDomain ? 1 : 0) + account.extraDomains`).
    4. **Gia hạn thời gian:** `ADDON_EXTEND_6M` (dành riêng cho tài khoản BASIC).

---

### 2.4. Zod Schema Validation & Idempotency / Order Expiry Cleanup

- Tạo schema validation chuẩn trong `addon.schema.ts`:
  ```typescript
  export const CreateAddonOrderSchema = z.object({
    addonCode: z.string().min(1, "Vui lòng chọn mã tiện ích hợp lệ"),
  });
  ```
- Gắn middleware `validateBody(CreateAddonOrderSchema)` vào route `POST /addons/orders`.
- Trong `AddonService.createAddonOrder`: Bổ sung bước dọn dẹp tự động các đơn PENDING cũ quá hạn:
  ```typescript
  await prisma.order.updateMany({
    where: {
      accountId,
      orderType: "ADDON",
      status: "PENDING",
      expiredAt: { lte: new Date() },
    },
    data: { status: "EXPIRED" },
  });
  ```

---

### 2.5. Bảo Đảm Toàn Vẹn ACID Khi Fulfill Addon

- Đảm bảo trong [addon.service.ts](file:///d:/freelancer/WebsiteThiep/be/src/services/addon.service.ts#L183-L258), hàm `fulfillAddon` luôn chạy trọn vẹn trong Prisma transaction `tx` do `manual-payment-review.service.ts` truyền vào.
- Khi cộng `extraDomains`, đồng thời xóa cache Redis liên quan để các trang `/dashboard/domains` cập nhật ngay quota mới.

---

## 3. Danh Sách Tệp Thay Đổi (Files to Modify)

| Tệp | Mục đích thay đổi |
| :--- | :--- |
| [be/src/config/addon-catalog.ts](file:///d:/freelancer/WebsiteThiep/be/src/config/addon-catalog.ts) | Tinh gọn danh mục, ẩn các gói chưa có backend thực thi, đánh dấu `requiredPlanCode` chuẩn xác. |
| [be/src/lib/validators/addon.schema.ts](file:///d:/freelancer/WebsiteThiep/be/src/lib/validators/addon.schema.ts) | Tạo mới Zod schema validation cho `CreateAddonOrder`. |
| [be/src/services/addon.service.ts](file:///d:/freelancer/WebsiteThiep/be/src/services/addon.service.ts) | Bổ sung kiểm tra điều kiện gói FREE/VIP cho `ADDON_EXTEND_6M`, dọn dẹp đơn stale, xử lý quyền hạn. |
| [be/src/controllers/addon.controller.ts](file:///d:/freelancer/WebsiteThiep/be/src/controllers/addon.controller.ts) | Áp dụng Zod schema validation chuẩn chỉnh. |
| [be/src/routes/api.router.ts](file:///d:/freelancer/WebsiteThiep/be/src/routes/api.router.ts) | Gắn middleware `validateBody(CreateAddonOrderSchema)` vào `POST /addons/orders`. |
| [be/src/services/domain.service.ts](file:///d:/freelancer/WebsiteThiep/be/src/services/domain.service.ts) | Cho phép kết nối tên miền riêng nếu tài khoản có `extraDomains > 0` kể cả trên gói BASIC. |
| [be/src/services/account-entitlement.service.ts](file:///d:/freelancer/WebsiteThiep/be/src/services/account-entitlement.service.ts) | Bật `allowCustomDomain = true` trong DTO nếu `extraDomains > 0`. |
| [be/tests/addon/addon-service.test.ts](file:///d:/freelancer/WebsiteThiep/be/tests/addon/addon-service.test.ts) | Tạo mới bộ Unit Test bao phủ 100% các kịch bản của AddonService. |

---

## 4. Các Bước Triển Khai (Step-by-step Implementation)

```text
Implementation Steps:
- [x] Bước 1: Tạo be/src/lib/validators/addon.schema.ts & gắn middleware validateBody trong api.router.ts
- [x] Bước 2: Nâng cấp be/src/config/addon-catalog.ts (tinh gọn danh mục tập trung 4 nhóm chủ lực)
- [x] Bước 3: Nâng cấp be/src/services/addon.service.ts (kiểm tra eligibility chặt chẽ, dọn dẹp đơn stale)
- [x] Bước 4: Đồng bộ quyền tên miền riêng trong domain.service.ts & account-entitlement.service.ts
- [x] Bước 5: Viết bộ Unit Test toàn diện be/tests/addon/addon-service.test.ts
- [x] Bước 6: Chạy kiểm thử Vitest suite & build Next.js frontend xác thực 100% Pass
```

---

## 5. Kế Hoạch Kiểm Thử Toàn Diện (Testing & Quality Assurance)

### 5.1. Unit Tests (`be/tests/addon/addon-service.test.ts`)
- **Case 1: Catalog Eligibility:**
  - Tài khoản VIP -> Gói gia hạn thời gian báo `isEligible = false`.
  - Tài khoản FREE -> Gói gia hạn thời gian và gói tên miền riêng báo `isEligible = false`.
  - Tài khoản BASIC -> Gói gia hạn thời gian và gói tên miền riêng báo `isEligible = true`.
- **Case 2: Order Creation & Idempotency:**
  - Gửi trùng `Idempotency-Key` -> Trả về đơn hàng cũ không tạo mới.
  - Tạo đơn khi đã có đơn cùng loại đang `PENDING` -> Tái sử dụng đơn cũ tránh spam.
- **Case 3: Stale Order Expiration:**
  - Các đơn PENDING quá hạn 48h tự động chuyển sang `EXPIRED`.
- **Case 4: Fulfill Addon:**
  - Fulfill `ADDON_CARDS_5` -> `extraCards` tăng thêm 5.
  - Fulfill `ADDON_PHOTOS_10` -> `extraPhotos` tăng thêm 10.
  - Fulfill `ADDON_DOMAIN_1` -> `extraDomains` tăng thêm 1.
  - Fulfill `ADDON_EXTEND_6M` -> `planExpiresAt` tăng thêm 180 ngày.
- **Case 5: BASIC Account with Extra Domains:**
  - Tài khoản BASIC có `extraDomains: 1` -> Tạo domain thành công, không bị chặn bởi 403 `PLAN_ENTITLEMENT_REQUIRED`.

---

## 6. Rủi Ro & Biện Pháp Giảm Thiểu (Risks & Mitigations)

| Rủi ro | Mức độ | Biện pháp giảm thiểu |
| :--- | :---: | :--- |
| Khách hàng cũ đã mua các addon bị ẩn (views, profile) | Thấp | Trong database vẫn lưu giữ nguyên vẹn giá trị `extraViews`, `extraProfiles` trong cột của `Account`, không xóa cột. |
| Xung đột giá giữa client và server | Thấp | Áp dụng nguyên tắc Server-authoritative: Giá tiền và quota luôn lấy trực tiếp từ `ADDON_CATALOG` trên server, client chỉ gửi `addonCode`. |
| Race condition khi khách click mua nhiều lần | Thấp | Đã có ràng buộc unique `[accountId, idempotencyKey]` và chặn đơn PENDING cùng loại đang tồn tại. |
