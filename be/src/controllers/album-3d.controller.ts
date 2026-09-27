import { Request, Response, NextFunction } from "express";
import { Album3DService } from "../services/album-3d.service";
import { Album3DConfigSchema } from "../schemas/album-3d.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { z } from "zod";

export class Album3DController {
  /**
   * GET /api/cards/:cardId/album-3d
   */
  static async getConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Chưa xác thực tài khoản" });
      }

      const cardId = req.params.cardId as string;
      const config = await Album3DService.getAlbumConfig(accountId, cardId);

      return res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/cards/:cardId/album-3d
   */
  static async updateConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Chưa xác thực tài khoản" });
      }

      const cardId = req.params.cardId as string;
      const parsed = Album3DConfigSchema.parse(req.body);

      const result = await Album3DService.updateAlbumConfig(accountId, cardId, parsed);
      return res.status(200).json({
        success: true,
        message: "Lưu cấu hình Album 3D thành công",
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu cấu hình Album 3D không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }

  /**
   * POST /api/cards/:cardId/google-drive-import
   */
  static async importDrive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = req.body?.url || req.body?.links || req.body?.input;
      if (!input || typeof input !== "string") {
        return res.status(400).json({
          success: false,
          error: "Vui lòng cung cấp link hoặc ID thư mục Google Drive",
        });
      }

      const result = await Album3DService.importGoogleDrive(input);
      return res.status(200).json({
        success: true,
        message: `Đã tìm thấy ${result.photos.length} ảnh hợp lệ từ Google Drive`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
