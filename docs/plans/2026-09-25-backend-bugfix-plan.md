# Backend Bugfix Implementation Plan

> Thực hiện từng task theo skill `executing-plans`; đánh dấu checkbox sau khi có bằng chứng kiểm thử. Tài liệu này là kế hoạch, chưa cho phép chạy migration trên production.

**Ngày:** 2026-09-25.
**Mục tiêu:** Sửa 11 nhóm lỗi trong đợt review backend, có test hồi quy qua đúng ranh giới gây lỗi và bảo toàn dữ liệu hiện hữu.
**Mốc mã nguồn khi lập kế hoạch:** `f48573fe91c38fdce7672546cd245729aac918ab`. Kiểm tra lại diff trước thực hiện vì workspace có thể tiếp tục thay đổi.
**Kiến trúc:** Sửa tại Express router/controller/service và Prisma hiện có. Dùng canonical Zod schemas, account entitlement và HttpError sẵn có; giữ API tương thích với frontend.
**Stack thực tế:** TypeScript strict, Express 4, Prisma 5/PostgreSQL, Redis/BullMQ, Zod, Vitest; frontend Next.js.

## 1. Phạm vi và quyết định

- Sửa toàn bộ 11 nhóm lỗi được báo; gom OTP/đăng ký thành một task hợp đồng API.
- Ưu tiên một luồng HTTP hoạt động từ router qua controller trước, tiếp đến worker, scene, dữ liệu khách và thanh toán.
- Không chuyển Express sang Next.js trong đợt sửa lỗi: việc chuyển framework không cần để xử lý các lỗi đã xác minh. Đây là ngoại lệ giữ nguyên hệ thống hiện hữu, không phải đề xuất kiến trúc mới.
- Không thiết kế lại UI, đổi giá gói, thêm payment provider hoặc refactor toàn bộ `any`. Code mới và code sửa dùng `unknown`, type rõ ràng và Zod.
- Giữ HttpOnly cookie, CSRF, rate limit và kiểm tra ownership. Truy vấn dữ liệu tenant dùng accountId từ phiên hoặc accountId đã xác định từ tài nguyên public; danh mục Plan/Template dùng phạm vi toàn hệ thống như hiện tại.
- Không thêm framework test HTTP: dùng Express hiện có, server cổng ngẫu nhiên và native fetch. Mock service tại test router, mock Prisma/Redis ở unit test. Test race/migration dùng PostgreSQL/Redis riêng.
- Nguồn nghiệp vụ: `docs/specs/2026-09-23-account-level-manual-payment.md`, `docs/plans/2026-09-02-personalized-guests-zalo-plan.md`, `docs/specs/2026-09-02-free-card-creation-flow.md`.
- Chưa biết DB có dữ liệu thật hay không; mặc định bảo toàn như production. Không reset DB, xóa đơn, tự gộp giao dịch hoặc sửa lịch sử migration đã áp dụng.

## 2. Bằng chứng đầu vào

| Nhóm | Vị trí hiện tại | Bằng chứng và tiêu chí khắc phục |
|---|---|---|
| OTP/register | `be/src/routes/api.router.ts:41,44` | Router strip type/name trước controller. Body hợp lệ phải đến service với đủ dữ liệu. |
| Worker | `be/src/queues/workers/rsvp-notification.worker.ts:13` | BullMQ ném `Queue name cannot contain :`; entrypoint phải khởi động và shutdown sạch. |
| Wedding scene | `be/src/lib/validators/card/wedding-scene.schema.ts:30` | 6/10 scene sinh tự động không qua schema; cả 10 phải tạo/lưu/publish/read được. |
| RSVP | `be/src/schemas/index.ts:38` | guestToken/guestCode bị strip; gửi lại cùng khách phải cập nhật một response. |
| Google | `be/src/services/auth.service.ts:112` | Thiếu client ID vẫn verify với audience undefined; cấu hình thiếu phải fail closed. |
| Public wishes | `be/src/services/wish.service.ts:83` | Trả nguyên model có IP; response chỉ gồm trường công khai. |
| Card lifecycle | `be/src/services/card.service.ts:397` | BASIC publish bị gán hạn public trái spec; paid publish phải có expiredAt=null. |
| Guest import | `be/src/controllers/guest.controller.ts:109` | Không sử dụng mode; import lặp phải skip/update đúng. |
| Error mapping | `be/src/middlewares/error.middleware.ts:11` | Expected errors dạng Error thành 500; dùng mã 4xx phù hợp. |
| Order idempotency | `be/src/services/order.service.ts:132` | Reuse không ghi khóa mới; retry sau duyệt phải trả cùng order. |
| Migration/setup | `be/prisma/migrations/20260923100000_account_manual_payments/migration.sql:99` | Partial unique chỉ nằm ở SQL; db push không tạo index; migration đầu tiên còn ALTER các bảng chưa được tạo trong history. |

