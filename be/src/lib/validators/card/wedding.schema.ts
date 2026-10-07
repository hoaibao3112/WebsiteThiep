import { z } from "zod";
import { EventSchema } from "./event.schema";

const ParentInfoSchema = z.object({
  fatherName: z.string().nullable().optional(),
  motherName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  isPassedAwayFather: z.boolean().default(false),
  isPassedAwayMother: z.boolean().default(false),
});

const PersonBioSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  shortName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional().or(z.literal("")),
  birthOrder: z.string().nullable().optional(), // "Trưởng nam", "Út nữ"...
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  parents: ParentInfoSchema.nullable().optional(),
  story: z.string().nullable().optional(),
});

const LoveStoryMilestoneSchema = z.object({
  title: z.string().trim().max(120).default(""),
  date: z.string().trim().max(80).default(""),
  description: z.string().trim().max(1_000).nullable().optional(),
  imageUrl: z.string().nullable().optional().or(z.literal("")),
});

const WeddingPhotoSchema = z.object({
  id: z.string().nullable().optional(),
  url: z.string().min(1),
  alt: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  thumbUrl: z.string().nullable().optional(),
  isCover: z.boolean().nullable().optional(),
});

import { CanvasElementSchema, CanvasDocumentSchema } from "./canvas-element.schema";
import { WeddingSceneDocumentSchema } from "./wedding-scene.schema";
import { EnvelopeConfigSchema } from "../../../schemas/envelope.schema";

export const TimelineEventSchema = z.object({
  time: z.string(),
  title: z.string(),
  icon: z.string().optional(),
});

export const WeddingDataSchema = z.object({
  cardCategory: z.literal("WEDDING"),
  heroSubtitle: z.string().nullable().optional(),
  headerSubtitle: z.string().nullable().optional(),
  headerDate: z.string().nullable().optional(),
  invitationTitle: z.string().nullable().optional(),
  coverPhotoUrl: z.string().nullable().optional().or(z.literal("")),
  isReverseOrder: z.boolean().optional().default(false),
  videoUrl: z.string().max(2000).nullable().optional(),
  groom: PersonBioSchema,
  bride: PersonBioSchema,
  greeting: z.string().nullable().optional(),
  loveStory: z.array(LoveStoryMilestoneSchema).default([]),
  timelineEvents: z.array(TimelineEventSchema).optional().default([]),
  events: z.array(EventSchema).optional().default([]),
  photos: z.array(WeddingPhotoSchema).optional().default([]),
  canvas: CanvasDocumentSchema.optional(),
  canvasElements: z.array(CanvasElementSchema).optional(),
  canvasDocument: WeddingSceneDocumentSchema.optional(),
  envelopeConfig: EnvelopeConfigSchema.optional(),
  elementAnimations: z.record(z.unknown()).optional(),
  canvasWidth: z.number().optional(),
  canvasHeight: z.number().optional(),
  canvasBackgroundColor: z.string().optional(),
  canvasBackgroundPattern: z.enum(["none", "flower-small", "flower-large"]).optional(),
  showBottomToolbar: z.boolean().optional(),
  showWishButton: z.boolean().optional(),
  showGiftQR: z.boolean().optional(),
  showRSVP: z.boolean().optional(),
  fieldPositions: z.record(z.any()).optional(),
  fieldScales: z.record(z.any()).optional(),
}).passthrough();

export type WeddingData = z.infer<typeof WeddingDataSchema>;
