import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";
import { checkRateLimit } from "../lib/rate-limiter";
import { logger } from "../lib/logger";
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  VerifyOtpRegisterInput,
} from "../lib/validators/auth.schema";
import { OtpService } from "./otp.service";

// [SECURITY FIX] Không cho fallback hardcode — nếu thiếu JWT_SECRET thì fail sớm ngay lúc khởi động
// thay vì âm thầm chạy với secret công khai trong source code.
if (!process.env.JWT_SECRET) {
  throw new Error(
    "[AuthService] JWT_SECRET chưa được cấu hình trong .env. Vui lòng set biến môi trường JWT_SECRET trước khi khởi động server."
  );
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// [SECURITY FIX] Rate limit cho login / register truyền thống (chống brute-force & credential stuffing)
const MAX_LOGIN_ATTEMPTS_PER_IP = 10; // 10 lần / 15 phút / IP
const MAX_LOGIN_ATTEMPTS_PER_EMAIL = 5; // 5 lần / 15 phút / email
const LOGIN_WINDOW_SECONDS = 900; // 15 phút

const MAX_REGISTER_ATTEMPTS_PER_IP = 10; // 10 lần / giờ / IP
const REGISTER_WINDOW_SECONDS = 3600;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface TokenPayload {
  userId: string;
  accountId: string;
  email: string;
  role: "USER" | "ADMIN";
}

export class AuthService {
  /**
   * Đăng nhập hoặc Đăng ký tài khoản tức thì với mã OTP Email (Magic OTP)
   */
  static async registerWithOtp(input: VerifyOtpRegisterInput) {
    const normalizedEmail = input.email.toLowerCase().trim();

    // 1. [CRITICAL] Xác thực OTP & check brute-force
    await OtpService.verifyRegisterOtp(normalizedEmail, input.otp);

    // Kiểm tra xem email đã có tài khoản chưa
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Tự động tạo tài khoản mới siêu gọn
      const defaultName = input.name?.trim() || normalizedEmail.split("@")[0];
      const rawPassword = input.password || crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: defaultName,
          phone: input.phone?.trim(),
          emailVerified: true, // Email đã xác minh qua OTP
          role: "USER",
        },
      });
    } else {
      // User đã có -> cập nhật emailVerified nếu chưa
      if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
      }
    }

    const accountId = await this.ensureDefaultAccount(user.id, user.name);
    const token = this.generateToken({
      userId: user.id,
      accountId,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
        hasPassword: !!user.password,
      },
      token,
    };
  }

  /**
   * 3 & 4. [CRITICAL] Đăng nhập / Đăng ký qua Google OAuth ID Token
   */
  static async googleLogin(idToken: string) {
    if (!GOOGLE_CLIENT_ID) {
      logger.warn("[GoogleAuth] GOOGLE_CLIENT_ID chưa được cấu hình trong .env");
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID, // Bắt buộc check audience
      });
    } catch (error: any) {
      logger.error({ err: error?.message || error }, "[GoogleAuth] Token verification failed");
      throw new Error("Mã xác thực Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại!");
    }

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error("Không lấy được thông tin email từ tài khoản Google.");
    }

    // 3. [CRITICAL] Bắt buộc kiểm tra email_verified từ Google
    if (payload.email_verified !== true) {
      throw new Error("Email Google này chưa được xác thực. Vui lòng xác thực email với Google trước khi đăng nhập.");
    }

    const googleId = payload.sub;
    const normalizedEmail = payload.email.toLowerCase().trim();
    const name = payload.name || "Người dùng Google";
    const avatar = payload.picture || null;

    // 4. [CRITICAL] Xử lý merge hoặc tạo user mới
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // User chưa tồn tại -> Tạo mới với googleId
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name,
          avatar,
          googleId,
          emailVerified: true,
          role: "USER",
          password: null, // Không có mật khẩu khi tạo bằng Google
        },
      });
    } else {
      // User đã tồn tại -> Merge liên kết Google ID nếu chưa có
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          emailVerified: true, // Đã xác minh qua Google
          avatar: user.avatar || avatar,
          name: user.name || name,
        },
      });
    }

    const accountId = await this.ensureDefaultAccount(user.id, user.name);
    const token = this.generateToken({
      userId: user.id,
      accountId,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        hasPassword: !!user.password,
      },
      token,
    };
  }

  /**
   * Đăng ký truyền thống (Fallback)
   */
  static async register(input: RegisterInput, clientIp?: string) {
    // [SECURITY FIX] Rate limit theo IP để chống spam tạo tài khoản hàng loạt
    if (clientIp) {
      await checkRateLimit(
        `ratelimit:register:ip:${clientIp}`,
        MAX_REGISTER_ATTEMPTS_PER_IP,
        REGISTER_WINDOW_SECONDS,
        "Địa chỉ IP của bạn đã đăng ký quá nhiều lần. Vui lòng thử lại sau!"
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error("Email này đã được đăng ký trong hệ thống");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        password: hashedPassword,
        name: input.name.trim(),
        phone: input.phone?.trim(),
        emailVerified: false,
        role: "USER",
      },
    });

    const accountId = await this.ensureDefaultAccount(user.id, user.name);
    const token = this.generateToken({
      userId: user.id,
      accountId,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        hasPassword: true,
      },
      token,
    };
  }

  /**
   * Đăng nhập bằng Email & Mật khẩu
   */
  static async login(input: LoginInput, clientIp?: string) {
    const normalizedEmail = input.email.toLowerCase().trim();

    // [SECURITY FIX] Rate limit theo IP + theo email để chống brute-force mật khẩu
    if (clientIp) {
      await checkRateLimit(
        `ratelimit:login:ip:${clientIp}`,
        MAX_LOGIN_ATTEMPTS_PER_IP,
        LOGIN_WINDOW_SECONDS,
        "Địa chỉ IP của bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút!"
      );
    }
    await checkRateLimit(
      `ratelimit:login:email:${normalizedEmail}`,
      MAX_LOGIN_ATTEMPTS_PER_EMAIL,
      LOGIN_WINDOW_SECONDS,
      "Tài khoản này đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút!"
    );

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    const accountId = await this.ensureDefaultAccount(user.id, user.name);
    const token = this.generateToken({
      userId: user.id,
      accountId,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        telegramId: user.telegramId,
        emailVerified: user.emailVerified,
        hasPassword: true,
      },
      token,
    };
  }

  /**
   * Lấy thông tin user hiện tại (Me)
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        googleId: true,
        emailVerified: true,
        password: true,
        telegramId: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error("Người dùng không tồn tại");

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      googleId: user.googleId,
      emailVerified: user.emailVerified,
      hasPassword: !!user.password,
      telegramId: user.telegramId,
      createdAt: user.createdAt,
    };
  }

  /**
   * Cập nhật thông tin profile
   */
  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        password: true,
        telegramId: true,
      },
    });

    const { password, ...safeUser } = updated;
    return {
      ...safeUser,
      hasPassword: !!password,
    };
  }

  /**
   * Helper sinh JWT token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  private static async ensureDefaultAccount(userId: string, name: string | null): Promise<string> {
    const existing = await prisma.accountMember.findFirst({
      where: { userId },
      select: { accountId: true },
    });
    if (existing) return existing.accountId;

    const account = await prisma.account.create({
      data: {
        name: name?.trim() || "Tài khoản của tôi",
        members: { create: { userId, role: "OWNER" } },
      },
      select: { id: true },
    });
    return account.id;
  }

  /**
   * Helper verify JWT token
   */
  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}
