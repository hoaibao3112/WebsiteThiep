# Kế hoạch tiếp tục Canvas Editor

Ngày: 2026-09-24. Trạng thái: bản đề xuất dựa trên khảo sát mã; chưa chốt phạm vi/kiến trúc, chưa triển khai.

Cập nhật theo người dùng: lấy chính trang canvas tham chiếu làm chuẩn về giao diện và thao tác. Đã đọc video `D:\CacVideoQuay\2026-09-24 10-23-20.mp4` bằng các khung hình cách 4 giây và kiểm tra ảnh chi tiết. Website trực tiếp vẫn chuyển tới login; video là nguồn tham chiếu UI hiện tại. Không suy diễn backend của website từ video.

## Mục tiêu và giới hạn khảo sát

Hoàn thiện frontend/backend chỉnh sửa thiệp theo giao diện và thao tác trong video trang https://ngaychungdoi.com/card/create/canvas. Video xác nhận bố cục desktop, các panel và một số thao tác; chưa xác nhận hành vi mobile, kết quả lưu lên server hoặc mọi tùy chọn chưa mở.

Mục tiêu cuối: editor thiệp cưới giống trải nghiệm đã quay, gồm cả widget và các nhóm thuộc tính/hiệu ứng thấy trong video. Các giai đoạn bên dưới là thứ tự triển khai, không phải cắt giảm mục tiêu. AI, cộng tác realtime, export PDF/video không được thể hiện trong video nên không đưa vào phạm vi.

## Đặc tả quan sát từ video

Thời gian dưới đây là khoảng gần đúng theo mẫu khung hình, không phải log sự kiện chính xác.

| Phần | Quan sát | Hệ quả triển khai |
|---|---|---|
| Shell xuyên suốt | Header logo/back, undo/redo, trạng thái lưu, nút Lưu thiệp; rail icon + panel trái; canvas nền xám; inspector phải | Scroll riêng từng vùng; workspace chiếm chiều cao còn lại; giữ thương hiệu của dự án |
| Công cụ trái | Văn bản, Hình ảnh, Stock, Nền, Nhạc, Hình dạng, Tiện ích, Preset, Mẫu, Hiệu ứng | Repo đã có 10 mục trong LeftSidebar, cần hoàn thiện hành vi thay vì dựng shell mới |
| Kho Stock đầu/cuối video | Nhóm nhân vật, hoa cưới, chữ hỷ, trái tim; item được thêm vào canvas | Catalog có metadata, preview, nguồn asset hợp lệ; chọn/thêm/sửa/lưu cùng contract |
| Canvas | Thiệp dọc dài, cuộn; khung chọn xanh, handles và toolbar nổi với nhân bản/xóa/menu; điều khiển zoom | Tọa độ ổn định khi scroll/zoom; selection overlay không xuất hiện ở public |
| Dải dưới | Thumbnail ảnh và nhãn Thay ảnh nhanh; điều khiển số px hiển thị 1200 | Xác minh ý nghĩa điều khiển px trước khi gán width/height; quy định rõ thay ảnh nào và undo được |
| Khoảng 18–38s | Tiện ích có Lịch, Đếm ngược, Bản đồ, Liên hệ, Xác nhận tham dự, Album ảnh, Tên khách mời, QR Box, Hiệu ứng phong bì thư; thấy countdown/RSVP/phong bì xuất hiện | Widget phải là element có cấu hình typed, có vị trí và renderer, không chỉ toggle toàn trang |
| RSVP khoảng 30–38s | Inspector chỉnh hiển thị tiêu đề/mô tả, tiêu đề, nội dung, tên nút, trường số người/liên hệ/nhà trai–nhà gái/ghi chú/xe đưa đón | Tách cấu hình form khỏi câu trả lời khách; đối chiếu schema/API RSVP hiện có trước khi thêm trường |
| Khoảng 40–54s | Chọn mẫu từ grid, nội dung thiệp/ảnh thay đổi; chọn ảnh có Cắt ảnh/Đổi ảnh | Đổi mẫu là một thao tác history; có quy tắc giữ dữ liệu cá nhân và phục hồi khi hủy/lỗi |
| Khoảng 54–62s | Thêm và sửa Văn bản mới; inspector có kiểu chữ, căn chỉnh, cỡ, font, màu chữ/nền, trong suốt | Sửa inline liên kết cùng document với inspector; serialize đủ style |
| Inspector ảnh/text | Khoảng đệm, đường viền, đổ bóng, liên kết, hiệu ứng chuyển động, chuyển động liên tục | Có nhóm UI không chứng minh hiệu ứng đã chạy; nghiệm thu renderer public cho từng option triển khai |
| Khi không chọn đối tượng | Bản xem trước chia sẻ, thanh công cụ dưới và tùy chọn lời chúc/QR/RSVP | Global settings lưu cùng document; preview chia sẻ dùng dữ liệu metadata thực |
| Trạng thái header | Có thay đổi chưa lưu và Đã lưu tạm thời | Chưa xác định website lưu local hay server; dự án phải phân biệt lưu local, server và xuất bản |

