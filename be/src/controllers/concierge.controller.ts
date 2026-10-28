import { Request, Response, NextFunction } from "express";
import { MailService } from "../services/mail.service";
import { checkRateLimit } from "../lib/rate-limiter";

export class ConciergeController {
  /**
   * Khách hàng gửi yêu cầu đăng ký thuê thiết kế riêng
   * POST /api/concierge/submit
   */
  static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
      await checkRateLimit(
        `ratelimit:concierge:ip:${clientIp}`,
        5,
        600,
        "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau 10 phút!"
      );

      // req.body đã được validate bởi middleware validate(ConciergeSchema)
      const { fullName, phone, email, servicePackage, favoriteTemplate, notes } = req.body;

      // Gửi email thông báo trực tiếp đến Gmail của Admin / Chủ website
      await MailService.sendConciergeBookingEmail({
        fullName: String(fullName).trim(),
        phone: String(phone).trim(),
        email: email ? String(email).trim() : undefined,
        servicePackage: servicePackage ? String(servicePackage).trim() : undefined,
        favoriteTemplate: favoriteTemplate ? String(favoriteTemplate).trim() : undefined,
        notes: notes ? String(notes).trim() : undefined,
      });

      res.status(200).json({
        success: true,
        message: "Yêu cầu thuê thiết kế riêng đã được gửi thành công. Chúng tôi sẽ liên hệ lại với bạn trong vòng 15 phút!",
      });
    } catch (error: unknown) {
      next(error);
    }
  }
}
