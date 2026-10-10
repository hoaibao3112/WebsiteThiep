import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { OtpService } from "../services/otp.service";
import { WeddingProfileSchema } from "../lib/validators/wedding-profile.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import crypto from "node:crypto";

import { COOKIE_OPTIONS, CSRF_COOKIE_OPTIONS } from "../config/security";

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}

function setAuthCookies(res: Response, token: string): string {
  const csrf = crypto.randomBytes(32).toString("base64url");
  res.cookie("auth_token", token, COOKIE_OPTIONS);
  res.cookie("csrf_token", csrf, CSRF_COOKIE_OPTIONS);
  res.setHeader("X-CSRF-Token", csrf);
  return csrf;
}

export class AuthController {
  /**
   * 2 & 6. Gửi mã OTP xác thực qua Email
   */
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body đã được validate bởi middleware validate(SendOtpSchema)
      const clientIp = getClientIp(req);

      const result = await OtpService.sendRegisterOtp(req.body.email, clientIp);

      res.status(200).json({
        success: true,
        message: "Mã xác thực OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!",
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * 1. Đăng ký tài khoản kèm xác thực mã OTP
   */
  static async registerWithOtp(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body đã được validate bởi middleware validate(RegisterWithOtpSchema)
      const result = await AuthService.registerWithOtp(req.body);

      if (result.token) {
        setAuthCookies(res, result.token);
      }

      res.status(201).json({
        success: true,
        message: "Đăng ký và xác thực tài khoản thành công!",
        data: { user: result.user },
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * 3 & 4. Đăng nhập / Đăng ký qua Google OAuth
   */
  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body đã được validate bởi middleware validate(GoogleLoginSchema)
      const result = await AuthService.googleLogin(req.body.idToken);

      if (result.token) {
        setAuthCookies(res, result.token);
      }

      res.status(200).json({
        success: true,
        message: "Đăng nhập với Google thành công!",
        data: { user: result.user },
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body đã được validate bởi middleware validate(RegisterSchema)
      const clientIp = getClientIp(req);
      const result = await AuthService.register(req.body, clientIp);

      if (result.token) {
        setAuthCookies(res, result.token);
      }

      res.status(201).json({
        success: true,
        message: "Đăng ký tài khoản thành công!",
        data: { user: result.user },
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body đã được validate bởi middleware validate(LoginSchema)
      const clientIp = getClientIp(req);
      const result = await AuthService.login(req.body, clientIp);

      if (result.token) {
        setAuthCookies(res, result.token);
      }

      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công!",
        data: { user: result.user },
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("auth_token", COOKIE_OPTIONS);
      res.clearCookie("csrf_token", CSRF_COOKIE_OPTIONS);
      res.status(200).json({ success: true, message: "Đăng xuất thành công" });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
      }

      if (!token) {
        return res.status(200).json({ success: true, data: null });
      }

      try {
        const decoded = AuthService.verifyToken(token);
        const membership = await prisma.accountMember.findUnique({
          where: { accountId_userId: { accountId: decoded.accountId, userId: decoded.userId } },
          select: { id: true, role: true },
        });

        if (!membership) {
          if (req.cookies?.auth_token) {
            res.clearCookie("auth_token", COOKIE_OPTIONS);
            res.clearCookie("csrf_token", CSRF_COOKIE_OPTIONS);
          }
          return res.status(200).json({ success: true, data: null });
        }

        const user = await AuthService.getMe(decoded.userId, decoded.accountId);
        let csrfToken = req.cookies?.csrf_token;
        if (!csrfToken) {
          csrfToken = crypto.randomBytes(32).toString("base64url");
          res.cookie("csrf_token", csrfToken, CSRF_COOKIE_OPTIONS);
        }
        res.setHeader("X-CSRF-Token", csrfToken);
        return res.status(200).json({ success: true, data: user });
      } catch {
        if (req.cookies?.auth_token) {
          res.clearCookie("auth_token", COOKIE_OPTIONS);
          res.clearCookie("csrf_token", CSRF_COOKIE_OPTIONS);
        }
        return res.status(200).json({ success: true, data: null });
      }
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Chưa đăng nhập" });
      }

      // req.body đã được validate bởi middleware validate(UpdateProfileSchema)
      const user = await AuthService.updateProfile(userId, req.body);
      res.status(200).json({
        success: true,
        message: "Cập nhật thông tin thành công!",
        data: user,
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getWeddingProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Chưa đăng nhập" });
      }
      const profile = await AuthService.getWeddingProfile(userId);
      res.status(200).json({ success: true, data: profile });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateWeddingProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Chưa đăng nhập" });
      }
      // [CRITICAL FIX] Validate body qua Zod schema thay vì nhận raw JSON
      const validated = WeddingProfileSchema.parse(req.body);
      const updated = await AuthService.updateWeddingProfile(userId, validated);
      res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ cưới thành công!",
        data: updated,
      });
    } catch (error: unknown) {
      next(error);
    }
  }
}
