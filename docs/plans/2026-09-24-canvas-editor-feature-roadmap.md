# Kế hoạch tiếp tục hoàn thiện chức năng Canvas Editor

Ngày: 2026-09-24  
Trạng thái: kế hoạch tiếp nối sau đợt hợp nhất canvas document/backend scene. Chưa bắt đầu triển khai các hạng mục bên dưới.

## Bối cảnh

Editor hiện có shell ba vùng, 10 nhóm công cụ, canvas element model, inspector cơ bản, history/persistence và renderer wedding dùng `categoryData.canvasDocument`. Người dùng đã gửi đặc tả tạo từ video `15-50-16.mp4`; dùng đặc tả đó làm baseline cho phạm vi chức năng. Video chưa được xem trực tiếp nên các ví dụ có chữ “ví dụ/có thể” được coi là gợi ý chứ không phải chi tiết bắt buộc về pixel hoặc dữ liệu. Repo cũng có khảo sát trước từ video canvas `10-23-20.mp4`.

## Kết quả mong muốn

Người dùng thiết kế thiệp trong editor trực quan; các thay đổi có thể undo/redo, lưu và tải lại nguyên vẹn; scene backend là nguồn cấu hình thiết kế; public view render cùng document mà không lộ selection/editor UI. Các nhóm công cụ hiện có phải có hành vi hoạt động, không chỉ là panel hoặc nút.

## Phạm vi đã biết từ video canvas trước và code

- Canvas: chọn node, kéo/thả, resize, layer order, duplicate/delete, lock, inline text edit, zoom/scroll; selection handles chỉ có trong editor.
- Text/style: nội dung, font, cỡ, màu, nền/độ trong suốt, căn lề, khoảng đệm, viền, bóng; serialize đầy đủ vào scene.
- Media: upload/chọn ảnh, crop/replace, xóa, strip ảnh và trạng thái lỗi upload không làm mất ảnh cũ.
- Widget: catalog và typed config cho calendar/countdown, map, contact, RSVP, album, guest-name, gift/QR, envelope; renderer và callbacks thực tế.
- Template/asset: chọn mẫu từ dữ liệu backend; đổi mẫu có history, giữ data cá nhân và custom element tương thích; stock/background/music/effect đều lưu được.
- Lưu/xem: dirty/saving/saved/error đúng thực tế; reload giữ nguyên; public dùng đúng document mới nhất đã lưu; kiểm tra responsive và accessibility.

## Đặc tả người dùng xác nhận

Đặc tả 8 nhóm dưới đây là yêu cầu của kế hoạch; ví dụ về nội dung thiệp có thể thay theo dữ liệu thật. Phần thiết kế riêng của 9 mẫu thiệp tiếp tục do backend sở hữu trong `canvasDocument`; frontend chỉ cung cấp shell editor và renderer cho các node/widget allowlist. Backend cung cấp template/catalog/config/validation, không gửi HTML hoặc JavaScript để frontend thực thi.

| Nhóm | Điều kiện nghiệm thu |
|---|---|
| Header | Có logo/quay lại, undo/redo, autosave status phân biệt dirty/saving/saved/error; “Lưu thiệp” chạy lưu thay đổi rồi publish và chỉ báo thành công khi cả hai bước thành công. |
| Công cụ trái | Có đủ Văn bản, Hình ảnh, Stock, Nền, Nhạc, Hình dạng, Tiện ích, Preset, Màu, Hiệu ứng. Stock có danh mục/lọc; nhạc có search/thể loại/play/upload; hiệu ứng có intro/opening. |
| Canvas dọc | Hiển thị scene dài theo cấu hình backend; hỗ trợ các khối dữ liệu cưới như cover/cặp đôi, countdown/calendar, lời mời, gia đình, gallery và thanh hành động cuối trang khi bật. |
| Chọn/chỉnh node | Chọn text/image/stock/widget; drag, resize 8 handles, rotate; mini toolbar duplicate/delete/more; toàn bộ thay đổi vào document và history. |
| Inspector | Empty selection có preview/settings thanh dưới; inspector theo node có đúng thuộc tính trong prompt. Calendar hỗ trợ ngày, 1/2 ngày, preset/style và typography; countdown có ngày giờ đích. |
| Dải ảnh nhanh | Ảnh đã upload hiển thị dạng strip; khi chọn image node, chọn thumbnail thay đúng node đó; thao tác undo được. |
| Chọn mẫu | Grid thumbnail/tên mẫu lấy template metadata từ backend; đổi mẫu có thể undo, giữ dữ liệu cá nhân và element custom tương thích. |
| Lưu/xuất bản | Autosave chỉ cập nhật nháp; nút chính lưu phần dirty rồi gọi publish API riêng, trả link chia sẻ khi thành công; publish lỗi giữ bản nháp và báo lỗi, không điều hướng/báo thành công giả. |

### Đối chiếu hiện trạng đã kiểm tra trong code

