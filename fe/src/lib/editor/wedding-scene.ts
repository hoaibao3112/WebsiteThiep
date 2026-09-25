import type { CardDetail, WeddingDataPayload } from "@/types/card.types";
import type { CanvasElement } from "@/types/canvas.types";
import type {
  WeddingSceneDocument,
  WeddingSceneSection,
  WeddingSceneSectionId,
  WeddingSceneTokens,
} from "@/types/wedding-scene.types";
import { WEDDING_SCENE_VERSION } from "@/types/wedding-scene.types";
import { getTemplateConfig } from "./template-config";

const SECTION_ALIASES: Record<string, WeddingSceneSectionId> = {
  "hero-dragon": "hero",
  "arch-welcome": "hero",
  "chibi-songhy": "couple",
  "facing-couple": "couple",
  "date-circle": "calendar",
  "lake-calendar": "calendar",
  "calendar-card": "calendar",
  "calendar-kiss": "calendar",
  "countdown-dual": "countdown",
  "washi-poem": "story",
  "love-story": "story",
  "fall-in-love": "story",
  "promex-map": "map",
  "gift-dual-cards": "gift",
  "gift-pastel": "gift",
  "lotus-crest": "hero",
  "lotus-farewell": "farewell",
  "seal-farewell": "farewell",
  "sunshine-poster": "gallery",
  "songhy-illustration": "gallery",
  "lake-gallery": "gallery",
  "unified-events": "events",
};

