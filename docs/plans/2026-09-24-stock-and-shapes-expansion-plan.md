# Kế hoạch triển khai: Mở rộng Stock (Khung viền, Phân cách) & Menu Hình dạng cho Canvas Editor

Ngày: 2026-09-24  
Trạng thái: Đã thống nhất yêu cầu (Dựa trên 3 ảnh giao diện mẫu từ ngaychungdoi.com)  
Tài liệu tham chiếu giao diện: 
- `media_1790256866045.png` & `media_1790256868173.png`: Thư viện Stock (Tags, Khung viền, Đường phân cách)
- `media_1790256871466.png`: Popover menu Hình dạng (Đường kẻ, Vuông, Chữ nhật, Tròn, Tam giác)

---

## 1. Bối cảnh & Mục tiêu

- **Hiện trạng:** 
  - `StockTool.tsx` hiện tại chỉ có một số emoji và sticker văn bản đơn giản, thiếu các yếu tố cốt lõi quan trọng nhất của thiệp cưới: **Khung viền (Frames)** và **Đường phân cách (Dividers)** dạng vector/SVG sắc nét.
  - `LeftSidebar.tsx` đang mở toàn bộ công cụ thành Drawer rộng 320px, trong khi mục **Hình dạng** ở giao diện mẫu là một Popover menu nhanh gọn gồm 5 hình cơ bản (Đường kẻ, Vuông, Chữ nhật, Tròn, Tam giác).
  - Canvas cần render các vector SVG này mượt mà, hỗ trợ đổi màu (color/stroke), kéo thả hoặc chạm để thêm, resize và lưu bền vững vào `canvasDocument`.
- **Mục tiêu:** 
  - Tái hiện chính xác giao diện và trải nghiệm thêm Khung viền, Đường phân cách, Họa tiết cưới trong tab Stock.
  - Thêm menu Popover nhanh cho Hình dạng (Đường kẻ, Vuông, Chữ nhật, Tròn, Tam giác).
  - Đảm bảo toàn bộ element thêm vào canvas có đầy đủ thuộc tính, chỉnh được màu/kích thước, lưu đúng vào `canvasDocument` và hiển thị đồng nhất ở cả Editor lẫn Public page.

---

## 2. Key Decisions (Quyết định kỹ thuật cốt lõi)

1. **Kiến trúc Catalog Hybrid:**
   - Xây dựng kho SVG vector sắc nét cao cấp (Khung viền uốn lượn cổ điển, Khung góc hoa văn, Đường phân cách cổ điển/chấm/hoa văn Á Đông) định nghĩa theo schema chuẩn (`StockItem`) tại Frontend (`fe/src/config/stock-catalog.ts`).
   - Đảm bảo ứng dụng tải tức thì, chạy mượt mà không phụ thuộc độ trễ mạng, đồng thời schema tương thích để sau này có thể cắm thêm API Backend `GET /api/v1/cards/stocks`.
2. **Hình dạng (Shapes) dạng Popover Tool:**
   - Trong `LeftSidebar.tsx`, khi click vào icon "Hình dạng", hiển thị một Floating Popover Menu trực tiếp cạnh dock icon (thay vì mở drawer 320px chiếm diện tích), khớp 100% ảnh tham chiếu `media_1790256871466.png`.
   - 5 lựa chọn: `line` (Đường kẻ), `square` (Hình vuông), `rect` (Hình chữ nhật), `circle` (Hình tròn), `triangle` (Tam giác).
   - Click vào lựa chọn sẽ chèn ngay shape vào giữa canvas và tự động đóng menu.
3. **Cấu trúc dữ liệu CanvasElement:**
   - Dùng type `shape` cho các hình khối hình học (`line`, `square`, `rect`, `circle`, `triangle`).
   - Dùng type `stock` cho Khung viền và Đường phân cách vector SVG (hoặc `svgPath` / `svgContent`), lưu `color`, `strokeWidth`, `width`, `height`, `opacity`.
4. **Renderer & Public Parity:**
   - Cả `CenterCanvas.tsx` và `CanvasCardView.tsx` (trang xem thiệp công khai) sử dụng chung logic render SVG/Shape, đảm bảo những gì thấy trong Editor hiển thị y hệt trên trang công khai.

---

## 3. Chi tiết triển khai theo từng phần

