# Kế Hoạch Triển Khai: Chuyển Đổi 9 Mẫu Thiệp Sang Backend & Thêm Luồng Mẫu Trắng

**Ngày lập:** 2026-09-25  
**Trạng thái:** Sẵn sàng triển khai  
**Mục tiêu:** 
1. Khắc phục triệt để lỗi "ra trang trắng" khi ấn vào các mẫu thiệp.
2. Thiết kế màn hình tạo mới với 2 lựa chọn rõ ràng: **Tạo Mẫu Trắng (Blank Canvas)** và **Chỉnh Sửa Từ 9 Mẫu Có Sẵn (Backend Presets)**.
3. Hoàn thiện toàn bộ 9 mẫu thiệp cưới được định nghĩa và cấu hình trực tiếp từ Backend (`be/src/services/wedding-scene.service.ts`), xoá bỏ phụ thuộc vào thiệp JSX cứng.
4. Đảm bảo Editor, Preview và Public Route (`/thiep/:slug`) đồng bộ 100% dữ liệu từ một `WeddingSceneDocument` duy nhất.

---

## 1. Phân Tích Nguyên Nhân Lỗi Trang Trắng (Root Causes)

1. **Endpoint Backend yêu cầu AuthGuard không cần thiết:**
   - Route `GET /api/templates/:slug/wedding-scene` trong `be/src/routes/api.router.ts` đang bọc qua `authGuard`. Khách vãng lai, token hết hạn hoặc request chưa đăng nhập đều bị trả về lỗi `401 Unauthorized`.
2. **Thiếu cơ chế Fallback an toàn trên Frontend:**
   - Khi API gọi không thành công hoặc trả về null, `getWeddingScene(card)` trong `fe/src/lib/editor/wedding-scene.ts` trả về `null`.
   - `WeddingView.tsx` nhận `scene == null` chỉ render duy nhất một thông báo rỗng: `"Thiệp này chưa có cấu hình thiết kế từ máy chủ."`, biến màn hình thành trang trắng hoàn toàn.
3. **Dữ liệu Demo tĩnh chưa có `canvasDocument`:**
   - `DEMO_TEMPLATES_MAP` trong `fe/src/app/(public)/thiep/[slug]/demo-templates-data.ts` thiếu trường `canvasDocument`, khiến trang xem thử trực tiếp `/thiep/[slug]` cũng rơi vào trạng thái trang trắng.

---

## 2. Thiết Kế Luồng Người Dùng Mới (User Experience)

### Tại `/dashboard/cards/new`:
Màn hình khởi đầu với Modal / Banner lựa chọn trực quan:
- **Lựa chọn 1: Tạo Mẫu Trắng (Blank Canvas)**
  - Tỷ lệ chuẩn di động `390px`.
  - Khởi tạo với scene tối giản (background tinh tế, sạch sẽ, không có sẵn nội dung mẫu).
  - Dành cho người dùng muốn tự do sáng tạo từ đầu bằng thanh công cụ (Text, Ảnh, Video, Hộp mừng cưới, Đếm ngược, Album, Bản đồ).
- **Lựa chọn 2: Chỉnh Sửa Từ Mẫu Có Sẵn (9 Mẫu Tuyệt Tác Backend)**
  - Danh sách 9 thẻ mẫu với ảnh bìa thực tế, phong cách (Á Đông, Tạp chí Hàn Quốc, Sweet Pink, Marsala, Rustic, Sen Báo Hỷ, Điện ảnh, Hồ Thụy Sĩ, Long Phụng).
  - Nhấp chọn mẫu nào -> Hệ thống tải ngay `canvasDocument` hoàn chỉnh của mẫu đó từ Backend (kèm fallback FE tức thì nếu offline).
  - Tự động điền dữ liệu mẫu (Tên CD-CR, ngày cưới, địa điểm, nhạc nền, bảng màu) vào Visual Editor để người dùng sửa đổi trực tiếp.

---

