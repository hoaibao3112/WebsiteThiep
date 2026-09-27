import { Request, Response, NextFunction } from "express";
import { EnvelopeService } from "../services/envelope.service";
import { EnvelopeConfigSchema } from "../schemas/envelope.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { z } from "zod";

export class EnvelopeController {
  /**
   * GET /api/envelope-styles
   * Public: Lấy danh sách các kiểu phong bì mở đầu được cung cấp từ Backend
   */
  static async getStyles(_req: Request, res: Response, next: NextFunction) {
    try {
      const styles = await EnvelopeService.getStyles();
      return res.status(200).json({
        success: true,
        data: styles,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cards/:cardId/envelope-config
   * Lấy cấu hình phong bì của thiệp
   */
  static async getCardConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Chưa xác thực tài khoản" });
      }

      const cardId = req.params.cardId as string;
      const config = await EnvelopeService.getCardEnvelopeConfig(accountId, cardId);
      return res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/cards/:cardId/envelope-config
   * Cập nhật cấu hình phong bì mở đầu cho thiệp (Lưu backend PostgreSQL)
   */
  static async updateCardConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Chưa xác thực tài khoản" });
      }

      const cardId = req.params.cardId as string;
      const parsedConfig = EnvelopeConfigSchema.parse(req.body);

      const result = await EnvelopeService.updateCardEnvelopeConfig(accountId, cardId, parsedConfig);
      return res.status(200).json({
        success: true,
        message: "Lưu cấu hình phong bì thành công",
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu cấu hình phong bì không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }
}
