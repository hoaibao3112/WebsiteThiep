import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_TIMEOUT_MS = 15_000;

function getGenAI(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!key || !key.trim()) return null;
  return new GoogleGenerativeAI(key);
}

export interface TranslatedWeddingData {
  en: Record<string, unknown>;
  zh: Record<string, unknown>;
}

export class AiTranslateService {
  /**
   * Dịch dữ liệu văn bản tự do của thiệp cưới sang tiếng Anh (en) và tiếng Trung (zh).
   * Tuyệt đối không dịch tên riêng (chú rể, cô dâu, bố mẹ).
   */
  static async translateWeddingData(categoryData: Record<string, unknown>): Promise<TranslatedWeddingData> {
    const ai = getGenAI();
    if (!ai) {
      logger.info("GEMINI_API_KEY is not configured. Returning empty AI translations.");
      return { en: {}, zh: {} };
    }

    // Trích xuất các trường văn bản cần dịch
    const groomData = (categoryData.groom as Record<string, unknown>) || {};
    const brideData = (categoryData.bride as Record<string, unknown>) || {};
    const dressCodeData = (categoryData.dressCode as Record<string, unknown>) || {};
    const weddingPassData = (categoryData.weddingPass as Record<string, unknown>) || {};

    const contentToTranslate = {
      heroSubtitle: typeof categoryData.heroSubtitle === "string" ? categoryData.heroSubtitle : "",
      headerSubtitle: typeof categoryData.headerSubtitle === "string" ? categoryData.headerSubtitle : "",
      invitationTitle: typeof categoryData.invitationTitle === "string" ? categoryData.invitationTitle : "",
      greeting: typeof categoryData.greeting === "string" ? categoryData.greeting : "",
      groomStory: typeof groomData.story === "string" ? groomData.story : "",
      brideStory: typeof brideData.story === "string" ? brideData.story : "",
      loveStory: Array.isArray(categoryData.loveStory)
        ? categoryData.loveStory.map((m: Record<string, unknown>) => ({
            title: typeof m.title === "string" ? m.title : "",
            description: typeof m.description === "string" ? m.description : "",
          }))
        : [],
      timelineEvents: Array.isArray(categoryData.timelineEvents)
        ? categoryData.timelineEvents.map((t: Record<string, unknown>) => ({
            time: typeof t.time === "string" ? t.time : "",
            title: typeof t.title === "string" ? t.title : "",
          }))
        : [],
      dressCode: categoryData.dressCode
        ? {
            title: typeof dressCodeData.title === "string" ? dressCodeData.title : "",
            description: typeof dressCodeData.description === "string" ? dressCodeData.description : "",
            note: typeof dressCodeData.note === "string" ? dressCodeData.note : "",
          }
        : undefined,
      weddingPass: categoryData.weddingPass
        ? {
            title: typeof weddingPassData.title === "string" ? weddingPassData.title : "",
            departing: typeof weddingPassData.departing === "string" ? weddingPassData.departing : "",
            arriving: typeof weddingPassData.arriving === "string" ? weddingPassData.arriving : "",
            note: typeof weddingPassData.note === "string" ? weddingPassData.note : "",
          }
        : undefined,
      events: Array.isArray(categoryData.events)
        ? categoryData.events.map((e: Record<string, unknown>) => ({
            eventName: typeof e.eventName === "string" ? e.eventName : "",
            venueName: typeof e.venueName === "string" ? e.venueName : "",
            address: typeof e.address === "string" ? e.address : "",
            note: typeof e.note === "string" ? e.note : "",
          }))
        : [],
    };

    const hasContent = Boolean(
      contentToTranslate.greeting ||
      contentToTranslate.heroSubtitle ||
      contentToTranslate.headerSubtitle ||
      contentToTranslate.invitationTitle ||
      contentToTranslate.groomStory ||
      contentToTranslate.brideStory ||
      contentToTranslate.loveStory.length > 0 ||
      contentToTranslate.timelineEvents.length > 0 ||
      contentToTranslate.events.length > 0
    );

    if (!hasContent) {
      return { en: {}, zh: {} };
    }

    const prompt = `You are a professional wedding translator. Translate the provided Vietnamese wedding invitation texts into English ("en") and Simplified Chinese ("zh").

CRITICAL REQUIREMENTS:
1. NEVER translate personal proper names (Groom, Bride, Parents, Guests). Keep personal names unaltered.
2. Tone & Style:
   - English ("en"): Romantic, elegant, heartfelt wedding invitation diction.
   - Chinese ("zh"): Culturally graceful, auspicious, and formal wedding invitation phrasing (良辰吉日, 喜宴, 嘉礼, 典礼, etc.).
3. Standard ceremony terms:
   - "LỄ THÀNH HÔN" -> en: "WEDDING CEREMONY" / zh: "结婚典礼"
   - "LỄ VU QUY" -> en: "BRIDE'S FAREWELL CEREMONY" / zh: "出阁之喜"
   - "LỄ TÂN HÔN" -> en: "GROOM'S WELCOMING CEREMONY" / zh: "迎亲之喜"
   - "TIỆC CƯỚI" / "TIỆC RƯỢU" -> en: "WEDDING RECEPTION" / zh: "新婚喜宴"
   - "Tư gia" -> en: "Private Residence" / zh: "府邸"
4. Output MUST BE strictly a single raw JSON object matching this structure (no conversational markdown or preamble):
{
  "en": {
    "heroSubtitle": "...",
    "headerSubtitle": "...",
    "invitationTitle": "...",
    "greeting": "...",
    "groomStory": "...",
    "brideStory": "...",
    "loveStory": [{"title": "...", "description": "..."}],
    "timelineEvents": [{"time": "...", "title": "..."}],
    "dressCode": {"title": "...", "description": "...", "note": "..."},
    "weddingPass": {"title": "...", "departing": "...", "arriving": "...", "note": "..."},
    "events": [{"eventName": "...", "venueName": "...", "address": "...", "note": "..."}]
  },
  "zh": {
    "heroSubtitle": "...",
    "headerSubtitle": "...",
    "invitationTitle": "...",
    "greeting": "...",
    "groomStory": "...",
    "brideStory": "...",
    "loveStory": [{"title": "...", "description": "..."}],
    "timelineEvents": [{"time": "...", "title": "..."}],
    "dressCode": {"title": "...", "description": "...", "note": "..."},
    "weddingPass": {"title": "...", "departing": "...", "arriving": "...", "note": "..."},
    "events": [{"eventName": "...", "venueName": "...", "address": "...", "note": "..."}]
  }
}

Here is the JSON payload to translate:
${JSON.stringify(contentToTranslate, null, 2)}`;

    const modelsToTry = ["gemini-2.5-flash", "gemini-flash-latest"];
    for (const modelName of modelsToTry) {
      try {
        const model = ai.getGenerativeModel(
          {
            model: modelName,
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          },
          { timeout: GEMINI_TIMEOUT_MS }
        );

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Không tìm thấy JSON object trong phản hồi từ Gemini");
        }
        const parsed = JSON.parse(jsonMatch[0]) as { en?: Record<string, unknown>; zh?: Record<string, unknown> };

        if (parsed && (parsed.en || parsed.zh)) {
          return {
            en: parsed.en || {},
            zh: parsed.zh || {},
          };
        }
      } catch (err: unknown) {
        logger.warn({ err, modelName }, "Gemini translation attempt failed, trying fallback model");
      }
    }

