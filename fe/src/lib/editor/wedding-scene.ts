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
  return card.categoryData.cardCategory === "WEDDING"
    ? card.categoryData
    : ({ cardCategory: "WEDDING", groom: { fullName: "" }, bride: { fullName: "" } } as WeddingDataPayload);
}

function sceneElement(id: string, content: string, x: number, y: number, width: number, height: number, extra: Partial<CanvasElement> = {}): CanvasElement {
  return { id, type: "text", content, x, y, width, height, zIndex: 1, textAlign: "center", ...extra };
}

function createElements(data: WeddingDataPayload): CanvasElement[] {
  return [
    sceneElement("scene-groom", data.groom.fullName || "Chú rể", 40, 250, 310, 54, { fontSize: 30, isBold: true, color: "#2E1B1B" }),
    sceneElement("scene-ampersand", "&", 40, 310, 310, 36, { fontSize: 24, color: "#C9A45C" }),
    sceneElement("scene-bride", data.bride.fullName || "Cô dâu", 40, 350, 310, 54, { fontSize: 30, isBold: true, color: "#2E1B1B" }),
    sceneElement("scene-greeting", data.greeting || "Trân trọng kính mời bạn đến chung vui", 40, 430, 310, 64, { fontSize: 16, color: "#4B3A37" }),
  ];
}

export function createWeddingScene(card: CardDetail, templateSlug = card.template?.slug): WeddingSceneDocument {
  return createWeddingSceneFromWeddingData(asWeddingData(card), templateSlug);
}

export function createWeddingSceneFromWeddingData(data: WeddingDataPayload, templateSlug?: string): WeddingSceneDocument {
  const config = getTemplateConfig(templateSlug, "WEDDING");
  const slug = config?.slug || "wedding-heritage-crimson-gold";
  const sectionIds = config?.sections || ["hero", "couple", "events", "gallery", "rsvp"];
  const sections: WeddingSceneSection[] = sectionIds.map((rawId, index) => ({
    id: `section-${rawId}-${index}`,
    type: SECTION_ALIASES[rawId] || (rawId as WeddingSceneSectionId),
    label: rawId,
    visible: true,
    order: index,
    elementIds: index === 0 ? ["scene-groom", "scene-ampersand", "scene-bride", "scene-greeting"] : [],
  }));
  const tokens = DEFAULT_TOKENS[slug] || DEFAULT_TOKENS["wedding-heritage-crimson-gold"];
  return {
    schemaVersion: WEDDING_SCENE_VERSION,
    templateSlug: slug,
    width: 390,
    height: Math.max(1200, sections.length * 360),
    background: { color: tokens.surface },
    tokens,
    sections,
    elements: createElements(data),
    bindings: {
      "scene-groom": "groom.fullName",
      "scene-bride": "bride.fullName",
      "scene-greeting": "greeting",
    },
  };
}

export function hydrateWeddingScene(scene: WeddingSceneDocument, data: WeddingDataPayload): WeddingSceneDocument {
  const values: Record<string, string> = {
    "groom.fullName": data.groom.fullName || "Chú rể",
    "groom.shortName": data.groom.shortName || data.groom.fullName || "Chú rể",
    "bride.fullName": data.bride.fullName || "Cô dâu",
    "bride.shortName": data.bride.shortName || data.bride.fullName || "Cô dâu",
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

export function getWeddingScene(card: CardDetail): WeddingSceneDocument | null {
  const categoryData = card.categoryData as unknown as Record<string, unknown>;
  const existing = categoryData.canvasDocument;
  return isWeddingSceneDocument(existing) ? existing : null;
}
