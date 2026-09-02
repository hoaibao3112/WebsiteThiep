# Kế hoạch triển khai Quản lý khách mời cá nhân hóa và chia sẻ Zalo

## 1. Bối cảnh và kết quả mong muốn

Mở rộng luồng Guest/RSVP hiện có để chủ thiệp VIP có thể quản lý danh sách khách, tạo liên kết khó đoán cho từng người, chuẩn bị lời mời và mở Zalo để người dùng tự gửi. Khách mở liên kết sẽ thấy đúng danh xưng/tên, form RSVP được điền sẵn và mỗi khách chỉ có một phản hồi hiện hành.

MVP không tuyên bố gửi Zalo tự động và không đánh dấu `Đã gửi` chỉ vì đã mở Zalo. Việc gửi tự động qua Zalo OA/ZBS là một tích hợp riêng sau khi xác minh điều kiện tài khoản, template và webhook của Zalo.

## 2. Phạm vi MVP

### Bao gồm

- CRUD khách mời, tìm kiếm, lọc, phân trang và thống kê.
- Nhập nhanh bằng paste text có bước xem trước và báo lỗi từng dòng.
- Liên kết cá nhân dùng token ngẫu nhiên khó đoán.
- Soạn lời mời bằng các biến được cho phép, copy và mở giao diện chia sẻ Zalo.
- Trạng thái gửi có ngữ nghĩa rõ: chưa gửi, đã mở Zalo, người dùng xác nhận đã gửi.
- Hiển thị tên trên phong bì và điền sẵn RSVP.
- Mỗi khách cá nhân có một RSVP hiện hành; gửi lại là cập nhật.
- Kiểm tra VIP và `accountId` tại backend.
- Điều hướng từ danh sách thiệp và trang quản lý RSVP.

### Ngoài phạm vi MVP

- Gửi tin tự động bằng Zalo OA/ZBS, webhook giao nhận và tính phí tin nhắn.
- Tự động đọc danh bạ hoặc chọn sẵn người nhận Zalo.
- Import Excel. MVP dùng paste text và giữ export Excel hiện có; import Excel làm phase 2 sau khi parser được chứng minh ổn định.
- Gửi hàng loạt không có thao tác xác nhận của người dùng.
- Lịch sử nhiều phiên bản RSVP; MVP lưu trạng thái hiện hành.

## 3. Quyết định nghiệp vụ

1. Tính năng link cá nhân và chia sẻ Zalo chỉ dành cho card có entitlement `personalizedGuestLinks=true`. Backend là nguồn quyết định; frontend chỉ phản ánh kết quả.
2. Trong thời gian thanh toán VIP chưa hoàn thiện, entitlement lấy từ `Plan.code === VIP`. Khi payment activation ra mắt, chỉ thay hàm kiểm tra entitlement, không đổi Guest API.
3. FREE tiếp tục dùng link chung và RSVP không gắn guest.
4. `OPENED_ZALO` chỉ có nghĩa người dùng đã bấm mở giao diện chia sẻ. Chỉ thao tác xác nhận riêng mới ghi `CONFIRMED_SENT` và `sentAt`.
5. Xóa khách không xóa RSVP: quan hệ hiện tại `onDelete: SetNull` giữ lại dữ liệu thống kê.
6. Một guest chỉ có tối đa một RSVP hiện hành. Link chung vẫn cho phép nhiều phản hồi độc lập và được rate-limit.
7. Import tối đa 500 dòng/request. Mặc định bỏ qua bản trùng; người dùng có thể chọn cập nhật bản trùng.
8. Bản trùng ưu tiên xác định bằng số điện thoại đã chuẩn hóa; nếu không có điện thoại, dùng `normalizedName + normalizedGroup` trong phạm vi card.

## 4. Mô hình dữ liệu và migration

### Prisma

Thêm enum:

```prisma
enum GuestDeliveryStatus {
  NOT_SENT
  OPENED_ZALO
  CONFIRMED_SENT
  FAILED
}
```

Thay đổi `Guest`:

```prisma
guestToken     String              @unique
normalizedName String
normalizedPhone String?
notes          String?
deliveryStatus GuestDeliveryStatus @default(NOT_SENT)
shareOpenedAt  DateTime?
sentAt         DateTime?

@@index([accountId, cardId, deliveryStatus])
@@index([accountId, cardId, normalizedPhone])
```

