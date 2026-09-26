import { z } from "zod";
import { CanvasElementSchema } from "./canvas-element.schema";

const HexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const WEDDING_SCENE_SECTION_TYPES = [
  // Core standard types
  "hero",
  "couple",
  "parents",
  "events",
  "calendar",
  "countdown",
  "gallery",
  "story",
  "map",
  "rsvp",
  "gift",
  "guestbook",
  "farewell",

  // Template-generated section types
  "envelope",
  "ceremony",
  "location",
  "marry-me",
  "about-bride",
  "about-groom",
  "timeline",
  "thank-you",
  "signatures",
  "parents-zigzag",
  "ceremony-invitation",
  "venue",
  "calendar-countdown",
  "rsvp-envelope",
  "album-gallery",
  "arch-calendar",
  "invitation-cards",
  "ceremony-groom",
  "ceremony-bride",
  "photo-collage",
  "polaroid-calendar",
  "invitation",
  "facing-photos",
  "events-card",
  "gallery-grid",
  "announcement",
  "invitation-header",
  "ceremonies",
  "album",

  // Legacy aliases
  "hero-dragon",
  "arch-welcome",
  "chibi-songhy",
  "facing-couple",
  "date-circle",
  "lake-calendar",
  "calendar-card",
  "calendar-kiss",
  "countdown-dual",
  "washi-poem",
  "love-story",
  "fall-in-love",
  "promex-map",
  "gift-dual-cards",
  "gift-pastel",
  "lotus-crest",
  "lotus-farewell",
  "seal-farewell",
  "sunshine-poster",
  "songhy-illustration",
  "lake-gallery",
  "unified-events",
] as const;

export type WeddingSceneSectionType = (typeof WEDDING_SCENE_SECTION_TYPES)[number];

export const WeddingSceneDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  templateSlug: z.string().trim().min(1).max(100),
  width: z.number().int().min(200).max(1_200),
  height: z.number().int().min(200).max(30_000),
  background: z.object({
    color: z.string().optional(),
    pattern: z.string().optional(),
    imageUrl: z.string().max(2_000).optional(),
  }).passthrough(),
  tokens: z.record(z.any()).optional(),
  sections: z.array(z.record(z.any())).max(50).optional().default([]),
  elements: z.array(CanvasElementSchema).max(500).optional().default([]),
  bindings: z.record(z.any()).optional().default({}),
}).passthrough();

export type WeddingSceneDocumentInput = z.infer<typeof WeddingSceneDocumentSchema>;
