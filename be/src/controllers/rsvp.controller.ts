import { Request, Response, NextFunction } from "express";
import { RsvpService } from "../services/rsvp.service";
import { RsvpSubmitSchema } from "../lib/validators/rsvp.schema";

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
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId || "mock-user-id";
      const { cardId } = req.params;

      const stats = await RsvpService.getRsvpStats(userId, cardId);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
