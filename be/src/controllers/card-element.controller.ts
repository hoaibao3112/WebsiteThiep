import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { CardElementService } from "../services/card-element.service";
import { HttpError } from "../lib/http-error";
import { PatchElementBodySchema } from "../lib/validators/card/canvas-element.schema";
export { PatchElementBodySchema };


export class CardElementController {
  private static getAuth(req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    const accountId = req.user?.accountId;
    if (!userId || !accountId) {
      throw new HttpError(401, "Thiếu thông tin xác thực", "UNAUTHORIZED");
    }
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

      // Hỗ trợ expectedUpdatedAt từ header If-Match hoặc body
      const ifMatchHeader = req.headers["if-match"];
      const expectedUpdatedAt =
        parseResult.data.expectedUpdatedAt ||
        (ifMatchHeader ? ifMatchHeader.replace(/"/g, "").trim() : undefined);

      const result = await CardElementService.patchElement(
        accountId,
        cardId,
        elementId,
        parseResult.data,
        expectedUpdatedAt
      );

      return res.status(200).json({
        success: true,
        data: result,
        updatedAt: result.updatedAt,
      });
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
