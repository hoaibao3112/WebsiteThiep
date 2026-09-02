# Free Card Creation and Publishing Flow

## Context

Luồng tạo và chỉnh sửa thiệp hiện tại chưa phân biệt đúng giữa lưu nháp và xuất bản. Frontend có thể báo thành công khi API trả lỗi, trang chỉnh sửa dùng dữ liệu demo nếu không tải được thiệp, và endpoint công khai chưa giới hạn theo trạng thái xuất bản. Đợt thay đổi này hoàn thiện luồng FREE trước khi hệ thống bổ sung thanh toán và thiệp VIP.

## Goals

- Người dùng FREE có thể tạo, chỉnh sửa, xem trước và xuất bản thiệp một cách an toàn.
- Mỗi `accountId` chỉ được sở hữu tối đa 2 thiệp.
- Không để thiệp nháp, hết hạn hoặc lưu trữ bị truy cập công khai.
- Không báo lưu/xuất bản thành công khi backend từ chối hoặc mất kết nối.
- Giữ dữ liệu người dùng khi validation hoặc request thất bại.
- Cải thiện hiệu suất nhập liệu, live preview và upload ảnh trong phạm vi feature tạo thiệp.

## Non-goals

- Chưa tích hợp xác minh thanh toán hoặc cấp quyền BASIC/VIP.
- Chưa xây dựng mẫu thiệp VIP.
- Chưa thay đổi toàn bộ visual design của builder.
- Chưa hỗ trợ khôi phục thiệp đã xóa vĩnh viễn.
- Chưa triển khai custom domain.

## Business Rules

### Free plan assignment

- Backend tự lấy plan có `code = FREE` và `isActive = true`.
- Client không gửi và không được quyền quyết định `planId`.
- Template phải tồn tại, đang active, đúng `cardCategory`, và không phải premium.

### Two-card account limit

- Giới hạn áp dụng theo `accountId`, không theo `userId`.
- Tối đa 2 bản ghi Card trên mỗi account, tính tất cả trạng thái: `DRAFT`, `ACTIVE`, `EXPIRED`, và `ARCHIVED`.
- Chỉ xóa vĩnh viễn một Card mới giải phóng một suất.
- Update, autosave và publish một Card hiện có không làm tăng bộ đếm.
- Kiểm tra giới hạn và tạo Card phải nằm trong transaction PostgreSQL mức `Serializable`, có retry giới hạn khi serialization conflict, để tránh hai request đồng thời vượt giới hạn.

### Draft creation and autosave

- Builder mới không tạo Card chỉ vì người dùng mở trang hoặc nhập dữ liệu.
- Lần đầu, người dùng chủ động bấm `Lưu bản nháp`.
- Sau khi backend tạo thành công và trả `cardId`, builder mới bật autosave cho các thay đổi tiếp theo.
- Autosave debounce; không gửi request khi dữ liệu không thay đổi hoặc đang có upload chưa hoàn tất.
- UI hiển thị các trạng thái `Chưa lưu`, `Đang lưu`, `Đã lưu`, và `Lưu thất bại – Thử lại`.
- Nếu autosave thất bại, dữ liệu đang nhập vẫn được giữ nguyên và người dùng có thể thử lại.

### Slug reservation

- Slug được chuẩn hóa và kiểm tra ở backend.
- Slug duy nhất trên toàn hệ thống và được giữ chỗ ngay khi tạo bản nháp.
- Xóa vĩnh viễn Card sẽ giải phóng slug.
- UI kiểm tra khả dụng theo debounce để phản hồi sớm, nhưng backend vẫn là nguồn quyết định cuối cùng.

### Publishing and expiration

- `Lưu bản nháp` chỉ tạo/cập nhật Card ở trạng thái `DRAFT`.
- `Xuất bản` là thao tác riêng, yêu cầu Card đã tồn tại.
- Publish chạy validation đầy đủ theo loại thiệp và chỉ đổi trạng thái khi dữ liệu hợp lệ.
- Khi publish thành công: `status = ACTIVE`, `publishedAt = now`, `expiredAt = publishedAt + FREE.durationDays`.
- Thời gian lưu nháp không làm giảm 7 ngày công khai của gói FREE.
- Publish lại một Card đang `ACTIVE` không tự động gia hạn thời gian.
- Card `EXPIRED` không thể tự xuất bản lại trong luồng FREE hiện tại; việc gia hạn/nâng cấp thuộc phạm vi thanh toán sau này.

