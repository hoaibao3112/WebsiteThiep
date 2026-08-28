import { z } from "zod";

export const WishSubmitSchema = z.object({
  cardId: z.string().min(1, "Mã thiệp không hợp lệ"),
  senderName: z.string().min(2, "Vui lòng nhập tên người gửi"),
  relationship: z.string().max(50, "Mối quan hệ tối đa 50 ký tự").optional(),
  content: z
    .string()
    .min(2, "Lời chúc phải có ít nhất 2 ký tự")
    .max(1000, "Lời chúc tối đa 1000 ký tự"),
  emoji: z.string().max(10).optional().default("❤️"),
});

export type WishSubmitInput = z.infer<typeof WishSubmitSchema>;
