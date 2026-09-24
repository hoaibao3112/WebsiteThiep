# Kế hoạch chuyển 9 thiệp cưới sang cấu hình backend

Ngày: 2026-09-24  
Trạng thái: Kế hoạch triển khai, dựa trên code hiện tại và yêu cầu đã được người dùng duyệt.  
Mục tiêu: backend quyết định toàn bộ cấu hình scene của 9 mẫu; editor và trang public cùng render/chỉnh sửa một document, theo trải nghiệm trong video tham chiếu `D:\CacVideoQuay\2026-09-24 10-23-20.mp4`.

## Kết quả cần đạt

Với mỗi một trong 9 `templateSlug`, backend trả về một `canvasDocument` đầy đủ, có thứ tự và trạng thái section, nội dung và asset mặc định, vị trí/kích thước phần tử, style, binding vào dữ liệu thiệp và cấu hình widget. FE chỉ có renderer theo các node type được hỗ trợ; không tự chọn palette/layout, không tự khởi tạo thiết kế và không dựng giao diện từ template JSX cũ.

Editor, preview, autosave, tải lại và public dùng cùng một document. Kéo/thả, sửa text/ảnh/widget và chỉnh style thay đổi đúng document đó. Public render cùng scene đã lưu, không vẽ thêm `canvasElements` legacy chồng lên scene.

## Cơ sở đã xác minh

- `be/src/services/wedding-scene.service.ts` hiện có registry cho 9 slug nhưng scene khởi tạo chỉ chứa bốn node text và section chưa có nội dung/layout; đây chưa phải cấu hình thiết kế hoàn chỉnh.
- `be/src/services/card.service.ts` gọi `ensureWeddingScene` ở create/update; wedding data lưu trong JSON `categoryData` và schema Zod dùng `.passthrough()`. Có thể hoàn thiện contract trong JSON mà chưa cần thêm cột Prisma.
- `fe/src/lib/editor/wedding-scene.ts` vẫn tự tạo scene fallback với token/layout ở FE; phải gỡ khỏi đường chạy editor/public sau khi API đảm bảo scene cho card mới và migration xử lý card cũ.
- `fe/src/components/editor/EditorContext.tsx` và `CenterCanvas.tsx` đang chỉnh `categoryData.canvasElements`; backend scene nằm ở `categoryData.canvasDocument.elements`. Đây là hai nguồn dữ liệu cần hợp nhất.
- `fe/src/components/wedding/WeddingView.tsx` gọi `getWeddingScene()` và còn overlay legacy elements; `WeddingSceneRenderer.tsx` dựng các section bằng JSX. Renderer cần trở thành renderer node generic, nhận config từ backend.
- `fe/src/components/wedding/templates/Template01Heritage.tsx` đến `Template09ImperialDragon.tsx` là 9 layout JSX cũ. `template-config.ts` và `docs/plans/2026-09-02-template-variant-architecture-plan.md` là prior art cho 9 slug/nhận diện, nhưng không còn là nguồn điều khiển scene runtime.
- Video tham chiếu cho thấy editor dạng workspace: header, rail/panel trái, canvas dọc cuộn được, inspector phải, selection/toolbar/zoom, dải ảnh và catalog widget. Video không xác nhận mobile hay API backend của website mẫu; không suy diễn các phần đó.

## Quyết định thiết kế

