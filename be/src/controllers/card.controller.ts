import { Request, Response, NextFunction } from "express";
import { CardService } from "../services/card.service";
import { UpsertCardSchema } from "../lib/validators/card";

export class CardController {
  static async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId || "mock-user-id"; // Thay bằng JWT user id thực tế
      const cardId = req.params.id;
      const validated = UpsertCardSchema.parse(req.body);

      const card = await CardService.upsertCard(userId, validated, cardId);
      res.status(200).json({ success: true, data: card });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const guestCode = req.query.g as string | undefined;

      const result = await CardService.getCardBySlug(slug, guestCode);
      if (!result) {
        return res.status(404).json({ success: false, error: "Thiệp không tồn tại" });
      }

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getUserCards(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId || "mock-user-id";
      const cards = await CardService.getUserCards(userId);
      res.status(200).json({ success: true, data: cards });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId || "mock-user-id";
      const { id } = req.params;
      const card = await CardService.publishCard(userId, id);
      res.status(200).json({ success: true, data: card });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
