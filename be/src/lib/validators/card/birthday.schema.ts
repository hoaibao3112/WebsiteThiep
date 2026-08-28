import { z } from "zod";
import { EventSchema } from "./event.schema";

export const BirthdayDataSchema = z.object({
  cardCategory: z.literal("BIRTHDAY"),
  celebrantName: z.string().min(2, "Vui lòng nhập tên chủ nhân bữa tiệc"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  age: z.number().int().positive("Tuổi phải là số dương").optional(),
  birthDate: z.coerce.date().optional(),
  greeting: z.string().optional(),
  themeMood: z.string().optional(),
  hobbies: z.array(z.string()).default([]),
  events: z.array(EventSchema).min(1, "Vui lòng nhập thông tin tiệc sinh nhật"),
});

export type BirthdayData = z.infer<typeof BirthdayDataSchema>;
