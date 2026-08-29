import { z } from "zod";
import { WeddingDataSchema } from "./wedding.schema";
import { BirthdayDataSchema } from "./birthday.schema";
import { NewbornDataSchema } from "./newborn.schema";

export * from "./event.schema";
export * from "./wedding.schema";
export * from "./birthday.schema";
export * from "./newborn.schema";

export const CategoryDataSchema = z.discriminatedUnion("cardCategory", [
  WeddingDataSchema,
  BirthdayDataSchema,
  NewbornDataSchema,
]);

export type CategoryData = z.infer<typeof CategoryDataSchema>;

// Schema cho tạo mới và cập nhật thiệp
export const UpsertCardSchema = z.object({
  slug: z
    .string()
    .min(3, "Đường dẫn tối thiểu 3 ký tự")
    .max(50, "Đường dẫn tối đa 50 ký tự")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug chỉ bao gồm chữ cái thường, số và dấu gạch ngang (-)"
    ),
  templateId: z.string().min(1, "Vui lòng chọn mẫu giao diện thiệp"),
  planId: z.string().min(1, "Vui lòng chọn gói dịch vụ"),
  openingEffect: z
    .enum(["NONE", "WAX_SEAL", "GATE_OPEN", "GIFT_BOX"])
    .default("WAX_SEAL"),
  fallingEffect: z
    .enum(["NONE", "PETAL", "HEART", "SNOW", "CONFETTI", "BALLOON"])
    .default("PETAL"),
  musicUrl: z.string().url("Link nhạc không hợp lệ").optional().or(z.literal("")),
  isAutoPlay: z.boolean().default(true),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu HEX không hợp lệ (VD: #D4AF37)")
    .default("#D4AF37"),
  fontFamily: z.string().default("Inter"),
  greetingMessage: z.string().optional(),

  // Thông tin ngân hàng nhận mừng cưới/quà
  bankingPrimary: z
    .object({
      bankCode: z.string(),
      accountNumber: z.string(),
      accountName: z.string(),
    })
    .optional(),
  bankingSecondary: z
    .object({
      bankCode: z.string(),
      accountNumber: z.string(),
      accountName: z.string(),
    })
    .optional(),

  telegramChatId: z.string().optional(),
  photos: z.array(z.any()).optional(),
  events: z.array(z.any()).optional(),

  // Payload đa danh mục
  data: CategoryDataSchema,
});

export type UpsertCardInput = z.infer<typeof UpsertCardSchema>;
