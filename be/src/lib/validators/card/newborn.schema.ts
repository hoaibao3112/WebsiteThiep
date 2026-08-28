import { z } from "zod";
import { EventSchema } from "./event.schema";

export const NewbornCeremonyType = z.enum([
  "ANNOUNCEMENT_ONLY",
  "FULL_MONTH",
  "ONE_YEAR",
]);

export const NewbornDataSchema = z.object({
  cardCategory: z.literal("NEWBORN"),
  babyName: z.string().min(2, "Vui lòng nhập tên bé"),
  nickname: z.string().optional(),
  gender: z.enum(["BOY", "GIRL", "OTHER"]).default("BOY"),
  birthDate: z.coerce.date({ required_error: "Vui lòng chọn ngày sinh của bé" }),
  birthTime: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  parents: z
    .object({
      fatherName: z.string().optional(),
      motherName: z.string().optional(),
    })
    .optional(),
  ceremonyType: NewbornCeremonyType,
  greeting: z.string().optional(),
  events: z.array(EventSchema).optional().default([]),
});

export type NewbornData = z.infer<typeof NewbornDataSchema>;
