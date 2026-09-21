# 📘 TÀI LIỆU CHUẨN: HƯỚNG DẪN THIẾT LẬP SHOP & NÚT [🛍️ SẢN PHẨM] MESSENGER CHO FANPAGE CHÍNH

> 📌 **Ghi chú quan trọng:** File này được viết cho cả **BẠN (xem lại để tự thao tác)** và cho **AI (để bất kỳ AI nào đọc vào cũng hiểu ngay bạn đang làm gì, mục tiêu là gì, và không chỉ linh tinh làm phiền bạn)**.

---

## 🤖 PHẦN DÀNH CHO AI ĐỌC (CONTEXT & TECHNICAL SPEC)
*(Nếu bạn gửi file này cho AI ở các phiên chat sau, AI hãy đọc kỹ phần này trước khi tư vấn)*

- **Mục tiêu của User:** Tạo trải nghiệm mua sắm trong Facebook Messenger chuẩn 100% giống shop thời trang **MACI**:
  1. Trong khung chat Messenger có nút bấm nổi màu đen: **`[ 🛍️ Sản phẩm ]`** nằm trên thanh gõ phím.
  2. Góc trên bên phải thanh tiêu đề có icon giỏ hàng: **`[ 🛍️ ]`**.
  3. Bấm vào nút bung ra giao diện Native tối màu (Dark sheet) của Facebook liệt kê **"Tất cả sản phẩm"**.
  4. Bấm vào từng sản phẩm hiện trang **"Chi tiết sản phẩm"** có nút: **`Mua ngay`**, **`Thêm vào giỏ hàng`**, **`Đặt câu hỏi`**, **`Quan tâm!`**.
  5. Dòng chữ hệ thống: *"Hệ thống sẽ chuyển hướng bạn đến trang web của bên thứ ba để thanh toán"*.
- **Nguyên lý cốt lõi (Core Mechanism):**
  - Đây là tính năng **Facebook Shop (Cửa hàng trên Facebook & Messenger)** NATIVE của Meta, được quản lý tại **Meta Commerce Manager**.
  - **KHÔNG PHẢI** là tính năng của phần mềm bên thứ 3.
- **Những công cụ ĐÃ LOẠI BỎ (Không được đề xuất lại):**
  - ❌ **Pancake (pos.pages.fm):** Bị lỗi 121, bắt trả phí bản quyền hàng tháng.
  - ❌ **Fchat (fchat.vn):** Gói miễn phí khóa tính năng Persistent Menu (`check_menu_role`), giới hạn tin nhắn 24h.
- **Giải pháp MIỄN PHÍ 100% ĐÃ KIỂM CHỨNG THÀNH CÔNG:**
  - Sử dụng trực tiếp **Meta Business Suite** + **Meta Commerce Manager**.
  - **Mẹo vượt chặn thị trường VN:** Khi onboarding tạo Shop, chọn thị trường chính là **`Hợp chúng quốc Hoa Kỳ 🇺🇸`** (hoặc Đài Loan) để mở khóa nút Tạo Cửa Hàng mà không cần Giấy phép kinh doanh.
  - Hình thức thanh toán: Chọn **"Thanh toán trên trang web khác"** (Checkout on website).
  - Thanh toán thực tế tại VN: Dùng link sinh mã **VietQR tự động** kèm số tài khoản ngân hàng (0đ phí cổng thanh toán).

---

## 👤 PHẦN DÀNH CHO BẠN (CÁC BƯỚC BẤM CHUỘT THỰC HÀNH)

### 🎯 Mục tiêu bạn muốn đạt được:
Giao diện khách hàng nhìn thấy trên điện thoại phải y hệt như shop **MACI**:
1. Khách nhắn tin với Fanpage chính -> Thấy nút nổi **`[ 🛍️ Sản phẩm ]`**.
2. Bấm vào nút -> Xem lưới tất cả sản phẩm thời trang.
3. Bấm vào món đồ -> Xem ảnh lớn, giá tiền, bấm Mua ngay / Đặt câu hỏi.

---

