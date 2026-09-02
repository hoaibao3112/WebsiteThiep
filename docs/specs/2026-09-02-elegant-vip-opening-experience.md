# Đặc tả: Elegant VIP Opening Experience

## Mục tiêu

Tạo trải nghiệm mở thiệp VIP sang trọng, nhẹ và dễ dùng trên điện thoại. Cá nhân hóa tên khách và con dấu chữ cái của cô dâu/chú rể nhưng vẫn đảm bảo nhạc không tự phát trước tương tác và tôn trọng người dùng giảm chuyển động.

## Phạm vi

### VIP

- Tên khách hiển thị trên phong bì dưới dạng chữ dập nổi ánh kim nhẹ.
- Con dấu sáp hiển thị chữ cái cô dâu/chú rể.
- Hiệu ứng mở phong bì Elegant kéo dài khoảng 1.2–1.5 giây.
- Nhạc chỉ bắt đầu sau khi khách bấm mở phong bì.
- Có lựa chọn “Tắt nhạc” và ghi nhớ lựa chọn trong phiên.
- Hỗ trợ `prefers-reduced-motion` và nút “Giảm chuyển động”.

### FREE

- Giữ phong bì và hiệu ứng cơ bản hiện tại.
- Không hiển thị tên khách dập nổi và con dấu chữ cái tùy biến.
- Không tự phát nhạc trước tương tác; nếu có nhạc, chỉ phát sau thao tác mở.
- Vẫn tự động tôn trọng `prefers-reduced-motion`.

## Dữ liệu và quyền

- Backend trả `card.features.vipOpeningExperience` hoặc capability tương đương dựa trên plan/entitlement; frontend không tự suy luận VIP từ query hoặc localStorage.
- `guestInfo.salutation` và `guestInfo.fullName` được truyền dưới dạng dữ liệu riêng; không nối chuỗi ở server thành HTML.
- Chữ cái con dấu được sinh bằng hàm thuần từ tên đã trim, lấy chữ cái đầu của mỗi bên, tối đa hai ký tự; fallback `♥` nếu thiếu dữ liệu.
- Tên khách không được đưa vào CSS selector, URL hay HTML không escape.

## Luồng tương tác

```text
Khách mở link
  -> kiểm tra capability + guestInfo
  -> render phong bì (không phát nhạc)
  -> khách bấm con dấu
  -> phát nhạc (nếu không tắt và browser cho phép)
  -> chạy animation Elegant 1.2–1.5s
  -> gọi onOpened()
  -> nội dung thiệp hiển thị
```

- Nếu `audio.play()` bị browser từ chối, thiệp vẫn mở bình thường và hiện nút phát nhạc.
- Nếu người dùng bấm nhiều lần, chỉ xử lý lần đầu.
- Nếu `prefers-reduced-motion: reduce` hoặc người dùng bật nút giảm chuyển động, bỏ scale/rotate/particle; dùng fade/opacity tối đa 180ms.
- Nút mở phải có nhãn truy cập, focus ring và kích thước vùng chạm tối thiểu 44×44px.

## Visual direction

- Nền phong bì `#FDFBF7`, giấy trắng ngà, chữ chính stone-800.
- Accent vàng champagne lấy từ `primaryColor`, không dùng glow mạnh.
- Tên dập nổi: gradient ánh kim rất nhẹ + `text-shadow`/inset shadow; luôn có màu fallback tương phản cao khi gradient không hỗ trợ.
- Con dấu: hình tròn, viền mảnh, bóng đổ nhẹ; chữ cái ở giữa, không thêm icon trang trí nếu đã có monogram.
- Một lớp mặt phẳng phong bì và một lớp nắp; tránh nhiều layer DOM/ảnh nền nặng.
- `motion-safe:` cho animation và `motion-reduce:` cho fallback Tailwind.

## Component contract

`WaxSealOpening` nhận:

```ts
interface WaxSealOpeningProps {
  primaryColor?: string;
  title: string;
  subtitle?: string;
  guest?: { salutation?: string; fullName: string };
  monogram?: string;
  isVipExperience?: boolean;
  musicUrl?: string;
  onOpened: () => void;
}
```

- Giữ tương thích tạm thời với `guestName`/`guestCode` trong một release; adapter chuyển sang `guest`.
- Không tạo `Audio` trước khi người dùng bấm.
- Component tự cleanup timer/audio khi unmount.

`AudioPlayer`:

- Nhận `startOnUserGesture` và chỉ gọi `play()` từ callback mở phong bì.
- Expose `play`, `pause`, `isPlaying`, `hasError` qua callback/ref tối thiểu cần thiết.
- Không tự phát khi mount đối với trang public.

## Files dự kiến

- `fe/src/components/shared/OpeningEffect/WaxSealOpening.tsx`: tách VIP/basic visual, reduced-motion, cleanup.
- `fe/src/components/shared/AudioPlayer.tsx`: start sau gesture, play error fallback.
- `fe/src/components/shared/OpeningEffect/monogram.ts`: pure helper + unit test.
- `fe/src/app/(public)/thiep/[slug]/page.tsx`: truyền guest object/capability, thêm referrer policy đã có.
- `fe/src/components/wedding/WeddingView.tsx`, `BirthdayView.tsx`, `NewbornView.tsx`: dùng contract mới.
- `fe/src/types/card.types.ts`: kiểu capability và guest info.
- `be/src/services/card.service.ts`: serialize capability theo plan, không leak plan nội bộ.
- `be/src/lib/validators/card/`: schema response nếu cần.

## Hiệu suất

- Không thêm thư viện animation mới; dùng CSS transform/opacity và Framer Motion hiện có.
- Không tải audio cho tới khi có thao tác mở nếu có thể trì hoãn preload.
- Không dùng canvas/particle cho Elegant VIP MVP.
- Animation chỉ transform/opacity để tránh layout thrashing.
- Ảnh/album tải sau khi phong bì mở.
- Đo thời gian đến nội dung thiệp và lỗi audio ở client telemetry không chứa tên/SĐT khách.

## Kiểm thử

- Monogram đúng với tên tiếng Việt, tên nhiều từ, thiếu một bên và chuỗi rỗng.
- FREE không nhận visual VIP; VIP có guest hiển thị đúng danh xưng/tên.
- Không gọi `Audio.play` khi component mount; gọi đúng một lần sau click.
- `play()` reject không ngăn `onOpened`.
- Reduced motion bỏ transform dài và vẫn mở nội dung.
- Unmount dọn timer, không gọi state update sau unmount.
- Nút mở keyboard-accessible, focus-visible, aria-label rõ.
- Chạy `npm.cmd test -- --run` và `npm.cmd run build` cho frontend; backend test response capability.

## Không làm trong phần này

- Không thay đổi giới hạn FREE/VIP hoặc thanh toán.
- Không xây lại toàn bộ builder.
- Không thêm thư viện âm thanh/animation mới.
- Không tự động gửi Zalo.

## Acceptance criteria

1. Trên card VIP, khách cá nhân mở link và thấy tên dập nổi cùng monogram đúng.
2. Không có âm thanh trước khi click.
3. Sau click, thiệp mở dù audio bị browser chặn.
4. Chế độ giảm chuyển động hoạt động bằng cả OS preference và nút điều khiển.
5. Card FREE không thể bật visual VIP từ client.
6. Không tăng đáng kể bundle size hoặc thời gian hiển thị nội dung sau khi mở.