## Khoảng cách với code và thứ tự bàn giao

1. **Đợt 1 — Lưu được thiết kế thật:** sửa state/payload canvas, trạng thái autosave và empty canvas; text + ảnh → lưu → reload. Giữ nguyên shell đã có.
2. **Đợt 2 — Đúng giao diện và thao tác:** căn shell theo khung video; inspector theo selection; drag/resize/rotate, inline text, crop/replace, layer, undo/redo, dải thay ảnh; dùng chung renderer.
3. **Đợt 3 — Tiện ích như mẫu:** thay WidgetTool hiện chủ yếu là thẻ trạng thái/toggle thành catalog thêm widget. Thêm union widget vào FE (BE đã liệt kê type widget nhưng chưa có cấu hình riêng). Triển khai countdown/RSVP/phong bì trước, sau đó lịch/map/liên hệ/album/tên khách/QR; nối dữ liệu nghiệp vụ thực.
4. **Đợt 4 — Mẫu, media và thuộc tính nâng cao:** đổi mẫu an toàn; catalog assets; background/music; style/link/motion có public parity; metadata chia sẻ và thanh công cụ dưới có persistence.
5. **Đợt 5 — Xuất bản và nghiệm thu:** xử lý concurrent saves/tenant isolation theo phần kỹ thuật bên dưới, nghiệm thu thiết kế đã lưu trên public, desktop đối chiếu video và mobile riêng.

Các gate bảo toàn dữ liệu/quyền ở đợt 1–4 phải được làm ngay khi có API liên quan, không chờ đợt 5. Chưa ước lượng thời gian khi quyết định backend còn mở.

Đối chiếu mã bổ sung: `LeftSidebar.tsx` đã có đủ nhóm công cụ; `RightPanel.tsx` đã có nhiều controls và crop modal, cần kiểm chứng dữ liệu/public thay vì làm lại; `WidgetTool.tsx` chưa có catalog widget như video; FE CanvasElement chưa có type widget trong khi BE có. Vì vậy phần thiếu chính là tính hoàn chỉnh của document, widget và renderer, không chỉ giao diện.

## Hiện trạng đã xác minh từ mã

