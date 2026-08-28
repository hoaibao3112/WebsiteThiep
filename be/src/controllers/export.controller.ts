import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ExportService } from "../services/export.service";

export class ExportController {
  static async exportExcel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error("Chưa đăng nhập");

      const { cardId } = req.params;
      const buffer = await ExportService.exportRsvpToExcel(userId, cardId);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=RSVP-Report-${cardId}-${Date.now()}.xlsx`
      );

      res.send(buffer);
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
