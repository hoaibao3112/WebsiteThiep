# Báo Cáo Triển Khai Sửa Bug Backend WebsiteThiep (Hoàn Tất 10/10 Bugs)

> **Trạng thái:** ✅ Đã hoàn thành 10/10 bugs & 100% Typecheck / Unit Tests (170/170 tests passed)  
> **Thời gian:** 2026-10-14  

---

## 1. Kết Quả Xác Nhận Trước Khi Code (Mục 2)

| Vấn đề cần xác nhận | Kết quả kiểm tra thực tế trong Codebase | Quyết định kỹ thuật |
| :--- | :--- | :--- |
| **2.1. Schema @unique** | `Card.slug` đã có `@unique` (line 188 `schema.prisma`). Card đã có `@@unique([accountId, createIdempotencyKey])` (line 247). | **Không cần chạy DB migration.** Tận dụng trực tiếp DB constraint làm source-of-truth. |
| **2.2. getEffectivePlan khi BASIC hết hạn** | `AccountEntitlementService.getEffectivePlan` tự động downgrade sang `FREE`, trả `planCode = "FREE"` và `isPaid = false`. | `effectivePlan.isPaid` là nguồn sự thật duy nhất. Fix #2 là **dọn code thừa** (`if (effectivePlan.isPaid)`). |
| **2.3. Frontend & openingEffect / reminder** | FE cho phép chọn `openingEffect` linh hoạt (NONE, WAX_SEAL, GATE_OPEN, GIFT_BOX). Ép `WAX_SEAL` khi chỉnh phong bì làm mất lựa chọn của host. | **Chọn Option A:** Bỏ ép `openingEffect: "WAX_SEAL"` trong `EnvelopeService.updateCardEnvelopeConfig`. Endpoint public reminder bắt buộc chỉ cho `status: "ACTIVE"`. |
| **2.4. Quy tắc VIP Guest khi card EXPIRED** | Thiệp `EXPIRED` và `ARCHIVED` không được tiếp tục gửi thiệp / tạo khách mời. | Dùng allowlist `status: { in: ["DRAFT", "ACTIVE"] }`, ném `409 CARD_STATE_CONFLICT` nếu thiệp ở trạng thái khác. |

---

## 2. Chi Tiết Thực Hiện Theo 3 Phase

### Phase 1: Mức HIGH

#### Fix #3: `sentAt` bị reset về null (`guest.service.ts`)
- **Vấn đề:** Khi cập nhật `deliveryStatus` sang trạng thái khác (như `OPENED_ZALO`), logic cũ gán `sentAt: status === "CONFIRMED_SENT" ? now : null` làm mất lịch sử gửi.
- **Giải pháp:** Đổi thành `sentAt: status === "CONFIRMED_SENT" ? now : undefined`. Trong Prisma, `undefined` sẽ bỏ qua field và giữ nguyên giá trị cũ trong DB.
- **Test:** `tests/guest/guest-service.test.ts` kiểm tra `OPENED_ZALO` giữ `sentAt: undefined`, `CONFIRMED_SENT` ghi nhận `Date`.

#### Fix #4: `patchElement` không tăng version (`card-element.service.ts`)
- **Vấn đề:** `patchElement` cập nhật canvas element nhưng không tăng `version`, khiến `updateDraft` (PUT) sau đó không phát hiện được xung đột ghi đè.
- **Giải pháp:** Thêm `version: { increment: 1 }` vào data của `card.updateMany`.
- **Test:** `tests/card/card-element.test.ts` assert `version: { increment: 1 }`.

#### Fix #1: Race condition tạo slug draft (`card.service.ts`)
- **Vấn đề:** Check slug nằm ngoài transaction, khi 2 request song song cùng slug, cả 2 vượt qua check và gây lỗi 503 (do transaction conflict retry) thay vì trả 409 cho client.
- **Giải pháp:**
  - Kiểm tra slug bổ sung bên trong transaction.
  - Trong khối `catch`: bắt lỗi Prisma `P2002`:
    - Nếu `meta.target` chứa `slug` → ném `409 SLUG_TAKEN` ngay lập tức, không retry.
    - Nếu `meta.target` chứa `createIdempotencyKey` → truy vấn lại trả card đã tạo (idempotent response).
    - `P2034` (serialization failure) → retry tối đa 3 lần.
- **Test:** `tests/card/card-service.test.ts` kiểm tra `P2002 slug` trả 409 không retry, `P2002 idempotency` trả existing card.

#### Fix #8: Endpoint reminder công khai lộ dữ liệu thiệp nháp (`reminder.service.ts`)
- **Vấn đề:** `ReminderService.resolveConfig` dùng `findUnique({ where: { id: cardId } })` không kiểm tra `status`, làm lộ `categoryData` của thiệp DRAFT/ARCHIVED qua URL public ICS/Google Calendar.
- **Giải pháp:** Đổi sang `prisma.card.findFirst({ where: { id: cardId, status: "ACTIVE" } })`, ném `404 CARD_NOT_FOUND` chung để không tiết lộ trạng thái thiệp.
- **Test:** `tests/card/reminder-service.test.ts` kiểm tra DRAFT/ARCHIVED nhận 404, ACTIVE tạo calendar URL/ICS bình thường.

---

### Phase 2: Mức MEDIUM

#### Fix #5: Thứ tự validate thanh toán (`manual-payment-review.service.ts`)
- **Vấn đề:** Trước đây chuyển trạng thái `PAID` bằng `updateMany` trước, sau đó mới kiểm tra `receivedAmount < order.amount` và throw rollback.
- **Giải pháp:**
  - Đọc Order và kiểm tra `status === "AWAITING_REVIEW"` trước.
  - Kiểm tra `receivedAmount >= order.amount` trước; nếu thiếu ném `422 INSUFFICIENT_AMOUNT` ngay, không chạm vào trạng thái đơn.
  - Thực hiện `updateMany` với `where: { id: orderId, status: "AWAITING_REVIEW" }` và guard `transition.count === 1` làm concurrency gate chống 2 admin duyệt cùng lúc.