Baseline ở lượt review: `npm test -- --reporter=dot` đạt 19 files/85 tests; `tsc --noEmit --incremental false` thành công. Đây không phải kiểm chứng PostgreSQL/Redis hoặc production.

## 3. Task 1 — Sửa hợp đồng auth và RSVP qua HTTP

**Sửa:** `be/src/routes/api.router.ts`, `be/src/schemas/index.ts`, `be/src/lib/validators/auth.schema.ts`, `be/src/lib/validators/rsvp.schema.ts`; controllers auth/RSVP nếu cần bỏ parse trùng.
**Tạo:** `be/tests/helpers/http-server.ts`, `be/tests/auth/auth-routes.test.ts`, `be/tests/rsvp/rsvp-routes.test.ts`.

- [x] Viết test HTTP với router thật: POST send-otp body `{email,type:"REGISTER"}`; POST register `{email,password,name,phone}`; POST rsvp chứa guestToken hoặc guestCode. Mock side effects và chứng minh bản hiện tại không truyền đủ dữ liệu.
- [x] Dùng schemas trong `lib/validators` làm nguồn chuẩn. `schemas/index.ts` chỉ re-export alias cần tương thích. Router register dùng RegisterSchema; OTP dùng SendOtpSchema; RSVP dùng RsvpSubmitSchema.
- [x] Đối chiếu payload frontend và giữ tên endpoint/response envelope. Chốt OTP type REGISTER; nếu frontend đã bỏ type, thêm default REGISTER tại canonical schema thay vì duy trì hai schema khác nhau.
- [x] Kiểm tra dữ liệu không hợp lệ vẫn 400; identity do client chèn không được dùng làm tenant authority; cookie/CSRF behavior không đổi.
- [x] Test RSVP qua router + service: token đúng liên kết guest; request lặp cập nhật một response; link chung tiếp tục được gửi độc lập; token tenant khác không liên kết guest bên kia.
- [x] Chạy `npm test -- tests/auth/auth-routes.test.ts tests/rsvp/rsvp-routes.test.ts` trong `be`; kỳ vọng pass, đóng server và mock connections sau mỗi suite.

## 4. Task 2 — Worker khởi động và đóng sạch

**Sửa:** `be/src/queues/workers/rsvp-notification.worker.ts`, `be/src/worker.ts`.
**Tạo:** `be/tests/infrastructure/worker-startup.test.ts`, `be/tests/integration/worker-smoke.test.ts`.

- [x] Đổi DLQ thành `rsvp-notification-queue-dlq`. Dùng cùng một hằng tên, không thay tên queue chính; queue cũ chứa dấu hai chấm không thể được constructor hiện tại tạo.
- [x] Cho shutdown đóng DLQ cùng hai workers và queues; bảo đảm startup failure có log rõ, không để tiến trình treo.
- [x] Test constructor BullMQ thật để bắt quy tắc tên; test khởi động worker với Redis thử nghiệm và SMTP giả, không gửi mail/Telegram thật.
- [x] Test job RSVP lỗi hết retry xuất hiện đúng một lần trong DLQ; SIGTERM đóng kết nối trong thời gian giới hạn.
- [x] Chạy `npm test -- tests/infrastructure/worker-startup.test.ts`; smoke thực nằm trong suite integration của Task 9.