## 3. Cấu Trúc Chi Tiết 9 Mẫu Trên Backend (`be/src/services/wedding-scene.service.ts`)

Mỗi mẫu sẽ được định nghĩa cấu trúc riêng biệt gồm: `tokens` (màu sắc, font chữ, độ bo góc, mật độ), `sections` (thứ tự và trạng thái hiển thị) và `elements` (tọa độ, kiểu dáng, hiệu ứng):

1. **`wedding-heritage-crimson-gold` (Á Đông Cung Đình Hoàng Gia):**
   - Palette: Đỏ nhung `#8B1E2D`, Vàng kim `#C5A059`, Kem `#FAF4EA`.
   - Font: Playfair Display. Motif: ❖ (Phù hiệu cung đình / Song Hỷ).
   - Sections: Hero bảng gấm cung đình -> Cặp đôi khung sơn mài hoàng gia -> Lịch âm dương Song Hỷ -> Hộp mừng cưới VietQR -> Lời chúc phúc.
2. **`wedding-modern-editorial-magazine` (Tạp Chí Hàn Quốc Editorial):**
   - Palette: Nâu ấm `#4A3728`, Be `#D8C7B5`, Kem giấy báo `#F7F4EF`.
   - Font: Inter / Cormorant. Motif: — (Vogue Editorial lines).
   - Sections: Hero bìa tạp chí tiêu đề lớn -> Bố cục Zigzag Song thân -> Lưới ảnh Triptych 3 tấm -> Tờ lịch tháng tối giản -> RSVP rút thẻ.
3. **`wedding-sweet-editorial-romance` (Sweet Pink Lãng Mạn):**
   - Palette: Hồng đất nung `#B84A39` / `#D48B96`, Hồng phấn `#E8B4B8`, Trắng kem `#FFF5F5`.
   - Font: Great Vibes + Quicksand. Motif: ♡.
   - Sections: Mở thiệp phong bì 3D -> Đếm ngược 4 ô vòm -> Thông điệp kính mời -> Lịch tháng trái tim -> Cặp thẻ VietQR đôi -> Hộp vòm RSVP.
4. **`wedding-crimson-wine-marsala` (Quý Tộc Đỏ Rượu Marsala):**
   - Palette: Đỏ rượu vang `#6B1724`, Vàng Champagne `#C69C6D`, Trắng kem `#FAF6F0`.
   - Font: Playfair Display. Motif: ✦ (Cổng vòm Roman Arch).
   - Sections: Cổng vòm La Mã chữ uốn lượn -> Đếm ngược kép 2 nhà -> Lịch tháng thấu kính tròn -> Dress code tiệc cưới -> Hộp quà mừng.
5. **`wedding-forest-green-botanical` (Rustic Xanh Rêu Thiên Nhiên):**
   - Palette: Xanh rêu `#3D4A34`, Vàng đồng mộc `#B88E4C`, Xanh xám nhạt `#F4F7F4`.
   - Font: Outfit. Motif: ✿ (Nhánh lá thảo mộc).
   - Sections: Khung thảo mộc tự nhiên -> Ảnh cưới Polaroid "My Love" -> Bài thơ tình đối xứng -> Bản đồ Google Maps -> Sổ lưu bút sân vườn.
6. **`wedding-pure-lotus-heritage` (Hoa Sen Thanh Khiết Báo Hỷ):**
   - Palette: Hồng sen `#A8424E`, Xanh lá sen `#3B5E43`, Trắng sứ `#FAF7F2`.
   - Font: Playfair Display. Motif: ❀ (Song Hỷ tròn son & hoa sen).
   - Sections: Đầm sen thủy mặc báo hỷ -> Thiệp mời song thân 2 họ -> Biểu tượng Song Hỷ son -> Lịch lễ thành hôn trang nghiêm -> Lời cảm tạ.
