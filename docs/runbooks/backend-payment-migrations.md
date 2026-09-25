# Runbook: Quy trình Migration Database & Index Thanh toán (Production)

Tài liệu này hướng dẫn chi tiết quy trình thực thi, kiểm thử và xử lý sự cố migration cho cơ sở dữ liệu PostgreSQL trong môi trường Production.

---

## 1. Nguyên tắc cốt lõi
1. **Không dùng `prisma db push` trên Production**: `db push` có thể làm mất dữ liệu, bỏ qua các bước backfill logic và tạo drift schema không thể kiểm soát. Mọi thay đổi schema trên Production **bắt buộc** dùng `prisma migrate deploy`.
2. **Release job chạy duy nhất một lần**: Migration chỉ được thực thi bởi Release Phase trong pipeline deployment (CI/CD hoặc Render release command), không được khởi chạy đồng thời trong cả API container và Worker container.
3. **Fail-Closed & Preflight trước khi migrate**: Luôn chạy `db:preflight` trước khi deploy. Nếu phát hiện đơn hàng trùng lặp hoặc migration hỏng dở dang, quá trình deploy phải dừng ngay lập tức để đối soát thủ công.
4. **Không tự động gộp tiền hoặc sửa trạng thái đơn AWAITING_REVIEW**: Các đơn đang chờ admin duyệt không bao giờ được tự động hủy hoặc xóa bỏ bằng script.

---

## 2. Quy trình chuẩn bị & triển khai (Standard Deployment)

### Bước 1: Kiểm tra Preflight (Read-Only)
Trước khi chạy migration trên production database, thực thi:
```bash
npm run db:preflight
```
Preflight sẽ kiểm tra:
- Danh sách các migration đã apply và migration bị fail (`_prisma_migrations`).
- Cấu hình các gói dịch vụ cơ bản (`FREE`, `BASIC`, `VIP`).
- Thống kê số lượng bản ghi các bảng chính (`users`, `accounts`, `cards`, `orders`, `payment_transactions`).
- Sự tồn tại và tính hợp lệ của partial unique index `orders_active_account_plan_uniq`.
- Quét các đơn hàng `PENDING` quá hạn và đơn hàng active bị trùng lặp (`accountId` + `planId`).

Nếu kết quả trả về `isReadyForMigration: true`, chuyển sang Bước 3.

### Bước 2: Xử lý đơn quá hạn hoặc xung đột (nếu có)
Nếu preflight phát hiện đơn `PENDING` đã quá hạn `expiresAt`:
```bash
npm run db:preflight -- --auto-expire
```
Lệnh này sẽ cập nhật các đơn `PENDING` đã hết hạn sang `EXPIRED`.
*Lưu ý: Nếu có đơn `AWAITING_REVIEW` trùng lặp, script sẽ KHÔNG tự động sửa mà báo lỗi blocking để Admin vào trang quản trị duyệt hoặc từ chối đơn theo đúng thực tế giao dịch ngân hàng.*

### Bước 3: Thực thi Migration
Thực hiện migrate theo cơ chế an toàn:
```bash
npm run db:deploy
```
Lệnh này chạy `prisma migrate deploy` áp dụng tuần tự các migration files đã kiểm duyệt.

### Bước 4: Kiểm tra sau Migration
Chạy lại:
```bash
npm run db:preflight
```
Xác nhận rằng:
- `partialUniqueIndex.exists === true`
- `partialUniqueIndex.validPredicate === true`
- Không còn lỗi blocking nào.

---

## 3. Kế hoạch ứng cứu sự cố (Disaster Recovery & Repair Runbook)

### Kịch bản 1: Migration bị fail dở dang (P3009/P3018)
Nếu một migration bị ngắt giữa chừng do mất kết nối mạng hoặc lỗi cú pháp:
1. `_prisma_migrations` sẽ lưu bản ghi với `finished_at IS NULL`.
2. Kiểm tra log chi tiết để xác định câu lệnh SQL nào đã chạy và câu lệnh nào thất bại.
3. KHÔNG tự ý chỉnh sửa file `.sql` đã commit trong repo vì checksum sẽ thay đổi khiến toàn bộ cluster lỗi.
4. Nếu bảng/cột đã được tạo một phần:
   - Sử dụng script repair có điều kiện `IF NOT EXISTS` hoặc `DROP ... IF EXISTS` trên DB tạm/staging trước khi chạy trên Prod.
   - Khi DDL đã đạt trạng thái mong muốn của migration đó, dùng:
     ```bash
     npx prisma migrate resolve --applied "<migration_name>"
     ```
   - Xác nhận bằng `npm run db:preflight`.

### Kịch bản 2: Duplicate key khi tạo Unique Index (`orders_active_account_plan_uniq`)
Nguyên nhân: Trước khi có unique index, hệ thống cũ có 2 đơn `PENDING` hoặc `AWAITING_REVIEW` cùng `accountId` và `planId`.
Khắc phục:
1. Chạy `npm run db:preflight` để lấy danh sách `orderIds` bị xung đột.
2. Kiểm tra sao kê ngân hàng và bảng `payment_transactions`:
   - Nếu khách chưa thanh toán cho cả 2 đơn: chuyển đơn cũ hơn sang `EXPIRED`.
   - Nếu 1 đơn đã thanh toán: hoàn tất duyệt đơn đó (`PAID`), chuyển đơn còn lại sang `EXPIRED` hoặc `CANCELLED`.
3. Chạy lại `npm run db:deploy`.

---

## 4. Kiểm tra Drift Schema
Để kiểm tra schema trên database thực tế có bị lệch so với `schema.prisma`:
```bash
npx prisma migrate status
```
Tất cả migration phải hiển thị trạng thái `Database is up to date`.
