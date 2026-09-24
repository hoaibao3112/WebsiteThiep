import { z } from "zod";
import { WeddingDataSchema } from "./wedding.schema";
import { BirthdayDataSchema } from "./birthday.schema";
import { NewbornDataSchema } from "./newborn.schema";

export * from "./event.schema";
export * from "./wedding.schema";
export * from "./birthday.schema";
export * from "./newborn.schema";
export * from "./canvas-element.schema";
import { CanvasElementSchema, CanvasDocumentSchema } from "./canvas-element.schema";

export const CategoryDataSchema = z.discriminatedUnion("cardCategory", [
  WeddingDataSchema,
  BirthdayDataSchema,
  NewbornDataSchema,
]);

export type CategoryData = z.infer<typeof CategoryDataSchema>;

const normalizeSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const StoredImageUrlSchema = z.string().refine(
  (value) =>
    /^https?:\/\//i.test(value) ||
    value.startsWith("/uploads/") ||
    value.startsWith("/images/") ||
    value.startsWith("data:image/") ||
    (value.startsWith("/") && !value.startsWith("//")),
  "Ảnh không hợp lệ hoặc chưa được tải lên máy chủ"
);

export const PhotoSchema = z.object({
  id: z.string().nullable().optional(),
  url: StoredImageUrlSchema,
  thumbUrl: z.union([StoredImageUrlSchema, z.literal("")]).nullable().optional(),
  caption: z.string().trim().max(200).nullable().optional(),
  isCover: z.boolean().nullable().optional(),
});

