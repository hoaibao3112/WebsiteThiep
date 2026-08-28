import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { RegisterInput, LoginInput, UpdateProfileInput } from "../lib/validators/auth.schema";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key";
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}

export class AuthService {
  /**
   * Đăng ký tài khoản mới
   */
  static async register(input: RegisterInput) {
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
        role: "USER",
      },
    });

    const token = this.generateToken({
      userId: user.id,
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
      },
      token,
    };
  }

  /**
   * Đăng nhập bằng Email & Mật khẩu
   */
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user || !user.password) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    const token = this.generateToken({
      userId: user.id,
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
        telegramId: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error("Người dùng không tồn tại");
    return user;
  }

  /**
   * Cập nhật thông tin profile
   */
  static async updateProfile(userId: string, input: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        telegramId: true,
      },
    });
  }

  /**
   * Helper sinh JWT token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Helper verify JWT token
   */
  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}
