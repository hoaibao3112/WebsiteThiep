import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { RsvpService } from "../services/rsvp.service";
import { RsvpSubmitSchema } from "../lib/validators/rsvp.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class RsvpController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = RsvpSubmitSchema.parse(req.body);
      const ipAddress =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const rsvp = await RsvpService.submitRsvp(validated, {
        ipAddress,
        userAgent,
      });

      res.status(201).json({
        success: true,
        message: "Xác nhận tham dự thành công!",
        data: rsvp,
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

  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: "Thiếu thông tin xác thực - lỗi hệ thống",
        });
      }

      const cardId = req.params.cardId as string;
      const stats = await RsvpService.getRsvpStats(userId, cardId);
      res.status(200).json({ success: true, data: stats });
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