### BƯỚC 1: Thêm Fanpage chính vào Trình quản trị Business
1. Đăng nhập Facebook máy tính bằng nick Quản trị viên (Admin) của Fanpage chính.
2. Bấm vào link này: 👉 **[https://business.facebook.com/settings/pages](https://business.facebook.com/settings/pages)**
3. Ở menu bên trái: Bấm mục **Trang** (Pages).
4. Bấm nút màu xanh **`Thêm`** > Chọn **`Thêm Trang Facebook`**.
5. Nhập tên Fanpage chính của bạn vào và bấm **Thêm Trang**.

---

### BƯỚC 2: Tạo Danh mục (Catalog) & Đăng tối thiểu 4 sản phẩm
> ⚠️ **LƯU Ý BẮT BUỘC:** Facebook chỉ cho phép Cửa hàng hoạt động công khai khi có **ít nhất 4 sản phẩm** đã được duyệt xanh.

1. Bấm vào link này: 👉 **[https://business.facebook.com/commerce](https://business.facebook.com/commerce)**
2. Ở cột trái chọn **Danh mục** (Catalogs) > Bấm **Tạo danh mục mới** (hoặc chọn danh mục có sẵn). Đặt tên: `Catalog_FanpageChinh`.
3. Nhìn sang cột trái bấm vào: **Mặt hàng** (Items) > Bấm nút màu xanh **`Thêm mặt hàng`** > Chọn **`Thêm thủ công`**.
4. Nhập thông tin cho tối thiểu **4 sản phẩm**:
   - **Hình ảnh:** Tải ảnh chụp sản phẩm vuông, đẹp rõ nét.
   - **Tiêu đề:** Tên sản phẩm (Ví dụ: *Đầm Body Dự Tiệc, Chân Váy Xòe, Áo Kiểu Lụa...*).
   - **Mô tả:** Mô tả thông tin sản phẩm, chất vải, số đo size S/M/L.
   - **Liên kết trang web:** Dán link Fanpage chính của bạn (Dạng: `https://www.facebook.com/profile.php?id=<ID_TRANG>` hoặc `https://m.me/<ID_TRANG>`).
   - **Giá cả:** Chọn tiền tệ **VND**, nhập giá bán (Ví dụ: `490000`).
5. Kéo xuống bấm nút **`Tải mặt hàng lên`**. Đảm bảo 4 món đều có tích xanh **🟢 Đủ điều kiện**.

---

### BƯỚC 3: Mở Cửa hàng (Shop) — Mẹo đổi vùng Hoa Kỳ
1. Bấm vào link mở Cửa hàng: 👉 **[https://business.facebook.com/commerce_manager/onboarding/](https://business.facebook.com/commerce_manager/onboarding/)**
2. **MẸO QUYẾT ĐỊNH (Không được quên):**
   - Nhìn lên góc trên bên phải màn hình: Tìm ô **"Chọn thị trường chính của bạn"**.
   - Đổi từ `Việt Nam 🇻🇳` sang **`Hợp chúng quốc Hoa Kỳ 🇺🇸`**.
   *(Đổi sang Hoa Kỳ để Facebook không chặn tính năng Cửa hàng tại Việt Nam và không bắt nộp Giấy phép kinh doanh)*.
3. Bấm nút màu xanh: **`Tạo cửa hàng`** (Bắt đầu).
4. Chọn phương thức: **"Thanh toán trên trang web khác"** (Checkout on another website).
5. Chọn **Fanpage chính** của bạn > Chọn **Catalog sản phẩm** bạn vừa tạo ở Bước 2.
6. Điền email của bạn, tích vào ô xác nhận điều khoản > Bấm **`Hoàn tất thiết lập`**.

---

### BƯỚC 4: Thiết lập Bố cục Cửa hàng (Bước tránh bị lỗi ô trắng)
> ⚠️ **BƯỚC QUAN TRỌNG NHẤT ĐỂ SẢN PHẨM HIỆN LÊN MESSENGER:**

1. Ở menu bên trái, bấm vào mục: **`Cửa hàng`** (Shops).
2. Bấm nút: **`Chỉnh sửa cửa hàng`** (Edit shop).
3. Lúc này bạn sẽ thấy màn hình có hình chiếc điện thoại xem trước bên phải:
   - Nếu thấy có mục `Bộ sưu tập` hoặc `Thẻ quay vòng` bị một ô vuông trắng tinh: Bấm vào dấu `...` của nó chọn **Xóa**.
   - Ở cột giữa, bấm nút màu xanh: **`+ Thêm mới`**.
   - Chọn mục: **`Lưới sản phẩm`** (Product Grid).
   - Chọn nguồn sản phẩm: **Toàn bộ sản phẩm** trong Catalog của bạn.
   *(Ngay lúc này màn hình điện thoại bên phải sẽ hiện đầy đủ các sản phẩm xếp 2 cột y chang như shop MACI)*.
4. Nhìn xuống góc dưới cùng bên phải màn hình, bấm nút màu xanh:  
   👉 **`Đăng bản cập nhật`** (Publish updates).

---

### BƯỚC 5: Kiểm tra trạng thái Kênh bán hàng
1. Bấm vào link: 👉 **[https://business.facebook.com/commerce](https://business.facebook.com/commerce)**
2. Nhìn vào dòng Cửa hàng của bạn: Phải hiện chữ màu xanh: **🟢 ĐANG HOẠT ĐỘNG** (Active).
3. Nếu có thông báo ở mục **"Danh sách việc cần làm"**: Bấm vào đó để duyệt/xác nhận các gợi ý của Facebook.

---

### BƯỚC 6: Thử nghiệm thực tế trên Messenger
> ⚠️ **ĐIỀU KIỆN TEST:** KHÔNG dùng nick Admin đang quản lý Fanpage để tự chat với Fanpage. Facebook sẽ ưu tiên hiển thị công cụ của người bán chứ không hiện nút sản phẩm của người mua.

1. Lấy một điện thoại khác (dùng **nick Facebook phụ hoặc nick của bạn bè/người thân**).
2. Mở ứng dụng **Messenger**.
3. Tìm tên **Fanpage chính** của bạn và bấm vào chat.
4. Gửi 1 tin nhắn bất kỳ (Ví dụ: *"Shop ơi tư vấn mình với"*).
5. Nhìn vào khung chat:
   - Nút nổi **`[ 🛍️ Sản phẩm ]`** sẽ hiện ngay phía trên thanh gõ chữ!
   - Icon giỏ hàng **`[ 🛍️ ]`** hiện ở góc trên bên phải!
6. Bấm vào nút `[ 🛍️ Sản phẩm ]`: Màn hình sẽ bung ra bảng danh sách sản phẩm đen huyền bí, bấm vào từng món có nút "Mua ngay", "Thêm vào giỏ hàng" y hệt 100% shop MACI!

---

## 💡 CÁC CÂU HỎI THƯỜNG GẶP (FAQ & TROUBLESHOOTING)

| Tình huống | Nguyên nhân | Cách xử lý |
| :--- | :--- | :--- |
| **Báo lỗi "Chưa dùng được tại quốc gia của bạn"** | Đang để thị trường Việt Nam | Ở Bước 3, đổi thị trường sang **Hoa Kỳ 🇺🇸** là được ngay. |
| **Bản xem trước bị ô vuông trắng tinh** | Có 1 bộ sưu tập trống chưa gắn ảnh | Xóa bộ sưu tập đó đi, bấm `+ Thêm mới` -> chọn `Lưới sản phẩm`. |
| **Vừa bấm Đăng xong vào Messenger chưa thấy nút** | Máy chủ Meta cần thời gian cập nhật CDN | Chờ khoảng 15 - 30 phút để Facebook đồng bộ sang điện thoại. |
| **Tôi dùng nick của tôi vào chat không thấy nút** | Nick của bạn là Admin/Chủ trang | Facebook ẩn nút đối với Admin. Phải dùng **nick Facebook khác (khách hàng)** để test. |
| **Có cần trả tiền cho Pancake hay Fchat không?** | Hoàn toàn không cần | Tính năng này là của Meta cung cấp **MIỄN PHÍ 100%**. |

---

## 💳 KỊCH BẢN CHỐT ĐƠN TỰ ĐỘNG BẰNG MÃ VIETQR (MIỄN PHÍ)

Khi khách hàng bấm **"Mua ngay"** hoặc nhắn tin muốn lấy sản phẩm, bạn vào **Meta Business Suite > Hộp thư (Inbox) > Tự động hóa** tạo một tin nhắn mẫu:

- Nội dung:  
  *"Cảm ơn bạn đã đặt hàng! Tổng đơn hàng của bạn là [Số tiền]đ. Bạn vui lòng quét mã QR dưới đây để hoàn tất thanh toán nhé:"*
- Kèm link ảnh VietQR (tự động điền số tiền và STK):  
  `https://img.vietqr.io/image/<MÃ_NGÂN_HÀNG>-<SỐ_TÀI_KHOẢN>-compact2.png?amount=<SỐ_TIỀN>&addInfo=<NỘI_DUNG>&accountName=<TÊN_BẠN>`

*(Khách mở app ngân hàng bất kỳ quét mã là tiền về tài khoản của bạn ngay lập tức, không qua trung gian).*
