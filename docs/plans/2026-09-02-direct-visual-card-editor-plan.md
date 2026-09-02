# Plan triển khai Visual Card Editor

## Mục tiêu

Thêm chỉnh sửa trực tiếp trên preview cho builder tạo/sửa thiệp, giữ renderer và API hiện tại, không thêm dependency kéo thả.

## Thứ tự thực hiện

1. **Core thuần và test:** tạo template registry, đọc/ghi allowlist path, history Undo/Redo và debounce helper. Viết test trước cho patch bất biến, reset, gộp thao tác và chặn path lạ.
2. **Editor shell:** tạo `VisualCardEditor`, `CardPreviewCanvas`, `FieldInspector`; preview nhận field click, inspector đổi giá trị qua callback, toolbar có viewport/history/save state.
3. **Inspector sáu nhóm:** text, image, color, font, effect, music; tái sử dụng upload hiện có, validate client, giữ ảnh cũ khi upload lỗi.
4. **Tích hợp builder:** thay vùng preview/form chính trong `new` và `edit` bằng editor shell, giữ payload draft hiện tại; autosave dùng POST idempotency lần đầu và PUT sau đó, publish chỉ khi saved.
5. **Public parity/capability:** dùng cùng field mapping với public renderer; VIP fields/effects lấy từ capability backend, không bật bằng query/localStorage.
6. **Responsive/accessibility/performance:** bottom sheet mobile, focus/keyboard, aria-live, reduced motion, lazy-load inspector nặng, không render duplicate preview.
7. **Regression verification:** frontend/backend tests, Prisma validation/build và kiểm tra diff.

## Files chính

- `fe/src/lib/editor/template-registry.ts`
- `fe/src/lib/editor/patch-draft.ts`
- `fe/src/hooks/use-visual-card-editor.ts`
- `fe/src/components/editor/*`
- `fe/src/app/(dashboard)/dashboard/cards/new/page.tsx`
- `fe/src/app/(dashboard)/dashboard/cards/[cardId]/edit/page.tsx`
- `fe/src/types/card.types.ts`
- `be/src/lib/validators/card/index.ts`
- `be/src/services/card.service.ts`

## Constraints/STOP

- Không đổi schema Card nếu dữ liệu hiện tại chứa đủ sáu nhóm; dừng và báo nếu một field không có đường dẫn ổn định.
- Không cho arbitrary JSON path hoặc premium effect từ client.
- Không publish khi còn dirty/error draft.
- Không thêm drag-and-drop/canvas dependency.

## Verification

```powershell
cd fe; npm.cmd test -- --run; npm.cmd run build
cd ../be; npm.cmd test -- --run; npm.cmd run build
```

Kỳ vọng: tất cả test pass và build exit code 0.
