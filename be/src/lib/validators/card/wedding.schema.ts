import { z } from "zod";
import { EventSchema } from "./event.schema";

const ParentInfoSchema = z.object({
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  isPassedAwayFather: z.boolean().default(false),
  isPassedAwayMother: z.boolean().default(false),
});

const PersonBioSchema = z.object({
  fullName: z.string().min(2, "Họ tên không được để trống"),
  shortName: z.string().optional(),
  avatarUrl: z.string().url("Avatar không hợp lệ").optional().or(z.literal("")),
  birthOrder: z.string().optional(), // "Trưởng nam", "Út nữ"...
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
  groom: PersonBioSchema,
  bride: PersonBioSchema,
  greeting: z.string().optional(),
  loveStory: z.array(LoveStoryMilestoneSchema).default([]),
  events: z.array(EventSchema).min(1, "Cần ít nhất 1 sự kiện cưới (Lễ hoặc Tiệc)"),
});

export type WeddingData = z.infer<typeof WeddingDataSchema>;
