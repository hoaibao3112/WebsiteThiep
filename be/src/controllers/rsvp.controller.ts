import { Request, Response, NextFunction } from "express";
import { RsvpService } from "../services/rsvp.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class RsvpController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body đã được validate bởi middleware validate(RsvpSubmitSchema)
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const rsvp = await RsvpService.submitRsvp(req.body, {
        ipAddress,
        userAgent,
      });

      res.status(201).json({
        success: true,
        message: "Xác nhận tham dự thành công!",
        data: rsvp,
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({
          success: false,
          error: "Thiếu thông tin xác thực - lỗi hệ thống",
        });
      }

      const cardId = req.params.cardId as string;
      const stats = await RsvpService.getRsvpStats(accountId, cardId);
      res.status(200).json({ success: true, data: stats });
    } catch (error: unknown) {
      next(error);
    }
  }
}
