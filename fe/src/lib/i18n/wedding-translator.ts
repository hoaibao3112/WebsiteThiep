import { SupportedLanguage, DICTIONARY } from "@/config/i18n";
import type { CardDetail, WeddingDataPayload, EventItem } from "@/types/card.types";

/**
 * Bảng tra cứu chuẩn hóa vai vế & thứ bậc gia đình
 */
const BIRTH_ORDER_MAP: Record<string, { en: string; zh: string }> = {
  "trưởng nam": { en: "Eldest Son", zh: "长子" },
  "trưởng tử": { en: "Eldest Son", zh: "长子" },
  "thứ nam": { en: "Second Son", zh: "次子" },
  "thứ tử": { en: "Second Son", zh: "次子" },
  "út nam": { en: "Youngest Son", zh: "幼子" },
  "nam út": { en: "Youngest Son", zh: "幼子" },
  "trưởng nữ": { en: "Eldest Daughter", zh: "长女" },
  "thứ nữ": { en: "Second Daughter", zh: "次女" },
  "út nữ": { en: "Youngest Daughter", zh: "幼女" },
  "nữ út": { en: "Youngest Daughter", zh: "幼女" },
  "con một": { en: "Only Child", zh: "独生子女" },
  "ái nữ": { en: "Beloved Daughter", zh: "爱女" },
  "quý tử": { en: "Beloved Son", zh: "贵子" },
};

/**
 * Bảng tra cứu tên các nghi thức / sự kiện hôn lễ
 */
const EVENT_NAME_MAP: Record<string, { en: string; zh: string }> = {
  "lễ thành hôn": { en: "Wedding Ceremony", zh: "结婚典礼" },
  "tiệc cưới": { en: "Wedding Banquet", zh: "新婚喜宴" },
  "lễ vu quy": { en: "Bride's Send-off Ceremony", zh: "出阁之礼" },
  "lễ tân hôn": { en: "Groom's Welcome Ceremony", zh: "迎亲之礼" },
  "lễ báo hỷ": { en: "Wedding Celebration Banquet", zh: "答谢喜宴" },
  "lễ đính hôn": { en: "Engagement Ceremony", zh: "订婚仪式" },
  "lễ ăn hỏi": { en: "Betrothal Ceremony", zh: "过聘大礼" },
  "lễ rước dâu": { en: "Bridal Procession", zh: "迎亲迎娶之礼" },
  "hôn lễ": { en: "Wedding Ceremony", zh: "结婚典礼" },
};

/**
 * Bảng tra cứu loại địa điểm
 */
const VENUE_NAME_MAP: Record<string, { en: string; zh: string }> = {
  "tư gia": { en: "Private Residence", zh: "府邸" },
  "tư gia nhà trai": { en: "Groom's Family Residence", zh: "男方府邸" },
  "tư gia nhà gái": { en: "Bride's Family Residence", zh: "女方府邸" },
  "trung tâm tiệc cưới": { en: "Wedding Convention Center", zh: "婚礼宴会中心" },
  "khách sạn": { en: "Hotel & Resort", zh: "酒店宴会厅" },
};

/**
 * Bảng tra cứu câu châm ngôn & lời chúc cưới kinh điển
 */
const QUOTES_MAP: Record<string, { en: string; zh: string }> = {
  "trăm năm tình viên mãn": {
    en: "A hundred years of harmonious love, together through silver hair.",
    zh: "百年好合，白头偕老。愿得一心人，白首不相离。",
  },
  "tình yêu không phải là nhìn nhau": {
    en: "Love does not consist of gazing at each other, but in looking outward together in the same direction.",
    zh: "爱不是相互凝望，而是一起注视同一个方向。携手共度，此生不渝。",
  },
  "trân trọng kính mời": {
    en: "Cordially invite you to celebrate this joyous and memorable day with our families.",
    zh: "诚挚邀请您携同至亲好友出席，共同见证我们的婚礼喜悦与幸福时刻。",
  },
};

/**
 * Dịch vai vế / thứ bậc (VD: Trưởng nam -> Eldest Son / 长子)
 */
export function translateWeddingRole(role: string | null | undefined, lang: SupportedLanguage): string {
  if (!role || !role.trim()) return "";
  if (lang === "vi") return role;

  const key = role.trim().toLowerCase();
  for (const [pattern, trans] of Object.entries(BIRTH_ORDER_MAP)) {
    if (key.includes(pattern)) {
      return trans[lang] || role;
    }
  }
  return role;
}

/**
 * Dịch tên sự kiện hôn lễ (VD: Lễ Thành Hôn -> Wedding Ceremony / 结婚典礼)
 */