### Public and owner access

- Endpoint public theo slug chỉ trả Card có `status = ACTIVE` và `expiredAt > now`.
- Nếu một Card ACTIVE đã quá hạn, request public trả trạng thái không khả dụng và backend cập nhật Card thành `EXPIRED` theo cách an toàn.
- Chủ sở hữu tải Card để chỉnh sửa/xem trước qua endpoint có xác thực theo `cardId`.
- Mọi query và mutation của chủ sở hữu phải lọc bằng `accountId`; `userId` chỉ dùng thêm khi nghiệp vụ yêu cầu xác định người tạo.
- Thiệp `DRAFT`, `EXPIRED`, `ARCHIVED` chỉ có thể preview trong phiên đã xác thực của account sở hữu.

### Permanent deletion

- Có thao tác xóa vĩnh viễn để người dùng giải phóng một trong hai suất FREE.
- UI bắt buộc xác nhận rõ tên/slug thiệp và cảnh báo không thể khôi phục.
- Backend kiểm tra `accountId`, xóa theo transaction/cascade hiện có và trả kết quả rõ ràng.

## API Design

### Card reads

- `GET /cards/:id`: lấy Card cho owner editor; bắt buộc auth và `accountId` isolation.
- `GET /cards/my-cards`: danh sách Card của account hiện tại.
- `GET /cards/by-slug/:slug`: public; chỉ trả Card ACTIVE chưa hết hạn.
- `GET /cards/slug-availability?slug=...`: phản hồi khả dụng để hỗ trợ UI; không thay thế unique constraint.

### Card writes

- `POST /cards`: tạo bản nháp FREE; backend tự gán plan và kiểm tra giới hạn 2 Card.
- `PUT /cards/:id`: lưu thủ công hoặc autosave; bắt buộc auth và account ownership.
- `PATCH /cards/:id/publish`: validate đầy đủ rồi publish.
- `DELETE /cards/:id`: xóa vĩnh viễn sau xác nhận ở UI.

### Response contract

- API client phân biệt HTTP/network failure và response nghiệp vụ thất bại.
- Frontend chỉ chạy success UI khi `success === true` và có dữ liệu cần thiết.
- Validation trả lỗi theo field khi có thể; lỗi hệ thống trả thông điệp an toàn, không lộ stack/provider message.
- Create và publish chấp nhận idempotency key để chống double-submit/retry tạo kết quả trùng.

## Validation

- Thay `z.any()` của events/photos bằng schema có kiểu rõ ràng.
- Tách schema lưu nháp và schema xuất bản:
  - Draft cho phép dữ liệu chưa hoàn chỉnh nhưng vẫn kiểm tra kiểu, giới hạn độ dài và URL.
  - Publish yêu cầu đầy đủ trường bắt buộc theo `WEDDING`, `BIRTHDAY`, hoặc `NEWBORN`.
- Normalize slug, tên, số điện thoại, số tài khoản, URL và text ở backend.
- Validate ngày sự kiện, RSVP deadline, tuổi, ngày sinh và giới hạn ảnh.
- Không nhận Base64/blob URL trong payload Card production.

## Builder UX

- Header có hai hành động rõ ràng: `Lưu bản nháp` và `Xuất bản`.
- Không chạy confetti trước khi publish được backend xác nhận.
- Chuyển bước kiểm tra các trường bắt buộc của bước hiện tại; lỗi được hiển thị cạnh field và focus vào lỗi đầu tiên.
- Stepper dùng semantics phù hợp và thông báo bước hiện tại cho assistive technology.
- Khi rời trang có thay đổi chưa lưu, hiển thị cảnh báo.
- Khi publish thành công, hiển thị màn hình hoàn tất với URL, sao chép link, QR và mở thiệp.
- Tải editor thất bại hiển thị retry/back; không nạp `DEMO_CARD`.
- Không dùng sẵn thông tin tài khoản ngân hàng thật làm giá trị mặc định.
- Trường giới tính/ngày sinh newborn phải lấy từ input người dùng, không hard-code.

