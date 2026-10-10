import { Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { MediaService } from "../services/media.service";
import { VideoEmbedService } from "../services/video-embed.service";
import { checkRateLimit } from "../lib/rate-limiter";

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
      // Giới hạn số lần upload / tài khoản (mỗi upload buffer tới 50MB trong RAM)
      await checkRateLimit(
        `ratelimit:upload:${accountId}`,
        40,
        600,
        "Bạn tải lên quá nhiều tệp trong thời gian ngắn. Vui lòng thử lại sau ít phút!"
      );
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
      // HttpError (validation 400 / storage 502-503) và lỗi bất ngờ (500) đều do errorHandler chuẩn hóa,
      // không còn trả thẳng error.message (có thể chứa nội dung lỗi của Cloudinary) ra client.
      return next(error);
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể phân tích URL video";
      return res.status(400).json({
        success: false,
        error: message.includes("Invalid") || message.includes("Unsupported")
          ? message
          : "Không thể phân tích URL video, vui lòng kiểm tra lại đường dẫn",
      });
    }
  }
}
