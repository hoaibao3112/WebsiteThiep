import { Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { MediaService } from "../services/media.service";

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

      const fileUrl = await MediaService.handleFileUpload(req.file);
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
      next(error);
    }
  }
}