1. **Nguồn chuẩn:** `categoryData.canvasDocument` là document duy nhất của scene wedding. Chuẩn hóa thao tác editor sang `canvasDocument.elements`; không dual-write `canvasElements`. Giữ adapter đọc `canvasElements`/`canvas.elements` cũ trong migration, chỉ bỏ adapter sau khi đã migrate và đo được không còn card cần nó.
2. **Backend sở hữu preset:** đưa 9 template definition vào module backend có type/Zod contract. Backend factory tạo scene mặc định theo slug; validator giới hạn node/section, số lượng, chiều dài, kích thước và giá trị style để tránh JSON độc hại/quá lớn. `CardService` tiếp tục enforce account isolation và entitlement đang có.
3. **Document biểu diễn presentation, không mã thực thi:** scene chứa allowlisted node type (`text`, `image`, `shape`, `sticker`, `widget`, `section`), data binding, geometry, tokens, style và config; không nhận component name tùy ý, HTML tùy ý hay JS. FE giữ các renderer nguyên thủy cho từng node/widget và áp cấu hình từ document.
4. **Giữ nhận diện mẫu:** 9 backend definitions giữ palette/font/motif và composition riêng. Các phần dùng chung (couple, event, gallery, story, map, RSVP, gift) lấy dữ liệu có thật từ CardDetail; thiếu dữ liệu thì section ẩn hoặc hiển thị empty state tối giản, không bịa thông tin demo.
5. **Đổi mẫu:** backend trả scene factory tương ứng slug mới; giữ data cá nhân, ảnh, event, widget tùy chỉnh và global settings theo migration map. User customization được giữ nếu node binding/type còn tương thích; trường hợp không tương thích chuyển vào `preservedElements` hoặc giữ trong document bị ẩn, không xóa âm thầm.
6. **Card cũ:** migrate lười trong owner update/save và có command batch dry-run/apply idempotent cho backfill; public cũ có fallback đọc legacy trong thời gian chuyển đổi. Không đổi schema DB nếu kiểm tra Prisma xác nhận `categoryData` là JSON hiện tại.
7. **Public lifecycle:** trong phạm vi này public đọc bản thiết kế đã lưu hiện tại. Nếu hệ thống hiện không có draft/published snapshot riêng thì không tự mở rộng lifecycle; ghi nhận nguy cơ autosave của thiệp ACTIVE làm public đổi theo. Chỉ thêm snapshot nếu code kiểm tra cho thấy đã có contract nghiệp vụ bắt buộc cần giữ publish immutable.

## Trình tự triển khai

### 1. Chốt contract và factory phía backend

- Định nghĩa `WeddingSceneDocument`, sections, bindings, tokens, media references và allowlisted element/widget config ở backend; thay `JsonRecord`/string tùy ý bằng kiểu Zod có giới hạn.
- Xây 9 definitions trong một registry server-side; mỗi definition mô tả đầy đủ section order/visibility, background, typography, design tokens và node layout mặc định.
- Factory nhận template slug và card data; dựng elements thực sự cho couple, cover, event/date, gallery, story, RSVP/gift/map phù hợp capability. Gắn binding rõ ràng để backend hydrate nội dung khi update.
- `ensureWeddingScene` giữ chỉnh sửa của người dùng, chỉ hydrate binding; khi đổi template phải gọi factory/migrate có chủ đích, không trả nguyên scene của slug cũ.
- Bổ sung test service cho đủ 9 slug, contract, dữ liệu thiếu, update/hydrate, đổi slug và giữ custom elements; kiểm tra validation publish/create/update.

### 2. Thống nhất adapter và editor state

- Thêm adapter FE duy nhất để parse/validate response scene; bỏ `createWeddingSceneFromWeddingData` và mọi default template decision phía FE. Nếu API thiếu scene cho wedding, hiện lỗi/compatibility state có chỉ dẫn lưu/migrate, không tự dựng scene mới.
- `EditorContext` lấy `canvasDocument.elements` làm state, actions thay elements cập nhật document immutable và dirty/history/autosave revision cùng một patch.
- Sửa load, preview draft, create/edit payload để round-trip toàn bộ document mà không rebuild categoryData từ state rời và làm rơi scene.
- `CenterCanvas` dùng geometry document (width/height/background), cùng zoom/pointer math hiện có. Selection handles/toolbars chỉ là overlay editor, không nằm trong public output.
- Inspector bind vào selected node; text/style/position/widget edits sửa scene. Các form business data hiện có tiếp tục cập nhật field nguồn và hydrate node binding theo contract.
- Giữ empty canvas là chủ ý hợp lệ; xóa phần tử cuối không được tự thêm default elements.