- `fe/src/components/editor/EditorContext.tsx:25`: có CanvasElement, state, thao tác và history. Dữ liệu canvas nằm trong categoryData; nhiều chỗ dùng any.
- `fe/src/components/editor/EditorContext.tsx:280`: mảng canvas rỗng bị thay bằng mẫu mặc định. Cần phân biệt thiếu dữ liệu với người dùng chủ động xóa hết.
- `fe/src/app/(dashboard)/dashboard/cards/[cardId]/edit/page.tsx:861`: preview dựng lại categoryData từ các state rời; `handleDraftChange` tại dòng 899 không giữ canvasElements; payload tại dòng 1039 cũng không mang canvasElements/fieldPositions/fieldScales. Đây là đứt gãy dữ liệu cần sửa trước.
- `EditorContext.tsx:1023`: lưu coi Promise resolve là thành công. Trang edit trả về bình thường khi API báo thất bại; khi thành công lại chuyển sang trang public. Vì vậy không thể dùng nguyên hàm này cho autosave.
- `fe/src/components/editor/CenterCanvas.tsx:501` và `fe/src/components/card/CanvasCardView.tsx:58`: render element riêng biệt, số preset được xử lý khác nhau. Chưa kiểm tra trực quan trong browser.
- `fe/src/app/(public)/thiep/[slug]/page.tsx:139`: chọn canvas renderer theo mảng không rỗng, chưa có chế độ render tường minh.
- `be/src/lib/validators/card/canvas-element.schema.ts`: schema canvas đã tồn tại nhưng passthrough, URL/style/font còn rộng. Wedding schema dùng z.any cho fieldPositions/fieldScales.
- `be/src/services/card.service.ts:250`: updateDraft có accountId, quyền gói và transaction; chưa có revision chống ghi đè. Mỗi lần lưu thay toàn bộ events/photos bằng deleteMany/createMany.
- `be/prisma/schema.prisma:180`: Card có JSON categoryData và createIdempotencyKey; chưa có draft/published document riêng.
- Backend thực tế là Express (`be/package.json`), frontend là Next.js App Router. AGENTS yêu cầu backend Next.js: đây là quyết định kiến trúc chưa được giải quyết, không mặc định được phép mở rộng Express hoặc tự ý migrate toàn bộ backend.
- Kế hoạch/spec ngày 2026-09-02 loại trừ kéo thả tự do, đã không phản ánh đúng editor hiện có.

## Quyết định cần chốt

1. Đã chốt hướng: bám editor trong video. Những panel hoặc hành vi chưa thao tác trong video được ghi là chưa xác minh; không coi menu hiện diện là bằng chứng chức năng đã đầy đủ.
2. Backend: đề xuất kế hoạch migration có phạm vi cho API editor sang Next.js Route Handlers theo AGENTS, tái sử dụng service/validation và xác minh session, accountId, CSRF, upload trước khi chuyển route. Không đổi toàn bộ auth/payment/worker trong cùng đợt. Nếu muốn tiếp tục Express hiện tại, cần người dùng xác nhận ngoại lệ với chỉ dẫn stack.
3. Đề xuất lưu nháp không thay đổi thiệp công khai cho đến khi bấm xuất bản lại. Đây là thay đổi lifecycle cần xác nhận, nhất là thiệp ACTIVE cũ.

<!-- UNRESOLVED: hướng migration backend và hành vi sửa thiệp ACTIVE chưa được xác nhận; hành vi mobile và một số tùy chọn chưa được thể hiện trong video. -->

## Thứ tự triển khai đề xuất

### 1. Chứng minh một luồng hoàn chỉnh

Sau khi chốt chủ sở hữu API, dùng một thiệp cưới DRAFT và một text element: tải → sửa nội dung/vị trí → lưu → reload → owner preview giữ đúng dữ liệu. Dùng contract Zod typed xuyên suốt; sửa state/serializer ở trang edit, kiểm tra trang new có cùng lỗi trước khi áp dụng. Chưa thay hàng loạt công cụ.

Tách saveDraft trả kết quả rõ ràng khỏi publish/navigation/toast. Autosave không chuyển trang, không confetti; lỗi giữ draft và báo chưa lưu. Thêm test tái hiện mất canvas và báo lưu sai trước khi sửa.

Hoàn thành khi JSON gửi lên, JSON trả lại và editor sau reload khớp; xóa hết element vẫn rỗng; dữ liệu legacy không tự chuyển thành canvas.

### 2. Hợp đồng dữ liệu và lưu an toàn

