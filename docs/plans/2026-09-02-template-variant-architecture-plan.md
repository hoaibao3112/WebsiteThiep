# Kế hoạch: hệ thống mẫu thiệp có bố cục riêng

## Mục tiêu

Mỗi template slug phải chọn một layout/visual variant riêng; dữ liệu và trình chỉnh sửa dùng chung nhưng renderer quyết định bố cục, màu nền, typography, thứ tự section và hiệu ứng. Khi người dùng chọn mẫu, preview và editor lập tức chuyển sang đúng variant đó.

## Thiết kế

1. Tạo `template-config.ts` làm registry typed theo slug. Mỗi config khai báo category, variant, palette mặc định, font mặc định, danh sách section và capability VIP.
2. Mở rộng props của `WeddingView`, `BirthdayView`, `NewbornView` với `templateSlug` (optional, fallback theo category). Mỗi view tách renderer theo variant, không copy dữ liệu hay logic RSVP.
3. Tạo các layout riêng ở mức section:
   - Wedding Minimalist Gold: editorial, nhiều khoảng thở, ảnh hero dọc.
   - Wedding Hồng Xanh Luxury: nền gradient xanh đêm, khung ảnh đôi và timeline ngang.
   - Birthday Glow Party: hero radial neon, gallery dạng polaroid, CTA nổi bật.
   - Newborn Little Prince: bố cục storybook xanh navy/vàng, milestone cards.
   - Newborn Sweet Angel: pastel hồng, ảnh bo tròn, timeline mềm.
4. Visual editor lấy field/schema từ registry, hiển thị đúng nhóm điều chỉnh của template; thay đổi chỉ cập nhật draft immutable và autosave debounce.
5. Preview trong trang tạo/sửa truyền `templateSlug` xuống renderer; khi đổi mẫu reset các giá trị mặc định theo config nhưng giữ dữ liệu người dùng.

## Hiệu suất và UX

- Lazy-load renderer ít dùng bằng `dynamic`, tránh tải toàn bộ template vào bundle đầu tiên.
- Ảnh dùng `next/image`, kích thước cố định để tránh CLS; chỉ preload hero.
- Animation tôn trọng `prefers-reduced-motion`; không autoplay âm thanh trước gesture.
- Editor có undo/redo, trạng thái lưu rõ ràng, mobile inspector dạng bottom sheet.

## Kiểm thử

- Unit test registry: slug hợp lệ, fallback, capability và default tokens.
- Component test: mỗi slug render class/layout marker riêng; đổi field không làm mutate draft cũ.
- Build/test frontend và kiểm tra kích thước route sau khi tách renderer.

## Phạm vi phiên đầu

Triển khai registry + variant shell và khác biệt rõ ràng ở hero/section đầu cho cả 5 mẫu; sau đó mở rộng từng section mà không đổi API dữ liệu. Không thay đổi schema database.
