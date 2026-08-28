import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().min(2, "Tên người dùng tối thiểu 2 ký tự"),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Tên người dùng tối thiểu 2 ký tự").optional(),
  phone: z.string().optional(),
  avatar: z.string().url("Avatar URL không hợp lệ").optional(),
  telegramId: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