## 5. Task 3 — Đồng bộ schema và scene cưới

**Sửa:** `be/src/lib/validators/card/wedding-scene.schema.ts`, `be/src/services/wedding-scene.service.ts`; đối chiếu `fe/src/types/wedding-scene.types.ts`, `fe/src/lib/editor/wedding-scene.ts`.
**Tạo/sửa test:** `be/tests/card/wedding-scene-contract.test.ts`, `be/tests/card/card-service.test.ts`.

- [x] Liệt kê toàn bộ section types đang được sinh bởi 9 template và blank. Định nghĩa enum/tuple chuẩn ở backend, type scene suy ra từ schema; generator không tiếp tục dùng string tự do cho section type.
- [x] Giữ các loại section legacy hợp lệ. Không sửa bằng `z.string()` hoặc passthrough làm mất validation. Không thay layout/motif/ảnh của các mẫu.
- [x] Mỗi template có test: DraftCardSchema parse input -> ensureWeddingScene -> WeddingSceneDocumentSchema -> lưu/đọc JSON -> update -> PublishCardDataSchema đều thành công.
- [x] Thêm fixture scene đã lưu, blank scene, custom elements và ngày sự kiện. Bảo đảm bước Date -> JSON ISO không làm mất eventDate/content khi đồng bộ bindings.
- [x] Input section không hỗ trợ vẫn bị từ chối; scene lưu trước đây không mất element khi đọc lại.
- [x] Chạy `npm test -- tests/card/wedding-scene-contract.test.ts tests/card/card-service.test.ts`; kỳ vọng 10/10 template round-trip đạt.

## 6. Task 4 — Google auth và phân loại lỗi

**Sửa:** `be/src/services/auth.service.ts`, `be/src/services/otp.service.ts`, `be/src/lib/rate-limiter.ts`, `be/src/middlewares/error.middleware.ts`; các service guest/rsvp/wish có expected Error cùng đường đi.
**Test:** `be/tests/auth/google-login.test.ts`, `be/tests/auth/auth-errors.test.ts`, `be/tests/infrastructure/error-middleware.test.ts`, `be/tests/infrastructure/rate-limiter.test.ts`.

- [x] Thiếu GOOGLE_CLIENT_ID: endpoint Google trả 503 với code cấu hình, không gọi verifyIdToken. Có cấu hình: truyền audience cụ thể; wrong audience/email chưa verified/token hết hạn bị từ chối 401.
- [x] Chuyển expected failures sang HttpError: invalid input/OTP 400, invalid credentials 401, thiếu quyền 403, không tìm thấy 404, xung đột 409, rate-limit 429, dependency unavailable 503.
- [x] Không suy đoán HTTP status bằng chuỗi message; lỗi lập trình/DB bất ngờ vẫn 500, không lộ stack/secret. Unknown catch phải được narrow trước sử dụng.
- [x] Các lỗi DB hạ tầng không bị giả thành sai mật khẩu; không phân biệt tài khoản không tồn tại với sai mật khẩu trong response.
- [x] Chạy `npm test -- tests/auth tests/infrastructure`; bảo đảm Google không cấu hình vẫn cho phép login bằng password.

## 7. Task 5 — Public wishes và import khách

**Sửa:** `be/src/services/wish.service.ts`, `be/src/services/guest.service.ts`, `be/src/controllers/guest.controller.ts`.
**Test:** `be/tests/wish/wish-service.test.ts`, `be/tests/wish/wish-routes.test.ts`, `be/tests/guest/guest-import.test.ts`.

