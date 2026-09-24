import { z } from "zod";
import { EventSchema } from "./event.schema";

const ParentInfoSchema = z.object({
  fatherName: z.string().nullable().optional(),
  motherName: z.string().nullable().optional(),
  isPassedAwayFather: z.boolean().default(false),
  isPassedAwayMother: z.boolean().default(false),
});

const PersonBioSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  shortName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional().or(z.literal("")),
  birthOrder: z.string().nullable().optional(), // "Trưởng nam", "Út nữ"...
  phone: z.string().nullable().optional(),
  parents: ParentInfoSchema.nullable().optional(),
  story: z.string().nullable().optional(),
});

const LoveStoryMilestoneSchema = z.object({
  title: z.string().min(1, "Tiêu đề mốc thời gian"),
  date: z.string().min(1, "Thời gian (VD: 10/2022)"),
  description: z.string().nullable().optional(),
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

export const WeddingDataSchema = z.object({
  cardCategory: z.literal("WEDDING"),
  heroSubtitle: z.string().nullable().optional(),
  invitationTitle: z.string().nullable().optional(),
  coverPhotoUrl: z.string().nullable().optional().or(z.literal("")),
  groom: PersonBioSchema,
  bride: PersonBioSchema,
  greeting: z.string().nullable().optional(),
  loveStory: z.array(LoveStoryMilestoneSchema).default([]),
  events: z.array(EventSchema).optional().default([]),
  photos: z.array(WeddingPhotoSchema).optional().default([]),
  canvas: CanvasDocumentSchema.optional(),
  canvasElements: z.array(CanvasElementSchema).optional(),
  fieldPositions: z.record(z.any()).optional(),
  fieldScales: z.record(z.any()).optional(),
}).passthrough();


export type WeddingData = z.infer<typeof WeddingDataSchema>;