export function translateEventName(eventName: string | null | undefined, lang: SupportedLanguage): string {
  if (!eventName || !eventName.trim()) return "";
  if (lang === "vi") return eventName;

  const key = eventName.trim().toLowerCase();
  for (const [pattern, trans] of Object.entries(EVENT_NAME_MAP)) {
    if (key.includes(pattern)) {
      return trans[lang] || eventName;
    }
  }
  return eventName;
}

/**
 * Dịch tên địa điểm (VD: Tư gia -> Private Residence / 男方府邸)
 */
export function translateVenueName(venueName: string | null | undefined, lang: SupportedLanguage): string {
  if (!venueName || !venueName.trim()) return "";
  if (lang === "vi") return venueName;

  const key = venueName.trim().toLowerCase();
  for (const [pattern, trans] of Object.entries(VENUE_NAME_MAP)) {
    if (key.includes(pattern)) {
      return trans[lang] || venueName;
    }
  }
  return venueName;
}

/**
 * Dịch lời ngỏ / câu châm ngôn cưới chuẩn
 */
export function translateQuoteOrGreeting(quote: string | null | undefined, lang: SupportedLanguage): string {
  if (!quote || !quote.trim()) return "";
  if (lang === "vi") return quote;

  const key = quote.trim().toLowerCase();
  for (const [pattern, trans] of Object.entries(QUOTES_MAP)) {
    if (key.includes(pattern)) {
      return trans[lang] || quote;
    }
  }
  return quote;
}

/**
 * Định dạng ngày giờ cưới theo ngôn ngữ
 */
export function formatWeddingDate(rawDate: string | Date, lang: SupportedLanguage) {
  let d: Date;
  if (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
    const [y, m, day] = rawDate.trim().split("-").map(Number);
    d = new Date(y, m - 1, day, 12, 0, 0); // safe noon local time
  } else {
    d = new Date(rawDate);
  }
  const isValid = !isNaN(d.getTime());
  const dateObj = isValid ? d : new Date("2026-11-20T18:00:00Z");

  const dayNumber = String(dateObj.getDate()).padStart(2, "0");
  const monthNumber = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yearNumber = String(dateObj.getFullYear());
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const mins = String(dateObj.getMinutes()).padStart(2, "0");
  const time = `${hours}:${mins}`;

  const dayOfWeekIndex = dateObj.getDay(); // 0 = Sun, 1 = Mon...

  if (lang === "en") {
    const daysEn = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const monthsEn = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const fullMonthsEn = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
    ];
    return {
      dayName: daysEn[dayOfWeekIndex],
      day: dayNumber,
      month: fullMonthsEn[dateObj.getMonth()],
      monthShort: monthsEn[dateObj.getMonth()],
      year: yearNumber,
      time,
      formatted: `${daysEn[dayOfWeekIndex]}, ${fullMonthsEn[dateObj.getMonth()]} ${dateObj.getDate()}, ${yearNumber}`,
    };
  }

  if (lang === "zh") {
    const daysZh = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return {
      dayName: daysZh[dayOfWeekIndex],
      day: dayNumber,
      month: `${dateObj.getMonth() + 1}月`,
      monthShort: `${dateObj.getMonth() + 1}月`,
      year: `${yearNumber}年`,
      time,
      formatted: `${yearNumber}年${dateObj.getMonth() + 1}月${dayNumber}日 ${daysZh[dayOfWeekIndex]}`,
    };
  }

  // Tiếng Việt mặc định
  const daysVi = ["CHỦ NHẬT", "THỨ HAI", "THỨ BA", "THỨ TƯ", "THỨ NĂM", "THỨ SÁU", "THỨ BẢY"];
  return {
    dayName: daysVi[dayOfWeekIndex],
    day: dayNumber,
    month: `THÁNG ${monthNumber}`,
    monthShort: `T.${monthNumber}`,
    year: yearNumber,
    time,
    formatted: `${daysVi[dayOfWeekIndex]}, ${dayNumber}/${monthNumber}/${yearNumber}`,
  };
}

/**
 * Xử lý chuỗi lịch âm (VD: Tức ngày 12 tháng 10 năm Bính Ngọ)
 */
export function formatLunarDate(lunarStr: string | null | undefined, lang: SupportedLanguage): string {
  if (!lunarStr || !lunarStr.trim()) return "";
  if (lang === "vi") return lunarStr;

  if (lang === "en") {
    // Trích xuất số ngày và tháng nếu có
    return lunarStr.replace(/tức ngày/i, "Lunar Date:").replace(/năm/i, "Year:");
  }

  if (lang === "zh") {
    return lunarStr.replace(/tức ngày/i, "农历：").replace(/âm lịch/i, "");
  }

  return lunarStr;
}