- **Test:** `tests/order/order-expiry-approval.test.ts` kiểm tra số tiền thiếu trả 422 không update, 2 admin duyệt đồng thời thì admin thứ 2 nhận 409.

#### Fix #2: Dọn code thừa trong `publishCard` (`card.service.ts`)
- **Vấn đề:** `effectivePlan.isPaid` đã bao hàm cả `BASIC` còn hạn và `VIP`. Điều kiện thừa `|| planCode === "BASIC" || planCode === "VIP"` gây mơ hồ logic.
- **Giải pháp:** Rút gọn chỉ còn `if (effectivePlan.isPaid) { expiredAt = null; } else { ... }`.
- **Test:** `tests/card/card-lifecycle.test.ts` (10/10 tests passed).

#### Fix #10: Kiểm tra status trong `requireVipCard` (`guest.service.ts`)
- **Vấn đề:** `requireVipCard` chỉ check quyền sở hữu và VIP plan nhưng không check `card.status`, cho phép thao tác khách mời trên thiệp `ARCHIVED` hoặc `EXPIRED`.
- **Giải pháp:** Select `status` và áp dụng allowlist:
  ```ts
  if (card.status !== "DRAFT" && card.status !== "ACTIVE") {
    throw new HttpError(409, `Thiệp đang ở trạng thái ${card.status === "ARCHIVED" ? "lưu trữ" : "hết hạn"}, không thể thao tác khách mời`, "CARD_STATE_CONFLICT");
  }
  ```
- **Test:** `tests/guest/guest-service.test.ts` kiểm tra ARCHIVED và EXPIRED nhận 409 `CARD_STATE_CONFLICT`, DRAFT và ACTIVE hoạt động tốt.

#### Fix #6: Bỏ cưỡng ép WAX_SEAL khi cập nhật phong bì (`envelope.service.ts`)
- **Vấn đề:** `updateCardEnvelopeConfig` ép `openingEffect: "WAX_SEAL"`, ghi đè lựa chọn của host nếu host muốn chọn hiệu ứng mở màn khác (NONE, GATE_OPEN,...).
- **Giải pháp:** Bỏ dòng `openingEffect: "WAX_SEAL"` trong lệnh update của `EnvelopeService`.
- **Test:** `tests/envelope/envelope-service.test.ts` kiểm tra update phong bì không làm thay đổi `openingEffect` hiện tại.

---

### Phase 3: Mức LOW

#### Fix #7: Telegram RSVP gửi tên gốc thay vì tên khách mời (`rsvp.service.ts`)
- **Vấn đề:** Job BullMQ `send-telegram-rsvp` lấy `fullName` và `phone` thô từ input thay vì `commonData.fullName` (đã resolve từ guest list).
- **Giải pháp:** Truyền `commonData.fullName` và `commonData.phone` vào payload của `rsvpNotificationQueue.add`.
- **Test:** `tests/rsvp/rsvp-notification.test.ts` kiểm tra payload chứa resolved name và phone.

#### Fix #9: Chống brute-force OTP race condition (`otp.service.ts`)
- **Vấn đề:** `GET hash` trước rồi mới `INCR attempts` gây race condition khi người dùng/bot gửi nhiều request đồng thời để đoán mã.
- **Giải pháp:**
  - `INCR attempts` trước, đặt `EXPIRE` 5 phút khi count === 1.
  - Nếu `attempts > MAX_VERIFY_ATTEMPTS (5)`: lập tức xóa key và khóa mã (`400 OTP_MAX_ATTEMPTS_EXCEEDED`), không đọc hash.
  - Khi verify thành công: xóa sạch cả `otpKey` lẫn `attemptsKey`.
- **Test:** `tests/auth/otp-service.test.ts` kiểm tra đếm atomic, khóa ngay khi quá 5 lần, và dọn dẹp key khi thành công.

---

## 3. Danh Sách File Đã Chỉnh Sửa & Bổ Sung Test

### Source Code:
1. `be/src/services/card.service.ts` (Fix #1, Fix #2)
2. `be/src/services/card-element.service.ts` (Fix #4)
3. `be/src/services/guest.service.ts` (Fix #3, Fix #10)
4. `be/src/services/reminder.service.ts` (Fix #8)
5. `be/src/services/manual-payment-review.service.ts` (Fix #5)
6. `be/src/services/envelope.service.ts` (Fix #6)
7. `be/src/services/rsvp.service.ts` (Fix #7)
8. `be/src/services/otp.service.ts` (Fix #9)

### Test Suites:
1. `be/tests/card/card-service.test.ts`
2. `be/tests/card/card-element.test.ts`
3. `be/tests/card/reminder-service.test.ts` *(mới tạo)*
4. `be/tests/guest/guest-service.test.ts`
5. `be/tests/guest/guest-import.test.ts`
6. `be/tests/guest/guest-tracking.test.ts`
7. `be/tests/order/order-expiry-approval.test.ts`
8. `be/tests/envelope/envelope-service.test.ts`
9. `be/tests/rsvp/rsvp-notification.test.ts`
10. `be/tests/auth/otp-service.test.ts` *(mới tạo)*

---

## 4. Kết Quả Kiểm Tra (Verification)

- **Typecheck & Prisma Build:** `npm run build` (`prisma generate && tsc`) chạy thành công 0 errors.
- **Vitest Suite:** Chạy 23 file tests liên quan với **170/170 tests PASSED (100%)**.
