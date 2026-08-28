import { Response, NextFunction } from "express";
import { GuestImportService } from "../services/guest-import.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { z } from "zod";

const ImportGuestsSchema = z.object({
  guests: z.array(
    z.object({
      fullName: z.string().min(2, "Tên khách không được để trống"),
      salutation: z.string().optional(),
      group: z.string().optional(),
      phone: z.string().optional(),
    })
  ),
});

export class GuestController {
  static async import(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: "Thiếu thông tin xác thực - lỗi hệ thống",
        });
      }

      const cardId = req.params.cardId as string;
      const validated = ImportGuestsSchema.parse(req.body);

      const result = await GuestImportService.importGuests(
        userId,
        cardId,
        validated.guests
      );

      res.status(201).json({
        success: true,
        message: `Đã nhập thành công ${result.length} khách mời`,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: "Thiếu thông tin xác thực - lỗi hệ thống",
        });
      }

      const cardId = req.params.cardId as string;
      const guests = await GuestImportService.listGuests(userId, cardId);
      res.status(200).json({ success: true, data: guests });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