## Performance

- Tách builder theo từng step và category để giảm phạm vi render.
- Debounce live preview; memoize phần preview nặng.
- Dynamic import view theo category nếu không làm giảm trải nghiệm chuyển loại thiệp.
- Nén ảnh thành Blob trước upload và gửi chính Blob đã nén; không tạo Base64 nếu request thành công.
- Upload album song song có giới hạn, không upload tuần tự toàn bộ.
- Revoke object URL khi thay/xóa ảnh hoặc unmount.
- Editor dùng thumbnail và kích thước ảnh ổn định để giảm bộ nhớ và layout shift.

## Data Model Changes

- Thêm `publishedAt DateTime?` vào Card.
- Giữ `expiredAt DateTime?`, nhưng chỉ thiết lập khi publish lần đầu.
- Giữ unique constraint toàn cục cho `slug`.
- Không thêm bảng subscription/entitlement trong đợt này.

## Error and Concurrency Handling

- Unique constraint là lớp bảo vệ cuối cho slug race.
- Transaction PostgreSQL mức `Serializable` bao trọn count và create; nếu hai request cạnh tranh, serialization conflict được retry giới hạn và kết quả cuối không vượt quá 2 Card.
- Idempotency key bảo vệ create và publish khỏi double-click/retry.
- Save/publish bị disable trong lúc request tương ứng đang chạy.
- Upload lỗi không được thay bằng URL tạm/Base64 rồi gửi lưu lên backend.

## Testing

### Backend

- Tạo Card tự gán FREE plan và bỏ qua mọi attempt chọn plan từ client.
- Account có 0/1 Card tạo được; account có 2 Card bị từ chối.
- Hai create đồng thời không tạo Card thứ ba.
- Tenant A không đọc, sửa, publish hoặc xóa Card tenant B.
- Draft không public; ACTIVE còn hạn public; ACTIVE quá hạn không public.
- `expiredAt` bắt đầu từ publish, không từ create.
- Template premium/sai category/inactive bị từ chối.
- Slug conflict trả lỗi nghiệp vụ ổn định.
- Draft schema cho dữ liệu chưa hoàn chỉnh; publish schema từ chối thiếu dữ liệu.

### Frontend

- API trả `success: false` không hiển thị success/confetti/navigation.
- Load editor thất bại không render dữ liệu demo.
- Lưu lần đầu tạo draft; sau đó autosave dùng PUT với cùng `cardId`.
- Autosave lỗi giữ dữ liệu và hiển thị retry.
- Publish chỉ điều hướng sau response thành công.
- Nút bị disable trong request để chống double-submit.
- Validation lỗi hiển thị và liên kết đúng với input.
- Upload lỗi không đưa blob/Base64 vào payload lưu Card.

## Acceptance Criteria

1. Một account không thể có Card thứ ba nếu chưa xóa vĩnh viễn một Card cũ.
2. Mở builder và nhập liệu không tự chiếm suất; chỉ `Lưu bản nháp` mới tạo Card.
3. Người dùng không thể tự chọn plan hoặc dùng template premium qua request thủ công.
4. Draft không truy cập được bằng public slug.
5. Bảy ngày của FREE bắt đầu đúng lúc publish thành công.
6. Không có đường lỗi nào hiển thị thông báo thành công.
7. Editor luôn tải dữ liệu thật theo `cardId` hoặc hiển thị trạng thái lỗi có retry.
8. Mọi owner query/mutation Card có `accountId` filter.
9. Build frontend/backend đạt và toàn bộ test liên quan đạt mà không bị treo.

## Rollout and Compatibility

- Migration thêm `publishedAt` là nullable nên không làm mất dữ liệu hiện có.
- Card ACTIVE hiện có nhưng thiếu `publishedAt` giữ `expiredAt` hiện tại; không tự gia hạn.
- Card DRAFT hiện có phải ngừng public ngay sau khi endpoint public thêm status filter.
- Dữ liệu demo chỉ tồn tại trong test fixtures, không dùng làm runtime fallback.