- [x] Public wish DTO dùng select rõ: id, senderName, relationship, content, emoji, createdAt. Áp dụng cho list và submit; không có ipAddress/accountId trong response.
- [x] Đưa import vào `GuestService.importGuests(accountId, cardId, input)`; controller chỉ parse và serialize kết quả `{created,updated,skipped,errors,items}`.
- [x] Kiểm tra ownership/VIP một lần; transaction khóa theo card/account để các lần import đồng thời không cùng tạo bản trùng. Chuẩn hóa và map danh sách hiện có trong phạm vi tenant/card.
- [x] Dùng quy tắc trong plan khách: có phone thì so normalizedPhone; không phone thì normalizedName + group đã chuẩn hóa. Không ghép hai người khác phone chỉ vì trùng tên.
- [x] SKIP_DUPLICATES bỏ qua; UPDATE_EXISTING chỉ cập nhật trường được cung cấp, giữ id/token/delivery/RSVP. Cập nhật map sau từng dòng để bắt trùng ngay trong payload.
- [x] Nếu nhiều bản cũ cùng khóa nhận diện: trả row error không tự chọn một bản để ghi đè; input validation fail không ghi gì, DB transaction fail rollback toàn batch, các dòng bị từ chối do mơ hồ được đếm riêng.
- [x] Test import lại, cả hai mode, phone +84/0, cùng tên khác group, 500/501 dòng, tenant khác, lỗi giữa transaction, và hai imports đồng thời trong suite integration.
- [x] Chạy `npm test -- tests/wish tests/guest`.

## 8. Task 6 — Card lifecycle theo Account

**Sửa:** `be/src/services/card.service.ts`, `be/src/services/account-entitlement.service.ts` nếu cần cung cấp duration của effective plan; không lấy duration từ card.plan lịch sử.
**Test:** `be/tests/card/card-lifecycle.test.ts`.

- [x] Paid BASIC/VIP tại thời điểm publish có expiredAt=null theo spec ngày 23/09. FREE mới publish dùng duration FREE được backend cấu hình; request publish lặp không kéo dài hạn.
- [x] Giữ thiệp đã publish khi paid có thể xem sau downgrade, nhưng feature editing vẫn dựa effective account plan.
- [x] Kiểm tra quyền template/photo hiện hành khi draft lần đầu publish sau downgrade; không dùng snapshot plan cũ để cấp quyền mới. Không xóa dữ liệu vượt quota.
- [x] Test paid/free publish, BASIC hết hạn, renewal, VIP, draft tạo trước nâng/hạ gói, card ARCHIVED/EXPIRED và publish lặp.
- [x] Dữ liệu cũ có expiry sai: tạo báo cáo read-only về ứng viên dựa order PAID, paidAt, publishedAt và plan history. Chỉ sửa các bản có bằng chứng đã publish trong thời gian paid; bản không xác định giữ nguyên và báo riêng. Không mass-clear expiry toàn bảng.
- [x] Chạy `npm test -- tests/card/card-lifecycle.test.ts`; test public read phải xác nhận thiệp paid không trả 404 chỉ vì account hết BASIC.

## 9. Task 7 — Lịch sử migration và unique index thanh toán

**Sửa:** `be/package.json`, `README.md`, `render.yaml`; bổ sung baseline/migration dưới `be/prisma/migrations` sau kiểm tra lịch sử.
**Tạo:** `be/scripts/payment-db-preflight.ts`, `docs/runbooks/backend-payment-migrations.md`, `be/tests/integration/migrations.test.ts`.

