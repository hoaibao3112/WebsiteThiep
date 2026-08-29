import { z } from "zod";
import { EventSchema } from "./event.schema";

const ParentInfoSchema = z.object({
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  isPassedAwayFather: z.boolean().default(false),
  isPassedAwayMother: z.boolean().default(false),
});

const PersonBioSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  shortName: z.string().optional(),
  avatarUrl: z.string().url("Avatar không hợp lệ").optional().or(z.literal("")),
  birthOrder: z.string().optional(), // "Trưởng nam", "Út nữ"...
  phone: z.string().optional(),
  parents: ParentInfoSchema.optional(),
  story: z.string().optional(),
});

const LoveStoryMilestoneSchema = z.object({
  title: z.string().min(1, "Tiêu đề mốc thời gian"),
  date: z.string().min(1, "Thời gian (VD: 10/2022)"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const WeddingDataSchema = z.object({
  cardCategory: z.literal("WEDDING"),
  heroSubtitle: z.string().optional(),
  invitationTitle: z.string().optional(),
  coverPhotoUrl: z.string().optional().or(z.literal("")),
  groom: PersonBioSchema,
  bride: PersonBioSchema,
  greeting: z.string().optional(),
  loveStory: z.array(LoveStoryMilestoneSchema).default([]),
  events: z.array(EventSchema).optional().default([]),
  photos: z.array(z.any()).optional().default([]),
});

export type WeddingData = z.infer<typeof WeddingDataSchema>;