const DEFAULT_TOKENS: Record<string, WeddingSceneTokens> = {
  "wedding-blank": { primary: "#2A2A2A", secondary: "#F0F0F0", accent: "#BE944E", surface: "#FFFFFF", text: "#1A1A1A", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
  "wedding-heritage-crimson-gold": { primary: "#8B1E2D", secondary: "#F4E8D0", accent: "#C9A45C", surface: "#FFFDF8", text: "#2E1B1B", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
  "wedding-modern-editorial-magazine": { primary: "#543A2C", secondary: "#E9DED5", accent: "#B9906D", surface: "#FAF8F5", text: "#211A17", headingFont: "Inter", bodyFont: "Inter", radius: "none", density: "compact" },
  "wedding-sweet-editorial-romance": { primary: "#B84A39", secondary: "#F7D8D7", accent: "#E9A7A2", surface: "#FFF9F8", text: "#42272A", headingFont: "Great Vibes", bodyFont: "Quicksand", radius: "lg", density: "airy" },
  "wedding-crimson-wine-marsala": { primary: "#6B1724", secondary: "#EBD4C6", accent: "#D2A35C", surface: "#FAF8F6", text: "#32181D", headingFont: "Playfair Display", bodyFont: "Inter", radius: "md", density: "comfortable" },
  "wedding-forest-green-botanical": { primary: "#364733", secondary: "#E2EAE0", accent: "#C9A45C", surface: "#F7F8F4", text: "#243322", headingFont: "Playfair Display", bodyFont: "Outfit", radius: "md", density: "airy" },
  "wedding-pure-lotus-heritage": { primary: "#3B5E43", secondary: "#E6EFE5", accent: "#B89052", surface: "#FBFCF6", text: "#213429", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
  "wedding-cinematic-editorial": { primary: "#1C1C1C", secondary: "#D6C9B8", accent: "#B99768", surface: "#F3F1ED", text: "#171717", headingFont: "Cinzel", bodyFont: "Inter", radius: "none", density: "compact" },
  "wedding-alpine-lake-romance": { primary: "#2B6B6D", secondary: "#D8ECE8", accent: "#D0A983", surface: "#F8FCFB", text: "#1C3C3D", headingFont: "Playfair Display", bodyFont: "Quicksand", radius: "lg", density: "airy" },
  "wedding-imperial-dragon-crimson": { primary: "#6E1719", secondary: "#F2D7B5", accent: "#D9A441", surface: "#FFF8EC", text: "#351616", headingFont: "Playfair Display", bodyFont: "Inter", radius: "sm", density: "comfortable" },
};

function asWeddingData(card: CardDetail): WeddingDataPayload {
  return card.categoryData?.cardCategory === "WEDDING"
    ? (card.categoryData as WeddingDataPayload)
    : ({ cardCategory: "WEDDING", groom: { fullName: "" }, bride: { fullName: "" } } as WeddingDataPayload);
}

function sceneElement(id: string, content: string, x: number, y: number, width: number, height: number, extra: Partial<CanvasElement> = {}): CanvasElement {
  return { id, type: "text", content, x, y, width, height, zIndex: 1, textAlign: "center", ...extra };
}

function createElements(data: WeddingDataPayload, slug: string, tokens: WeddingSceneTokens): CanvasElement[] {
  const primary = tokens.primary || "#8B1E2D";
  const accent = tokens.accent || "#C9A45C";
  const headingFont = tokens.headingFont || "Playfair Display";
  const bodyFont = tokens.bodyFont || "Inter";

  if (slug.includes("magazine")) {
    let top = 16;
    const elements: CanvasElement[] = [];
    elements.push({ id: "scene-hero", type: "preset", presetId: "p-mag-hero", content: "", x: 0, y: top, width: 390, height: 540, zIndex: 2 });
    top += 556;
    elements.push({ id: "scene-signatures", type: "preset", presetId: "p-mag-signatures", content: "", x: 0, y: top, width: 390, height: 170, zIndex: 2 });
    top += 186;
    elements.push({ id: "scene-parents-zigzag", type: "preset", presetId: "p-mag-parents-zigzag", content: "", x: 0, y: top, width: 390, height: 520, zIndex: 2 });
    top += 536;
    elements.push({ id: "scene-ceremony-invitation", type: "preset", presetId: "p-mag-ceremony-invitation", content: "", x: 0, y: top, width: 390, height: 680, zIndex: 2 });
    top += 696;
    elements.push({ id: "scene-venue", type: "widget", widgetType: "map", content: "", x: 24, y: top + 10, width: 342, height: 200, zIndex: 2, widgetConfig: { title: "Địa chỉ dự tiệc", description: "TƯ GIA NHÀ TRAI\n16 P. Phúc Minh, Phúc Diễn, Bắc Từ Liêm, TP. Hà Nội", buttonLabel: "Chỉ đường" } });
    top += 236;
    elements.push({ id: "scene-calendar-countdown", type: "preset", presetId: "p-mag-calendar-countdown", content: "", x: 0, y: top, width: 390, height: 530, zIndex: 2 });
    top += 546;
    elements.push({ id: "scene-rsvp-envelope", type: "preset", presetId: "p-mag-rsvp-envelope", content: "", x: 0, y: top, width: 390, height: 380, zIndex: 2 });
    top += 396;
    elements.push({ id: "scene-gift", type: "preset", presetId: "p-mag-gift", content: "", x: 0, y: top, width: 390, height: 200, zIndex: 2 });
    top += 216;
    elements.push({ id: "scene-album-gallery", type: "preset", presetId: "p-mag-album", content: "", x: 0, y: top, width: 390, height: 780, zIndex: 2 });
    top += 796;
    elements.push({ id: "scene-farewell", type: "preset", presetId: "p-mag-farewell", content: "", x: 0, y: top, width: 390, height: 440, zIndex: 2 });
    elements.push(
      sceneElement("scene-groom", data.groom?.fullName || "Chú rể", 0, 0, 0, 0, { opacity: 0 }),
      sceneElement("scene-bride", data.bride?.fullName || "Cô dâu", 0, 0, 0, 0, { opacity: 0 })
    );
    return elements;
  }

  if (slug === "wedding-crimson-wine-marsala") {
    let top = 16;
    const elements: CanvasElement[] = [];
    elements.push({ id: "scene-hero", type: "preset", presetId: "p-marsala-hero", content: "", x: 0, y: top, width: 390, height: 680, zIndex: 2 });
    top += 696;
    elements.push({ id: "scene-arch-calendar", type: "preset", presetId: "p-marsala-arch-calendar", content: "", x: 0, y: top, width: 390, height: 720, zIndex: 2 });
    top += 736;
    elements.push({ id: "scene-invitation-cards", type: "preset", presetId: "p-marsala-invitation-cards", content: "", x: 0, y: top, width: 390, height: 580, zIndex: 2 });
    top += 596;
    elements.push({ id: "scene-ceremony-groom", type: "preset", presetId: "p-marsala-ceremony-groom", content: "", x: 0, y: top, width: 390, height: 680, zIndex: 2 });
    top += 696;
    elements.push({ id: "scene-ceremony-bride", type: "preset", presetId: "p-marsala-ceremony-bride", content: "", x: 0, y: top, width: 390, height: 740, zIndex: 2 });
    top += 756;
    elements.push({ id: "scene-venue", type: "widget", widgetType: "map", content: "", x: 24, y: top + 10, width: 342, height: 200, zIndex: 2, widgetConfig: { title: "Địa chỉ dự tiệc", description: "TƯ GIA NHÀ TRAI\nKhu Phố Xuân Thượng, Phường Quảng Vinh, Nam Sầm Sơn, Thanh Hóa", buttonLabel: "Xem chỉ đường" } });
    top += 236;
    elements.push({ id: "scene-photo-collage", type: "preset", presetId: "p-marsala-photo-collage", content: "", x: 0, y: top, width: 390, height: 540, zIndex: 2 });
    top += 556;
    elements.push({ id: "scene-rsvp", type: "preset", presetId: "p-marsala-rsvp", content: "", x: 0, y: top, width: 390, height: 200, zIndex: 2 });
    top += 216;
    elements.push({ id: "scene-gift", type: "preset", presetId: "p-marsala-gift", content: "", x: 0, y: top, width: 390, height: 240, zIndex: 2 });
    top += 256;
    elements.push({ id: "scene-farewell", type: "preset", presetId: "p-marsala-farewell", content: "", x: 0, y: top, width: 390, height: 580, zIndex: 2 });
    elements.push(
      sceneElement("scene-groom", data.groom?.fullName || "Nguyễn Minh", 0, 0, 0, 0, { opacity: 0 }),
      sceneElement("scene-bride", data.bride?.fullName || "Bùi Phương", 0, 0, 0, 0, { opacity: 0 })
    );
    return elements;
  }

  if (slug === "wedding-forest-green-botanical") {
    let top = 16;
    const elements: CanvasElement[] = [];
    elements.push({ id: "scene-envelope", type: "preset", presetId: "p-forest-envelope", content: "", x: 0, y: top, width: 390, height: 680, zIndex: 2 });
    top += 696;
    elements.push({ id: "scene-polaroid-calendar", type: "preset", presetId: "p-forest-polaroid-calendar", content: "", x: 0, y: top, width: 390, height: 440, zIndex: 2 });
    top += 456;
    elements.push({ id: "scene-invitation", type: "preset", presetId: "p-forest-invitation", content: "", x: 0, y: top, width: 390, height: 300, zIndex: 2 });
    top += 316;
    elements.push({ id: "scene-facing-photos", type: "preset", presetId: "p-forest-facing-photos", content: "", x: 0, y: top, width: 390, height: 420, zIndex: 2 });
    top += 436;
    elements.push({ id: "scene-parents", type: "preset", presetId: "p-forest-parents", content: "", x: 0, y: top, width: 390, height: 160, zIndex: 2 });
    top += 176;
    elements.push({ id: "scene-events-card", type: "preset", presetId: "p-forest-events-card", content: "", x: 0, y: top, width: 390, height: 820, zIndex: 2 });
    top += 836;
    elements.push({ id: "scene-venue", type: "widget", widgetType: "map", content: "", x: 24, y: top + 10, width: 342, height: 200, zIndex: 2, widgetConfig: { title: "Địa chỉ dự tiệc", description: "TƯ GIA NHÀ GÁI\nXóm 5 , Xã Phú Cát, Quốc Oai, Hà Nội", buttonLabel: "Xem chỉ đường" } });
    top += 236;
    elements.push({ id: "scene-gallery-grid", type: "preset", presetId: "p-forest-gallery-grid", content: "", x: 0, y: top, width: 390, height: 780, zIndex: 2 });
    top += 796;
    elements.push({ id: "scene-rsvp", type: "preset", presetId: "p-forest-rsvp", content: "", x: 0, y: top, width: 390, height: 240, zIndex: 2 });
    top += 256;
    elements.push({ id: "scene-gift", type: "preset", presetId: "p-forest-gift", content: "", x: 0, y: top, width: 390, height: 220, zIndex: 2 });
    top += 236;
    elements.push({ id: "scene-farewell", type: "preset", presetId: "p-forest-farewell", content: "", x: 0, y: top, width: 390, height: 480, zIndex: 2 });
    elements.push(
      sceneElement("scene-groom", data.groom?.fullName || "Tuấn Minh", 0, 0, 0, 0, { opacity: 0 }),
      sceneElement("scene-bride", data.bride?.fullName || "Mai Lan", 0, 0, 0, 0, { opacity: 0 })
    );
    return elements;
  }

  if (slug.includes("sweet") || slug.includes("heritage")) {
    let top = 16;
    const elements: CanvasElement[] = [
      { id: "scene-envelope", type: "preset", presetId: "p-envelope-sweet", content: "", x: 0, y: top, width: 390, height: 400, zIndex: 2 },
    ];
    top += 416;
    elements.push({ id: "scene-hero", type: "preset", presetId: "p-hero-sweet", content: "", x: 0, y: top, width: 390, height: 510, zIndex: 2 });
    top += 526;
    elements.push({ id: "scene-ceremony", type: "preset", presetId: "p-ceremony-parents-date", content: "", x: 0, y: top, width: 390, height: 470, zIndex: 2 });
    top += 486;
    elements.push({ id: "scene-location", type: "preset", presetId: "p-location-map-sweet", content: "", x: 0, y: top, width: 390, height: 330, zIndex: 2 });
    top += 346;
    elements.push({ id: "scene-marry-me", type: "preset", presetId: "p-sweet-marry-me", content: "", x: 0, y: top, width: 390, height: 390, zIndex: 2 });
    top += 406;
    elements.push({ id: "scene-about-bride", type: "preset", presetId: "p-about-bride", content: "", x: 0, y: top, width: 390, height: 400, zIndex: 2 });
    top += 416;
    elements.push({ id: "scene-about-groom", type: "preset", presetId: "p-about-groom", content: "", x: 0, y: top, width: 390, height: 400, zIndex: 2 });
    top += 416;
    elements.push({ id: "scene-calendar", type: "preset", presetId: "p-calendar-heart-photo", content: "", x: 0, y: top, width: 390, height: 440, zIndex: 2 });
    top += 456;
    elements.push({ id: "scene-timeline", type: "preset", presetId: "p-timeline-sweet", content: "", x: 0, y: top, width: 390, height: 250, zIndex: 2 });
    top += 266;
    elements.push({ id: "scene-gallery", type: "preset", presetId: "p-gallery-editorial-stack", content: "", x: 0, y: top, width: 390, height: 590, zIndex: 2 });
    top += 606;
    elements.push({ id: "scene-rsvp", type: "preset", presetId: "p-rsvp-arch", content: "", x: 0, y: top, width: 390, height: 280, zIndex: 2 });
    top += 296;
    elements.push({ id: "scene-gift", type: "preset", presetId: "p-dual-gift-qr", content: "", x: 0, y: top, width: 390, height: 350, zIndex: 2 });
    top += 366;
    elements.push({ id: "scene-thank-you", type: "preset", presetId: "p-thank-you-chibi", content: "", x: 0, y: top, width: 390, height: 250, zIndex: 2 });
    elements.push(
      sceneElement("scene-groom", data.groom?.fullName || "Chú rể", 0, 0, 0, 0, { opacity: 0 }),
      sceneElement("scene-bride", data.bride?.fullName || "Cô dâu", 0, 0, 0, 0, { opacity: 0 })
    );
    return elements;
  }

  const elements: CanvasElement[] = [
    // Hero Banner Panel
    {
      id: "hero-panel",
      type: "shape",
      content: "",
      x: 0,
      y: 20,
      width: 390,
      height: 280,
      zIndex: 1,
      shapeType: "rect",
      backgroundColor: primary,
      borderRadius: slug.includes("magazine") || slug.includes("cinematic") ? 0 : 24,
      opacity: 1,
    },
    // Subtitle
    sceneElement("hero-subtitle", data.heroSubtitle || "TRÂN TRỌNG KÍNH MỜI", 32, 50, 326, 26, {
      fontSize: 11,
      color: "#ffffff",
      fontFamily: bodyFont,
      isUppercase: true,
      letterSpacing: 3,
      zIndex: 2,
    }),
    // Groom
    sceneElement("scene-groom", data.groom?.shortName || data.groom?.fullName || "Chú rể", 32, 90, 326, 44, {
      fontSize: 28,
      isBold: true,
      color: "#ffffff",
      fontFamily: headingFont,
      zIndex: 2,
    }),
    // Ampersand
    sceneElement("scene-ampersand", "&", 32, 134, 326, 26, {
      fontSize: 20,
      color: accent,
      fontFamily: headingFont,
      zIndex: 2,
    }),
    // Bride
    sceneElement("scene-bride", data.bride?.shortName || data.bride?.fullName || "Cô dâu", 32, 160, 326, 44, {
      fontSize: 28,
      isBold: true,
      color: "#ffffff",
      fontFamily: headingFont,
      zIndex: 2,
    }),
    // Event Date
    sceneElement(
      "hero-date",
      data.events?.[0]?.eventDate ? new Date(data.events[0].eventDate).toLocaleDateString("vi-VN") : "HÔM NAY",
      32,
      216,
      326,
      26,
      {
        fontSize: 13,
        color: "#ffffff",
        fontFamily: bodyFont,
        zIndex: 2,
      }
    ),
    // Greeting
    sceneElement("scene-greeting", data.greeting || "Trân trọng kính mời bạn đến chung vui", 32, 320, 326, 50, {
      fontSize: 14,
      color: primary,
      fontFamily: bodyFont,
      isItalic: true,
      zIndex: 2,
    }),
  ];

  // Avatars if available
  const groomAvatar = data.groom?.avatarUrl || "/images/demo/groom-avatar.png";
  const brideAvatar = data.bride?.avatarUrl || "/images/demo/bride-avatar.png";
  elements.push(
    {
      id: "scene-groom-avatar",
      type: "image",
      content: groomAvatar,
      imageUrl: groomAvatar,
      x: 42,
      y: 400,
      width: 130,
      height: 150,
      zIndex: 2,
      borderRadius: slug.includes("forest") ? 20 : 75,
      borderWidth: 2,
      borderColor: accent,
    },
    {
      id: "scene-bride-avatar",
      type: "image",
      content: brideAvatar,
      imageUrl: brideAvatar,
      x: 218,
      y: 400,
      width: 130,
      height: 150,
      zIndex: 2,
      borderRadius: slug.includes("forest") ? 20 : 75,
      borderWidth: 2,
      borderColor: accent,
    },
    sceneElement("couple-groom-name", data.groom?.fullName || "Chú rể", 32, 560, 150, 30, {
      fontSize: 15,
      isBold: true,
      color: primary,
      fontFamily: headingFont,
      zIndex: 2,
    }),
    sceneElement("couple-bride-name", data.bride?.fullName || "Cô dâu", 208, 560, 150, 30, {
      fontSize: 15,
      isBold: true,
      color: primary,
      fontFamily: headingFont,
      zIndex: 2,
    })
  );

  return elements;
}

export function createWeddingScene(card: CardDetail, templateSlug = card.template?.slug): WeddingSceneDocument {
  return createWeddingSceneFromWeddingData(asWeddingData(card), templateSlug);
}

export function createWeddingSceneFromWeddingData(data: WeddingDataPayload, templateSlug?: string): WeddingSceneDocument {
  const config = getTemplateConfig(templateSlug, "WEDDING");
  const slug = config?.slug || templateSlug || "wedding-heritage-crimson-gold";

  if (slug === "wedding-blank") {
    const tokens = DEFAULT_TOKENS["wedding-blank"];
    return {
      schemaVersion: WEDDING_SCENE_VERSION,
      templateSlug: slug,
      width: 390,
      height: 1200,
      background: { color: tokens.surface },
      tokens,
      sections: [{ id: "section-hero-0", type: "hero", label: "hero", visible: true, order: 0, elementIds: ["blank-welcome"] }],
      elements: [
        sceneElement("blank-welcome", "MẪU TRẮNG SÁNG TẠO\n\nNhấn vào thanh công cụ bên trái để bắt đầu thêm Chữ, Ảnh hoặc Tiện ích", 20, 180, 350, 120, {
          fontSize: 14,
          color: "#666666",
          backgroundColor: "#f9f9f9",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e5e5e5",
        }),
      ],
      bindings: {},
    };
  }

  const isRichTemplate = slug.includes("sweet") || slug.includes("heritage");
  const isMagTemplate = slug.includes("magazine");
  const isMarsalaTemplate = slug === "wedding-crimson-wine-marsala";
  const isForestTemplate = slug === "wedding-forest-green-botanical";
  const defaultRichSections = ["envelope", "hero", "ceremony", "location", "marry-me", "about-bride", "about-groom", "calendar", "timeline", "gallery", "rsvp", "gift", "thank-you"];
  const defaultMagSections = ["hero", "signatures", "parents-zigzag", "ceremony-invitation", "venue", "calendar-countdown", "rsvp-envelope", "gift", "album-gallery", "farewell"];
  const defaultMarsalaSections = ["hero", "arch-calendar", "invitation-cards", "ceremony-groom", "ceremony-bride", "venue", "photo-collage", "rsvp", "gift", "farewell"];
  const defaultForestSections = ["envelope", "polaroid-calendar", "invitation", "facing-photos", "parents", "events-card", "venue", "gallery-grid", "rsvp", "gift", "farewell"];
  const sectionIds = isRichTemplate ? defaultRichSections : isMagTemplate ? defaultMagSections : isMarsalaTemplate ? defaultMarsalaSections : isForestTemplate ? defaultForestSections : (config?.sections || ["hero", "couple", "events", "gallery", "rsvp"]);
  const sections: WeddingSceneSection[] = sectionIds.map((rawId, index) => ({
    id: `section-${rawId}-${index}`,
    type: SECTION_ALIASES[rawId] || (rawId as WeddingSceneSectionId),
    label: rawId,
    visible: true,
    order: index,
    elementIds: isRichTemplate || isMagTemplate || isMarsalaTemplate || isForestTemplate ? [`scene-${rawId}`] : index === 0 ? ["hero-panel", "hero-subtitle", "scene-groom", "scene-ampersand", "scene-bride", "hero-date", "scene-greeting"] : [],
  }));
  const tokens = DEFAULT_TOKENS[slug] || DEFAULT_TOKENS["wedding-heritage-crimson-gold"];
  const elements = createElements(data, slug, tokens);
  const maxY = elements.reduce((max, el) => Math.max(max, (typeof el.y === "number" ? el.y : 0) + (typeof el.height === "number" ? el.height : 0)), 1200);

  return {
    schemaVersion: WEDDING_SCENE_VERSION,
    templateSlug: slug,
    width: 390,
    height: maxY + 40,
    background: { color: tokens.surface },
    tokens,
    sections,
    elements,
    bindings: {
      "scene-groom": "groom.fullName",
      "scene-bride": "bride.fullName",
      "scene-greeting": "greeting",
    },
  };
}

export function hydrateWeddingScene(scene: WeddingSceneDocument, data: WeddingDataPayload): WeddingSceneDocument {
  const values: Record<string, string> = {
    "groom.fullName": data.groom?.fullName || "Chú rể",
    "groom.shortName": data.groom?.shortName || data.groom?.fullName || "Chú rể",
    "bride.fullName": data.bride?.fullName || "Cô dâu",
    "bride.shortName": data.bride?.shortName || data.bride?.fullName || "Cô dâu",
    greeting: data.greeting || "Trân trọng kính mời bạn đến chung vui",
  };
  return {
    ...scene,
    elements: scene.elements.map((element) => {
      const binding = scene.bindings[element.id];
      return binding && values[binding] ? { ...element, content: values[binding] } : element;
    }),
  };
}

export function isWeddingSceneDocument(value: unknown): value is WeddingSceneDocument {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.schemaVersion === WEDDING_SCENE_VERSION && typeof record.templateSlug === "string" && Array.isArray(record.elements) && Array.isArray(record.sections);
}

export function getWeddingScene(card: CardDetail, fallbackSlug?: string): WeddingSceneDocument | null {
  const categoryData = card?.categoryData as unknown as Record<string, unknown> | undefined;
  const existing = categoryData?.canvasDocument;
  if (isWeddingSceneDocument(existing)) {
    return existing;
  }
  // Fallback an toàn: Luôn tự tạo scene hợp lệ cho thiệp cưới, không bao giờ để scene bị null gây trang trắng
  if (card?.cardCategory === "WEDDING") {
    const slug = fallbackSlug || card.template?.slug || (card as any).templateSlug;
    return createWeddingScene(card, slug);
  }
  return null;
}
