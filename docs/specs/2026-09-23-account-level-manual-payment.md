# Account-Level Manual Bank Transfer Upgrade

## Context

Hệ thống đã có bảng `Plan`, `Order`, `PaymentTransaction`, trang pricing/billing và luồng VietQR/SePay, nhưng việc mua gói hiện gắn vào một `Card`. Trang billing còn gửi `cardId = "demo-card-id"`, frontend có nhiều nguồn giá không đồng nhất, và webhook hiện nâng cấp riêng một thiệp. Feature này chuyển quyền lợi BASIC/VIP lên cấp `Account`, dùng chuyển khoản VietQR và quản trị viên duyệt thủ công trước khi kích hoạt cho toàn bộ thiệp hiện tại lẫn tương lai của tài khoản.

## Goals

- OWNER chọn BASIC/VIP, nhận QR chuyển khoản đúng giá và báo đã chuyển khoản.
- ADMIN xem hàng đợi thanh toán, đối chiếu giao dịch rồi duyệt hoặc từ chối.
- Một lần duyệt thành công nâng cấp toàn bộ tài khoản trong transaction, không thể xử lý hai lần.
- Mọi thiệp hiện tại và tương lai đọc quyền lợi từ `Account` thay vì quyền lợi cục bộ trên `Card`.
- Giá, thời hạn và quyền lợi luôn do backend quyết định.
- BASIC hết hạn được xử lý mềm: dữ liệu giữ nguyên, tài khoản có hiệu lực FREE và các tính năng cao cấp bị khóa chỉnh sửa.

## Non-goals

- Không tự động xác nhận bằng webhook SePay/Casso.
- Không tải ảnh minh chứng chuyển khoản.
- Không mã giảm giá, hóa đơn VAT, hoàn tiền hoặc prorate thời gian BASIC còn lại khi nâng VIP.
- Không email, Telegram hoặc push notification cho trạng thái thanh toán.
- Không hỗ trợ nhiều payment provider hoặc subscription tự động định kỳ.
- Không xóa dữ liệu vượt giới hạn khi tài khoản bị hạ về FREE.

## Authoritative Plan and Pricing

- Backend/database là nguồn chuẩn duy nhất cho giá và quyền lợi.
- FREE: `0đ`.
- BASIC: `199.000đ`, thời hạn 180 ngày.
- VIP: `399.000đ`, vĩnh viễn (`durationDays = null`).
- Frontend không hard-code giá để tạo đơn và không gửi `amount`.
- API công khai chỉ trả các Plan `isActive = true` với những field an toàn cần cho pricing/billing.

## Account Entitlement Model

`Account` là nguồn sự thật của quyền lợi:

- `currentPlanId`: Plan có hiệu lực hoặc Plan được lưu gần nhất.
- `planStartedAt`: lần kích hoạt/gia hạn gần nhất.
- `planExpiresAt`: hạn BASIC; `null` cho VIP và FREE.
- Quyền lợi hiệu dụng là FREE nếu `currentPlan.code = BASIC` và `planExpiresAt <= now`, kể cả trước khi có thao tác ghi hạ gói.

Một `AccountEntitlementService` tập trung việc:

- Đọc Plan hiệu dụng của account theo `accountId`.
- Kiểm tra feature flags (`maxPhotos`, premium templates, music, Telegram, watermark, export...).
- Tính hạn khi kích hoạt/gia hạn.
- Trả summary cho auth/billing/frontend.

`Card.planId` được giữ tạm để tương thích dữ liệu/API cũ nhưng không còn quyết định quyền lợi. `Card.expiredAt` vẫn giữ vai trò lifecycle/publication của từng thiệp FREE, không phải nguồn feature entitlement. Các service Card, Guest và Export phải chuyển sang entitlement của Account. Response Card có thể tiếp tục trả field `plan` dưới dạng effective account plan trong giai đoạn tương thích để frontend không phải đổi đồng loạt trong cùng một bước.

Khi account được duyệt BASIC/VIP:

- Card `DRAFT` vẫn là `DRAFT`; Card `ARCHIVED` vẫn là `ARCHIVED`.
- Card `ACTIVE` được bỏ hạn public (`expiredAt = null`).
- Card `EXPIRED` do hết hạn gói trước đó được kích hoạt lại thành `ACTIVE` và `expiredAt = null`.
- Card tạo/publish trong thời gian account có gói trả phí có `expiredAt = null`.
- Card tạo sau khi account đã về FREE lại áp dụng lifecycle FREE 7 ngày như hiện tại.

## Legacy Data Migration

Migration phải chạy theo thứ tự an toàn:

