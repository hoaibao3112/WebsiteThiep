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
  "wedding-crimson-wine-marsala": { primary: "#6B1724", secondary: "#EBD4C6", accent: "#D2A35C", surface: "#FFF9F2", text: "#32181D", headingFont: "Playfair Display", bodyFont: "Inter", radius: "md", density: "comfortable" },
  "wedding-forest-green-botanical": { primary: "#3D4A34", secondary: "#DCE4D4", accent: "#A78B5B", surface: "#F8F7F0", text: "#263027", headingFont: "Outfit", bodyFont: "Outfit", radius: "md", density: "airy" },
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

  const sectionIds = config?.sections || ["hero", "couple", "events", "gallery", "rsvp"];
  const sections: WeddingSceneSection[] = sectionIds.map((rawId, index) => ({
    id: `section-${rawId}-${index}`,
    type: SECTION_ALIASES[rawId] || (rawId as WeddingSceneSectionId),
    label: rawId,
    visible: true,
    order: index,
    elementIds: index === 0 ? ["hero-panel", "hero-subtitle", "scene-groom", "scene-ampersand", "scene-bride", "hero-date", "scene-greeting"] : [],
  }));
  const tokens = DEFAULT_TOKENS[slug] || DEFAULT_TOKENS["wedding-heritage-crimson-gold"];
  return {
    schemaVersion: WEDDING_SCENE_VERSION,
    templateSlug: slug,
    width: 390,
    height: Math.max(1200, sections.length * 340),
    background: { color: tokens.surface },
    tokens,
    sections,
    elements: createElements(data, slug, tokens),
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
