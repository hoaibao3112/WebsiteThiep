import { Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { MediaService } from "../services/media.service";
import { VideoEmbedService } from "../services/video-embed.service";

export class MediaController {
  static async upload(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "Vui lòng chọn file" });
      }

      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Chưa đăng nhập" });
      const fileUrl = await MediaService.handleFileUpload(req.file, accountId);
      res.status(200).json({
        success: true,
        message: "Tải file thành công!",
        data: { url: fileUrl },
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      return res.status(error.message?.includes("Cloudinary") ? 503 : 400).json({
        success: false,
        error: error.message || "Không thể tải lên file",
      });
    }
  }

  static async parseVideo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ success: false, error: "Vui lòng cung cấp URL video" });
      }

      const parsed = VideoEmbedService.parseVideoUrl(url);
      return res.status(200).json({
        success: true,
        data: parsed,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || "Không thể phân tích URL video",
      });
    }
  }
}
