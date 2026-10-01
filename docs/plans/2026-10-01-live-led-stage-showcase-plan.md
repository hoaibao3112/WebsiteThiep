# Kế Hoạch: Màn Hình LED Sảnh Tiệc Tương Tác (Live LED Stage Showcase)

*Ngày: 2026-10-01 · Dự án: WebsiteThiep*

---

## Context

Hiện tại website thiệp cưới chỉ phục vụ **trước ngày cưới** (gửi link, nhận RSVP). Cặp đôi cần một điểm chạm công nghệ **trong ngày cưới** — chiếu ảnh và lời chúc của khách lên màn hình LED sảnh tiệc theo thời gian thực.

Backend đã có sẵn:
- Bảng `WeddingMemory` + `Wish` với đầy đủ trường dữ liệu (không cần Prisma migration).
- SSE endpoint: `GET /api/cards/:slug/memories/stream` (wedding-memory.controller.ts:60-101).
- Redis Pub/Sub channel `wedding:memories:${cardId}` publish 3 event types: `NEW_MEMORY`, `HIDE_MEMORY`, `DELETE_MEMORY` (wedding-memory.service.ts:40,121,151,165).
- Trang mẫu đơn giản tại `/thiep/[slug]/live/page.tsx` — đã có SSE client, confetti, slide show cơ bản.

Cần thêm:
- `WishService` hiện **không publish Redis event** khi có lời chúc mới (wish.service.ts:56-77).
- Giao diện Stage Split Screen VIP thay thế bố cục đơn giản hiện tại.
- Ticker marquee chạy chữ lời chúc realtime.

---

## Tracer Bullet (Vertical Slice Đầu Tiên)

Trước khi xây toàn bộ, chứng minh cơ chế hoạt động bằng 1 slice tối thiểu xuyên suốt stack:

```
WishService.submitWish() → redis.publish("wedding:memories:{cardId}", NEW_WISH)
→ SSE stream bắn event → Trang /live-display nhận → Hiện lời chúc + confetti
```

**Done criteria:** Mở `/thiep/test-slug/live-display` trên browser, gửi 1 lời chúc từ tab khác, thấy lời chúc bay lên Spotlight trong < 1 giây kèm confetti vàng. Nếu slice này fail → dừng lại debug trước khi xây UI phức tạp.

---

## Approach

### Phase 1: Backend — Thêm `NEW_WISH` vào Redis Pub/Sub (30 phút)

**Quyết định:** Giữ nguyên channel hiện tại `wedding:memories:${cardId}`. Không tạo channel mới.
- **Lý do:** Trang `/live` cũ và tất cả publisher hiện tại đang dùng channel này. Đổi tên = gãy SSE toàn bộ. Thêm event types mới vào cùng channel, client lọc theo `event` name.

**File:** `be/src/services/wish.service.ts`
- Import `redis` từ `../lib/redis` và `logger` từ `../lib/logger`.
- Sau dòng `const wish = await prisma.wish.create(...)` (line 56-77), thêm Redis publish:

```typescript
// Publish lên channel SSE cho màn hình LED
if (isApproved) {
  try {
    const channel = `wedding:memories:${cardId}`;
    await redis.publish(channel, JSON.stringify({
      event: "NEW_WISH",
      data: wish,
    }));
  } catch (err) {
    logger.warn({ err }, "Không thể publish NEW_WISH event");
  }
}
```

- Chỉ publish khi `isApproved === true` (lời chúc không chứa profanity). Lời chúc bị profanity filter chặn sẽ không bay lên LED.

**Không tạo route SSE mới.** Tái sử dụng endpoint `/api/cards/:slug/memories/stream` hiện tại — nó đã subscribe channel `wedding:memories:${cardId}` và forward mọi event. Event `NEW_WISH` sẽ tự động được đẩy tới tất cả SSE clients mà không cần sửa controller.

### Phase 2: Frontend — Trang Live LED Stage VIP (2-3 giờ)

**File tạo mới:** `fe/src/app/(public)/thiep/[slug]/live-display/page.tsx`

**Bố cục Stage Split Screen (Landscape 16:9):**

```
┌──────────────────────────────────────────────────────────┐
│  TOP BAR: Tên cặp đôi (Serif Gold) │ Live Clock │ Controls │
├────────────────────────────────────────┬─────────────────┤
│                                        │                 │
│         SPOTLIGHT STAGE (60%)          │  SIDE WALL (40%)│
│                                        │                 │
│   ┌──────────────────────────┐         │  ┌───┐ ┌───┐   │
│   │  Khung vàng ánh kim 3D   │         │  │ 📷│ │ 📷│   │
│   │                          │         │  └───┘ └───┘   │
│   │   [Ảnh / Lời chúc mới]  │         │  ┌───┐ ┌───┐   │
│   │                          │         │  │ 📷│ │ 📷│   │
│   │  "Tên Khách" — Lời chúc  │         │  └───┘ └───┘   │
│   └──────────────────────────┘         │  (Auto scroll)  │
│                                        │                 │
├────────────────────────────────────────┴─────────────────┤
│ 🔲 QR │ ❤️ Chúc mừng từ Anh Nam... │ Chị Linh gửi... │ 42 ảnh │
│  Code  │        WISHES TICKER MARQUEE (chạy chữ vô tận)         │
└──────────────────────────────────────────────────────────┘
```