### 3. Renderer generic và parity editor/public

- Thay `WeddingSceneRenderer` section switch bằng renderer dựa trên allowlisted node types/section definitions và config từ document. Renderer không quyết định variant slug, palette, section order hay tọa độ mặc định.
- Dùng chung node rendering cho CenterCanvas và public: cùng font/color/background/image crop/shape/widget/animation semantics; editor truyền mode/selection callbacks, public không có thao tác chỉnh sửa.
- Đưa widget RSVP, gift QR, map, calendar/countdown, contact, album, guest name, envelope vào document với config typed; callback/API nghiệp vụ vẫn được cấp từ host page.
- Xóa overlay canvasElements trong `WeddingView`; public wedding luôn render từ `canvasDocument`. Giữ wrapper opening/music/modal khi chúng còn là chức năng global thực tế.
- Thêm contract tests cho các node type, binding, section visibility/order và same-document parity. Tránh snapshot test chỉ lặp lại JSX.

### 4. Chuyển 9 thiết kế và migration dữ liệu

- Chuyển nhận diện của 9 file `Template01...Template09` vào 9 backend definitions. Thứ tự ưu tiên: Heritage làm vertical slice end-to-end; kiểm tra tạo → editor thao tác → lưu/reload → public; sau đó chuyển tám mẫu còn lại qua cùng contract.
- Dùng ảnh/card/event thật của card làm data; xác định rõ asset mặc định có quyền dùng. Không giữ tên, ngày, địa điểm, ảnh demo hard-coded trong output của khách hàng.
- Viết migration idempotent: nếu có canvasDocument hợp lệ giữ customization; nếu chỉ có canvasElements map sang document; nếu card chỉ có categoryData tạo scene từ slug và data; ghi version/report per-card; lỗi thì không ghi đè card.
- Dry-run trên dữ liệu snapshot, báo số card theo template/version/legacy/error; apply theo batch có thể chạy lại. Có backup và rollback qua document version/backup JSON trước khi backfill.
- Sau khi public/editor chỉ đọc scene, đánh dấu legacy adapter deprecated; chỉ xóa khi báo cáo migration xác nhận không còn document cũ cần fallback.

### 5. Nghiệm thu theo video và an toàn lưu

- So sánh desktop với video: topbar, left tool rail/panel, canvas dọc cuộn, inspector phải, selection/handles, inline edit, zoom, asset strip và widget catalog; giữ brand hiện tại.
- Kiểm tra từng slug 9 mẫu bằng fixture thật ở editor/public: layout distinction, ảnh/text/event binding, hidden sections, widget open/save, đổi template, refresh sau save.
- Kiểm tra quyền owner/accountId ở mọi API mutation; không expose draft/card riêng tư qua public route; payload invalid/oversized bị từ chối.
- Kiểm tra lỗi mạng/autosave, save revision race, hai tab cùng card, không báo saved giả, không mất edit khi hydration hoàn thành muộn.
- Kiểm tra kích thước 390px/desktop, zoom 50/100/200%, reduced motion, keyboard/focus và selection overlay không xuất hiện public.

## Nhóm file dự kiến

- Backend contract/factory: `be/src/services/wedding-scene.service.ts`, module template definition mới cạnh service, `be/src/lib/validators/card/wedding.schema.ts`, validator scene mới, `be/src/services/card.service.ts`.
- Migration: command/script mới trong `be/src/scripts` hoặc vị trí scripts conventions đang dùng; report/version lưu trong JSON document, không thêm schema DB nếu không cần.
- Editor state/adapter: `fe/src/types/wedding-scene.types.ts`, `fe/src/lib/editor/wedding-scene.ts`, `fe/src/components/editor/EditorContext.tsx`, `CenterCanvas.tsx`, inspector và form integration.
- Shared render: `fe/src/components/wedding/WeddingSceneRenderer.tsx`, `WeddingView.tsx`, `fe/src/components/card/CanvasElementContent.tsx`, `CanvasWidget.tsx`, public route.
- 9 template files và `template-config.ts`: chỉ gỡ khỏi runtime sau khi definition tương đương đã được kiểm chứng; component legacy không xóa trước migration.

