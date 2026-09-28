import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../lib/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

function getGenAI(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  return Boolean(key && key.trim() !== '');
}

/**
 * Sinh vector embedding từ text sử dụng mô hình gemini-embedding-001
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getGenAI();
  if (!ai) {
    logger.warn('GEMINI_API_KEY is not configured. Falling back to zero-vector embedding.');
    return new Array(768).fill(0);
  }

  try {
    const embeddingModel = ai.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    logger.error({ error }, 'Failed to generate embedding with Gemini API');
    return new Array(768).fill(0);
  }
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RagContextArticle {
  title: string;
  category: string;
  content: string;
  metadata?: any;
}

export interface ChatAnswerResult {
  answer: string;
  extractedLead?: {
    name?: string;
    phone?: string;
    demand?: string;
  };
}

/**
 * Tạo câu trả lời tư vấn khách hàng kết hợp RAG Context
 */
export async function generateChatAnswer(params: {
  userMessage: string;
  contextArticles: RagContextArticle[];
  history: ChatHistoryMessage[];
}): Promise<ChatAnswerResult> {
  const { userMessage, contextArticles, history } = params;

  // Trích xuất SĐT dự phòng bằng regex tiếng Việt (10 số: 03, 05, 07, 08, 09 hoặc +84)
  const phoneRegex = /(?:\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}\b/g;
  const phoneMatches = userMessage.match(phoneRegex);
  const detectedPhone = phoneMatches ? phoneMatches[0] : undefined;

  const ai = getGenAI();
  if (!ai) {
    // Fallback thông minh khi chưa có API Key
    const fallbackAnswer = generateRuleBasedAnswer(userMessage, contextArticles, detectedPhone);
    return {
      answer: fallbackAnswer,
      extractedLead: detectedPhone ? { phone: detectedPhone, demand: userMessage } : undefined,
    };
  }

  try {
    const contextFormatted = contextArticles.length > 0
      ? contextArticles.map((art, idx) => `[Tài liệu ${idx + 1}: ${art.title} (${art.category})]\n${art.content}`).join('\n\n---\n\n')
      : 'Không có tài liệu bổ sung trực tiếp.';

    const systemInstruction = `
Bạn là "Trợ lý AI Tư vấn Cao Cấp" của nền tảng thiệp cưới điện tử WebsiteThiep.
Mục tiêu của bạn:
1. Tư vấn chi tiết, thân thiện, lịch thiệp và sang trọng cho cô dâu chú rể hoặc khách hàng muốn làm thiệp cưới / sinh nhật / thôi nôi.
2. Trả lời CHÍNH XÁC dựa trên tài liệu NGỮ CẢNH RAG được cung cấp bên dưới. Không bịa đặt thông tin không có trong tài liệu.
3. Nếu tài liệu có nhắc đến bảng giá hoặc gói cước:
   - Gói FREE (0đ): Trải nghiệm đầy đủ tính năng cơ bản, tạo thiệp trong 2 phút.
   - Gói BASIC (199.000đ): Thiệp chuyên nghiệp, hiệu ứng mở nắp sáp Wax Seal, nhạc nền du dương, đếm ngược, bản đồ Maps.
   - Gói VIP (399.000đ trọn đời): Đầy đủ tính năng cao cấp nhất, Hộp mừng cưới quét mã VietQR động tự động nhận tiền, Sổ lưu bút ảnh (Live Photobooth), Xác nhận tham dự (RSVP) bắn thông báo về Telegram tức thì.
4. Điều hướng khéo léo để khách hàng xem các mẫu thiệp hoặc để lại Số điện thoại/Zalo để đội ngũ chuyên viên hỗ trợ thiết kế theo yêu cầu riêng.
5. Nếu khách hàng để lại Số điện thoại hoặc Zalo, hãy xác nhận ngay rằng: "Đội ngũ chuyên viên tư vấn sẽ liên hệ qua Zalo/SĐT [số điện thoại] của bạn trong ít phút để gửi mẫu chi tiết và hỗ trợ nhé!"
6. Định dạng câu trả lời rõ ràng bằng Markdown (dùng bullet point, bôi đậm ý quan trọng, chèn icon tinh tế như 💌, 💍, 🌸, ⚡).
7. Cuối câu trả lời, nếu khách để lại thông tin liên hệ, hãy xuất thêm một dòng ẩn định dạng JSON dạng:
<!-- LEAD_JSON: {"name": "...", "phone": "...", "demand": "..."} -->
`;

    // Chuyển đổi history sang format của Gemini SDK
    const geminiHistory = history.map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    }));

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    let rawAnswer = '';

    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
      const modelName = modelsToTry[attempt];
      try {
        const model = ai.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        });

        const chat = model.startChat({
          history: geminiHistory,
        });

        const promptWithContext = `
NGỮ CẢNH TÀI LIỆU RAG NỘI BỘ:
${contextFormatted}

CÂU HỎI / TIN NHẮN TỪ KHÁCH HÀNG:
"${userMessage}"
`;

        const response = await chat.sendMessage(promptWithContext);
        rawAnswer = response.response.text();
        if (rawAnswer) break;
      } catch (err: any) {
        logger.warn({ modelName, attempt, err: err?.message }, 'Gemini model attempt failed');
        if (attempt < modelsToTry.length - 1) {
          // Nghỉ 800ms để tránh spike demand rate-limit từ Google Free Tier
          await new Promise((res) => setTimeout(res, 800));
        }
      }
    }

    if (!rawAnswer) {
      throw new Error('All Gemini model attempts failed');
    }

    // Phân tích xem có tag LEAD_JSON không
    let extractedLead: ChatAnswerResult['extractedLead'] = detectedPhone
      ? { phone: detectedPhone, demand: userMessage }
      : undefined;

    const leadJsonMatch = rawAnswer.match(/<!-- LEAD_JSON:\s*({.*?})\s*-->/s);
    let cleanedAnswer = rawAnswer;

    if (leadJsonMatch && leadJsonMatch[1]) {
      try {
        const parsed = JSON.parse(leadJsonMatch[1]);
        extractedLead = {
          name: parsed.name || undefined,
          phone: parsed.phone || detectedPhone,
          demand: parsed.demand || userMessage,
        };
        // Xóa block comment khỏi tin nhắn hiển thị cho khách
        cleanedAnswer = rawAnswer.replace(/<!-- LEAD_JSON:\s*{.*?}\s*-->/s, '').trim();
      } catch {
        // bỏ qua nếu parse lỗi
      }
    }

    return {
      answer: cleanedAnswer,
      extractedLead,
    };
  } catch (error) {
    logger.error({ error }, 'Gemini generateChatAnswer failed');
    return {
      answer: generateRuleBasedAnswer(userMessage, contextArticles, detectedPhone),
      extractedLead: detectedPhone ? { phone: detectedPhone, demand: userMessage } : undefined,
    };
  }
}