- [x] Preflight mặc định chỉ đọc: migrations đã apply/failed, drift schema, Plan FREE/BASIC/VIP, partial index predicate, đơn active trùng account/plan, thống kê rows trước migration. Không log secrets hoặc full payment payload.
- [x] Dựng baseline SQL cho schema trước migration tenancy đầu tiên; chứng minh baseline + toàn bộ migrations chạy từ DB trống. Không dùng baseline schema hiện tại rồi replay ALTER cũ.
- [x] DB có schema nhưng thiếu history: đối chiếu schema/index với từng bước trước khi mark applied. Không tự chạy migrate resolve, không sửa checksum SQL đã apply. Trường hợp migration fail dở phải kiểm tra DDL còn lại và có recovery runbook riêng.
- [x] Đơn quá hạn: chuyển status theo quy tắc hiện hành, lưu báo cáo trước/sau. Các đơn active còn hạn trùng nhau, đặc biệt AWAITING_REVIEW: dừng migration ở preflight để đối soát; không xóa, tự approve/reject hoặc tự gộp số tiền.
- [x] Với DB chưa chạy migration chứa unique index: chạy bước chuẩn bị/dọn trạng thái có kiểm soát trước migration đó; thêm migration phía sau không cứu được migration trước đã fail. Với DB đã qua migration: dùng repair migration additive, kiểm tra index definition thay vì chỉ tên.
- [x] Chuẩn hóa lệnh `db:deploy` và `db:preflight`; release job chạy đúng một lần trước API/worker, không chạy migrate ở cả hai process. Hướng dẫn production bỏ db push.
- [x] Test ba nhánh: DB trống; fixture legacy nhiều pending orders; schema hiện tại được tạo bằng db push. Sau thành công phải có đúng partial unique index và bảo toàn paid orders/transactions/account entitlement.
- [x] Chạy các bài migration trên DB riêng; chưa cho phép chạy lên production trong task này.

## 10. Task 8 — Idempotency bền vững và race thanh toán

**Sửa:** `be/prisma/schema.prisma`, migration additive mới, `be/src/services/order.service.ts`, `be/src/lib/validators/order.schema.ts` nếu cần giới hạn key.
**Test:** `be/tests/order/order-service.test.ts`, `be/tests/integration/order-concurrency.test.ts`.

- [x] Tạo model hẹp `OrderRequest` gồm id, accountId, idempotencyKey, planCode, orderId, createdAt; unique(accountId,idempotencyKey), relations Account/Order. Giữ Order.idempotencyKey cũ để tương thích, backfill một mapping cho mỗi order cũ.
- [x] Lý do thêm bảng: nhiều request keys có thể cùng trỏ một active order theo spec. Trường đơn trên Order không thể giữ các alias bền vững; không thay bằng cache Redis dễ mất dữ liệu hoặc cơ chế idempotency tổng quát.
- [x] Sau xác thực OWNER, lookup mapping trước kiểm tra quyền mua mới/plan active: retry cùng key+plan trả cùng order kể cả đã PAID, account đã VIP hoặc giá/plan catalog đã thay đổi. Key cũ+plan khác trả 409.
- [x] Create/reuse + ghi mapping nằm cùng transaction Serializable, retry hữu hạn P2034/P2002 bằng đọc lại mapping/active order; bảo vệ thêm bằng partial unique index. Không trả success nếu mapping chưa commit.
- [x] Test K1 tạo O1, K2 reuse O1, duyệt O1, retry K1/K2 đều O1; hai key đồng thời cùng plan; cùng key khác plan; cùng key khác tenant độc lập; approve/reject race; lỗi giữa transaction rollback.
- [x] Giá luôn đọc server cho đơn mới; replay không tính lại giá đã chốt. Đơn expired/rejected vẫn replay trạng thái cũ, muốn đơn mới phải dùng key mới.
- [x] Chạy `npm test -- tests/order`; PostgreSQL race tests thuộc Task 9. Không dùng test tìm chuỗi source làm bằng chứng chống race.

## 11. Task 9 — Kiểm chứng tích hợp và phát hành

**Tạo:** `be/vitest.integration.config.ts`, `be/tests/integration/helpers/test-environment.ts`, `.github/workflows/backend-checks.yml`.
**Sửa:** `be/vitest.config.ts`, `be/package.json`, `docs/runbooks/backend-payment-migrations.md`.

