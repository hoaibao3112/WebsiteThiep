import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const CreateGuestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  salutation: optionalText(30),
  group: optionalText(80),
  phone: optionalText(20),
  notes: optionalText(500),
});

export const UpdateGuestSchema = CreateGuestSchema.partial().refine((value) => Object.keys(value).length > 0);
export const ImportGuestsSchema = z.object({
  mode: z.enum(["SKIP_DUPLICATES", "UPDATE_EXISTING"]).default("SKIP_DUPLICATES"),
  guests: z.array(CreateGuestSchema).min(1).max(500),
});
export const ListGuestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  search: optionalText(100),
  group: optionalText(80),
  deliveryStatus: z.enum(["NOT_SENT", "OPENED_ZALO", "CONFIRMED_SENT", "FAILED"]).optional(),
});
export const DeliveryStatusSchema = z.object({
  status: z.enum(["NOT_SENT", "OPENED_ZALO", "CONFIRMED_SENT", "FAILED"]),
});
export type CreateGuestInput = z.infer<typeof CreateGuestSchema>;
export type UpdateGuestInput = z.infer<typeof UpdateGuestSchema>;
export type ListGuestsQuery = z.infer<typeof ListGuestsQuerySchema>;
export type GuestDeliveryStatusInput = z.infer<typeof DeliveryStatusSchema>["status"];