const DraftEventSchema = z.object({
  id: z.string().nullable().optional(),
  eventName: z.string().trim().max(120).default(""),
  eventDate: z.coerce.date(),
  lunarDate: z.string().trim().max(100).nullable().optional(),
  venueName: z.string().trim().max(200).default(""),
  address: z.string().trim().max(500).default(""),
  mapUrl: z.string().trim().max(2_000).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

const DraftPersonSchema = z.object({
  fullName: z.string().trim().max(120).default(""),
  shortName: z.string().trim().max(80).nullable().optional(),
  avatarUrl: z.union([StoredImageUrlSchema, z.literal("")]).nullable().optional(),
  birthOrder: z.string().trim().max(80).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  parents: z.object({
    fatherName: z.string().trim().max(120).nullable().optional(),
    motherName: z.string().trim().max(120).nullable().optional(),
  }).nullable().optional(),
  story: z.string().trim().max(2_000).nullable().optional(),
});

const DraftCategoryDataSchema = z.discriminatedUnion("cardCategory", [
  z.object({
    cardCategory: z.literal("WEDDING"),
    heroSubtitle: z.string().trim().max(200).nullable().optional(),
    invitationTitle: z.string().trim().max(200).nullable().optional(),
    coverPhotoUrl: z.union([StoredImageUrlSchema, z.literal("")]).nullable().optional(),
    groom: DraftPersonSchema.default({ fullName: "" }),
    bride: DraftPersonSchema.default({ fullName: "" }),
    greeting: z.string().trim().max(2_000).nullable().optional(),
    loveStory: z.array(z.object({
      title: z.string().trim().max(120).default(""),
      date: z.string().trim().max(80).default(""),
      description: z.string().trim().max(1_000).nullable().optional(),
      imageUrl: z.union([StoredImageUrlSchema, z.literal("")]).nullable().optional(),
    })).max(20).default([]),
    events: z.array(DraftEventSchema).max(10).default([]),
    photos: z.array(PhotoSchema).max(50).optional(),
    canvas: CanvasDocumentSchema.optional(),
    canvasElements: z.array(CanvasElementSchema).optional(),
    fieldPositions: z.record(z.any()).optional(),
    fieldScales: z.record(z.any()).optional(),
  }).passthrough(),
  z.object({
    cardCategory: z.literal("BIRTHDAY"),
    celebrantName: z.string().trim().max(120).default(""),
    avatarUrl: z.union([StoredImageUrlSchema, z.literal("")]).nullable().optional(),
    age: z.number().int().min(1).max(150).optional(),
    birthDate: z.coerce.date().optional(),
    greeting: z.string().trim().max(2_000).nullable().optional(),
    themeMood: z.string().trim().max(100).nullable().optional(),
    hobbies: z.array(z.string().trim().max(80)).max(20).default([]),
    events: z.array(DraftEventSchema).max(10).default([]),
    canvasElements: z.array(z.record(z.any())).optional(),
    fieldPositions: z.record(z.any()).optional(),
    fieldScales: z.record(z.any()).optional(),
  }).passthrough(),
  z.object({
    cardCategory: z.literal("NEWBORN"),
    babyName: z.string().trim().max(120).default(""),
    nickname: z.string().trim().max(80).nullable().optional(),
    gender: z.enum(["BOY", "GIRL", "OTHER"]).default("OTHER"),
    birthDate: z.coerce.date().optional(),
    birthTime: z.string().trim().max(20).nullable().optional(),
    weight: z.string().trim().max(30).nullable().optional(),
    height: z.string().trim().max(30).nullable().optional(),
    avatarUrl: z.union([StoredImageUrlSchema, z.literal("")]).nullable().optional(),
    parents: z.object({
      fatherName: z.string().trim().max(120).nullable().optional(),
      motherName: z.string().trim().max(120).nullable().optional(),
    }).nullable().optional(),
    ceremonyType: z.enum(["ANNOUNCEMENT_ONLY", "FULL_MONTH", "ONE_YEAR"]).default("FULL_MONTH"),
    greeting: z.string().trim().max(2_000).nullable().optional(),
    events: z.array(DraftEventSchema).max(10).default([]),
    canvasElements: z.array(z.record(z.any())).optional(),
    fieldPositions: z.record(z.any()).optional(),
    fieldScales: z.record(z.any()).optional(),
  }).passthrough(),
]);

const CommonDraftFields = {
  slug: z.string().transform(normalizeSlug).pipe(
    z.string().min(3, "Đường dẫn tối thiểu 3 ký tự").max(50).regex(/^[a-z0-9-]+$/)
  ),
  templateSlug: z.string().trim().min(1).max(100),
  openingEffect: z.enum(["NONE", "WAX_SEAL", "GATE_OPEN", "GIFT_BOX"]).default("WAX_SEAL"),
  fallingEffect: z.enum(["NONE", "PETAL", "HEART", "SNOW", "CONFETTI", "BALLOON"]).default("PETAL"),
  musicUrl: z.string().trim().max(2_000).nullable().optional(),
  isAutoPlay: z.boolean().default(true),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#D4AF37"),
  fontFamily: z.string().trim().min(1).max(100).default("Inter"),
  greetingMessage: z.string().trim().max(2_000).nullable().optional(),
  bankingPrimary: z.object({
    bankCode: z.string().trim().max(30),
    accountNumber: z.string().trim().max(50),
    accountName: z.string().trim().max(120),
  }).nullable().optional(),
  bankingSecondary: z.object({
    bankCode: z.string().trim().max(30),
    accountNumber: z.string().trim().max(50),
    accountName: z.string().trim().max(120),
  }).nullable().optional(),
  telegramChatId: z.string().trim().max(100).nullable().optional(),
  photos: z.array(PhotoSchema).max(50).default([]),
  events: z.array(DraftEventSchema).max(10).default([]),
  data: DraftCategoryDataSchema,
};

export const DraftCardSchema = z.object(CommonDraftFields);
export const UpdateDraftCardSchema = DraftCardSchema;
export const PublishCardDataSchema = CategoryDataSchema;

export type DraftCardInput = z.infer<typeof DraftCardSchema>;
export type UpdateDraftCardInput = z.infer<typeof UpdateDraftCardSchema>;


