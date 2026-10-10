import { Request, Response, NextFunction } from "express";
import { GuestSignatureService } from "../services/guest-signature.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { GuestSignatureSubmitSchema } from "../schemas/guest-signature.schema";

export class GuestSignatureController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = req.params.cardId as string;
      const elementId = req.params.elementId as string;
      // Validate kiểu dữ liệu bằng Zod — body sai kiểu (object/array...) trả 400 thay vì TypeError -> 500
      const parsed = GuestSignatureSubmitSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || "Du lieu khong hop le",
        });
      }
      const { signerName, signatureDataUrl, message, guestToken } = parsed.data;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const result = await GuestSignatureService.submit(
        cardId, elementId, signerName, signatureDataUrl, message ?? undefined, guestToken ?? undefined, { ipAddress, userAgent }
      );
      res.status(201).json(result);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = req.params.cardId as string;
      const elementId = req.params.elementId as string;
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const data = await GuestSignatureService.getGallery(cardId, elementId, page, limit);
      res.json({ success: true, ...data });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Unauthorized" });
      const cardId = req.params.cardId as string;
      const elementId = req.params.elementId as string;
      const data = await GuestSignatureService.getList(accountId, cardId, elementId);
      res.json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async toggleApprove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Unauthorized" });
      const cardId = req.params.cardId as string;
      const signatureId = req.params.signatureId as string;
      const result = await GuestSignatureService.toggleApprove(accountId, cardId, signatureId);
      res.json(result);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteSignature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Unauthorized" });
      const cardId = req.params.cardId as string;
      const signatureId = req.params.signatureId as string;
      const result = await GuestSignatureService.deleteSignature(accountId, cardId, signatureId);
      res.json(result);
    } catch (error: unknown) {
      next(error);
    }
  }
}
