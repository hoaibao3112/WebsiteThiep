import { z } from "zod";

export const RsvpSubmitSchema = z.object({
  cardId: z.string().min(1, "Mã thiệp không hợp lệ"),
  guestCode: z.string().optional(),
  fullName: z.string().min(2, "Vui lòng nhập họ và tên của bạn"),
  phone: z
    .string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  status: z.enum(["ATTENDING", "DECLINED", "UNDECIDED"], {
    required_error: "Vui lòng chọn trạng thái tham dự",
  }),
  guestCount: z
    .number()
    .int()
    .min(1, "Số người tối thiểu là 1")
    .max(10, "Số người tối đa là 10")
    .default(1),
  side: z.enum(["GROOM_SIDE", "BRIDE_SIDE", "MUTUAL"]).default("MUTUAL"),
  note: z.string().max(500, "Lời nhắn tối đa 500 ký tự").optional(),
});

export type RsvpSubmitInput = z.infer<typeof RsvpSubmitSchema>;
