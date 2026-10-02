import { z } from "zod";

export const CreateWeddingMemorySchema = z.object({
  senderName: z.string().trim().min(1, "Vui lòng nhập tên của bạn").max(80, "Tên không được quá 80 ký tự"),
  relationship: z.string().trim().max(80).optional(),
  message: z.string().trim().max(500, "Lời chúc không được quá 500 ký tự").optional(),
  frameType: z.enum(["polaroid", "golden-monogram", "floral", "classic", "none"]).default("polaroid"),
  guestId: z.string().optional(),
});

export type CreateWeddingMemoryInput = z.infer<typeof CreateWeddingMemorySchema>;

export const ToggleMemorySchema = z.object({
  isApproved: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export type ToggleMemoryInput = z.infer<typeof ToggleMemorySchema>;

export const MemorySafeDTOSchema = z.object({
  id: z.string(),
  senderName: z.string(),
  relationship: z.string().nullable(),
  message: z.string().nullable(),
  photoUrl: z.string(),
  thumbUrl: z.string().nullable(),
  frameType: z.string(),
  isPinned: z.boolean(),
  createdAt: z.date(),
});

export type MemorySafeDTO = z.infer<typeof MemorySafeDTOSchema>;
