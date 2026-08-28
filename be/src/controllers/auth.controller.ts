import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
} from "../lib/validators/auth.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = RegisterSchema.parse(req.body);
      const result = await AuthService.register(validated);
      res.status(201).json({
        success: true,
        message: "Đăng ký tài khoản thành công!",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = LoginSchema.parse(req.body);
      const result = await AuthService.login(validated);
      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công!",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
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
