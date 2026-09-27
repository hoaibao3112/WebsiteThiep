import { z } from "zod";

export const CreateWeddingMemorySchema = z.object({
  senderName: z.string().trim().min(1, "Vui lòng nhập tên của bạn").max(80, "Tên không được quá 80 ký tự"),
  relationship: z.string().trim().max(80).optional(),
  message: z.string().trim().max(500, "Lời chúc không được quá 500 ký tự").optional(),
  photoUrl: z.string().min(1, "Ảnh kỷ niệm không được để trống"),
  thumbUrl: z.string().optional(),
  frameType: z.enum(["polaroid", "golden-monogram", "floral", "classic", "none"]).default("polaroid"),
  guestId: z.string().optional(),
});

export type CreateWeddingMemoryInput = z.infer<typeof CreateWeddingMemorySchema>;

export const ToggleMemorySchema = z.object({
  isApproved: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export type ToggleMemoryInput = z.infer<typeof ToggleMemorySchema>;