- [x] Unit suite exclude tests/integration; thêm script `test:integration`. Integration bắt buộc TEST_DATABASE_URL/TEST_REDIS_URL riêng, không fallback sang DATABASE_URL thật; fixture teardown chỉ xóa namespace/test database được xác minh.
- [x] CI dùng PostgreSQL và Redis service containers; test HTTP dùng router thật, queue smoke dùng BullMQ thật, mail/Telegram/Google dùng fake adapter/mock. Không phát sinh gửi thông báo thật.
- [x] Chạy trong `be`: `npm test`, `npx tsc --noEmit --incremental false`, `npm run build`, `npm run test:integration`. Kỳ vọng tất cả pass, process không treo, migrations và index được xác nhận từ PostgreSQL catalog.
- [x] Smoke staging: gửi OTP, đăng ký/login, sửa/publish 10 mẫu, RSVP cá nhân hai lần, import khách hai mode, xem lời chúc không có IP, tạo/reuse/duyệt/retry đơn, BASIC hết hạn vẫn xem được thiệp paid.
- [x] Review diff theo logic, isolation, race, dữ liệu nhạy cảm và type safety; không tidy ngoài những file đã chạm. Sửa findings trước release.
- [x] Release theo batch: Tasks 1–5 có thể phát hành trước; lifecycle mới sau test spec; Tasks 7–8 đi cùng migration/runbook và integration gate.
- [x] Theo dõi lỗi 400/401/429/500, worker startup/job failures, duplicate-order conflict và publish errors; không log OTP/token/IP khách trong báo cáo công khai.

## 12. Rollout, rollback và điều kiện dừng

- Backup DB và thử khôi phục trước thay đổi schema/data thực. Chạy rehearsal trên bản sao được bảo vệ; đối chiếu số paid orders, transactions và tổng tiền trước/sau, theo tenant.
- Migration additive trước code đọc bảng OrderRequest. Tạm dừng tạo/duyệt đơn trong khoảng sửa lịch sử/index nếu chưa bảo đảm invariant bằng DB.
- Rollback code giữ nguyên cột/bảng additive và payment history; không drop bảng alias khi có request đã sử dụng. Nếu phải lùi sang bản không hiểu alias, khóa tạo đơn cho đến khi forward-fix để không mất idempotency.
- Không rollback bằng phục hồi snapshot lên DB đang tiếp tục nhận thanh toán. Dùng forward repair; restore chỉ trong cửa sổ maintenance có đối soát các ghi phát sinh.
- Dừng nhánh migration khi thiếu history, schema drift chưa giải thích, active duplicate có thể đã chuyển tiền, hoặc không có DB thử riêng. Các task không phụ thuộc migration vẫn có thể tiếp tục.
- Dừng thay đổi lifecycle khi dữ liệu thực mâu thuẫn spec; không tự suy diễn lịch sử entitlement để mass-update.
- Không coi 85 tests cũ pass là hoàn thành. Mỗi lỗi phải có test hồi quy đúng boundary và kiểm chứng phù hợp.

## 13. Review kế hoạch — 2026-09-25

| Tiêu chí | Trước rà soát | Sau rà soát | Kết quả |
|---|---:|---:|---|
| Completeness | 4/5 | 5/5 | Map đủ 11 nhóm, có rollback và dữ liệu cũ. |
| Feasibility | 3/5 | 4/5 | Stack/test tools đã có; baseline thực tế và lịch sử DB cần preflight/rehearsal. |
| Scope | 4/5 | 5/5 | Giữ framework, không redesign UI/đổi nghiệp vụ; alias table giải quyết invariant cụ thể. |
| Testability | 3/5 | 5/5 | HTTP/schema round-trip/worker/real DB races, lệnh và expected results cụ thể. |
| Risk | 3/5 | 4/5 | Có bảo toàn/rollback; production history và duplicate payments chưa được kiểm tra. |
| Assumptions | 3/5 | 5/5 | Tách bằng chứng đã xác minh với điều kiện chưa biết, có stop conditions. |

<!-- UNRESOLVED: Feasibility/Risk đạt 5/5 sau khi biết lịch sử DB và rehearsal migration trên DB riêng; không coi là blocker cho Tasks 1–5. -->

Kế hoạch sẵn sàng triển khai các sửa lỗi ứng dụng theo thứ tự. Nhánh migration/payment có gate preflight bắt buộc; chưa được coi là production-ready trước khi gate này đạt.
