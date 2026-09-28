# KẾ HOẠCH TRIỂN KHAI: AI RAG TỰ ĐỘNG TƯ VẤN KHÁCH HÀNG

- **Ngày lập:** 2026-09-28
- **Mục tiêu:** Xây dựng trọn vẹn luồng RAG tư vấn khách hàng tự động sử dụng Google Gemini (`gemini-1.5-flash` + `text-embedding-004`), PostgreSQL Supabase, Express.js Backend và Next.js 15 Frontend Chatbot Widget.

---

## GIAI ĐOẠN 1: BACKEND DATABASE & PACKAGES SETUP
- [ ] **Bước 1.1:** Cài đặt package `@google/genai` hoặc `@google/generative-ai` trong `be/`.
- [ ] **Bước 1.2:** Cập nhật `be/prisma/schema.prisma` với 3 bảng:
  - `AiKnowledgeArticle`: Lưu bài viết kiến thức, category, tags, embedding vector.
  - `AiChatSession` & `AiChatMessage`: Lưu lịch sử hội thoại khách hàng.
  - `AiLead`: Lưu thông tin khách hàng tiềm năng (SĐT, Họ tên, Nhu cầu).
- [ ] **Bước 1.3:** Chạy `npx prisma db push` hoặc migration để đồng bộ lên Supabase Database và generate Prisma Client.

---

## GIAI ĐOẠN 2: BACKEND AI RAG SERVICES & APIS
- [ ] **Bước 2.1:** Viết `be/src/services/gemini.service.ts`:
  - Khởi tạo Gemini client từ `GEMINI_API_KEY`.
  - Hàm `generateEmbedding(text: string): Promise<number[]>` bằng `text-embedding-004`.
  - Hàm `generateChatAnswer(...)` với system prompt tư vấn bán hàng chuyên nghiệp, thân thiện, điều hướng chốt sale và link xem thiệp.
- [ ] **Bước 2.2:** Viết `be/src/services/rag.service.ts`:
  - Cosine similarity vector search trên các articles.
  - Regex / LLM parser nhận diện SĐT khách hàng (Lead Capture).
  - Tích hợp gửi thông báo Telegram cho Admin khi có Lead mới (dùng sẵn Telegram config của shop).
- [ ] **Bước 2.3:** Viết kịch bản Seed dữ liệu kiến thức (`be/prisma/seed_ai_knowledge.ts`):
  - Bảng giá gói cước FREE / BASIC / VIP.
  - Các tính năng đặc sắc: RSVP, VietQR động, thiệp đa danh mục, nhạc nền, bản đồ, đếm ngược.
  - Danh sách 5 mẫu thiệp có sẵn và đường link demo thực tế.
  - Quy trình thanh toán và chính sách bảo hành.
- [ ] **Bước 2.4:** Viết Controller & Route (`be/src/controllers/ai.controller.ts`, `be/src/routes/ai.routes.ts`):
  - `POST /api/ai/chat` (nhận `message`, `sessionId`).
  - `GET /api/ai/leads` (cho dashboard).
  - `POST /api/ai/seed` (endpoint tiện lợi để admin re-index tri thức).
  - Đăng ký route vào `be/src/server.ts`.

---

## GIAI ĐOẠN 3: FRONTEND AI CONSULTANT CHAT WIDGET
- [ ] **Bước 3.1:** Viết Component `fe/src/components/ai/AiConsultantWidget.tsx`:
  - Nút tròn nổi phong cách **Liquid Glass** ở góc phải dưới kèm hiệu ứng rung nhẹ/badge *"AI Tư Vấn"*.
  - Khung chat mở ra với thiết kế cao cấp, bo góc mượt mà, dark/light glow.
  - Quick Suggestion Pills: *"Bảng giá gói VIP"*, *"Xem mẫu thiệp cưới hot"*, *"Hướng dẫn thanh toán"*, *"Tư vấn qua Zalo"*.
  - Tin nhắn Markdown rendering, format link clickable, hiển thị Card mẫu thiệp nếu AI gợi ý.
  - Trạng thái gõ chữ (typing indicator), xử lý lỗi mượt mà khi mất mạng.
- [ ] **Bước 3.2:** Tích hợp `AiConsultantWidget` vào `fe/src/app/layout.tsx`.

---

## GIAI ĐOẠN 4: KIỂM THỬ & HOÀN THIỆN
- [ ] **Bước 4.1:** Seed thử dữ liệu tri thức vào database và kiểm tra vector similarity search.
- [ ] **Bước 4.2:** Viết test kiểm tra luồng API chat và trích xuất Lead.
- [ ] **Bước 4.3:** Review code, đảm bảo tuân thủ TypeScript strict, không dùng `any`, xử lý lỗi đầy đủ.