    return { en: {}, zh: {} };
  }

  /**
   * Dịch và lưu cache vào card.categoryData.translations
   */
  static async translateAndSaveCard(accountId: string, cardId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      include: {
        events: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!card) {
      throw new Error("Không tìm thấy thiệp cưới để dịch");
    }

    const categoryData = (card.categoryData as Record<string, unknown>) || {};
    
    // Nếu categoryData.events trống, bổ sung từ danh sách sự kiện card.events
    if (!Array.isArray(categoryData.events) || categoryData.events.length === 0) {
      if (card.events && card.events.length > 0) {
        categoryData.events = card.events.map((e) => ({
          eventName: e.eventName,
          venueName: e.venueName,
          address: e.address,
          lunarDate: e.lunarDate,
        }));
      }
    }

    const translations = await this.translateWeddingData(categoryData);

    // Nếu không có bản dịch nào được tạo (ví dụ API key chưa cấu hình), không cần update database
    if (Object.keys(translations.en).length === 0 && Object.keys(translations.zh).length === 0) {
      return card;
    }

    const existingTranslations = (categoryData.translations as Record<string, unknown>) || {};
    const updatedCategoryData = {
      ...categoryData,
      translations: {
        ...existingTranslations,
        en: { ...((existingTranslations.en as Record<string, unknown>) || {}), ...translations.en },
        zh: { ...((existingTranslations.zh as Record<string, unknown>) || {}), ...translations.zh },
        updatedAt: new Date().toISOString(),
      },
    };

    // Cập nhật categoryData qua raw SQL để KHÔNG kích hoạt @updatedAt của Prisma trên Card,
    // giúp bảo toàn optimistic concurrency lock (tránh lỗi 409 CARD_VERSION_CONFLICT của người dùng)
    await prisma.$executeRaw`
      UPDATE "cards"
      SET "categoryData" = ${JSON.stringify(updatedCategoryData)}::jsonb
      WHERE "id" = ${cardId} AND "accountId" = ${accountId}
    `;

    return {
      ...card,
      categoryData: updatedCategoryData,
    };
  }
}