7. **`wedding-cinematic-editorial` (Điện Ảnh Lookbook Tình Yêu):**
   - Palette: Đen điện ảnh `#1C1C1C`, Vàng cát sang trọng `#BE944E`, Xám ấm `#F8F5F0`.
   - Font: Cinzel. Motif: ✶ (Starlight & Film frame).
   - Sections: Poster điện ảnh độc bản -> "Our Love Story" phân đoạn hồi ký -> Lịch nụ hôn -> Khung ảnh lookbook thời trang -> RSVP xác nhận.
8. **`wedding-alpine-lake-romance` (Suối Nguồn Hồ Nước Thiên Nhiên):**
   - Palette: Xanh ngọc bích `#2B6B6D`, Vàng cát `#C29B63`, Băng tuyết `#F2F7F7`.
   - Font: Playfair Display + Quicksand. Motif: ≈ (Sóng nước & Washi Tape).
   - Sections: Hồ nước ngọc bích Thụy Sĩ -> Họa tiết Washi Tape hoa khô dán ảnh -> Đếm ngược ngày cưới -> Hộp quà mừng pastel.
9. **`wedding-imperial-dragon-crimson` (Long Phụng Sum Vầy Đỏ Đô):**
   - Palette: Đỏ đô gấm `#6E1719`, Hoàng kim `#D4AF37`, Tơ vàng `#FDF9F0`.
   - Font: Playfair Display. Motif: 龍 (Long Phụng thêu chìm).
   - Sections: Long Phụng dập nổi toàn trang -> Cổng Song Hỷ 3D nhân vật Chibi -> Giá vẽ hoa cưới nghệ thuật -> Thẻ QR vàng cát song đôi -> Lưu bút.

---

## 4. Kế Hoạch Các Bước Thực Hiện

### Bước 1: Sửa Route Backend & Cấu Hình Public Preview
- Mở route `GET /api/templates/:slug/wedding-scene` thành public (không bắt buộc token xác thực).
- Cập nhật `CardController.getWeddingScenePreview` phục vụ được cả người dùng chưa đăng nhập.

### Bước 2: Nâng Cấp Bộ 9 Preset Chuẩn Trên Backend (`be/src/services/wedding-scene.service.ts`)
- Mở rộng hàm `buildElements` để sinh ra đầy đủ các block mỹ thuật phong phú theo từng phong cách mẫu.
- Thêm mẫu trắng (`wedding-blank`) với cấu hình canvas rỗng sạch sẽ, nền trắng/kem, kích thước 390x1200px.

### Bước 3: Hoàn Thiện Cơ Chế Fallback Độc Lập Trên Frontend
- Nâng cấp `fe/src/lib/editor/wedding-scene.ts`: Hàm `getWeddingScene(card, fallbackSlug)` luôn sinh ra scene hợp lệ ngay trên trình duyệt nếu backend offline hoặc API gặp sự cố.
- Cập nhật `fe/src/app/(public)/thiep/[slug]/demo-templates-data.ts` tự động gán `canvasDocument` cho toàn bộ 9 mẫu demo.
- Sửa `fe/src/components/wedding/WeddingView.tsx` để luôn đảm bảo render scene mượt mà, không bao giờ rơi vào trang trắng.

### Bước 4: Xây Dựng UI Lựa Chọn Tại `/dashboard/cards/new`
- Tạo modal/màn hình chào đón: Chọn giữa **"Tạo Mẫu Trắng"** và **"Chọn Từ 9 Mẫu Có Sẵn"**.
- Bổ sung tab/nút bấm trên Top Bar của Visual Studio cho phép chuyển đổi mẫu hoặc xóa làm lại mẫu trắng tức thì.

### Bước 5: Kiểm Thử Toàn Diện (Testing & Verification)
- Test click trực tiếp vào từng mẫu trong 9 mẫu từ Trang chủ & Trang Collections.
- Test xem thử public `/thiep/[slug]` của cả 9 mẫu.
- Test Visual Editor khi tạo mẫu trắng và khi chỉnh sửa mẫu có sẵn.
- Chạy test kiểm thử tự động của BE và FE đảm bảo không có regressions.