## Ngoài phạm vi

- Thiệp birthday/newborn và các renderer không thuộc wedding.
- Realtime collaboration, AI generation, PDF/video export.
- Thay đổi API website tham chiếu hoặc suy luận backend của họ.
- Redesign toàn bộ shell editor ngoài phần cần để thao tác scene theo video.
- Thay đổi persistence publish lifecycle nếu repository không có yêu cầu snapshot bất biến.

## Rủi ro và giảm thiểu

- **Scene JSON bị xem như component config tổng quát:** chỉ nhận schema node allowlist; giới hạn kích thước/field; tuyệt đối không render HTML/JS tùy ý.
- **Mất tùy chỉnh khi chuyển từ legacy hoặc đổi template:** migration idempotent, không xóa field lạ, backup trước batch, thử trên snapshot, giữ adapter đọc cũ đến khi xác nhận.
- **Backend và FE definitions lệch nhau:** backend chỉ sở hữu document values; FE sở hữu semantics ổn định của node types. Contract tests dùng fixture backend trả về trực tiếp cho editor và public.
- **Đổi template làm scene không khớp slug:** update service phải so sánh `canvasDocument.templateSlug` với requested slug và dùng migration map đã định nghĩa.
- **Ảnh/font mặc định không khả dụng:** dùng asset nội bộ đã có và font hiện được project tải; thiếu thì validate/fallback renderer rõ ràng, không đưa URL giả.
- **Thay đổi công khai ngoài ý muốn do autosave:** xác minh publish semantics trước rollout; nếu card ACTIVE đổi ngay sau autosave, ghi behavior này thành decision hoặc lập snapshot riêng trước khi phát hành.

## Điều kiện dừng

- Dừng thay đổi nếu API owner không trả `categoryData.canvasDocument` sau persist/reload; tìm nguyên nhân ở validator/serializer trước khi thêm nguồn lưu mới.
- Dừng migration nếu chưa chạy được dry-run và backup được xác nhận đọc lại.
- Dừng gỡ renderer cũ nếu card legacy chưa có đường render/migrate qua scene.
- Dừng rollout nếu editor và public không render cùng fixture/document hoặc mutation không enforce account ownership.

## Kiểm chứng khi triển khai

Chạy từ PowerShell tại repository root; mỗi lệnh phải exit 0:

```powershell
npm.cmd --prefix be test
npm.cmd --prefix be run build
npm.cmd --prefix fe test
npm.cmd --prefix fe run build
git diff --check
```

Kịch bản tích hợp bắt buộc: mỗi 9 slug tạo document backend; editor GET → drag/edit text/widget → autosave PUT → GET lại bằng owner scope → public slug render cùng document; legacy canvasElements migrate mà giữ được nội dung/ảnh/vị trí; payload sai/oversized bị từ chối; account khác không đọc/sửa được; template change giữ data và custom node tương thích; lỗi save không xóa bản đang lưu.

## Challenge phạm vi

Giữ backend template definitions, một document chuẩn, renderer allowlist và migration vì đây là các yêu cầu trực tiếp để backend sở hữu thiết kế và không mất card cũ. Cắt khỏi phiên này: thêm DB columns, framework schema tổng quát nhiều category, realtime, export, AI, đổi publish lifecycle nếu chưa có yêu cầu xác minh. Chứng minh vertical slice Heritage trước khi chuyển tám mẫu còn lại.

## Review Notes

Điểm tự đánh giá: Completeness 5/5, Feasibility 4/5, Scope 5/5, Testability 5/5, Risk 5/5, Assumptions 4/5. Feasibility/Assumptions còn cần xác minh response serializer và publish semantics trên môi trường đang chạy; code hiện cho thấy Zod passthrough và JSON persistence nhưng chưa kiểm tra production data/API round-trip. Không xem test suite hiện có là bằng chứng cho các luồng scene mới.