- Đã có: shell 10 tool groups; một số text/image/stock/music/effect inspector; drag/resize/rotate handles; undo/redo; typed widget model cơ bản; backend scene factory cho 9 slug và endpoint publish riêng.
- Còn thiếu/không hoàn chỉnh: một số tool catalog/asset đang định nghĩa cứng ở frontend; calendar widget mới chỉ có cấu hình ngày cơ bản; photo strip hiện chọn field cover thay vì thay image node đang chọn; template picker của edit page dùng danh sách frontend; nút save edit hiện PUT rồi điều hướng, chưa gọi publish endpoint.
- Phải xác minh khi triển khai: exact field semantics cho “hiển thị 2 ngày”, calendar preset, RSVP/guest data, quyền/nguồn stock và lưu nhạc upload. Không lưu Base64/blob URL lâu dài thay cho media URL bền vững.

## Trình tự thực hiện

### 0. Chốt feature inventory từ video mới

- Dùng prompt 8 nhóm tính năng ở trên làm checklist; đối chiếu từng mục với implementation hiện tại và ghi trạng thái đã có/chưa đầy đủ/chưa có.
- Nếu video gốc được đính kèm sau đó, chỉ cập nhật các khác biệt cụ thể so với prompt; không cần trì hoãn những yêu cầu đã rõ.
- Các mục mơ hồ nhưng không chặn luồng đầu tiên được chốt bằng schema hiện có hoặc empty state rõ ràng; không tự tạo endpoint/nghiệp vụ ngoài yêu cầu.

### 1. Khóa contract thao tác canvas và state

- Bắt đầu bằng một vertical slice nhỏ qua biên thật: chọn ảnh hiện có → thay ảnh bằng upload → lưu API → tải lại owner card → public renderer dùng ảnh mới. Dùng slice này để phát hiện thiếu contract/persistence trước khi mở rộng ngang sang mọi công cụ.
- Hoàn thiện một `CanvasElement` contract dùng chung editor/public/backend; giới hạn style, URL, geometry, widget config bằng Zod.
- Đảm bảo selection, drag, resize, duplicate, delete, lock, z-order, inline edit và keyboard shortcuts cập nhật đúng `canvasDocument.elements`.
- Gom thao tác kéo thành một history entry; undo/redo đánh dấu dirty và không ghi đè state mới bằng response cũ.
- Thêm kiểm thử thuần cho geometry/serialization và component tests cho các tương tác trọng yếu.
- Chỉ tiếp tục triển khai hàng loạt khi vertical slice giữ nguyên URL ảnh, crop/position và state sau reload; lỗi upload phải giữ asset cũ.

### 2. Hoàn thiện inspector theo loại node

- Tách inspector theo text/image/shape/sticker/widget; chỉ hiển thị thuộc tính hợp lệ cho selection.
- Nối các thuộc tính UI đang có (padding, border, shadow, opacity, link, animation) vào document và renderer; nếu hiệu ứng chưa có public semantics thì ẩn/disable rõ, không lưu giả.
- Với animation/motion: allowlist preset, tôn trọng reduced-motion, không nhận CSS/JS tùy ý.
- Kiểm tra mọi control có thể thao tác bàn phím, nhãn truy cập và trạng thái disabled khi element locked.

### 3. Xây luồng media hoàn chỉnh

- Nối upload/thư viện ảnh với API đang có và account ownership; chỉ lưu URL bền vững, không lưu `blob:` URL.
- Thêm crop/replace có preview, cancel/rollback; upload lỗi giữ asset đang dùng.
- Nối bottom photo strip với đúng ảnh/node đang chọn; thay nhanh phải cập nhật cùng scene và undo được.
- Xác minh MIME/kích thước/plan ở backend, trạng thái loading/error/retry ở UI.

### 4. Chuyển tiện ích thành widget document thực

- Hoàn thiện typed config/validator/renderer cho từng widget: calendar/countdown, map, contact, RSVP, album, guest name, gift/QR, envelope.
- Mỗi widget thêm được như một node, chọn/sửa/xóa/di chuyển được, config được lưu; public interaction gọi callback/API hiện hữu.
- Ánh xạ field card sang widget qua binding có kiểm tra; tránh lẫn cấu hình form RSVP với câu trả lời RSVP.
- Trước mỗi widget, xác minh endpoint và data thật đang tồn tại; nếu chưa có thì định nghĩa rõ empty state thay vì demo giả.

### 5. Hoàn thiện catalog, template và thiết lập toàn cục

- Stock/preset/template/background/music/effect nạp từ dữ liệu backend/catalog thay vì định nghĩa từng thiết kế ở page frontend.
- Đổi template là một lệnh history có thể hoàn tác; giữ dữ liệu cá nhân, ảnh, event, nhạc và element tùy chỉnh tương thích.
- Lưu thiết lập toàn cục (background, nhạc, hiệu ứng rơi, bottom actions) cùng document hoặc card settings có schema rõ.
- Giữ ngoài scope các hạng mục không xuất hiện trong video như AI, cộng tác realtime và export video/PDF.

### 6. Lưu, public parity và nghiệm thu