### Bước 1: Xây dựng Catalog Khung viền, Đường phân cách & Họa tiết cưới (`fe/src/config/stock-catalog.ts`)
- Định nghĩa interface `StockItem`:
  ```typescript
  export interface StockItem {
    id: string;
    title: string;
    cat: "frames" | "dividers" | "wedding" | "character" | "flower" | "hy" | "heart" | "vietnam";
    svgContent?: string; // Nội dung SVG path/vector
    icon?: string;
    color?: string;
    width: number;
    height: number;
    isWide?: boolean;
    aspectRatio?: number;
  }
  ```
- Xây dựng ít nhất 6 mẫu **Khung viền (Frames)** vector cưới:
  - Khung chữ nhật viền chỉ hoa văn cổ điển (Classic ornate frame)
  - Khung đám mây / viền cong Baroque (Cloud/Scalloped vintage frame - như trong ảnh)
  - Khung thẻ bài hoàng gia (Royal certificate frame)
  - Khung viền góc hoa văn thanh lịch
- Xây dựng ít nhất 6 mẫu **Đường phân cách (Dividers)**:
  - Đường kẻ chỉ với họa tiết quả trám tâm (Diamond center divider)
  - Đường kẻ xoắn hoa văn cổ điển (Vintage flourish divider)
  - Đường phân cách dấu chấm thanh mảnh (Dotted divider)
  - Đường phân cách hoa văn Á đông / Song hỷ
- Giữ và hoàn thiện các danh mục: Yếu tố đám cưới, Nhân vật, Hoa cưới, Chữ hỷ, Trái tim.

### Bước 2: Nâng cấp `StockTool.tsx` theo chuẩn ảnh tham chiếu
- **Thanh Tag lọc danh mục:**
  - Hiển thị dải Pills: `Tất cả`, `Yếu tố đám cưới`, `Nhân vật`, `Hoa cưới`, `Chữ hỷ`, `Trái tim`.
  - Nút `Xem thêm ▾` mở menu thả xuống chứa các danh mục còn lại: `Khung viền`, `Đường phân cách`, `Văn hóa Việt`.
- **Chế độ xem "Tất cả":**
  - Section 1: **Khung viền** + nút "Xem thêm" (grid 3 cột, hiển thị 6 thumbnail khung viền nét đỏ/vàng trang nhã).
  - Section 2: **Đường phân cách** + nút "Xem thêm" (grid 3 cột, hiển thị 6 thumbnail đường phân cách ngang).
  - Section 3: **Yếu tố đám cưới**, **Chữ hỷ**, **Hoa cưới**,...
- **Chế độ xem theo danh mục cụ thể:**
  - Khi click vào "Xem thêm" hoặc bấm chip danh mục, lọc toàn bộ items của danh mục đó ra grid 3 cột, có nút "← Về tất cả".
- **Hỗ trợ Drag & Drop và Touch/Click:**
  - Chạm/click để chèn vào giữa viewport canvas.
  - Kéo thả vào canvas với toạ độ tương đối chuẩn xác (`__DRAGGED_STOCK_ITEM__`).

### Bước 3: Nâng cấp Menu "Hình dạng" (`LeftSidebar.tsx` & `ShapePopover`)
- Bổ sung trạng thái mở Popover cho mục `shape` ở `LeftSidebar.tsx`.
- Popover định vị ngay cạnh nút dock "Hình dạng", có đổ bóng nhẹ, bo góc, nền trắng:
  - `— Đường kẻ` (Line)
  - `□ Hình vuông` (Square - 120x120px)
  - `▭ Hình chữ nhật` (Rectangle - 200x120px)
  - `○ Hình tròn` (Circle - 120x120px)
  - `△ Tam giác` (Triangle - 120x120px)
- Bổ sung xử lý thêm shape mới trong `EditorContext.tsx`:
  - `addShapeElement({ shapeType: 'line' | 'square' | 'rect' | 'circle' | 'triangle' })`.

### Bước 4: Cập nhật Canvas Renderer & Inspector
- **Renderer (`CenterCanvas.tsx` & `CanvasCardView.tsx`):**
  - Render SVG cho element `type: 'stock'` (khung viền, đường phân cách): SVG tự động scale `100%` theo bounding box, giữ màu sắc `fill` / `stroke` được cấu hình.
  - Render `shape`:
    - `line`: thẻ `<line>` hoặc `<div>` có viền/background.
    - `square` / `rect`: `<div>` với border và fill background.
    - `circle`: `<div>` với `rounded-full`.
    - `triangle`: SVG path tam giác hoặc CSS clip-path.
