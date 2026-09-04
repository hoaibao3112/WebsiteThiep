import { Request, Response, NextFunction } from "express";
import { CardService } from "../services/card.service";
import { DraftCardSchema } from "../lib/validators/card";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class CardController {
  private static getAuth(req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    const accountId = req.user?.accountId;
    if (!userId || !accountId) throw new Error("Thiếu thông tin xác thực");
    return { userId, accountId };
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, accountId } = CardController.getAuth(req);
      const idempotencyKey = req.header("Idempotency-Key")?.trim();
      if (!idempotencyKey) {
        return res.status(400).json({ success: false, error: "Thiếu Idempotency-Key" });
      }
      const input = DraftCardSchema.parse(req.body);
      const card = await CardService.createDraft(userId, accountId, input, idempotencyKey);
      return res.status(201).json({ success: true, data: card });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = CardController.getAuth(req);
      const input = DraftCardSchema.parse(req.body);
      const card = await CardService.updateDraft(accountId, req.params.id as string, input);
      return res.status(200).json({ success: true, data: card });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }

  static async getOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = CardController.getAuth(req);
      const card = await CardService.getOwnerCard(accountId, req.params.id as string);
      if (!card) return res.status(404).json({ success: false, error: "Không tìm thấy thiệp" });
      return res.status(200).json({ success: true, data: card });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }

  static async slugAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = z.string().trim().min(3).max(50).regex(/^[a-z0-9-]+$/).safeParse(req.query.slug);
      if (!slug.success) return res.status(400).json({ success: false, error: "Slug không hợp lệ" });
      const available = await CardService.isSlugAvailable(slug.data, typeof req.query.excludeCardId === "string" ? req.query.excludeCardId : undefined);
      return res.status(200).json({ success: true, data: { available } });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = CardController.getAuth(req);
      await CardService.deleteCard(accountId, req.params.id as string);
      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
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

      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Thiếu accountId" });
      const cards = await CardService.getUserCards(accountId);
      res.status(200).json({ success: true, data: cards });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
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
      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Thiếu accountId" });
      const card = await CardService.publishCard(accountId, id);
      res.status(200).json({ success: true, data: card });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
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
