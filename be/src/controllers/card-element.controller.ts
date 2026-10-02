import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { CardElementService } from "../services/card-element.service";
import { HttpError } from "../lib/http-error";
import { StoredImageUrlSchema } from "../lib/validators/card";

export const PatchElementBodySchema = z.object({
  customData: z.record(z.unknown()).optional(),
  content: z.string().max(5000).optional(),
  imageUrl: z.union([StoredImageUrlSchema, z.literal("")]).optional(),
  title: z.string().max(500).optional(),
  x: z.number().min(-2000).max(10000).optional(),
  y: z.number().min(-2000).max(100000).optional(),
  width: z.number().min(0).max(10000).optional(),
  height: z.number().min(0).max(100000).optional(),
  fontSize: z.number().min(1).max(500).optional(),
  fontFamily: z.string().max(100).optional(),
  color: z.string().max(100).optional(),
  backgroundColor: z.string().max(100).optional(),
  borderRadius: z.number().min(0).max(1000).optional(),
  borderWidth: z.number().min(0).max(100).optional(),
  borderColor: z.string().max(100).optional(),
  opacity: z.number().min(0).max(1).optional(),
  rotation: z.number().min(-360).max(360).optional(),
  zIndex: z.number().int().optional(),
  shapeType: z.enum([
    "line",
    "rect",
    "circle",
    "corner",
    "square",
    "triangle",
    "arch",
    "heart",
    "star",
    "diamond",
    "hexagon",
    "oval",
    "ribbon",
    "wavy-line",
    "dashed-line",
    "flourish-line",
  ]).optional(),
  widgetConfig: z.record(z.unknown()).optional(),
  linkUrl: z.string().refine((url) => {
    if (!url) return true;
    return /^(https?:\/\/|tel:|mailto:)/i.test(url);
  }, "linkUrl chỉ cho phép giao thức http, https, tel hoặc mailto").optional(),
  svgContent: z.string().refine((svg) => {
    if (!svg) return true;
    const lower = svg.toLowerCase();
    if (lower.includes("<script") || /on[a-z]+\s*=/i.test(svg)) {
      return false;
    }
    return true;
  }, "svgContent không được chứa thẻ script hoặc sự kiện nguy hiểm").optional(),
  svgType: z.enum(["frame", "divider", "custom"]).optional(),
  textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
  isBold: z.boolean().optional(),
  isItalic: z.boolean().optional(),
  isUnderline: z.boolean().optional(),
  isStrike: z.boolean().optional(),
  isUppercase: z.boolean().optional(),
  letterSpacing: z.number().optional(),
  lineHeight: z.number().optional(),
  padding: z.number().optional(),
  shadow: z.string().optional(),
  isLocked: z.boolean().optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional(),
  animation: z.string().optional(),
  loopAnimation: z.string().optional(),
  userEdited: z.boolean().optional(),
  bindingDetached: z.boolean().optional(),
  expectedUpdatedAt: z.union([z.string(), z.date()]).optional(),
  version: z.number().int().optional(),
});

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
