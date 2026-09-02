# Đặc tả Visual Card Editor

## Mục tiêu

Biến builder thành trình chỉnh sửa trực quan: người dùng nhìn thấy thiệp thật, bấm trực tiếp vào vùng muốn sửa và preview cập nhật ngay. Template quyết định bố cục cùng các vùng được phép chỉnh; phiên bản đầu không kéo thả tự do để giữ responsive.

## Phạm vi phiên bản đầu

Hỗ trợ sáu nhóm: nội dung chữ, ảnh, màu sắc, font chữ, hiệu ứng và nhạc nền. Bản đồ, QR, RSVP nâng cao, timeline nâng cao và drag-and-drop giữ UI hiện tại, tích hợp sau.

## Trải nghiệm

Desktop có toolbar trái, preview giữa và inspector phải. Hover vùng chỉnh được sẽ highlight; click đặt `selectedField` và mở inspector. Có Undo/Redo, Reset mẫu, Xem mobile và trạng thái autosave. Mobile dùng preview lớn, toolbar cuộn ngang và bottom sheet inspector; vùng chạm tối thiểu 44px.

Preview dùng cùng renderer với trang công khai, không tạo mockup riêng. Autosave sau 600ms kể từ thay đổi cuối; hiển thị Đang lưu/Đã lưu/Lỗi. Khi còn thay đổi chưa lưu thì không cho publish và cảnh báo trước khi rời trang.

## Template field registry

```ts
type EditableFieldType = "text" | "image" | "color" | "font" | "effect" | "music";
interface EditableFieldDefinition {
  id: string;
  type: EditableFieldType;
  label: string;
  category: "content" | "media" | "style" | "motion" | "audio";
  path: string;
  maxLength?: number;
  allowedValues?: string[];
}
interface CardTemplateDefinition {
  slug: string;
  category: CardCategory;
  fields: EditableFieldDefinition[];
  defaults: Record<string, unknown>;
}
```

Registry dùng allowlist path (`categoryData.groom.fullName`, `primaryColor`, `musicUrl`...), không cho client gửi path tùy ý để ghi JSON. Backend validate field theo template/category; frontend chỉ hiển thị field đã đăng ký.

## Hành vi sáu nhóm

- **Nội dung:** inline editor; Enter/blur lưu, Escape hủy; đếm ký tự; render text escaped, không nhận HTML.
- **Ảnh:** chọn file/thư viện, preview object URL, crop cover cơ bản, đổi/xóa; lỗi upload giữ ảnh cũ và cho retry; revoke object URL khi hủy.
- **Màu:** color picker + HEX; chỉ token màu template hỗ trợ và phải giữ contrast; có Reset.
- **Font:** chỉ font allowlist đã tải sẵn; thay bằng CSS token, không inject URL/font tùy ý.
- **Hiệu ứng:** radio/card preview cho opening/falling; effect VIP chỉ hiện khi capability backend cho phép; reduced motion luôn tắt transform/particle nặng.
- **Nhạc:** chọn thư viện/upload theo plan/tắt; preview chỉ phát khi bấm Play; public chỉ phát sau gesture mở phong bì.

## State và persistence

```ts
interface VisualEditorState {
  draft: CardDraft;
  selectedField: string | null;
  history: { past: CardDraft[]; future: CardDraft[] };
  saveState: "idle" | "dirty" | "saving" | "saved" | "error";
  viewport: "desktop" | "mobile";
}
```

Mỗi thay đổi tạo snapshot bất biến; gộp thao tác gõ trong 300ms. Autosave debounce 600ms, hủy request cũ hoặc dùng revision để response cũ không ghi đè mới. Lần đầu POST kèm idempotency key, sau đó PUT owner endpoint. Lỗi mạng giữ state local và cho retry.

## Quyền và hiệu suất

- Backend lấy `accountId` từ auth, kiểm tra owner/plan/capability; client không tự bật VIP, premium template hoặc path JSON.
- PUT dùng draft schema allowlist và server revalidate trước publish.
- Inspector nặng lazy-load; không render song song nhiều preview; không thêm thư viện animation/drag-drop.
- Highlight chỉ dùng transform/opacity; album ngoài viewport defer; đo First Load JS và thời gian đến nội dung.

## Component boundaries

```text
VisualCardEditor
├── EditorToolbar
├── CardPreviewCanvas
│   └── EditablePreviewField
├── FieldInspector
│   ├── TextFieldInspector / ImageFieldInspector
│   ├── ColorFieldInspector / FontFieldInspector
│   └── EffectFieldInspector / MusicFieldInspector
├── HistoryControls
└── MobileInspectorSheet
```

`CardPreviewCanvas` chỉ phát `onSelectField`; `FieldInspector` nhận definition/value/`onChange`; editor quản lý patch path, history và autosave.

## Files dự kiến

- `fe/src/components/editor/VisualCardEditor.tsx`, `CardPreviewCanvas.tsx`, `FieldInspector.tsx`, `inspectors/*`
- `fe/src/lib/editor/template-registry.ts`, `patch-draft.ts`
- `fe/src/hooks/use-visual-card-editor.ts`
- Hai trang builder `new` và `edit`
- `be/src/lib/validators/card/index.ts`, `be/src/services/card.service.ts`

## Kiểm thử và Acceptance Criteria

- Click field chọn đúng inspector; text/ảnh/màu/font/effect/music cập nhật preview tức thời.
- Escape/Reset/Undo/Redo hoạt động; gõ liên tiếp không tạo hàng trăm snapshot.
- Upload lỗi không mất ảnh cũ; HEX/font/effect ngoài allowlist bị chặn.
- Autosave đúng debounce, request cũ không ghi đè mới; mất mạng giữ draft và retry.
- VIP effect bị backend từ chối với FREE; không có success giả.
- Mobile bottom sheet, keyboard/focus, aria-live và reduced-motion hoạt động.
- Chạy frontend/backend tests và production builds với exit code 0.

## Không làm

- Không kéo thả tự do, không xây lại renderer từng template, không thêm canvas/drag-drop dependency.
- Không thay đổi giới hạn FREE/VIP hoặc tự động gửi Zalo.
