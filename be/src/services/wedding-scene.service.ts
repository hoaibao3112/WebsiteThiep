import type { DraftCardInput } from "../lib/validators/card";
import type { WeddingSceneSectionType } from "../lib/validators/card/wedding-scene.schema";

type JsonRecord = Record<string, unknown>;

interface WeddingSceneSection {
  id: string;
  type: WeddingSceneSectionType;
  label: string;
  visible: boolean;
  order: number;
  elementIds: string[];
}

interface WeddingSceneDocument extends JsonRecord {
  schemaVersion: 1;
  templateSlug: string;
  width: number;
  height: number;
  background: JsonRecord;
  tokens: JsonRecord;
  sections: WeddingSceneSection[];
  elements: JsonRecord[];
  bindings: Record<string, string>;
}

const TEMPLATE_SECTIONS: Record<string, WeddingSceneSectionType[]> = {
  "wedding-blank": ["hero"],
  "wedding-heritage-crimson-gold": ["envelope", "hero", "ceremony", "location", "marry-me", "about-bride", "about-groom", "calendar", "timeline", "gallery", "rsvp", "gift", "thank-you"],
  "wedding-modern-editorial-magazine": ["hero", "signatures", "parents-zigzag", "ceremony-invitation", "venue", "calendar-countdown", "rsvp-envelope", "gift", "album-gallery", "farewell"],
  "wedding-sweet-editorial-romance": ["envelope", "hero", "ceremony", "location", "marry-me", "about-bride", "about-groom", "calendar", "timeline", "gallery", "rsvp", "gift", "thank-you"],
  "wedding-crimson-wine-marsala": ["hero", "arch-calendar", "invitation-cards", "ceremony-groom", "ceremony-bride", "venue", "photo-collage", "rsvp", "gift", "farewell"],
  "wedding-forest-green-botanical": ["envelope", "polaroid-calendar", "invitation", "facing-photos", "parents", "events-card", "venue", "gallery-grid", "rsvp", "gift", "farewell"],
  "wedding-pure-lotus-heritage": ["hero", "announcement", "invitation-header", "ceremonies", "venue", "calendar", "rsvp", "gift", "album", "farewell"],
  "wedding-cinematic-editorial": ["hero", "couple", "story", "calendar", "map", "gallery", "rsvp"],
  "wedding-alpine-lake-romance": ["hero", "couple", "calendar", "story", "gallery", "rsvp", "gift"],
  "wedding-imperial-dragon-crimson": ["hero", "couple", "calendar", "map", "gift", "farewell"],
};