1. Thêm các field Account ở dạng nullable và quan hệ Plan mới.
2. Xác nhận Plan FREE/BASIC/VIP tồn tại; nếu thiếu thì dừng migration, không tự đoán ID.
3. Với mỗi Account, chọn quyền lợi cao nhất còn hiệu lực từ các Card hiện có:
   - Có Card VIP hợp lệ: Account thành VIP, `planExpiresAt = null`.
   - Nếu không có VIP nhưng có BASIC chưa hết hạn: Account thành BASIC, dùng `expiredAt` xa nhất.
   - Còn lại: Account thành FREE.
4. Đặt `currentPlanId` thành NOT NULL và tạo foreign key/index.
5. Không xóa hoặc viết lại `Card.planId`, `Card.expiredAt` trong migration này.

Rollback application phải có thể tiếp tục đọc `Card.planId`; vì vậy chỉ xóa field Account sau khi đã rollback code và xác nhận không còn đơn account-level mới phụ thuộc dữ liệu đó.

## Roles and Authorization

- Chỉ `AccountMemberRole.OWNER` của account hiện tại được tạo đơn, báo đã chuyển khoản hoặc xem đơn thanh toán của account.
- `MEMBER` chỉ được xem summary gói hiện tại; không được tạo/gửi đơn.
- Chỉ `User.role = ADMIN` được truy cập màn hình và API duyệt thanh toán.
- Các tenant read/write luôn lọc `accountId`.
- Hàng đợi quản trị là một boundary platform-admin được bảo vệ riêng bằng `adminGuard`, phân trang, log truy cập và chỉ select field cần thiết. Mọi detail/mutation sau khi chọn một đơn phải dùng cả `orderId` và `accountId`.

## Order Model and State Machine

`cardId` trên Order chuyển thành nullable để giữ đơn cũ; đơn account-level mới luôn để `cardId = null`.

Các field audit mới:

- `submittedAt`: lúc OWNER bấm “Tôi đã chuyển khoản”.
- `reviewedAt`: lúc ADMIN duyệt/từ chối.
- `reviewedById`: ADMIN thực hiện.
- `reviewNote`: lý do từ chối hoặc ghi chú duyệt.

State machine:

```text
PENDING -> AWAITING_REVIEW -> PAID
    |              |-------> REJECTED
    |--------------|-------> EXPIRED
```

- `PENDING`: QR đã tạo, chưa báo chuyển khoản.
- `AWAITING_REVIEW`: người dùng đã báo chuyển khoản, chờ ADMIN.
- `PAID`: đã duyệt và entitlement đã kích hoạt.
- `REJECTED`: bị từ chối; bắt buộc có lý do.
- `EXPIRED`: quá 48 giờ kể từ khi tạo mà chưa PAID.
- `CANCELLED` được giữ cho dữ liệu/luồng cũ nhưng không cần UI mới trong phase này.

Mỗi account chỉ có một Order chưa hoàn tất cho cùng một Plan. PostgreSQL partial unique index trên `(accountId, planId)` cho các trạng thái `PENDING`/`AWAITING_REVIEW` là lớp bảo vệ cuối trước race từ hai idempotency key khác nhau. Request lặp lại trả lại đơn đang tồn tại thay vì tạo QR khác. `Idempotency-Key` vẫn bắt buộc cho POST tạo đơn.

## Purchase and Renewal Rules

- FREE -> BASIC: `planExpiresAt = now + 180 ngày`.
- BASIC còn hạn mua BASIC: cộng 180 ngày từ `planExpiresAt` hiện tại.
- BASIC đã hết hạn mua BASIC: `planExpiresAt = now + 180 ngày`.
- FREE/BASIC -> VIP: chuyển VIP ngay, `planExpiresAt = null`.
- VIP không được mua lại VIP hoặc hạ xuống BASIC.
- Không hoàn tiền hoặc prorate BASIC còn lại khi lên VIP.
- Khi BASIC hết hạn, effective entitlement là FREE ngay cả nếu cleanup write chưa chạy.

## Manual Review Rules

Người dùng bấm “Tôi đã chuyển khoản” mà không cần upload ảnh. ADMIN đối chiếu ứng dụng ngân hàng bằng `orderCode`, số tiền và thời gian.

Approve request phải có:

- `accountId` và `orderId` từ bản ghi đang review.
- `receivedAmount` là số nguyên dương và phải `>= order.amount`.
- `bankReference` tùy chọn; nếu có phải được normalize và chống dùng trùng.
- `reviewNote` tùy chọn.

Approve thực hiện trong transaction PostgreSQL `Serializable` với retry giới hạn cho serialization conflict:

