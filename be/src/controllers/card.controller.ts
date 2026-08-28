import { Request, Response, NextFunction } from "express";
import { CardService } from "../services/card.service";
import { UpsertCardSchema } from "../lib/validators/card";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class CardController {
  static async upsert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: "Thiếu thông tin xác thực - lỗi hệ thống",
        });
      }

      const cardId = req.params.id as string | undefined;
      const validated = UpsertCardSchema.parse(req.body);

      const card = await CardService.upsertCard(userId, validated, cardId);
      res.status(200).json({ success: true, data: card });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const guestCode = typeof req.query.g === "string" ? req.query.g : undefined;

      const result = await CardService.getCardBySlug(slug, guestCode);
      if (!result) {
        return res.status(404).json({ success: false, error: "Thiệp không tồn tại" });
      }

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getUserCards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: "Thiếu thông tin xác thực - lỗi hệ thống",
        });
      }

      const cards = await CardService.getUserCards(userId);
      res.status(200).json({ success: true, data: cards });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async publish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: "Thiếu thông tin xác thực - lỗi hệ thống",
        });
      }

      const id = req.params.id as string;
      const card = await CardService.publishCard(userId, id);
      res.status(200).json({ success: true, data: card });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
