import { z } from "zod";
import { CanvasElementSchema } from "./canvas-element.schema";

const HexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

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
    type: z.enum(["hero", "couple", "parents", "events", "calendar", "countdown", "gallery", "story", "map", "rsvp", "gift", "guestbook", "farewell"]),
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