- Chốt CanvasDocument gồm schemaVersion, chế độ render, kích thước thiết kế, elements, background và cấu hình widget. Chuẩn tọa độ thiết kế độc lập zoom; tái sử dụng kích thước đang có sau khi đo UI.
- Zod discriminated union theo loại; infer TypeScript; id duy nhất; số hữu hạn; giới hạn số element/kích thước payload; font/effect/preset allowlist. Không nhận HTML, script URL, blob URL làm tài sản lưu lâu dài. Kiểm tra tài sản thuộc account khi ghi document.
- Adapter đọc dữ liệu cũ, không rewrite toàn bộ thiệp. Phân biệt legacy, canvas rỗng, phiên bản không hỗ trợ. Không xóa unknown legacy fields trước khi kiểm kê dữ liệu.
- Thêm revision và cập nhật nguyên tử theo accountId + cardId + expectedRevision. Không khớp trả 409, giữ thay đổi local, cho tải bản server hoặc sao chép nội dung; không retry ghi đè mù.
- Một request save đang chạy; gom thay đổi tiếp theo; response cũ không đánh dấu draft mới là saved. Undo/redo cũng tạo thay đổi cần lưu; kéo một lần chỉ tạo một history entry khi kết thúc gesture.
- Canvas-only save không xóa/tạo lại events/photos. Giữ transaction khi cập nhật các quan hệ thực sự thay đổi. Tiếp tục idempotency cho tạo thiệp lần đầu.
- accountId lấy từ session, không nhận quyền/gói từ client. Mọi truy vấn dữ liệu tenant phải có accountId; kiểm tra catalog dùng chung và public slug resolver như các ngoại lệ cần thiết kế rõ, không giả vờ chúng đã đạt chỉ dẫn hiện tại.

### 3. Preview và public dùng cùng renderer

Tách phần vẽ thuần dùng chung khỏi selection/bounding box trong editor. Public không import editor context. Cùng document cho cùng kiểu chữ, ảnh, shape, preset, layer, opacity và rotation.

Dùng renderMode tường minh thay điều kiện elements.length. Lập bảng hỗ trợ tất cả preset hiện có: triển khai cùng renderer hoặc không cho chọn preset chưa được hỗ trợ. Resize viewport giữ đúng tỉ lệ; chiều cao thiệp dài không cắt nội dung; font tải xong không làm sai phép đo. Hỗ trợ reduced motion.

### 4. Hoàn thiện thao tác và media

Kiểm tra drag/resize/rotate ở zoom 50/100/200%, pointer capture, scroll offset, giới hạn canvas và khóa element. Undo/redo, copy/paste, layer phải giữ invariant ID/thứ tự. Không chặn phím khi đang gõ input. Mobile inspector có focus, nút đóng, vùng chạm và trạng thái loading/error.

Đưa widget toggles vào document và round-trip. Nối RSVP/QR/lời chúc với dữ liệu và API hiện có, không chỉ render biểu tượng. Tái sử dụng upload hiện hữu sau khi xác minh MIME, dung lượng, quyền account, quota và URL trả về. Upload lỗi giữ ảnh cũ, cho retry và thu hồi object URL. Nhạc tôn trọng isAutoPlay và gesture.

### 5. Xuất bản và tương thích

Nếu chốt tách nháp/public: migration bổ sung document nháp, snapshot xuất bản và revision; backfill thiệp ACTIVE từ dữ liệu hiện tại theo batch có thể chạy lại. Public chỉ đọc snapshot đã xuất bản; publish validate document và capability, đối chiếu revision và cập nhật snapshot nguyên tử. Không xuất bản khi upload/save đang chờ hoặc lỗi.

Triển khai reader tương thích trước writer mới. Bật editor mới theo cohort/account; thiệp cũ giữ renderer cũ. Trước rollout chạy thử migration trên bản sao dữ liệu; ghi số lượng/version lỗi. Rollback tắt entry editor mới và dùng reader vẫn hiểu document mới, không drop cột hay đưa reader cũ đọc dữ liệu mới không tương thích. Nếu không chốt snapshot, phải ghi rõ autosave tác động thiệp ACTIVE trước triển khai.

