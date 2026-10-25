import { z } from "zod";

export const CreateAddonOrderSchema = z
  .object({
    addonCode: z
      .string()
      .trim()
      .min(1, "Mã tiện ích addonCode không được để trống")
      .max(64, "Mã tiện ích không được vượt quá 64 ký tự"),
  })
  .strict();

export type CreateAddonOrderInput = z.infer<typeof CreateAddonOrderSchema>;