- Giữ `guestCode` trong một migration chuyển tiếp để link cũ tiếp tục hoạt động.
- Backfill `guestToken` bằng CSPRNG cho khách hiện có; không dùng `Math.random()`.
- Sau một chu kỳ phát hành, có thể bỏ `guestCode` và `customUrl`. URL phải được tạo từ `APP_URL`, slug và token khi serialize, không lưu URL tuyệt đối trong DB.
- Thêm unique có điều kiện cho RSVP cá nhân. Vì PostgreSQL partial unique không biểu diễn trực tiếp đầy đủ bằng Prisma, migration SQL tạo unique index trên `(card_id, guest_id) WHERE guest_id IS NOT NULL`; service vẫn dùng transaction/upsert tương ứng.
- Migration phải có `down`/rollback SQL hoặc tài liệu khôi phục, chạy được trên bản sao dữ liệu production trước khi deploy.

## 5. Hợp đồng API

Tất cả endpoint quản trị dùng `authGuard`, lấy `accountId` từ phiên đăng nhập và không nhận `accountId`, `planId`, `guestToken`, `deliveryStatus` tùy ý từ client.

### Danh sách và thống kê

```http
GET /api/cards/:cardId/guests?page=1&pageSize=50&search=&group=&deliveryStatus=&rsvpStatus=
```

Response:

```json
{
  "items": [],
  "pagination": { "page": 1, "pageSize": 50, "total": 180 },
  "metrics": {
    "total": 180,
    "confirmedSent": 120,
    "responded": 95,
    "attendingPeople": 128
  }
}
```

Query list chỉ select trường cần cho bảng; không include toàn bộ mảng RSVP. Metrics dùng aggregate/groupBy trong các truy vấn có `accountId` và `cardId`.

### CRUD

```http
POST   /api/cards/:cardId/guests
PUT    /api/cards/:cardId/guests/:guestId
DELETE /api/cards/:cardId/guests/:guestId
DELETE /api/cards/:cardId/guests
POST   /api/cards/:cardId/guests/:guestId/regenerate-token
```

- Create trả `201`; update trả `200`; delete trả số bản ghi đã xóa.
- Clear-all yêu cầu body `{ "confirmCardId": "..." }`, chạy theo `accountId + cardId`.
- Regenerate token làm link cũ mất hiệu lực và cần modal cảnh báo.

### Import

```http
POST /api/cards/:cardId/guests/import
Idempotency-Key: <uuid>

{
  "mode": "SKIP_DUPLICATES",
  "guests": [{ "fullName": "Anh Nam", "salutation": "Anh", "group": "Bạn bè", "phone": "090..." }]
}
```

Response chứa `created`, `updated`, `skipped`, `errors[{row,field,message}]` và items được tạo. Import validate tối đa 500 dòng, transaction ở isolation phù hợp, khóa/dedupe idempotency theo `accountId + cardId + key`.

### Trạng thái chia sẻ

Không dùng toggle vì retry hai lần có thể đảo ngược trạng thái:

```http
PATCH /api/cards/:cardId/guests/:guestId/delivery
{ "status": "OPENED_ZALO" }

PATCH /api/cards/:cardId/guests/:guestId/delivery
{ "status": "CONFIRMED_SENT" }
```

Chỉ cho phép transition hợp lệ. `CONFIRMED_SENT` ghi `sentAt`; chuyển về `NOT_SENT` chỉ qua thao tác rõ ràng và xóa `sentAt`.

### Public guest resolve và RSVP

- `GET /cards/by-slug/:slug?g=<guestToken>` chỉ trả guest thuộc đúng card; token không hợp lệ vẫn hiển thị thiệp chung, không tiết lộ token có tồn tại ở card khác.
- `POST /rsvp` nhận `guestToken` thay `guestCode` sau giai đoạn tương thích.
- Thiệp phải `ACTIVE` và chưa hết hạn; không nhận RSVP cho `DRAFT`.
- Khi token hợp lệ, backend lấy `fullName`, `phone`, `accountId`, `guestId` từ DB; không tin client thay các trường định danh.
- RSVP guest dùng upsert/transaction; link chung dùng create và rate-limit Redis.

## 6. Validation, quyền và bảo mật

- Chuyển Zod schema guest ra `be/src/lib/validators/guest/`; không khai báo schema trong controller.
- Giới hạn: tên 2–120, danh xưng 1–30, nhóm 0–80, ghi chú 0–500, search 0–100, pageSize tối đa 100.
- Chuẩn hóa Unicode/whitespace và điện thoại Việt Nam về một dạng lưu trữ nhất quán.
- Token sinh bằng `crypto.randomBytes(24).toString("base64url")`; không log, không đưa vào analytics/referrer tùy tiện.
- Thêm `Referrer-Policy: no-referrer` hoặc tối thiểu `strict-origin` trên trang thiệp để giảm rò token query.
- Rate limit: import/CRUD theo account; public resolve và RSVP theo IP + card + token hash.
- Mọi truy vấn Guest/Card/RSVP quản trị đều có `accountId`. Lookup public luôn ràng buộc `cardId + guestToken`.
- Lỗi chuẩn: `401`, `403 FEATURE_NOT_AVAILABLE`, `404`, `409 DUPLICATE_GUEST`, `422 VALIDATION_ERROR`, `429`.
- Không log số điện thoại đầy đủ; mask trong log và telemetry.