**Chi tiết từng vùng:**

1. **Top Bar (auto-hide khi không di chuột):**
   - Tên cặp đôi: Font Serif gradient vàng (`Instrument Serif` đã có sẵn trong project).
   - Live Clock: `HH:mm:ss` chạy realtime.
   - Controls (hiện khi hover): Fullscreen (F11), Mute/Unmute SFX, Pause slide show, Tốc độ slide (4s/6s/10s).
   - Badge "● Trực tiếp" (xanh lá nhấp nháy khi SSE connected, vàng khi đang reconnect).

2. **Spotlight Stage (60% width):**
   - Hiển thị khoảnh khắc mới nhất (Memory hoặc Wish).
   - Khi nhận `NEW_MEMORY`: Ảnh phóng to bay vào từ dưới (Framer Motion: `y: 80 → 0, scale: 0.8 → 1`), khung viền gradient vàng glow (`box-shadow: 0 0 60px rgba(212,175,55,0.4)`), badge "Khoảnh Khắc Mới!" bounce.
   - Khi nhận `NEW_WISH`: Card lời chúc xuất hiện với icon emoji to, tên người gửi font Serif 3xl, nội dung lời chúc font italic 2xl, viền trái vàng.
   - Sau 8 giây: Fade out, tiếp tục auto slide show xoay vòng qua tất cả memories/wishes đã có.
   - **Burst debounce:** Nếu đang hiển thị Spotlight (8s), event mới được queue vào hàng đợi, hiện lần lượt. Confetti chỉ trigger khi confetti trước đã kết thúc.

3. **Side Memory Wall (40% width):**
   - Grid 2 cột các thẻ ảnh mini (thumbnail polaroid) cuộn tự động từ dưới lên, mỗi thẻ có tên người gửi.
   - Khi ảnh mới đến: thẻ mới trượt vào từ trên cùng, đẩy các thẻ cũ xuống.

4. **Bottom Ticker Bar:**
   - Góc trái: Mã QR (kích thước 80x80px, nền trắng, bo tròn) + text hướng dẫn "Quét mã tại bàn tiệc".
   - Giữa: CSS Marquee vô tận (`animation: scroll-left 30s linear infinite`) hiển thị lời chúc mới nhất với icon ❤️ phân cách.
   - Góc phải: Counter "42 ảnh kỷ niệm · 18 lời chúc".

**SSE Client Logic (tái sử dụng pattern từ trang /live hiện tại):**

```typescript
// Subscribe SSE — tái sử dụng endpoint hiện tại
const streamUrl = ApiClient.getMemoryStreamUrl(slug);
const es = new EventSource(streamUrl);

// Nhận ảnh photobooth mới
es.addEventListener("NEW_MEMORY", (e) => { /* → Spotlight + Side Wall */ });

// Nhận lời chúc chữ mới (event type mới từ Phase 1)
es.addEventListener("NEW_WISH", (e) => { /* → Spotlight + Ticker */ });

// Host ẩn/xóa ảnh không phù hợp
es.addEventListener("HIDE_MEMORY", (e) => { /* → Xóa khỏi Side Wall */ });
es.addEventListener("DELETE_MEMORY", (e) => { /* → Xóa khỏi Side Wall */ });

// SSE auto-reconnect: EventSource tự reconnect khi mất kết nối.
// Khi reconnect thành công, refetch toàn bộ memories + wishes
// để đồng bộ event bị miss trong lúc mất kết nối.
es.onerror = () => { setIsConnected(false); };
es.addEventListener("connected", () => {
  setIsConnected(true);
  refetchAll(); // GET /memories + GET /wishes để đồng bộ
});
```

**Hiệu ứng & Âm thanh:**
- **Confetti:** `canvas-confetti` (đã có trong project) — pháo hoa vàng/gold 120 hạt khi có event mới.
- **SFX:** Sparkle chime (file MP3 nhẹ ~15KB, load sẵn khi mount). Mặc định TẮT. User phải click nút "🔔 Bật Âm Thanh" để kích hoạt (tuân thủ Chrome Autoplay Policy).
- **Nhạc nền:** Không có. Tránh xung đột với hệ thống âm thanh nhà hàng.