1. Conditional transition đúng một Order `AWAITING_REVIEW`, đúng `accountId`, chưa hết hạn sang `PAID`.
2. Ghi `paidAt`, `reviewedAt`, `reviewedById`, ghi chú.
3. Ghi `PaymentTransaction` với gateway `MANUAL`; dùng một gateway transaction key ổn định để retry không tạo log trùng.
4. Đọc và khóa logic Account entitlement trong cùng transaction, rồi cập nhật theo quy tắc mua/gia hạn; một BASIC approval không được ghi đè Account đã thành VIP bởi approval đồng thời.
5. Bỏ hạn public cho Card ACTIVE và kích hoạt lại Card EXPIRED của cùng `accountId`; không tự publish DRAFT hoặc khôi phục ARCHIVED.

Nếu conditional transition không cập nhật đúng một row, request trả conflict và không thay đổi entitlement. Nếu transaction vẫn conflict sau số lần retry giới hạn, trả lỗi retryable và không commit một phần. Reject cũng conditional, bắt buộc lý do, không tạo PaymentTransaction và không đổi gói.

## Expiration and Soft Downgrade

- Order hết hạn sau 48 giờ.
- Phiên bản đầu không cần cron mới: create/read/list/review Order gọi chung helper expire các order đến hạn trước khi xử lý.
- Entitlement lookup luôn tính theo thời gian nên BASIC quá hạn trở thành FREE ngay, không phụ thuộc cron.
- Khi về FREE:
  - Không xóa Card, ảnh, khách mời hoặc nội dung.
  - Thiệp đang public vẫn xem được và hiển thị watermark theo FREE.
  - Không cho thêm ảnh nếu dữ liệu hiện có đã vượt `maxPhotos` FREE.
  - Không cho sửa/chọn thêm tính năng cao cấp; dữ liệu cũ được giữ để phục hồi khi gia hạn.

## API Design

### Public/authenticated plan reads

- `GET /plans`: danh sách Plan active cho pricing.
- `GET /billing/summary`: effective Plan, hạn dùng, role OWNER/MEMBER và đơn chưa hoàn tất của account hiện tại.

### Owner payment flow

- `POST /orders`
  - Auth + OWNER guard + `Idempotency-Key`.
  - Body: `{ planCode: "BASIC" | "VIP" }`.
  - Backend lookup Plan và giá; không nhận `amount`, `cardId` hoặc `userId`.
- `POST /orders/:orderId/submit-transfer`
  - Auth + OWNER + `accountId` ownership.
  - Conditional `PENDING -> AWAITING_REVIEW`.
- `GET /orders/:orderId`
  - Auth + OWNER + account scope; dùng cho reload/polling.

Endpoint polling-token cũ có thể giữ tạm cho đơn legacy nhưng UI mới dùng authenticated order ID để có thể khôi phục sau reload.

### Platform admin review

- `GET /admin/payment-orders?status=&page=&pageSize=`: hàng đợi phân trang, chỉ ADMIN.
- `GET /admin/payment-orders/:orderId?accountId=`: detail đã scope.
- `POST /admin/payment-orders/:orderId/approve`: body có `accountId`, `receivedAmount`, `bankReference?`, `reviewNote?`.
- `POST /admin/payment-orders/:orderId/reject`: body có `accountId`, `reason`.

Webhook SePay được gỡ khỏi router kích hoạt để không tồn tại nguồn thứ hai có thể đổi entitlement.

## User Experience

### Pricing

- Hiển thị giá/backend Plan thống nhất: BASIC `199.000đ`, VIP `399.000đ`.
- FREE điều hướng tạo thiệp; BASIC/VIP điều hướng `/dashboard/billing?plan=<CODE>`.
- Sau login, giữ lại gói người dùng vừa chọn.

### Billing

- Hiển thị Plan hiện tại, hạn dùng và quyền OWNER/MEMBER.
- Các state: loading, chưa có đơn, chờ chuyển, chờ duyệt, thành công, từ chối, hết hạn, lỗi có retry.
- QR hiển thị số tiền và `orderCode`; có nút copy.
- Sau `submit-transfer`, polling authenticated order status; reload vẫn khôi phục đơn từ billing summary.
- Khi PAID, refresh auth/account summary, hiển thị success và cho quay về dashboard.

### Admin payments

- Filter theo trạng thái, phân trang, empty/loading/error states.
- Detail hiển thị account, buyer, Plan, amount, orderCode, submitted/expired timestamps.
- Dialog duyệt yêu cầu số tiền thực nhận; dialog từ chối bắt buộc lý do.
- Disable action khi pending; conflict từ concurrent review hiển thị trạng thái mới nhất thay vì success giả.

## Error Handling