## 7. Backend files và thứ tự thực hiện

### Phase A — Tracer bullet bắt buộc

1. Viết test thất bại: chủ VIP thêm một guest; tài khoản khác không đọc/sửa được.
2. Migration token/delivery status tối thiểu.
3. Implement create + owner list một guest theo `accountId`.
4. Public resolve token, hiển thị tên và RSVP upsert.
5. Test xuyên suốt từ create guest đến đọc RSVP trên dashboard.

Chỉ tiếp tục khi lát cắt này chạy qua database test thật.

### Phase B — Hoàn thiện API

- `be/prisma/schema.prisma` và migration SQL.
- `be/src/lib/validators/guest/index.ts`: create, update, import, list query, delivery transition.
- Thay `GuestImportService` bằng `GuestService` hoặc giữ tên nhưng mở rộng có kiểm soát; mọi method nhận `accountId`.
- `be/src/controllers/guest.controller.ts`: chỉ parse, gọi service, map error.
- `be/src/routes/api.router.ts`: khai báo route tĩnh/import trước `/:guestId` và clear-all bằng `DELETE /guests` để tránh collision.
- `be/src/services/card.service.ts`: resolve token theo card.
- `be/src/services/rsvp.service.ts`: ACTIVE-only, guest identity từ DB, upsert RSVP.
- Bổ sung shared domain errors thay cho `catch (error: any)`.

## 8. Frontend logic và UX

### Cấu trúc đề xuất

```text
fe/src/app/(dashboard)/dashboard/cards/[cardId]/guests/page.tsx
fe/src/components/guests/guest-metrics.tsx
fe/src/components/guests/guest-toolbar.tsx
fe/src/components/guests/guest-table.tsx
fe/src/components/guests/guest-mobile-list.tsx
fe/src/components/guests/import-text-dialog.tsx
fe/src/components/guests/guest-form-dialog.tsx
fe/src/components/guests/zalo-message-dialog.tsx
fe/src/hooks/use-guests.ts
fe/src/lib/guests/parse-guest-text.ts
fe/src/lib/guests/zalo-share.ts
```

### Trang quản lý khách

- Desktop dùng table; mobile chuyển sang card list, không ép bảng ngang sáu cột.
- Metrics có skeleton, empty state và error/retry riêng.
- Search debounce 300 ms; filter nằm trong URL để refresh/back không mất trạng thái.
- Mutation có pending state chống double submit. Delete/update dùng optimistic UI chỉ khi có rollback rõ ràng.
- Import text có hai bước: paste → preview/edit lỗi → confirm import. Không gửi dòng lỗi lên server.
- Copy link thông báo bằng `aria-live`; nếu Clipboard API thất bại, hiện textarea/select fallback.
- Template lời mời chỉ thay ba biến `{danh_xung}`, `{ten_khach}`, `{link_thiep}`; biến lạ được giữ nguyên và cảnh báo trước khi lưu.

### Chia sẻ Zalo

Thứ tự hành động:

1. Tạo message từ template đã escape/encode.
2. Copy message vào clipboard.
3. Gọi delivery API `OPENED_ZALO` theo kiểu best-effort.
4. Mở official Zalo share plugin/URL đã được kiểm chứng; nếu không hỗ trợ thì mở Zalo và giữ message trong clipboard.
5. Khi người dùng quay lại, hỏi `Bạn đã gửi lời mời cho Anh Nam chưa?`; xác nhận mới ghi `CONFIRMED_SENT`.

Không đưa số điện thoại vào URL nếu Zalo không có tài liệu chính thức bảo đảm hành vi đó.

### Trải nghiệm khách

- `WaxSealOpening.tsx` nhận object `{salutation, fullName}` thay vì chuỗi ghép không kiểm soát.
- `RsvpFormModal.tsx` khởi tạo tên/SĐT từ guest; tên được khóa hoặc cảnh báo nếu sửa vì backend vẫn lấy identity từ token.
- Token sai/hết hiệu lực: hiển thị lời mời chung, form trống; không hiện thông báo giúp dò token.
- Sau submit: cập nhật trạng thái ngay, chống submit lặp, hỗ trợ sửa câu trả lời sau đó.

## 9. Điều hướng và feature gating