/**
 * Phân giải toàn bộ dữ liệu thiệp cưới theo ngôn ngữ đang chọn:
 * 1. Nếu có bản dịch do AI cache trong `card.categoryData.translations[lang]`, ưu tiên áp dụng.
 * 2. Tự động chuyển ngữ các vai vế, sự kiện, câu chúc mặc định qua bộ từ điển.
 */
export function getResolvedWeddingData(
  card: CardDetail | null | undefined,
  lang: SupportedLanguage
): WeddingDataPayload {
  const rawData = (card?.categoryData as WeddingDataPayload) || {};
  if (lang === "vi") return rawData;

  const translations = (rawData as any)?.translations?.[lang] || {};

  // Clone dữ liệu và chuyển ngữ
  const resolved: WeddingDataPayload = {
    ...rawData,
    heroSubtitle: translations.heroSubtitle || rawData.heroSubtitle,
    invitationTitle: translations.invitationTitle || translateEventName(rawData.invitationTitle, lang),
    greeting: translations.greeting || translateQuoteOrGreeting(rawData.greeting, lang),
    groom: {
      ...rawData.groom,
      birthOrder: translations.groom?.birthOrder || translateWeddingRole(rawData.groom?.birthOrder, lang),
      story: translations.groom?.story || rawData.groom?.story,
    },
    bride: {
      ...rawData.bride,
      birthOrder: translations.bride?.birthOrder || translateWeddingRole(rawData.bride?.birthOrder, lang),
      story: translations.bride?.story || rawData.bride?.story,
    },
    loveStory: Array.isArray(rawData.loveStory)
      ? rawData.loveStory.map((m: any, idx: number) => {
          const mTrans = translations.loveStory?.[idx] || {};
          return {
            ...m,
            title: mTrans.title || m.title,
            description: mTrans.description || m.description,
          };
        })
      : rawData.loveStory,
    timelineEvents: Array.isArray(rawData.timelineEvents)
      ? rawData.timelineEvents.map((te: any, idx: number) => {
          const teTrans = translations.timelineEvents?.[idx] || {};
          return {
            ...te,
            title: teTrans.title || te.title,
          };
        })
      : rawData.timelineEvents,
    dressCode: rawData.dressCode
      ? {
          ...rawData.dressCode,
          title: translations.dressCode?.title || rawData.dressCode.title,
          description: translations.dressCode?.description || rawData.dressCode.description,
          note: translations.dressCode?.note || rawData.dressCode.note,
        }
      : rawData.dressCode,
    weddingPass: rawData.weddingPass
      ? {
          ...rawData.weddingPass,
          title: translations.weddingPass?.title || rawData.weddingPass.title,
          departing: translations.weddingPass?.departing || rawData.weddingPass.departing,
          arriving: translations.weddingPass?.arriving || rawData.weddingPass.arriving,
          note: translations.weddingPass?.note || rawData.weddingPass.note,
        }
      : rawData.weddingPass,
  };

  // Dịch danh sách sự kiện nếu có trong categoryData
  if (Array.isArray(rawData.events)) {
    resolved.events = rawData.events.map((ev: EventItem, idx: number) => {
      const evTrans = translations.events?.[idx] || {};
      return {
        ...ev,
        eventName: evTrans.eventName || translateEventName(ev.eventName, lang),
        venueName: evTrans.venueName || translateVenueName(ev.venueName, lang),
        address: evTrans.address || ev.address,
        note: evTrans.note || ev.note,
        lunarDate: evTrans.lunarDate || formatLunarDate(ev.lunarDate, lang),
      };
    });
  }

  return resolved;
}

/**
 * Dịch danh sách các sự kiện ngoài card.events
 */
export function getResolvedEvents(
  events: EventItem[] | undefined,
  card: CardDetail | null | undefined,
  lang: SupportedLanguage
): EventItem[] {
  if (!events || events.length === 0) return [];
  if (lang === "vi") return events;

  const translations = (card?.categoryData as any)?.translations?.[lang]?.events || [];

  return events.map((ev, idx) => {
    const evTrans = translations[idx] || {};
    return {
      ...ev,
      eventName: evTrans.eventName || translateEventName(ev.eventName, lang),
      venueName: evTrans.venueName || translateVenueName(ev.venueName, lang),
      address: evTrans.address || ev.address,
      note: evTrans.note || ev.note,
      lunarDate: evTrans.lunarDate || formatLunarDate(ev.lunarDate, lang),
    };
  });
}