- Plan inactive/not found: không tạo Order; pricing/billing refresh danh sách.
- MEMBER purchase: 403, giải thích cần OWNER.
- Active duplicate Order: trả/reuse Order cũ.
- Expired Order: 409 với trạng thái EXPIRED và CTA tạo đơn mới.
- Underpayment: approve bị từ chối, Order giữ AWAITING_REVIEW.
- Concurrent approve/reject: chỉ transition đầu tiên thành công; request sau nhận 409.
- DB transaction failure: không được có trạng thái PAID nếu entitlement hoặc transaction log chưa ghi thành công.
- Network/polling failure: giữ QR/state hiện tại và cho retry; không tự suy đoán đã thanh toán.

## Security and Audit

- Không tin giá, Plan ID, account/user identity hoặc trạng thái do client gửi.
- Zod validate mọi request body/query/params.
- Giữ CSRF guard, rate limit và HttpOnly auth cookie hiện có.
- Log có correlation ID/orderId/accountId nhưng không log polling token, cookie hoặc secret ngân hàng.
- Admin decision lưu reviewer, timestamp, amount/reference và reason/note.
- QR account configuration đọc từ validated environment; production không fallback sang tài khoản ngân hàng hard-code.

## Testing

### Database and service

- Backfill chọn đúng VIP, BASIC hạn xa nhất hoặc FREE.
- Effective entitlement trả FREE khi BASIC hết hạn mà chưa cleanup.
- Card/Guest/Export áp dụng account Plan cho mọi Card.
- BASIC renewal cộng đúng 180 ngày; BASIC -> VIP thành vĩnh viễn.
- VIP không mua lại/hạ BASIC.

### Orders and authorization

- OWNER tạo/submit/read Order; MEMBER và tenant khác bị từ chối.
- Giá Order lấy từ DB: BASIC 199.000đ, VIP 399.000đ.
- Idempotency replay và active-order reuse không tạo trùng.
- Order hết hạn chính xác sau 48 giờ.
- Reject không đổi entitlement; approve ghi đủ Order, PaymentTransaction và Account.
- Hai approve đồng thời chỉ một thành công.
- Underpayment không được duyệt.
- Admin route từ chối USER thường.

### Frontend

- Pricing dùng API Plan và giữ đúng selected Plan qua login/navigation.
- Billing render đủ state, khôi phục Order sau reload và không báo success khi API fail.
- MEMBER không thấy CTA mua.
- Admin review disable double-submit, bắt buộc reason/receivedAmount và xử lý 409.

## Acceptance Criteria

1. OWNER có thể chọn BASIC/VIP, chuyển khoản và gửi đơn chờ duyệt mà không cần chọn Card.
2. ADMIN duyệt thành công làm toàn account nhận quyền lợi mới trong một transaction.
3. Mọi Card hiện tại và tương lai dùng chung effective Account Plan.
4. Giá VIP hiển thị và tính tiền thống nhất là 399.000đ; client không quyết định số tiền.
5. BASIC gia hạn và VIP lifetime tuân thủ đúng quy tắc đã duyệt.
6. BASIC hết hạn hạ mềm về FREE, không xóa dữ liệu.
7. Không thể duyệt hai lần, duyệt đơn quá hạn, duyệt thiếu tiền hoặc duyệt chéo tenant.
8. MEMBER không thể mua; USER thường không thể vào API/page admin.
9. Reload billing vẫn thấy Order đang chờ; trạng thái lỗi không tạo success giả.
10. Backend/frontend tests, typecheck, builds và migration verification đều đạt.

## Rollout

1. Deploy migration additive và backfill; xác minh số Account theo FREE/BASIC/VIP trước/sau.
2. Deploy backend hỗ trợ account entitlement và API mới, vẫn giữ read compatibility với `Card.planId`.
3. Deploy pricing/billing mới và admin review page.
4. Tắt route webhook SePay sau khi xác nhận không còn production integration phụ thuộc nó.
5. Theo dõi Order transition conflicts, underpayment attempts và entitlement lookup errors.

## Approved Decisions

- Entitlement áp dụng cho toàn Account và mọi Card hiện tại/tương lai.
- BASIC mua lại cộng 180 ngày; BASIC lên VIP ngay; VIP không mua/hạ gói.
- BASIC hết hạn hạ mềm về FREE và giữ dữ liệu.
- Thanh toán duyệt thủ công; không upload minh chứng.
- Order hết hạn sau 48 giờ.
- VIP chính thức 399.000đ; backend/database là nguồn giá chuẩn.
- Chỉ OWNER mua; chỉ ADMIN duyệt.
- Phase đầu không webhook, notification, coupon, invoice, refund, proration hoặc provider abstraction.