- `dashboard/cards/page.tsx`: thêm `Quản lý khách mời`; FREE thấy nhãn VIP và CTA nâng cấp, không vào màn hình quản trị cá nhân hóa.
- `dashboard/cards/[cardId]/rsvp/page.tsx`: thêm link sang Guest Manager và thống nhất metrics từ cùng API/service.
- Route frontend vẫn cần guard trải nghiệm, nhưng mọi quyền cuối cùng do backend quyết định.
- Không hardcode VIP trong nhiều component; dùng response capability của card như `features.personalizedGuestLinks`.

## 10. Kiểm thử và tiêu chí hoàn thành

### Backend Vitest

- Tenant A không list/create/update/delete guest của tenant B.
- FREE nhận `403`; VIP được phép.
- Token đủ entropy, unique và lookup luôn kèm card.
- Import 0, 1, 500, 501 dòng; duplicate skip/update; retry cùng idempotency key không tạo trùng.
- Phân trang/filter/metrics đúng và mọi query có `accountId`.
- Delivery transition idempotent; mở Zalo không tự thành confirmed sent.
- RSVP token hợp lệ prefill/upsert; token của card khác không liên kết; DRAFT/EXPIRED bị từ chối.
- Clear-all giữ RSVP với `guestId=null`.

### Frontend Vitest + RTL/MSW

- Parser hỗ trợ dòng tên thuần, dấu phân cách tab/comma và báo lỗi dòng.
- Search/filter không mất khi back/refresh.
- Copy success/fallback, popup Zalo bị chặn và API delivery thất bại.
- Không hiện success giả; nút mutation disable khi pending.
- Mobile card list, keyboard/focus trap dialog, aria-label/icon buttons và aria-live toast.
- Guest token điền sẵn form; token không hợp lệ dùng form trống.

### Lệnh xác minh

```powershell
cd be
npm.cmd test -- --run
npx.cmd prisma validate
npm.cmd run build

cd ../fe
npm.cmd test -- --run
npm.cmd run build
```

Kỳ vọng: exit code 0, không có test fail hoặc TypeScript error. Chạy thêm migration trên database staging và kiểm tra explain plan của list/metrics với ít nhất 10.000 guest records.

### Definition of Done

- Một card VIP tạo guest, chia sẻ thủ công qua Zalo, nhận RSVP và thấy dashboard cập nhật end-to-end.
- Không có truy vấn quản trị nào thiếu `accountId`.
- Không có đường dẫn cá nhân dùng mã ngắn/dễ đoán.
- Không có số liệu `Đã gửi` được suy ra từ việc chỉ mở Zalo.
- FREE bị chặn ở backend nhưng vẫn sử dụng link chung và RSVP bình thường.
- Test, Prisma validation và cả hai production build đều đạt.

## 11. Rollout và quan sát

- Đặt sau feature flag `personalizedGuestLinksV1`, bật trước cho tài khoản test nội bộ.
- Triển khai migration tương thích ngược trước, sau đó backend, cuối cùng frontend.
- Theo dõi: import failure rate, duplicate rate, share-open/confirmed ratio, RSVP completion rate, API p95 và 403/429 rate.
- Rollback frontend/backend không làm mất dữ liệu vì trường cũ giữ trong giai đoạn chuyển tiếp.
- Không xóa `guestCode/customUrl` đến khi log cho thấy không còn traffic link cũ trong thời gian đã định.

## 12. STOP conditions

- Chưa có nguồn entitlement VIP đáng tin cậy ở backend.
- Migration partial unique làm lộ RSVP trùng hiện hữu mà chưa có quy tắc hợp nhất.
- URL/plugin Zalo dự kiến dùng không được tài liệu Zalo chính thức hỗ trợ trên cả desktop và mobile.
- Không xác định được `accountId` tin cậy từ auth context.
- Backfill token không thể rollback hoặc không đảm bảo unique.

Nếu gặp một trong các điều kiện này, dừng triển khai phần liên quan và báo lại; không tự nới quyền, dùng token yếu hoặc giả định đã gửi thành công.

## Review Notes — 2026-09-02

| Tiêu chí | Trước | Sau |
|---|---:|---:|
| Completeness | 3/5 | 5/5 |
| Feasibility | 3/5 | 5/5 |
| Scope | 4/5 | 5/5 |
| Testability | 2/5 | 5/5 |
| Risk | 2/5 | 5/5 |
| Assumptions | 2/5 | 5/5 |

Các giả định chính đã được chuyển thành feature gate, tracer bullet, test case hoặc STOP condition. Kế hoạch đủ chi tiết để triển khai mà không cần suy đoán thêm về bảo mật token, tenant isolation, RSVP uniqueness và ý nghĩa trạng thái gửi.
