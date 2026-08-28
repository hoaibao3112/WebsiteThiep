import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().min(2, "Tên người dùng tối thiểu 2 ký tự"),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// 9. [MEDIUM] Schema gửi OTP - chỉ giữ type: 'REGISTER', comment reserved cho login/forgot password sau
export const SendOtpSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  type: z.literal("REGISTER", {
    errorMap: () => ({ message: "Loại OTP hiện tại chỉ hỗ trợ REGISTER (Đăng ký tài khoản)" }),
  }),
  // Ghi chú: 'LOGIN' và 'FORGOT_PASSWORD' chưa implement, reserved cho tính năng nâng cấp sau
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;

export const VerifyOtpRegisterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  otp: z.string().length(6, "Mã OTP phải có đúng 6 chữ số"),
  name: z.string().min(2, "Tên người dùng tối thiểu 2 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  phone: z.string().optional(),
});

export type VerifyOtpRegisterInput = z.infer<typeof VerifyOtpRegisterSchema>;

// 3. [CRITICAL] Schema Google OAuth Login
export const GoogleLoginSchema = z.object({
  idToken: z.string().min(1, "Google ID Token không được để trống"),
});

export type GoogleLoginInput = z.infer<typeof GoogleLoginSchema>;

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
