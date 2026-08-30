import { z } from "zod";

// -----------------------------------------------------------------------
// AUTH SCHEMAS
// -----------------------------------------------------------------------

export const SendOtpSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export const RegisterWithOtpSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  otp: z.string().length(6, "OTP phải đủ 6 ký tự"),
  name: z.string().min(2, "Họ tên phải ít nhất 2 ký tự").max(100),
  password: z.string().min(8, "Mật khẩu phải ít nhất 8 ký tự").optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const GoogleLoginSchema = z.object({
  idToken: z.string().min(1, "Google ID Token không được để trống"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ").optional(),
  avatar: z.string().url("Avatar phải là URL hợp lệ").optional(),
  telegramId: z.string().max(50).optional(),
});

// -----------------------------------------------------------------------
// RSVP SCHEMA
// -----------------------------------------------------------------------

export const RsvpSchema = z.object({
  cardId: z.string().min(1, "cardId không được để trống"),
  fullName: z.string().min(2, "Họ tên phải ít nhất 2 ký tự").max(100),
  phone: z.string().optional(),
  status: z.enum(["ATTENDING", "DECLINED", "UNDECIDED"]).default("ATTENDING"),
  guestCount: z.number().int().min(1).max(20).default(1),
  side: z.enum(["GROOM_SIDE", "BRIDE_SIDE", "MUTUAL"]).default("MUTUAL"),
  note: z.string().max(500).optional(),
  guestId: z.string().optional(),
});

// -----------------------------------------------------------------------
// WISH SCHEMA
// -----------------------------------------------------------------------

export const WishSchema = z.object({
  cardId: z.string().min(1),
  senderName: z.string().min(2, "Tên người gửi phải ít nhất 2 ký tự").max(100),
  relationship: z.string().max(50).optional(),
  content: z.string().min(5, "Lời chúc phải ít nhất 5 ký tự").max(1000),
  emoji: z.string().max(10).optional(),
});

// -----------------------------------------------------------------------
// ORDER SCHEMA
// -----------------------------------------------------------------------

export const CreateOrderSchema = z.object({
  cardId: z.string().min(1, "cardId không được để trống"),
  planId: z.string().min(1, "planId không được để trống"),
});

// -----------------------------------------------------------------------
// CONCIERGE SCHEMA
// -----------------------------------------------------------------------

export const ConciergeSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải ít nhất 2 ký tự").max(100),
  phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  email: z.string().email().optional(),
  servicePackage: z.string().max(100).optional(),
  favoriteTemplate: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

// -----------------------------------------------------------------------
// EXPORT ALL TYPES
// -----------------------------------------------------------------------
export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type RegisterWithOtpInput = z.infer<typeof RegisterWithOtpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RsvpInput = z.infer<typeof RsvpSchema>;
export type WishInput = z.infer<typeof WishSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type ConciergeInput = z.infer<typeof ConciergeSchema>;