- **Inspector (`RightPanel.tsx` / `ShapeInspector`):**
  - Hỗ trợ đổi màu sắc (màu viền, màu nền), độ dày viền (strokeWidth), độ trong suốt (opacity), thứ tự layer (tiến/lùi).

### Bước 5: Kiểm tra tính toàn vẹn và Lưu dữ liệu (Persistence)
- Kiểm tra round-trip: Thêm khung viền + phân cách + hình dạng → Di chuyển / Resize / Đổi màu → Bấm Lưu thiệp → Reload trang → Kiểm tra dữ liệu được giữ nguyên vẹn.
- Kiểm tra trang xem công khai (`/thiep/[slug]`): Khung viền và đường kẻ phân cách hiển thị sắc nét, đúng tỷ lệ, không bị lỗi layout.

---

## 4. Danh sách file thay đổi

| Nhóm | Đường dẫn file | Mục đích thay đổi |
|---|---|---|
| **Catalog** | `fe/src/config/stock-catalog.ts` | Tạo mới file chứa dữ liệu vector SVG Khung viền, Phân cách, Sticker chuẩn |
| **Tool UI** | `fe/src/components/editor/tools/StockTool.tsx` | Nâng cấp giao diện Stock với Pills tags, Dropdown Xem thêm, Grid Khung viền & Phân cách |
| **Tool UI** | `fe/src/components/editor/LeftSidebar.tsx` | Tích hợp Popover menu cho công cụ Hình dạng theo đúng ảnh |
| **Editor State**| `fe/src/components/editor/EditorContext.tsx` | Hỗ trợ thêm hình dạng mới (tam giác, chữ nhật) và stock vector chuẩn |
| **Canvas** | `fe/src/components/editor/CenterCanvas.tsx` | Cập nhật vẽ SVG vector khung viền, phân cách và hình dạng |
| **Public** | `fe/src/components/card/CanvasCardView.tsx` | Đảm bảo public view hiển thị chính xác các stock và hình dạng mới |
| **Inspector**| `fe/src/components/editor/RightPanel.tsx` | Cập nhật controls đổi màu/viền cho stock vector và shape |

---

## 5. Ngoài phạm vi (Out of Scope)

- Chưa can thiệp vào logic xử lý thanh toán, phân quyền tài khoản (đã ổn định).
- Không tự ý migrate schema backend Express sang Next.js (đã thống nhất giữ nguyên kiến trúc backend hiện tại).
- Chưa làm chức năng AI tự động sinh sticker (không có trong video và ảnh tham chiếu).

---

## 6. Tiêu chí nghiệm thu & Kiểm chứng (Verification)

1. **Giao diện Stock:**
   - Thanh tag hiển thị đúng: Tất cả, Yếu tố đám cưới, Nhân vật, Hoa cưới, Chữ hỷ, Trái tim, Xem thêm ▾.
   - Nhóm "Khung viền" và "Đường phân cách" hiển thị dạng grid 3 cột với các mẫu viền uốn lượn và phân cách cổ điển như ảnh chụp.
   - Bấm "Xem thêm" chuyển sang danh mục chi tiết; bấm "← Về tất cả" quay lại ban đầu.
2. **Giao diện Hình dạng:**
   - Click "Hình dạng" mở ra popover menu 5 mục: Đường kẻ, Hình vuông, Hình chữ nhật, Hình tròn, Tam giác.
   - Click vào từng mục chèn ngay hình vào canvas.
3. **Thao tác Canvas:**
   - Kéo thả hoặc click thêm Khung viền / Đường phân cách vào canvas mượt mà.
   - Khung viền và đường kẻ có thể kéo giãn, thay đổi kích thước và vị trí tự do.
4. **Kiểm tra lệnh build & test:**
   - Chạy `npm.cmd --prefix fe test` -> Pass.
   - Chạy `npm.cmd --prefix fe run build` -> Exit code 0, không có lỗi TypeScript hoặc lint.

---

## 7. STOP Conditions

- Dừng lại và báo cáo nếu cấu trúc `canvasDocument` hiện tại xung đột với việc lưu trữ SVG vector hoặc schema của backend từ chối payload.
- Dừng lại nếu kích thước payload của document vượt quá giới hạn cho phép của API.
