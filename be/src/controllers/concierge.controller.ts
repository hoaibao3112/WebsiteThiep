import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { MailService } from "../services/mail.service";

export class ConciergeController {
  /**
   * Khách hàng gửi yêu cầu đăng ký thuê thiết kế riêng
   * POST /api/v1/concierge/submit
   */
  static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, phone, email, servicePackage, favoriteTemplate, notes } = req.body;

      if (!fullName || !phone) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp đầy đủ Họ tên và Số điện thoại liên hệ.",
        });
        return;
      }

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
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
        return;
      }
      next(error);
    }
  }
}