const TOKENS: Record<string, JsonRecord> = {
  "wedding-blank": { primary: "#2A2A2A", secondary: "#F0F0F0", accent: "#BE944E", surface: "#FFFFFF", text: "#1A1A1A", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
  "wedding-heritage-crimson-gold": { primary: "#8B1E2D", secondary: "#F4E8D0", accent: "#C9A45C", surface: "#FFFDF8", text: "#2E1B1B", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
  "wedding-modern-editorial-magazine": { primary: "#543A2C", secondary: "#E9DED5", accent: "#B9906D", surface: "#FAF8F5", text: "#211A17", headingFont: "Inter", bodyFont: "Inter", radius: "none", density: "compact" },
  "wedding-sweet-editorial-romance": { primary: "#B84A39", secondary: "#F7D8D7", accent: "#E9A7A2", surface: "#FFF9F8", text: "#42272A", headingFont: "Great Vibes", bodyFont: "Quicksand", radius: "lg", density: "airy" },
  "wedding-crimson-wine-marsala": { primary: "#6B1724", secondary: "#EBD4C6", accent: "#D2A35C", surface: "#FAF8F6", text: "#32181D", headingFont: "Playfair Display", bodyFont: "Inter", radius: "md", density: "comfortable" },
  "wedding-forest-green-botanical": { primary: "#364733", secondary: "#E2EAE0", accent: "#C9A45C", surface: "#F7F8F4", text: "#243322", headingFont: "Playfair Display", bodyFont: "Outfit", radius: "md", density: "airy" },
  "wedding-pure-lotus-heritage": { primary: "#2E5136", secondary: "#E6EFE5", accent: "#C9A45C", surface: "#FCFDFB", text: "#1F3524", headingFont: "Playfair Display", bodyFont: "Outfit", radius: "md", density: "airy" },
  "wedding-cinematic-editorial": { primary: "#1C1C1C", secondary: "#D6C9B8", accent: "#B99768", surface: "#F3F1ED", text: "#171717", headingFont: "Cinzel", bodyFont: "Inter", radius: "none", density: "compact" },
  "wedding-alpine-lake-romance": { primary: "#2B6B6D", secondary: "#D8ECE8", accent: "#D0A983", surface: "#F8FCFB", text: "#1C3C3D", headingFont: "Playfair Display", bodyFont: "Quicksand", radius: "lg", density: "airy" },
  "wedding-imperial-dragon-crimson": { primary: "#6E1719", secondary: "#F2D7B5", accent: "#D9A441", surface: "#FFF8EC", text: "#351616", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
};

const TEMPLATE_MOTIFS: Record<string, string> = {
  "wedding-blank": "",
  "wedding-heritage-crimson-gold": "❖",
  "wedding-modern-editorial-magazine": "—",
  "wedding-sweet-editorial-romance": "♡",
  "wedding-crimson-wine-marsala": "✦",
  "wedding-forest-green-botanical": "✿",
  "wedding-pure-lotus-heritage": "❀",
  "wedding-cinematic-editorial": "✶",
  "wedding-alpine-lake-romance": "≈",
  "wedding-imperial-dragon-crimson": "龍",
};

type WidgetType = "calendar" | "countdown" | "map" | "contact" | "rsvp" | "album" | "guest-name" | "gift" | "envelope";
type SceneElement = JsonRecord & { id: string; type: string; content: string; x: number; y: number; width: number; height: number; zIndex: number };

function makeText(id: string, content: string, x: number, y: number, width: number, height: number, color: string, fontFamily: string, fontSize: number, extra: JsonRecord = {}): SceneElement {
  return { id, type: "text", content, x, y, width, height, color, fontFamily, fontSize, textAlign: "center", zIndex: 2, ...extra };
}

function makePreset(id: string, presetId: string, x: number, y: number, width: number, height: number, extra: JsonRecord = {}): SceneElement {
  return { id, type: "preset", presetId, content: "", x, y, width, height, zIndex: 2, ...extra };
}

function makeWidget(id: string, widgetType: WidgetType, x: number, y: number, width: number, height: number, title: string, primary: string, extra: JsonRecord = {}): SceneElement {
  return {
    id, type: "widget", widgetType, content: "", title, x, y, width, height, zIndex: 2,
    color: primary, backgroundColor: "#ffffff", borderRadius: 18, borderWidth: 1,
    borderColor: `${primary}55`, shadow: "0 8px 24px rgba(30,20,20,.08)", padding: 16,
    widgetConfig: { title, ...extra },
  };
}

function buildElements(data: JsonRecord, slug: string, sections: WeddingSceneSection[], tokens: JsonRecord): { elements: SceneElement[]; bindings: Record<string, string> } {
  const groom = readRecord(data.groom) ?? {};
  const bride = readRecord(data.bride) ?? {};
  const event = Array.isArray(data.events) ? readRecord(data.events[0]) ?? {} : {};
  const primary = String(tokens.primary);
  const accent = String(tokens.accent);
  const headingFont = String(tokens.headingFont);
  const bodyFont = String(tokens.bodyFont);
  const motif = TEMPLATE_MOTIFS[slug];
  const elements: SceneElement[] = [];
  const bindings: Record<string, string> = {};
  const isRichSlug = slug === "wedding-sweet-editorial-romance" || slug === "wedding-heritage-crimson-gold";
  const isMagSlug = slug === "wedding-modern-editorial-magazine";
  const isMarsalaSlug = slug === "wedding-crimson-wine-marsala";
  const isForestSlug = slug === "wedding-forest-green-botanical";
  const isLotusSlug = slug === "wedding-pure-lotus-heritage";

  if (slug === "wedding-blank") {
    const blankSection = sections[0];
    if (blankSection) {
      blankSection.elementIds = [];
    }
    return {
      elements: [],
      bindings: {},
    };
  }

  let currentTop = 16;
  sections.forEach((section) => {
    const top = currentTop;
    let sectionHeight = 360;
    section.elementIds = [];
    const add = (element: SceneElement) => {
      elements.push(element);
      section.elementIds.push(element.id);
    };
    const addBoundText = (id: string, binding: string, value: unknown, fallback: string, y: number, size = 18, extra: JsonRecord = {}) => {
      const el = makeText(id, readString(value, fallback), 32, y, 326, 46, primary, headingFont, size, extra);
      add(el);
      bindings[id] = binding;
    };

    if (isMagSlug) {
      if (section.type === "hero") {
        sectionHeight = 540;
        add(makePreset(`${section.id}-hero`, "p-mag-hero", 0, top, 390, sectionHeight));
      } else if (section.type === "signatures") {
        sectionHeight = 170;
        add(makePreset(`${section.id}-signatures`, "p-mag-signatures", 0, top, 390, sectionHeight));
      } else if (section.type === "parents-zigzag") {
        sectionHeight = 520;
        add(makePreset(`${section.id}-parents`, "p-mag-parents-zigzag", 0, top, 390, sectionHeight));
      } else if (section.type === "ceremony-invitation") {
        sectionHeight = 680;
        add(makePreset(`${section.id}-ceremony`, "p-mag-ceremony-invitation", 0, top, 390, sectionHeight));
      } else if (section.type === "venue") {
        sectionHeight = 220;
        add(makeWidget(`${section.id}-widget`, "map", 24, top + 10, 342, 200, "Địa chỉ dự tiệc", primary, {
          url: readString(event.mapUrl, "https://maps.google.com"),
          description: [readString(event.venueName, "TƯ GIA NHÀ TRAI"), readString(event.address, "16 P. Phúc Minh, Phúc Diễn, Bắc Từ Liêm, TP. Hà Nội")].filter(Boolean).join("\n"),
          buttonLabel: "Chỉ đường",
        }));
        bindings[`${section.id}-widget`] = "events[0].mapUrl";
      } else if (section.type === "calendar-countdown") {
        sectionHeight = 530;
        add(makePreset(`${section.id}-countdown`, "p-mag-calendar-countdown", 0, top, 390, sectionHeight));
      } else if (section.type === "rsvp-envelope") {
        sectionHeight = 380;
        add(makePreset(`${section.id}-rsvp`, "p-mag-rsvp-envelope", 0, top, 390, sectionHeight));
      } else if (section.type === "gift") {
        sectionHeight = 200;
        add(makePreset(`${section.id}-gift`, "p-mag-gift", 0, top, 390, sectionHeight));
      } else if (section.type === "album-gallery") {
        sectionHeight = 780;
        add(makePreset(`${section.id}-album`, "p-mag-album", 0, top, 390, sectionHeight));
      } else if (section.type === "farewell") {
        sectionHeight = 440;
        add(makePreset(`${section.id}-farewell`, "p-mag-farewell", 0, top, 390, sectionHeight));
      } else {
        sectionHeight = 200;
        add(makeText(`${section.id}-misc`, "", 0, top, 390, sectionHeight, primary, bodyFont, 14));
      }
    } else if (isMarsalaSlug) {
      if (section.type === "hero") {
        sectionHeight = 680;
        add(makePreset(`${section.id}-hero`, "p-marsala-hero", 0, top, 390, sectionHeight));
      } else if (section.type === "arch-calendar") {
        sectionHeight = 720;
        add(makePreset(`${section.id}-arch-calendar`, "p-marsala-arch-calendar", 0, top, 390, sectionHeight));
      } else if (section.type === "invitation-cards") {
        sectionHeight = 580;
        add(makePreset(`${section.id}-invitation-cards`, "p-marsala-invitation-cards", 0, top, 390, sectionHeight));
      } else if (section.type === "ceremony-groom") {
        sectionHeight = 680;
        add(makePreset(`${section.id}-ceremony-groom`, "p-marsala-ceremony-groom", 0, top, 390, sectionHeight));
      } else if (section.type === "ceremony-bride") {
        sectionHeight = 740;
        add(makePreset(`${section.id}-ceremony-bride`, "p-marsala-ceremony-bride", 0, top, 390, sectionHeight));
      } else if (section.type === "venue") {
        sectionHeight = 220;
        add(makeWidget(`${section.id}-widget`, "map", 24, top + 10, 342, 200, "Địa chỉ dự tiệc", primary, {
          url: readString(event.mapUrl, "https://maps.google.com"),
          description: [readString(event.venueName, "TƯ GIA NHÀ TRAI"), readString(event.address, "Khu Phố Xuân Thượng, Phường Quảng Vinh, Nam Sầm Sơn, Thanh Hóa")].filter(Boolean).join("\n"),
          buttonLabel: "Xem chỉ đường",
        }));
        bindings[`${section.id}-widget`] = "events[0].mapUrl";
      } else if (section.type === "photo-collage") {
        sectionHeight = 540;
        add(makePreset(`${section.id}-photo-collage`, "p-marsala-photo-collage", 0, top, 390, sectionHeight));
      } else if (section.type === "rsvp") {
        sectionHeight = 200;
        add(makePreset(`${section.id}-rsvp`, "p-marsala-rsvp", 0, top, 390, sectionHeight));
      } else if (section.type === "gift") {
        sectionHeight = 240;
        add(makePreset(`${section.id}-gift`, "p-marsala-gift", 0, top, 390, sectionHeight));
      } else if (section.type === "farewell") {
        sectionHeight = 580;
        add(makePreset(`${section.id}-farewell`, "p-marsala-farewell", 0, top, 390, sectionHeight));
      } else {
        sectionHeight = 200;
        add(makeText(`${section.id}-misc`, "", 0, top, 390, sectionHeight, primary, bodyFont, 14));
      }
    } else if (isForestSlug) {
      if (section.type === "envelope") {
        sectionHeight = 680;
        add(makePreset(`${section.id}-envelope`, "p-forest-envelope", 0, top, 390, sectionHeight));
      } else if (section.type === "polaroid-calendar") {
        sectionHeight = 440;
        add(makePreset(`${section.id}-polaroid-calendar`, "p-forest-polaroid-calendar", 0, top, 390, sectionHeight));
      } else if (section.type === "invitation") {
        sectionHeight = 300;
        add(makePreset(`${section.id}-invitation`, "p-forest-invitation", 0, top, 390, sectionHeight));
      } else if (section.type === "facing-photos") {
        sectionHeight = 420;
        add(makePreset(`${section.id}-facing-photos`, "p-forest-facing-photos", 0, top, 390, sectionHeight));
      } else if (section.type === "parents") {
        sectionHeight = 160;
        add(makePreset(`${section.id}-parents`, "p-forest-parents", 0, top, 390, sectionHeight));
      } else if (section.type === "events-card") {
        sectionHeight = 820;
        add(makePreset(`${section.id}-events-card`, "p-forest-events-card", 0, top, 390, sectionHeight));
      } else if (section.type === "venue") {
        sectionHeight = 220;
        add(makeWidget(`${section.id}-widget`, "map", 24, top + 10, 342, 200, "Địa chỉ dự tiệc", primary, {
          url: readString(event.mapUrl, "https://maps.google.com"),
          description: [readString(event.venueName, "TƯ GIA NHÀ GÁI"), readString(event.address, "Xóm 5 , Xã Phú Cát, Quốc Oai, Hà Nội")].filter(Boolean).join("\n"),
          buttonLabel: "Xem chỉ đường",
        }));
        bindings[`${section.id}-widget`] = "events[0].mapUrl";
      } else if (section.type === "gallery-grid") {
        sectionHeight = 780;
        add(makePreset(`${section.id}-gallery-grid`, "p-forest-gallery-grid", 0, top, 390, sectionHeight));
      } else if (section.type === "rsvp") {
        sectionHeight = 240;
        add(makePreset(`${section.id}-rsvp`, "p-forest-rsvp", 0, top, 390, sectionHeight));
      } else if (section.type === "gift") {
        sectionHeight = 220;
        add(makePreset(`${section.id}-gift`, "p-forest-gift", 0, top, 390, sectionHeight));
      } else if (section.type === "farewell") {
        sectionHeight = 480;
        add(makePreset(`${section.id}-farewell`, "p-forest-farewell", 0, top, 390, sectionHeight));
      } else {
        sectionHeight = 200;
        add(makeText(`${section.id}-misc`, "", 0, top, 390, sectionHeight, primary, bodyFont, 14));
      }
    } else if (isLotusSlug) {
      if (section.type === "hero") {
        sectionHeight = 580;
        add(makePreset(`${section.id}-hero`, "p-lotus-hero", 0, top, 390, sectionHeight));
      } else if (section.type === "announcement") {
        sectionHeight = 480;
        add(makePreset(`${section.id}-announcement`, "p-lotus-announcement", 0, top, 390, sectionHeight));
      } else if (section.type === "invitation-header") {
        sectionHeight = 340;
        add(makePreset(`${section.id}-invitation-header`, "p-lotus-invitation-header", 0, top, 390, sectionHeight));
      } else if (section.type === "ceremonies") {
        sectionHeight = 480;
        add(makePreset(`${section.id}-ceremonies`, "p-lotus-ceremonies", 0, top, 390, sectionHeight));
      } else if (section.type === "venue") {
        sectionHeight = 220;
        add(makeWidget(`${section.id}-widget`, "map", 24, top + 10, 342, 200, "Địa chỉ dự tiệc", primary, {
          url: readString(event.mapUrl, "https://maps.google.com"),
          description: [readString(event.venueName, "Khách sạn CINELOVE"), readString(event.address, "Hà Nội")].filter(Boolean).join("\n"),
          buttonLabel: "CHỈ ĐƯỜNG",
        }));
        bindings[`${section.id}-widget`] = "events[0].mapUrl";
      } else if (section.type === "calendar") {
        sectionHeight = 420;
        add(makePreset(`${section.id}-calendar`, "p-lotus-calendar", 0, top, 390, sectionHeight));
      } else if (section.type === "rsvp") {
        sectionHeight = 280;
        add(makePreset(`${section.id}-rsvp`, "p-lotus-rsvp", 0, top, 390, sectionHeight));
      } else if (section.type === "gift") {
        sectionHeight = 260;
        add(makePreset(`${section.id}-gift`, "p-lotus-gift", 0, top, 390, sectionHeight));
      } else if (section.type === "album") {
        sectionHeight = 760;
        add(makePreset(`${section.id}-album`, "p-lotus-album", 0, top, 390, sectionHeight));
      } else if (section.type === "farewell") {
        sectionHeight = 520;
        add(makePreset(`${section.id}-farewell`, "p-lotus-farewell", 0, top, 390, sectionHeight));
      } else {
        sectionHeight = 200;
        add(makeText(`${section.id}-misc`, "", 0, top, 390, sectionHeight, primary, bodyFont, 14));
      }
    } else if (section.type === "envelope") {
      sectionHeight = 400;
      add(makePreset(`${section.id}-envelope`, "p-envelope-sweet", 0, top, 390, sectionHeight));
    } else if (section.type === "hero") {
      if (isRichSlug) {
        sectionHeight = 510;
        add(makePreset(`${section.id}-hero`, "p-hero-sweet", 0, top, 390, sectionHeight));
      } else {
        sectionHeight = 320;
        add({ id: `${section.id}-panel`, type: "shape", content: "", x: 0, y: top, width: 390, height: 290, zIndex: 1, shapeType: "rect", backgroundColor: primary, borderRadius: slug.includes("magazine") || slug.includes("cinematic") ? 0 : 28, opacity: 1 });
        if (motif) {
          add(makeText(`${section.id}-motif`, motif, 40, top + 18, 310, 36, accent, headingFont, 28));
        }
        add(makeText(`${section.id}-subtitle`, readString(data.heroSubtitle, "TRÂN TRỌNG KÍNH MỜI"), 32, top + 58, 326, 30, "#ffffff", bodyFont, 11, { isUppercase: true, letterSpacing: 3 }));
        addBoundText("scene-groom", "groom.fullName", groom.shortName || groom.fullName, "Chú rể", top + 100, 30, { color: "#ffffff", isBold: true });
        add(makeText(`${section.id}-ampersand`, "&", 32, top + 139, 326, 28, accent, headingFont, 21));
        addBoundText("scene-bride", "bride.fullName", bride.shortName || bride.fullName, "Cô dâu", top + 168, 30, { color: "#ffffff", isBold: true });
        add(makeText(`${section.id}-date`, readString(event.eventDate, ""), 32, top + 222, 326, 26, "#ffffff", bodyFont, 13));
      }
    } else if (section.type === "ceremony") {
      sectionHeight = 470;
      add(makePreset(`${section.id}-ceremony`, "p-ceremony-parents-date", 0, top, 390, sectionHeight));
    } else if (section.type === "location") {
      sectionHeight = 330;
      add(makeWidget(`${section.id}-widget`, "map", 24, top + 20, 342, 280, "Địa điểm tổ chức", primary, {
        url: readString(event.mapUrl, "https://maps.google.com"),
        description: [event.venueName, event.address].filter(Boolean).join(" · ") || "(18A Lý Văn Phúc, P. Ô Chợ Dừa, Tp Hà Nội)",
        buttonLabel: "Mở trong Google Maps",
      }));
      bindings[`${section.id}-widget`] = "events[0].mapUrl";
    } else if (section.type === "marry-me") {
      sectionHeight = 390;
      add(makePreset(`${section.id}-marry-me`, "p-sweet-marry-me", 0, top, 390, sectionHeight));
    } else if (section.type === "about-bride") {
      sectionHeight = 400;
      add(makePreset(`${section.id}-about-bride`, "p-about-bride", 0, top, 390, sectionHeight));
    } else if (section.type === "about-groom") {
      sectionHeight = 400;
      add(makePreset(`${section.id}-about-groom`, "p-about-groom", 0, top, 390, sectionHeight));
    } else if (section.type === "calendar") {
      if (isRichSlug) {
        sectionHeight = 440;
        add(makePreset(`${section.id}-calendar`, "p-calendar-heart-photo", 0, top, 390, sectionHeight));
      } else {
        sectionHeight = 240;
        add(makeWidget(`${section.id}-widget`, "calendar", 24, top + 20, 342, 210, readString(event.eventName, "Ngày chung đôi"), primary, {
          eventDate: readString(event.eventDate, ""), description: [event.venueName, event.address].filter(Boolean).join(" · "),
        }));
        bindings[`${section.id}-widget`] = "events[0].eventDate";
      }
    } else if (section.type === "timeline") {
      sectionHeight = 250;
      add(makePreset(`${section.id}-timeline`, "p-timeline-sweet", 0, top, 390, sectionHeight));
    } else if (section.type === "gallery") {
      if (isRichSlug) {
        sectionHeight = 590;
        add(makePreset(`${section.id}-gallery`, "p-gallery-editorial-stack", 0, top, 390, sectionHeight));
      } else {
        sectionHeight = 300;
        add(makeWidget(`${section.id}-widget`, "album", 24, top + 20, 342, 280, "Album ảnh cưới", primary));
      }
    } else if (section.type === "rsvp" || section.type === "guestbook") {
      if (isRichSlug) {
        sectionHeight = 280;
        add(makePreset(`${section.id}-rsvp`, "p-rsvp-arch", 0, top, 390, sectionHeight));
      } else {
        sectionHeight = 210;
        add(makeWidget(`${section.id}-widget`, "rsvp", 24, top + 20, 342, 180, "Xác nhận tham dự", primary, { description: readString(data.greeting, "Sự hiện diện của bạn là niềm vui của chúng mình."), buttonLabel: "Gửi xác nhận" }));
      }
    } else if (section.type === "gift") {
      if (isRichSlug) {
        sectionHeight = 350;
        add(makePreset(`${section.id}-gift`, "p-dual-gift-qr", 0, top, 390, sectionHeight));
      } else {
        sectionHeight = 210;
        add(makeWidget(`${section.id}-widget`, "gift", 24, top + 20, 342, 180, "Gửi lời chúc mừng", primary, { description: "Gửi lời chúc và mừng cưới đến cô dâu chú rể." }));
      }
    } else if (section.type === "thank-you" || (section.type === "farewell" && isRichSlug)) {
      sectionHeight = 250;
      add(makePreset(`${section.id}-thank-you`, "p-thank-you-chibi", 0, top, 390, sectionHeight));
    } else if (section.type === "couple") {
      sectionHeight = 320;
      add(makeText(`${section.id}-label`, "CÔ DÂU & CHÚ RỂ", 32, top, 326, 26, accent, bodyFont, 11, { isUppercase: true, letterSpacing: 2 }));
      const groomAvatar = readString(groom.avatarUrl, "/images/demo/groom-avatar.png");
      const brideAvatar = readString(bride.avatarUrl, "/images/demo/bride-avatar.png");
      add({ id: "scene-groom-avatar", type: "image", content: groomAvatar, imageUrl: groomAvatar, x: 42, y: top + 42, width: 130, height: 150, zIndex: 1, borderRadius: slug.includes("forest") ? 20 : 80, borderWidth: 2, borderColor: accent });
      add({ id: "scene-bride-avatar", type: "image", content: brideAvatar, imageUrl: brideAvatar, x: 218, y: top + 42, width: 130, height: 150, zIndex: 1, borderRadius: slug.includes("forest") ? 20 : 80, borderWidth: 2, borderColor: accent });
      addBoundText("scene-couple-groom", "groom.fullName", groom.fullName, "Chú rể", top + 200, 17, { isBold: true });
      addBoundText("scene-couple-bride", "bride.fullName", bride.fullName, "Cô dâu", top + 244, 17, { isBold: true });
    } else if (section.type === "countdown") {
      sectionHeight = 240;
      add(makeWidget(`${section.id}-widget`, "countdown", 24, top + 20, 342, 210, readString(event.eventName, "Ngày chung đôi"), primary, {
        eventDate: readString(event.eventDate, ""), description: [event.venueName, event.address].filter(Boolean).join(" · "),
      }));
      bindings[`${section.id}-widget`] = "events[0].eventDate";
    } else if (section.type === "events") {
      sectionHeight = 240;
      add(makeWidget(`${section.id}-widget`, "calendar", 24, top + 20, 342, 210, readString(event.eventName, "Lễ Thành Hôn"), primary, {
        eventDate: readString(event.eventDate, ""), description: [event.venueName, event.address].filter(Boolean).join(" · "),
      }));
      bindings[`${section.id}-widget`] = "events[0].eventDate";
    } else if (section.type === "story") {
      const stories = Array.isArray(data.loveStory) ? data.loveStory : [];
      sectionHeight = Math.max(180, stories.length * 90 + 50);
      add(makeText(`${section.id}-title`, "CHUYỆN TÌNH YÊU", 32, top, 326, 30, accent, bodyFont, 11, { isUppercase: true, letterSpacing: 2 }));
      stories.slice(0, 3).forEach((storyValue, storyIndex) => {
        const story = readRecord(storyValue) ?? {};
        add(makeText(`${section.id}-story-${storyIndex}`, [story.date, story.title, story.description].filter(Boolean).join("\n"), 32, top + 42 + storyIndex * 82, 326, 72, primary, bodyFont, 13, { textAlign: "left", backgroundColor: "#ffffff", borderRadius: 12, padding: 12 }));
      });
      if (!stories.length) add(makeText(`${section.id}-empty`, readString(data.greeting, "Chúng mình đã cùng viết nên câu chuyện này."), 32, top + 48, 326, 76, primary, bodyFont, 14, { isItalic: true }));
    } else if (section.type === "map") {
      sectionHeight = 240;
      add(makeWidget(`${section.id}-widget`, "map", 24, top + 20, 342, 210, "Địa điểm tổ chức", primary, { url: readString(event.mapUrl, ""), description: readString(event.address, "Địa chỉ sẽ được cập nhật") }));
      bindings[`${section.id}-widget`] = "events[0].mapUrl";
    } else if (section.type === "parents") {
      sectionHeight = 210;
      const groomParents = readRecord(groom.parents) ?? {};
      const brideParents = readRecord(bride.parents) ?? {};
      add(makeText(`${section.id}-title`, "KÍNH MỜI HAI HỌ", 32, top, 326, 28, accent, bodyFont, 11, { isUppercase: true, letterSpacing: 2 }));
      add(makeText(`${section.id}-groom`, [groomParents.fatherName, groomParents.motherName].filter(Boolean).join("\n"), 32, top + 42, 326, 70, primary, bodyFont, 14));
      add(makeText(`${section.id}-bride`, [brideParents.fatherName, brideParents.motherName].filter(Boolean).join("\n"), 32, top + 116, 326, 70, primary, bodyFont, 14));
    } else {
      sectionHeight = 160;
      add(makeText(`${section.id}-farewell`, readString(data.greeting, "Cảm ơn bạn đã cùng chia sẻ ngày vui."), 32, top + 30, 326, 80, primary, headingFont, 17, { isItalic: true }));
    }

    currentTop += sectionHeight + 16;
  });

  if (isMagSlug || isMarsalaSlug || isForestSlug || isLotusSlug) {
    const hiddenGroom = makeText("scene-groom", readString(groom.fullName, isLotusSlug ? "Trần Đức Hiển" : isForestSlug ? "Tuấn Minh" : isMarsalaSlug ? "Nguyễn Minh" : "Công Vinh"), 0, 0, 0, 0, "#000000", bodyFont, 1, { opacity: 0 });
    const hiddenBride = makeText("scene-bride", readString(bride.fullName, isLotusSlug ? "Nguyễn Minh Hằng" : isForestSlug ? "Mai Lan" : isMarsalaSlug ? "Bùi Phương" : "Hải Yến"), 0, 0, 0, 0, "#000000", bodyFont, 1, { opacity: 0 });
    elements.push(hiddenGroom, hiddenBride);
    bindings["scene-groom"] = "groom.fullName";
    bindings["scene-bride"] = "bride.fullName";
    const firstSec = sections.find((s) => s.type === "hero" || s.type === "envelope");
    if (firstSec) {
      firstSec.elementIds.push("scene-groom", "scene-bride");
    }
  }

  return { elements, bindings };
}

function readRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function canonicalSlug(templateSlug: string): string {
  if (TEMPLATE_SECTIONS[templateSlug]) return templateSlug;
  if (templateSlug === "wedding-minimalist-gold") return "wedding-heritage-crimson-gold";
  if (templateSlug === "wedding-hong-xanh-luxury") return "wedding-sweet-editorial-romance";
  return "wedding-heritage-crimson-gold";
}

function resolveBinding(data: JsonRecord, binding: string): unknown {
  const pathParts = binding.match(/[^[.\]]+/g) ?? [];
  return pathParts.reduce<unknown>((value, key) => {
    const source = readRecord(value);
    if (source && Object.hasOwn(source, key)) return source[key];
    if (Array.isArray(value) && /^\d+$/.test(key)) return value[Number(key)];
    return undefined;
  }, data);
}

export function ensureWeddingSceneData(templateSlug: string, rawData: unknown): JsonRecord {
  const data = readRecord(rawData) ?? {};
  const existing = readRecord(data.canvasDocument);
  const slug = canonicalSlug(templateSlug);
  if (existing?.schemaVersion === 1 && canonicalSlug(String(existing.templateSlug || "")) === slug && Array.isArray(existing.sections) && Array.isArray(existing.elements)) {
    const bindings = readRecord(existing.bindings);
    const elements = existing.elements.map((element) => {
      const binding = typeof bindings?.[String(element.id)] === "string" ? String(bindings[element.id]) : "";
      const value = binding ? resolveBinding(data, binding) : undefined;
      if (!binding || value === undefined) return element;
      if (element.type === "widget") {
        const widgetConfig = readRecord(element.widgetConfig) ?? {};
        const configKey = binding.endsWith(".eventDate") ? "eventDate" : binding.endsWith(".mapUrl") ? "url" : binding.endsWith(".eventName") ? "title" : "description";
        return { ...element, widgetConfig: { ...widgetConfig, [configKey]: typeof value === "string" ? value : "" } };
      }
      if (element.type === "image") return { ...element, content: String(value), imageUrl: String(value) };
      return { ...element, content: typeof value === "string" ? value : "" };
    });
    return { ...data, canvasDocument: { ...existing, elements } };
  }

  const tokens: JsonRecord = { ...TOKENS[slug], motif: TEMPLATE_MOTIFS[slug] };
  const sections = TEMPLATE_SECTIONS[slug].map((type, order): WeddingSceneSection => ({ id: `section-${type}-${order}`, type, label: type, visible: true, order, elementIds: [] }));
  const built = buildElements(data, slug, sections, TOKENS[slug]);
  const legacyCanvas = readRecord(data.canvas);
  const legacyElements = Array.isArray(data.canvasElements)
    ? data.canvasElements
    : Array.isArray(legacyCanvas?.elements) ? legacyCanvas.elements as JsonRecord[] : [];
  const generatedIds = new Set(built.elements.map((element) => element.id));
  const legacyCustomElements = legacyElements.filter((element) => {
    const record = readRecord(element);
    return typeof record?.id === "string" && !generatedIds.has(record.id);
  });
  const previousCustomElements = Array.isArray(existing?.elements)
    ? existing.elements.filter((element) => {
        const record = readRecord(element);
        return typeof record?.id === "string" && !generatedIds.has(record.id) && !String(record.id).startsWith("section-");
      })
    : [];
  const elements = [...built.elements, ...legacyCustomElements, ...previousCustomElements];
  const maxY = elements.reduce((max, el) => Math.max(max, (typeof el.y === "number" ? el.y : 0) + (typeof el.height === "number" ? el.height : 0)), 1200);
  const document: WeddingSceneDocument = {
    schemaVersion: 1,
    templateSlug: slug,
    width: 390,
    height: maxY + 40,
    background: { color: tokens.surface },
    tokens,
    sections,
    elements,
    bindings: built.bindings,
  };
  return { ...data, canvasDocument: document };
}

export function ensureWeddingScene(input: DraftCardInput): DraftCardInput["data"] {
  if (input.data.cardCategory !== "WEDDING") return input.data;
  return ensureWeddingSceneData(input.templateSlug, input.data) as DraftCardInput["data"];
}
