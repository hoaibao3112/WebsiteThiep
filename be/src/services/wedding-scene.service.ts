import type { DraftCardInput } from "../lib/validators/card";

type JsonRecord = Record<string, unknown>;

interface WeddingSceneSection {
  id: string;
  type: string;
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

const TEMPLATE_SECTIONS: Record<string, string[]> = {
  "wedding-heritage-crimson-gold": ["hero", "couple", "events", "gallery", "guestbook", "rsvp"],
  "wedding-modern-editorial-magazine": ["hero", "couple", "events", "calendar", "gallery", "rsvp"],
  "wedding-sweet-editorial-romance": ["hero", "countdown", "parents", "map", "story", "calendar", "rsvp", "gift"],
  "wedding-crimson-wine-marsala": ["hero", "events", "countdown", "gallery", "rsvp", "gift"],
  "wedding-forest-green-botanical": ["hero", "calendar", "couple", "events", "gallery", "rsvp", "farewell"],
  "wedding-pure-lotus-heritage": ["hero", "events", "calendar", "rsvp", "gallery", "farewell"],
  "wedding-cinematic-editorial": ["hero", "story", "calendar", "map", "gallery", "rsvp"],
  "wedding-alpine-lake-romance": ["hero", "calendar", "story", "gallery", "rsvp", "gift"],
  "wedding-imperial-dragon-crimson": ["hero", "couple", "calendar", "map", "gift", "farewell"],
};

const TOKENS: Record<string, JsonRecord> = {
  "wedding-heritage-crimson-gold": { primary: "#8B1E2D", secondary: "#F4E8D0", accent: "#C9A45C", surface: "#FFFDF8", text: "#2E1B1B", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
  "wedding-modern-editorial-magazine": { primary: "#543A2C", secondary: "#E9DED5", accent: "#B9906D", surface: "#FAF8F5", text: "#211A17", headingFont: "Inter", bodyFont: "Inter", radius: "none", density: "compact" },
  "wedding-sweet-editorial-romance": { primary: "#B84A39", secondary: "#F7D8D7", accent: "#E9A7A2", surface: "#FFF9F8", text: "#42272A", headingFont: "Great Vibes", bodyFont: "Quicksand", radius: "lg", density: "airy" },
  "wedding-crimson-wine-marsala": { primary: "#6B1724", secondary: "#EBD4C6", accent: "#D2A35C", surface: "#FFF9F2", text: "#32181D", headingFont: "Playfair Display", bodyFont: "Inter", radius: "md", density: "comfortable" },
  "wedding-forest-green-botanical": { primary: "#3D4A34", secondary: "#DCE4D4", accent: "#A78B5B", surface: "#F8F7F0", text: "#263027", headingFont: "Outfit", bodyFont: "Outfit", radius: "md", density: "airy" },
  "wedding-pure-lotus-heritage": { primary: "#3B5E43", secondary: "#E6EFE5", accent: "#B89052", surface: "#FBFCF6", text: "#213429", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
  "wedding-cinematic-editorial": { primary: "#1C1C1C", secondary: "#D6C9B8", accent: "#B99768", surface: "#F3F1ED", text: "#171717", headingFont: "Cinzel", bodyFont: "Inter", radius: "none", density: "compact" },
  "wedding-alpine-lake-romance": { primary: "#2B6B6D", secondary: "#D8ECE8", accent: "#D0A983", surface: "#F8FCFB", text: "#1C3C3D", headingFont: "Playfair Display", bodyFont: "Quicksand", radius: "lg", density: "airy" },
  "wedding-imperial-dragon-crimson": { primary: "#6E1719", secondary: "#F2D7B5", accent: "#D9A441", surface: "#FFF8EC", text: "#351616", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
};

const TEMPLATE_MOTIFS: Record<string, string> = {
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
  const sectionGap = slug.includes("cinematic") || slug.includes("magazine") ? 330 : 360;

  sections.forEach((section, index) => {
    const top = 24 + index * sectionGap;
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

    if (section.type === "hero") {
      add({ id: `${section.id}-panel`, type: "shape", content: "", x: 0, y: top, width: 390, height: 290, zIndex: 1, shapeType: "rect", backgroundColor: primary, borderRadius: slug.includes("magazine") || slug.includes("cinematic") ? 0 : 28, opacity: 1 });
      add(makeText(`${section.id}-motif`, motif, 40, top + 18, 310, 36, accent, headingFont, 28));
      add(makeText(`${section.id}-subtitle`, readString(data.heroSubtitle, "TRÂN TRỌNG KÍNH MỜI"), 32, top + 58, 326, 30, "#ffffff", bodyFont, 11, { isUppercase: true, letterSpacing: 3 }));
      addBoundText("scene-groom", "groom.fullName", groom.shortName || groom.fullName, "Chú rể", top + 100, 30, { color: "#ffffff", isBold: true });
      add(makeText(`${section.id}-ampersand`, "&", 32, top + 139, 326, 28, accent, headingFont, 21));
      addBoundText("scene-bride", "bride.fullName", bride.shortName || bride.fullName, "Cô dâu", top + 168, 30, { color: "#ffffff", isBold: true });
      add(makeText(`${section.id}-date`, readString(event.eventDate, ""), 32, top + 222, 326, 26, "#ffffff", bodyFont, 13));
    } else if (section.type === "couple") {
      add(makeText(`${section.id}-label`, "CÔ DÂU & CHÚ RỂ", 32, top, 326, 26, accent, bodyFont, 11, { isUppercase: true, letterSpacing: 2 }));
      const groomAvatar = readString(groom.avatarUrl, "");
      const brideAvatar = readString(bride.avatarUrl, "");
      if (groomAvatar) add({ id: "scene-groom-avatar", type: "image", content: groomAvatar, imageUrl: groomAvatar, x: 42, y: top + 42, width: 130, height: 150, zIndex: 1, borderRadius: slug.includes("forest") ? 20 : 80, borderWidth: 2, borderColor: accent });
      if (brideAvatar) add({ id: "scene-bride-avatar", type: "image", content: brideAvatar, imageUrl: brideAvatar, x: 218, y: top + 42, width: 130, height: 150, zIndex: 1, borderRadius: slug.includes("forest") ? 20 : 80, borderWidth: 2, borderColor: accent });
      addBoundText("scene-couple-groom", "groom.fullName", groom.fullName, "Chú rể", top + 200, 17, { isBold: true });
      addBoundText("scene-couple-bride", "bride.fullName", bride.fullName, "Cô dâu", top + 244, 17, { isBold: true });
    } else if (["events", "calendar", "countdown"].includes(section.type)) {
      const widgetType: WidgetType = section.type === "countdown" ? "countdown" : "calendar";
      add(makeWidget(`${section.id}-widget`, widgetType, 24, top + 30, 342, 210, readString(event.eventName, "Ngày vui của chúng mình"), primary, {
        eventDate: readString(event.eventDate, ""), description: [event.venueName, event.address].filter(Boolean).join(" · "),
      }));
      bindings[`${section.id}-widget`] = "events[0].eventDate";
    } else if (section.type === "gallery") {
      add(makeWidget(`${section.id}-widget`, "album", 24, top + 20, 342, 280, "Album ảnh cưới", primary));
    } else if (section.type === "story") {
      const stories = Array.isArray(data.loveStory) ? data.loveStory : [];
      add(makeText(`${section.id}-title`, "CHUYỆN TÌNH YÊU", 32, top, 326, 30, accent, bodyFont, 11, { isUppercase: true, letterSpacing: 2 }));
      stories.slice(0, 3).forEach((storyValue, storyIndex) => {
        const story = readRecord(storyValue) ?? {};
        add(makeText(`${section.id}-story-${storyIndex}`, [story.date, story.title, story.description].filter(Boolean).join("\n"), 32, top + 42 + storyIndex * 82, 326, 72, primary, bodyFont, 13, { textAlign: "left", backgroundColor: "#ffffff", borderRadius: 12, padding: 12 }));
      });
      if (!stories.length) add(makeText(`${section.id}-empty`, readString(data.greeting, "Chúng mình đã cùng viết nên câu chuyện này."), 32, top + 48, 326, 76, primary, bodyFont, 14, { isItalic: true }));
    } else if (section.type === "map") {
      add(makeWidget(`${section.id}-widget`, "map", 24, top + 20, 342, 210, "Địa điểm tổ chức", primary, { url: readString(event.mapUrl, ""), description: readString(event.address, "Địa chỉ sẽ được cập nhật") }));
      bindings[`${section.id}-widget`] = "events[0].mapUrl";
    } else if (section.type === "rsvp" || section.type === "guestbook") {
      add(makeWidget(`${section.id}-widget`, "rsvp", 24, top + 26, 342, 180, "Xác nhận tham dự", primary, { description: readString(data.greeting, "Sự hiện diện của bạn là niềm vui của chúng mình."), buttonLabel: "Gửi xác nhận" }));
    } else if (section.type === "gift") {
      add(makeWidget(`${section.id}-widget`, "gift", 24, top + 26, 342, 180, "Gửi lời chúc mừng", primary, { description: "Gửi lời chúc và mừng cưới đến cô dâu chú rể." }));
    } else if (section.type === "parents") {
      const groomParents = readRecord(groom.parents) ?? {};
      const brideParents = readRecord(bride.parents) ?? {};
      add(makeText(`${section.id}-title`, "KÍNH MỜI HAI HỌ", 32, top, 326, 28, accent, bodyFont, 11, { isUppercase: true, letterSpacing: 2 }));
      add(makeText(`${section.id}-groom`, [groomParents.fatherName, groomParents.motherName].filter(Boolean).join("\n"), 32, top + 42, 326, 70, primary, bodyFont, 14));
      add(makeText(`${section.id}-bride`, [brideParents.fatherName, brideParents.motherName].filter(Boolean).join("\n"), 32, top + 116, 326, 70, primary, bodyFont, 14));
    } else {
      add(makeText(`${section.id}-farewell`, readString(data.greeting, "Cảm ơn bạn đã cùng chia sẻ ngày vui."), 32, top + 30, 326, 80, primary, headingFont, 17, { isItalic: true }));
    }
  });

  // Each design receives its own accent marker and design tokens from the server.
  const motifElement = makeText("scene-footer-motif", motif, 32, sections.length * sectionGap + 20, 326, 48, accent, headingFont, 28);
  elements.push(motifElement);
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
  const sectionGap = slug.includes("cinematic") || slug.includes("magazine") ? 330 : 360;
  const document: WeddingSceneDocument = {
    schemaVersion: 1,
    templateSlug: slug,
    width: 390,
    height: Math.max(1200, sections.length * sectionGap + 100),
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