**Nạp dữ liệu ban đầu (Bootstrap):**
Khi trang load lần đầu, gọi 2 API song song:
1. `GET /api/cards/:slug/memories` (top 50 ảnh, endpoint đã có).
2. `GET /api/wishes/:cardId` (top 30 lời chúc, endpoint đã có).
→ Màn hình ngay lập tức đầy nội dung, không bị rỗng trắng.

### Phase 3: Dashboard — Nút mở LED + Redirect trang cũ (30 phút)

**File:** `fe/src/app/(dashboard)/dashboard/cards/[cardId]/memories/page.tsx`
- Thêm nút nổi bật "🖥️ Mở Màn Hình LED Sảnh Tiệc" → `window.open("/thiep/{slug}/live-display", "_blank")`.
- Thêm nút "📋 Sao chép link LED" → Copy URL vào clipboard.

**File:** `fe/src/app/(public)/thiep/[slug]/live/page.tsx`
- Thay toàn bộ nội dung bằng Next.js `redirect("/thiep/${slug}/live-display")` (HTTP 308 permanent redirect).

---

## Key Decisions

| # | Quyết định | Lý do | Phương án bị loại |
|---|-----------|-------|-------------------|
| 1 | **Giữ nguyên channel `wedding:memories:${cardId}`**, không tạo channel mới | Trang `/live` cũ, tests, và 5 publisher sites đang dùng channel này. Đổi tên = gãy hệ thống. Client phân biệt bằng `event` name. | Tạo channel `wedding:live:${cardId}` riêng — rủi ro cao, zero benefit. |
| 2 | **Tái sử dụng SSE endpoint `/memories/stream`**, không tạo route mới | Endpoint hiện tại forward mọi event từ channel. Thêm `NEW_WISH` vào channel = tự động hoạt động. Ít code hơn. | Tạo `/live-stream` endpoint mới — code trùng lặp. |
| 3 | **Defer `GUEST_CHECKIN`** sang phase sau | Feature check-in hoàn toàn chưa tồn tại (0 code trong codebase). Cần endpoint mới, tracking logic, UI. Quá lớn cho sprint này. | Xây ngay — scope creep. |
| 4 | **Defer moderation mode** sang phase sau | Cần schema change + pending queue UI. Host đã có nút ẩn/xóa 1-chạm tức thì trên Dashboard — đủ an toàn cho V1. | Xây ngay — scope creep. |
| 5 | **Profanity filter sẵn có** bảo vệ LED khỏi nội dung xấu | `containsProfanity()` tại wish.service.ts:50-54 set `isApproved = false`. Chỉ publish `NEW_WISH` khi approved. | Xây content moderation AI — YAGNI. |

---

## Files to Modify

### Backend (1 file sửa, ~10 dòng mới)

| File | Thay đổi |
|------|----------|
| `be/src/services/wish.service.ts` | Thêm `redis.publish()` sau `prisma.wish.create()` khi `isApproved === true`. Import `redis`, `logger`. |

### Frontend (3 files)

| File | Thay đổi |
|------|----------|
| `fe/src/app/(public)/thiep/[slug]/live-display/page.tsx` | **[TẠO MỚI]** Toàn bộ giao diện Stage Split Screen VIP. ~400-500 dòng. |
| `fe/src/app/(public)/thiep/[slug]/live/page.tsx` | Thay nội dung bằng Next.js `redirect()` sang `/live-display`. ~5 dòng. |
| `fe/src/app/(dashboard)/dashboard/cards/[cardId]/memories/page.tsx` | Thêm 2 nút: "Mở Màn Hình LED" + "Sao chép link". ~20 dòng. |

---

## Out of Scope

| Tính năng | Lý do không làm |
|-----------|-----------------|
| `GUEST_CHECKIN` event & UI điểm danh | Chưa tồn tại trong codebase. Cần thiết kế từ đầu. Tách plan riêng. |
| Chế độ Moderation (kiểm duyệt trước khi lên LED) | Cần schema change + pending queue UI. Host đã có nút ẩn/xóa 1-chạm → đủ cho V1. |
| Mini-game Lucky Draw | Feature mới hoàn toàn, không liên quan đến core LED display. |
| Nhạc nền tự động phát | Xung đột âm thanh nhà hàng. Chỉ giữ SFX chime. |
| Route backend `/live-stream` mới | Không cần — endpoint SSE hiện tại đã đủ. |

---

## Risks & Mitigations

