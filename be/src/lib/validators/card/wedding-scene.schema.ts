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
  height: z.number().int().min(390).max(20_000),
  background: z.object({
    color: HexColor,
    pattern: z.enum(["none", "flower-small", "flower-large"]).optional(),
    imageUrl: z.string().max(2_000).optional(),
  }).strict(),
  tokens: z.object({
    primary: HexColor,
    secondary: HexColor,
    accent: HexColor,
    surface: HexColor,
    text: HexColor,
    headingFont: z.string().max(100),
    bodyFont: z.string().max(100),
    radius: z.enum(["none", "sm", "md", "lg", "full"]),
    density: z.enum(["airy", "comfortable", "compact"]),
    motif: z.string().max(8).optional(),
  }).strict(),
  sections: z.array(z.object({
    id: z.string().min(1).max(120),
    type: z.enum(WEDDING_SCENE_SECTION_TYPES),
    label: z.string().max(120),
    visible: z.boolean(),
    order: z.number().int().min(0).max(100),
    elementIds: z.array(z.string().max(120)).max(200),
  }).strict()).max(30),
  elements: z.array(CanvasElementSchema).max(200),
  bindings: z.record(z.string().regex(/^(groom|bride|coverPhotoUrl|greeting|events\[\d+\]|loveStory\[\d+\])([.][A-Za-z]+)*$/)).superRefine((bindings, context) => {
    if (Object.keys(bindings).length > 200) context.addIssue({ code: z.ZodIssueCode.custom, message: "Tối đa 200 binding trong scene" });
  }),
}).strict();

export type WeddingSceneDocumentInput = z.infer<typeof WeddingSceneDocumentSchema>;