- Save/autosave phân biệt dirty/saving/saved/error; lỗi mạng giữ nguyên draft và có retry; không báo thành công giả.
- Tách `PUT /cards/:id` lưu nháp khỏi `PATCH /cards/:id/publish`; nút “Lưu thiệp” phải tuần tự chờ PUT thành công rồi publish. Publish lỗi thì ở lại editor với nháp đã lưu và lỗi rõ; chỉ điều hướng tới link chia sẻ sau khi publish trả thành công.
- Kiểm tra account isolation, ownership, payload bounds và entitlement server-side cho mọi mutation.
- Cùng fixture scene phải render tương đương ở editor preview và public; public không render handles/menu hoặc hai lớp legacy chồng nhau.
- Chạy kịch bản 9 template: mở → sửa text/ảnh/widget/style → undo/redo → lưu → tải lại → kiểm tra public; thêm kích thước mobile/desktop, zoom 50/100/200%, reduced-motion.

## Nhóm file dự kiến

- Canvas/model/contract: `fe/src/types/canvas.types.ts`, `fe/src/types/wedding-scene.types.ts`, `be/src/lib/validators/card/`.
- Tương tác và inspector: `fe/src/components/editor/CenterCanvas.tsx`, `EditorContext.tsx`, `RightPanel.tsx`, `CanvasBoundingBox.tsx`, `WidgetInspector.tsx`.
- Tool/media/catalog: `fe/src/components/editor/tools/`, API/catalog routes và service tương ứng trong `be/src/`.
- Render/public: `fe/src/components/card/CanvasElementContent.tsx`, `CanvasWidget.tsx`, `fe/src/components/wedding/WeddingSceneRenderer.tsx`, `WeddingView.tsx`.
- Tests: `fe/tests/` và `be/tests/card/`; mở rộng fixture scene backend dùng chung.

## Rủi ro và cách giảm thiểu

- **Prompt được AI trích có thể thiếu chi tiết thị giác:** dùng hành vi/chức năng được mô tả làm yêu cầu; ví dụ không rõ thì giữ tùy chọn. Chỉ cần video gốc nếu muốn kiểm tra pixel/động tác chưa xuất hiện trong prompt.
- **Mất thiết kế khi đổi template hoặc upload lỗi:** history/rollback, giữ asset cũ đến khi server xác nhận, tests round-trip.
- **Editor và public lệch nhau:** dùng cùng document và node semantics; test cùng fixture ở cả hai renderer.
- **Autosave race hoặc chỉnh thiệp ACTIVE làm đổi public ngay:** xác minh lifecycle hiện hành trước khi thay đổi; không tự mở rộng thành draft/publish snapshot nếu chưa có quyết định sản phẩm.
- **Cấu hình do client giả mạo:** backend validate toàn bộ scene; accountId lấy từ auth, không từ payload.
- **Blast radius khi rollout:** nghiệm thu đầu trên card DRAFT/test account; không áp batch/backfill lên card người dùng và không đổi cách public thiệp ACTIVE cho tới khi semantics được xác nhận.

## Ngoài phạm vi

Không migrate toàn bộ backend Express, không thay schema persistence card nếu JSON `categoryData` đủ dùng, không thêm dependency canvas/animation, không làm AI/realtime/PDF/video export, không thiết kế lại toàn bộ thương hiệu/shell.

## Xác minh

- `npm.cmd --prefix be test` — tất cả backend tests pass.
- `npm.cmd --prefix be run build` — backend build exit 0.
- `npm.cmd --prefix fe test` — frontend tests pass, bao gồm test được cập nhật cho labels hiện hành.
- `npm.cmd --prefix fe run build` — production build exit 0.
- `git diff --check` — không có whitespace errors.
- Manual browser test theo checklist 9 template/editor/public ở trên; đối chiếu clip mới sau khi được đọc.

## Blindspot checklist trước khi bắt đầu từng phase

- Tính năng có ghi vào document bền vững hay chỉ thay state tạm?
- Undo/redo có khôi phục cả dữ liệu và UI state cần thiết không?
- Public renderer có cùng kết quả và không lộ control editor không?
- Lỗi upload/save/hydration muộn có làm mất dữ liệu hoặc báo saved sai không?
- Config/URL/widget có bị giới hạn an toàn ở backend và đúng account không?
- Có trạng thái empty/loading/error và hỗ trợ keyboard/reduced-motion không?
- Có kiểm tra quyền sở hữu và entitlement khi thêm hoặc thay asset/template không?

## STOP conditions

- Không xem ví dụ trong prompt là yêu cầu dữ liệu cứng; không thêm hành vi nghiệp vụ không được mô tả.
- Dừng nếu một control yêu cầu nghiệp vụ/backend contract chưa có (ví dụ dữ liệu RSVP mới, crop storage, asset catalog); trình bày contract tối thiểu trước khi mở rộng.
- Dừng trước thay đổi lifecycle public nếu chưa xác minh hành vi thiệp ACTIVE và chưa được chủ sản phẩm chốt.