| Rủi ro | Mức độ | Blast Radius | Mitigation |
|--------|--------|-------------|------------|
| **SSE miss events khi mất mạng tạm thời** | Trung bình | LED thiếu 1-2 ảnh/lời chúc | Khi SSE reconnect (event `connected`), gọi lại `GET /memories` + `GET /wishes` để đồng bộ full state. |
| **Burst 50+ ảnh cùng lúc** | Thấp | Confetti + SFX chồng chéo | Debounce: nếu highlight đang hiện (8s), queue event mới, hiển thị lần lượt. Confetti không trigger chồng. |
| **Ảnh nhạy cảm bay lên LED trước 500 khách** | Trung bình | Xấu hổ cho cặp đôi | Layer 1: Profanity filter tự động. Layer 2: Host bấm ẩn 1-chạm trên Dashboard (< 2s). Layer 3: Phase sau thêm moderation mode. |
| **Redirect `/live` → `/live-display` gãy link cũ** | Thấp | User bị redirect | HTTP 308 permanent redirect — browser tự chuyển hướng. |
| **QR nhỏ trên LED lớn, khách xa không quét được** | Thấp | Khách không gửi được ảnh | QR 80x80px (~15-20cm trên LED 55"). Đủ cho 3-5m. Sảnh lớn hơn: in QR riêng đặt bàn. |
| **Chrome chặn Web Audio autoplay** | Cao | Không nghe SFX | SFX mặc định TẮT. Nút "🔔 Bật Âm Thanh" rõ ràng. 1 click = unlock Web Audio. |

**Rollout strategy:** URL riêng `/live-display`, không ảnh hưởng trang khác. Không cần feature flag.

---

## Assumptions

| # | Giả định | Trạng thái | Invalidation criteria |
|---|----------|------------|----------------------|
| 1 | Redis Pub/Sub ổn định cho long-lived SSE trên production | ✅ Verified — đã hoạt động cho trang `/live` hiện tại | SSE ngắt > 3 lần/phút → cần polling fallback |
| 2 | `EventSource` tự reconnect khi mất kết nối | ✅ Verified — W3C spec, mọi browser hiện đại hỗ trợ | Browser trên máy LED quá cũ (IE11) → cần polyfill |
| 3 | Profanity filter đủ chặn nội dung xấu | ✅ Verified — `containsProfanity()` tại wish.service.ts:50-54 | Tiếng lóng mới chưa cover → cập nhật từ điển |
| 4 | Supabase connection pool đủ cho burst ~200 users | ⚠️ Unverified — cần kiểm tra Supabase plan | Connection pool exhausted → nâng plan hoặc thêm `connection_limit` |
| 5 | `canvas-confetti` + `framer-motion` có trong `fe/package.json` | ✅ Verified — trang `/live` đang dùng cả hai | N/A |
| 6 | API `api.qrserver.com` khả dụng khi tiệc cưới | ⚠️ Low risk — external dependency | API down → QR không hiện. Fallback: inline SVG generator |

---

## Verification

| # | Hành động | Kết quả mong đợi |
|---|----------|-----------------|
| 1 | **Tracer bullet:** Sửa `wish.service.ts`, mở `/live-display`, gửi 1 lời chúc từ tab khác | Lời chúc bay lên Spotlight trong < 1s kèm confetti vàng. |
| 2 | Mở `/live-display` khi DB có 10 ảnh + 5 lời chúc | Spotlight chiếu ảnh đầu, Side Wall 10 ảnh, Ticker chạy 5 lời chúc. QR đúng link. |
| 3 | Nhấn F11 hoặc nút Fullscreen | Tràn viền 16:9, không scrollbar, không address bar. |
| 4 | Gửi 3 ảnh liên tiếp trong 5 giây | Ảnh 1 Spotlight 8s. Ảnh 2+3 queue, hiện lần lượt. Confetti không chồng. |
| 5 | Ngắt mạng 10s rồi bật lại | Badge vàng "Đang kết nối...". Reconnect → badge xanh + refetch đồng bộ. |
| 6 | Mở `/thiep/test-slug/live` (URL cũ) | Redirect 308 sang `/live-display` tức thì. |
| 7 | Host bấm "Ẩn" trên Dashboard memories | Ảnh biến mất khỏi Side Wall < 1s (SSE `HIDE_MEMORY`). |
| 8 | Gửi lời chúc chứa từ cấm | `isApproved = false`. Không xuất hiện trên LED. |
| 9 | Redis chết, gửi lời chúc mới | Lời chúc lưu DB thành công. LED không nhận realtime. Backend log warning, không crash. |
| 10 | Mở `/live-display` với slug không tồn tại | Hiển thị "Không tìm thấy thiệp", không trang trắng. |

---

## STOP Conditions

Nếu bất kỳ điều kiện nào dưới đây xảy ra khi implement, **dừng lại và báo cáo**:

1. `canvas-confetti` hoặc `framer-motion` không có trong `fe/package.json`.
2. SSE endpoint không forward event `NEW_WISH` dù đã publish đúng channel → Controller có thể filter event types.
3. `wish.service.ts` đã bị refactor khác với snapshot trong plan.
4. Supabase/Redis `.env` không hoạt động → Fix infra trước khi test SSE.
