import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { CardElementService } from "../services/card-element.service";

const PatchElementBodySchema = z.object({
  customData: z.record(z.unknown()).optional(),
  content: z.string().max(2000).optional(),
  imageUrl: z.string().max(2000).optional(),
  title: z.string().max(500).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  fontSize: z.number().min(1).max(300).optional(),
  fontFamily: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
}).strict();

export class CardElementController {
  private static getAuth(req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    const accountId = req.user?.accountId;
    if (!userId || !accountId) throw new Error("Thiếu thông tin xác thực");
    return { userId, accountId };
  }

  /**
   * PATCH /cards/:cardId/elements/:elementId
   * Cập nhật 1 canvas element (customData, content, imageUrl, position...)
   * mà KHÔNG cần gửi toàn bộ card data.
   */
  static async patchElement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = CardElementController.getAuth(req);
      const cardId = req.params.cardId as string;
      const elementId = req.params.elementId as string;

      if (!cardId || !elementId) {
        return res.status(400).json({ success: false, error: "Thiếu cardId hoặc elementId" });
      }

      const parseResult = PatchElementBodySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: parseResult.error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: parseResult.error.flatten().fieldErrors,
        });
      }

      const updatedElement = await CardElementService.patchElement(
        accountId,
        cardId,
        elementId,
        parseResult.data,
      );

      return res.status(200).json({ success: true, data: updatedElement });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * GET /cards/:cardId/elements/:elementId
   * Đọc 1 canvas element cụ thể.
   */
  static async getElement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = CardElementController.getAuth(req);
      const cardId = req.params.cardId as string;
      const elementId = req.params.elementId as string;

      const element = await CardElementService.getElement(accountId, cardId, elementId);

      return res.status(200).json({ success: true, data: element });
    } catch (error: unknown) {
      next(error);
    }
  }
}