/**
 * Trả lời bằng quy tắc nội bộ khi chưa cấu hình GEMINI_API_KEY hoặc khi API bận
 */
function generateRuleBasedAnswer(
  query: string,
  contextArticles: RagContextArticle[],
  phone?: string
): string {
  const lower = query.toLowerCase();

  if (phone) {
    return `💌 **Cảm ơn bạn đã để lại thông tin liên hệ!**\n\nChuyên viên tư vấn của WebsiteThiep đã ghi nhận số điện thoại/Zalo **${phone}** và sẽ liên hệ hỗ trợ bạn trong ít phút để gửi mẫu thiệp chi tiết và báo giá ưu đãi nhé! ✨`;
  }

  if (lower.includes('giá') || lower.includes('bảng giá') || lower.includes('chi phí') || lower.includes('bao nhiêu')) {
    return `💍 **Bảng Giá Gói Thiệp Điện Tử WebsiteThiep:**\n\n` +
      `1. **Gói FREE (0đ):** Trải nghiệm đầy đủ tính năng tạo thiệp, xem trước trên di động, hỗ trợ tạo nhanh trong 2 phút.\n` +
      `2. **Gói BASIC (199.000đ):** Sử dụng trọn đời, mở nắp sáp Wax Seal, phát nhạc nền du dương, đồng hồ đếm ngược ngày cưới, chỉ đường bản đồ.\n` +
      `3. **Gói VIP (399.000đ - Đầy đủ nhất):** Hộp mừng cưới quét mã VietQR động tự động điền tiền, Sổ lưu bút ảnh (Live Photobooth), Nhận thông báo khách RSVP trực tiếp về Telegram cá nhân.\n\n` +
      `⚡ *Thanh toán tự động qua SePay VietQR kích hoạt gói chỉ trong 3-5 giây!* Bạn có thể chọn bất kỳ mẫu nào trên website để bắt đầu thiết kế ngay nhé!`;
  }

  if (lower.includes('mẫu') || lower.includes('demo') || lower.includes('giao diện')) {
    return `💌 **Các Mẫu Thiệp Cưới Nổi Bật Hiện Có:**\n\n` +
      `- **Mẫu 1: Royal Gold (Hoàng gia sang trọng):** Viền kim loại ánh vàng, phong cách hoàng gia quý phái.\n` +
      `- **Mẫu 2: Minimalist Modern (Tối giản thanh lịch):** Thiết kế hiện đại, typography Instrument Serif tinh tế.\n` +
      `- **Mẫu 3: Floral Romantic (Lãng mạn hoa tươi):** Tone hồng pastel nhẹ nhàng với hiệu ứng cánh hoa rơi.\n` +
      `- **Mẫu 4: Vintage Classic (Cổ điển hoài niệm):** Tone giấy kraft cổ điển ấm áp.\n` +
      `- **Mẫu 5: Luxury Monogram:** Khắc chữ cái lồng nghệ thuật của dâu rể.\n\n` +
      `Bạn có thể bấm vào mục **"Khám phá mẫu thiệp"** trên trang chủ để trải nghiệm trực tiếp!`;
  }

  if (contextArticles.length > 0) {
    const top = contextArticles[0];
    return `💌 **Thông tin tư vấn từ WebsiteThiep:**\n\n${top.content}\n\n*Nếu bạn có thêm câu hỏi hoặc muốn thiết kế mẫu riêng, hãy để lại số điện thoại/Zalo để chuyên viên liên hệ hỗ trợ ngay nhé!*`;
  }

  return `Chào bạn! Tôi là Trợ lý AI của **WebsiteThiep** 💌.\n\nTôi có thể giúp bạn:\n` +
    `- 💎 Tư vấn các gói thiệp: **FREE (0đ)**, **BASIC (199k)**, **VIP (399k)**\n` +
    `- 🌸 Khám phá các mẫu thiệp cưới, sinh nhật, thôi nôi đẹp nhất\n` +
    `- ⚡ Hướng dẫn tạo thiệp, cài nhạc nền, quét mã VietQR nhận tiền mừng cưới\n` +
    `- 📱 Kết nối chuyên viên thiết kế theo yêu cầu riêng\n\n` +
    `Bạn muốn tìm hiểu về phần nào, hãy nhắn cho tôi biết nhé!`;
}
