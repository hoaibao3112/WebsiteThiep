# 🔗 HƯỚNG DẪN TÍCH HỢP SEPAY WEBHOOK — THANH TOÁN TỰ ĐỘNG

> **Mục tiêu:** Khi khách hàng chuyển khoản, hệ thống tự động kích hoạt gói NGAY LẬP TỨC (3-5 giây), không cần admin duyệt thủ công.

---

## ✅ TIẾN ĐỘ HIỆN TẠI

- [x] Đã đăng ký tài khoản SePay (baohoaitran3112@gmail.com)
- [x] Đã chọn gói FREE (0đ/tháng — 50 giao dịch/tháng)
- [x] Đã chọn mục đích: "Chỉ cần chia sẻ biến động số dư"
- [ ] **Bước tiếp theo: Kết nối tài khoản MB Bank vào SePay**
- [ ] Lấy Webhook Secret từ SePay Dashboard
- [ ] Code tích hợp Webhook vào backend

---

## 📋 BƯỚC 1 — KẾT NỐI TÀI KHOẢN MB BANK VÀO SEPAY

1. Đăng nhập **my.sepay.vn**
2. Vào **Cấu hình Công ty → Ngân hàng** (hoặc **Tài khoản ngân hàng**)
3. Bấm **"Thêm tài khoản ngân hàng"**
4. Điền thông tin:
   - Ngân hàng: **MB Bank (MB)**
   - Số tài khoản: `0988888888` *(thay bằng số thật)*
   - Tên chủ tài khoản: `NGUYEN VAN A` *(thay bằng tên thật)*
5. SePay sẽ hướng dẫn kết nối qua **MB Bank API / SMS Banking**
6. Xác nhận kết nối thành công

---

## 📋 BƯỚC 2 — LẤY WEBHOOK SECRET TỪ SEPAY

1. Đăng nhập **my.sepay.vn**
2. Vào **API Access** (menu bên trái)
3. Tìm mục **Webhook** hoặc **API Token**
4. Copy **Webhook Secret** (chuỗi ký tự dài)
5. Mở file `be/.env` và điền vào:
   ```
   SEPAY_WEBHOOK_SECRET=paste_chuoi_secret_vao_day
   ```

---

## 📋 BƯỚC 3 — CẤU HÌNH WEBHOOK URL TRONG SEPAY

1. Vào **API Access → Webhook** trong SePay Dashboard
2. Điền **Webhook URL**:
   - **Production:** `https://your-backend.onrender.com/api/webhooks/sepay`
   - **Local test:** Dùng ngrok để tạo URL public tạm thời
3. Chọn sự kiện: **"Biến động số dư"** / **"Giao dịch vào"**
4. Bấm **Lưu**

---

## 📋 BƯỚC 4 — CODE TÍCH HỢP BACKEND (Nhờ AI làm)

> Nói với AI: **"Bây giờ hãy code tích hợp SePay Webhook vào backend"**

AI sẽ tạo:
- `be/src/controllers/sepay-webhook.controller.ts`
- `be/src/services/sepay-webhook.service.ts`
- Đăng ký route `POST /api/webhooks/sepay` trong `server.ts` (bypass CSRF)
- Logic: Match `content` chuyển khoản với `orderCode` → tự động kích hoạt gói

---

## 📋 BƯỚC 5 — KIỂM TRA HOẠT ĐỘNG

1. Tạo đơn hàng test trên website
2. Chuyển khoản với nội dung là mã đơn hàng (VD: `THIEP1A23456`)
3. Trong vòng **3-5 giây**, gói phải được kích hoạt tự động
4. Kiểm tra log backend: `npm run dev` trong thư mục `be/`

---

## ⚙️ CẤU HÌNH ENV CẦN THIẾT

```env
# be/.env
SEPAY_WEBHOOK_SECRET=your-sepay-webhook-secret-from-dashboard
BANK_CODE=MB
BANK_ACCOUNT=0988888888          # Số tài khoản MB thật của bạn
BANK_ACCOUNT_NAME=NGUYEN VAN A   # Tên chủ TK viết HOA không dấu
```

---

## 🔄 LUỒNG HOẠT ĐỘNG SAU KHI TÍCH HỢP

```
Khách chọn gói VIP/BASIC
    ↓
Hệ thống tạo đơn hàng + mã QR VietQR
    ↓
Khách quét QR → Chuyển khoản với nội dung: "THIEP1A23456"
    ↓
Tiền vào tài khoản MB của bạn (1-3 giây)
    ↓
SePay nhận biến động số dư → Gửi Webhook POST đến server
    ↓
Server kiểm tra HMAC signature → Match orderCode → Kích hoạt gói
    ↓
Khách thấy gói được kích hoạt (confetti animation 🎉)
```

---

## 📞 THÔNG TIN TÀI KHOẢN SEPAY

- **Website:** https://my.sepay.vn
- **Email đăng ký:** baohoaitran3112@gmail.com
- **Gói:** FREE (50 giao dịch/tháng)
- **Ngân hàng cần kết nối:** MB Bank

---

## ⚠️ LƯU Ý QUAN TRỌNG

- Nội dung chuyển khoản PHẢI khớp với mã đơn hàng (VD: `THIEP1A23456`)
- Hệ thống hiện tại đã có code VietQR tự động điền nội dung CK → khách chỉ cần quét QR
- Sau khi tích hợp, nút "Tôi đã chuyển khoản" sẽ trở thành tùy chọn (không bắt buộc)