## Files dự kiến

- Contract/state: `fe/src/types/card.types.ts`, `fe/src/components/editor/EditorContext.tsx`, `fe/src/lib/editor/patch-draft.ts`, `fe/src/lib/editor/template-registry.ts`; tạo contract dùng chung ở vị trí chốt sau quyết định backend.
- Tích hợp: hai trang `dashboard/cards/new` và `dashboard/cards/[cardId]/edit`; `VisualCardEditor.tsx`.
- Render: `CenterCanvas.tsx`, `CanvasBoundingBox.tsx`, `CanvasCardView.tsx`, trang public `thiep/[slug]`; thêm component render thuần dùng chung.
- Persistence: `be/src/lib/validators/card/*`, `be/src/services/card.service.ts`, `be/prisma/schema.prisma`, migration; Route Handlers Next.js là vị trí mới cần chốt khi migration.
- Tests: mở rộng `fe/tests/components/edit-card-page.test.tsx`, `fe/tests/unit/lib/editor-core.test.ts`, `be/tests/card/*`; thêm test contract/concurrency/render theo hành vi.
- Cập nhật spec/plan editor cũ để đánh dấu được thay thế sau khi scope được chốt.

## Kiểm chứng khi triển khai

PowerShell từ root, chạy từng lệnh:

```powershell
npm.cmd --prefix fe test
npm.cmd --prefix be test
npm.cmd --prefix fe run build
npm.cmd --prefix be run build
git diff --check
```

Kỳ vọng từng lệnh exit 0; không dùng `fe lint` làm gate hiện tại vì script là next lint trong dự án Next 15, cần xác minh riêng. Chưa chạy test/build trong khảo sát này.

Các ca bắt buộc: create/reload/edit round-trip; empty canvas; legacy card; tenant A không đọc/ghi asset hoặc card B; payload sai bị từ chối; hai tab cùng revision chỉ một lần ghi thành công; save chậm rồi sửa tiếp không báo saved sớm; offline/retry không mất draft; autosave không navigate; drag một gesture undo một bước; API lỗi không false success; preview/public tương đồng; publish khi dirty/error bị chặn; ACTIVE giữ snapshot cũ nếu chọn lifecycle mới.

Browser nghiệm thu ở 390px, 768px, desktop; zoom 50/100/200%; một document nhỏ và fixture 100 elements. Ghi số đo hiệu năng thực tế trước khi đặt ngân sách hoặc thêm thư viện. Kiểm thử tích hợp concurrency với PostgreSQL thật trong môi trường test, không chỉ mock Prisma. Dùng Vitest/RTL hiện có; bổ sung MSW nếu cần kiểm tra network boundary, không đổi toàn bộ test setup.

## Review Notes

Rà soát ngày 2026-09-24 theo skill planning. Đây là draft có bằng chứng mã, chưa đạt mức sẵn sàng triển khai toàn bộ.

| Chiều đánh giá | Điểm | Phần còn thiếu |
|---|---:|---|
| Completeness | 4/5 | Đã đối chiếu video; còn lifecycle và các panel chưa mở |
| Feasibility | 3/5 | Chưa chốt biên migration Express → Next, chưa chạy ứng dụng |
| Scope | 4/5 | Đã chốt hướng giống video; cần đặc tả option chưa thao tác |
| Testability | 4/5 | Có ca và lệnh; chưa có baseline browser/performance |
| Risk | 4/5 | Có rollout/rollback; cần dữ liệu legacy mẫu cho migration |
| Assumptions | 3/5 | Quyết định backend/lifecycle còn mở; không suy diễn API của website mẫu |

STOP: không code migration backend/published snapshot khi chưa chốt các quyết định tương ứng; không suy diễn website tham chiếu; không migrate thiệp cũ nếu chưa hiểu version dữ liệu; không tuyên bố test/build pass khi chưa chạy.
