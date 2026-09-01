import { Request, Response, NextFunction, CookieOptions } from "express";
import { AuthService } from "../services/auth.service";
import { OtpService } from "../services/otp.service";
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  SendOtpSchema,
  VerifyOtpRegisterSchema,
  GoogleLoginSchema,
} from "../lib/validators/auth.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import crypto from "node:crypto";

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    "127.0.0.1"
  );
}

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction, // HTTPS trên production
  sameSite: isProduction ? "none" : "lax", // "none" cho phép cross-site request từ frontend sang backend
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  path: "/",
};

const CSRF_COOKIE_OPTIONS: CookieOptions = {
  ...COOKIE_OPTIONS,
  httpOnly: false,
};

function setAuthCookies(res: Response, token: string) {
  res.cookie("auth_token", token, COOKIE_OPTIONS);
  res.cookie("csrf_token", crypto.randomBytes(32).toString("base64url"), CSRF_COOKIE_OPTIONS);
}

export class AuthController {
  /**
   * 2 & 6. Gửi mã OTP xác thực qua Email
   */
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = SendOtpSchema.parse(req.body);
      const clientIp = getClientIp(req);

      const result = await OtpService.sendRegisterOtp(validated.email, clientIp);

      res.status(200).json({
        success: true,
        message: "Mã xác thực OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * 1. Đăng ký tài khoản kèm xác thực mã OTP
   */
  static async registerWithOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = VerifyOtpRegisterSchema.parse(req.body);
      const result = await AuthService.registerWithOtp(validated);

      // Đặt HTTPS HTTPOnly Cookie
      if (result.token) {
        setAuthCookies(res, result.token);
      }

      res.status(201).json({
        success: true,
        message: "Đăng ký và xác thực tài khoản thành công!",
        data: { user: result.user },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * 3 & 4. Đăng nhập / Đăng ký qua Google OAuth
   */
  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = GoogleLoginSchema.parse(req.body);
      const result = await AuthService.googleLogin(validated.idToken);

      // Đặt HTTPS HTTPOnly Cookie
      if (result.token) {
        setAuthCookies(res, result.token);
      }

      res.status(200).json({
        success: true,
        message: "Đăng nhập với Google thành công!",
        data: { user: result.user },
      });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = RegisterSchema.parse(req.body);
      const clientIp = getClientIp(req);
      const result = await AuthService.register(validated, clientIp);

      // Đặt HTTPS HTTPOnly Cookie
      if (result.token) {
        setAuthCookies(res, result.token);
      }

      res.status(201).json({
        success: true,
        message: "Đăng ký tài khoản thành công!",
        data: { user: result.user },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = LoginSchema.parse(req.body);
      const clientIp = getClientIp(req);
      const result = await AuthService.login(validated, clientIp);

      // Đặt HTTPS HTTPOnly Cookie
      if (result.token) {
        setAuthCookies(res, result.token);
      }

      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công!",
        data: { user: result.user },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("auth_token", COOKIE_OPTIONS);
      res.clearCookie("csrf_token", CSRF_COOKIE_OPTIONS);
      res.status(200).json({ success: true, message: "Đăng xuất thành công" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error("Chưa đăng nhập");

      const user = await AuthService.getMe(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error("Chưa đăng nhập");

      const validated = UpdateProfileSchema.parse(req.body);
      const user = await AuthService.updateProfile(userId, validated);
      res.status(200).json({
        success: true,
        message: "Cập nhật thông tin thành công!",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

