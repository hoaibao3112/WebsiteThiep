import { Request, Response, NextFunction } from "express";
import { GuestSignatureService } from "../services/guest-signature.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class GuestSignatureController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = req.params.cardId as string;
      const elementId = req.params.elementId as string;
      const { signerName, signatureDataUrl, message, guestToken } = req.body as {
        signerName: string;
        signatureDataUrl: string;
        message?: string;
        guestToken?: string;
      };
      if (!signerName?.trim()) {
        return res.status(400).json({ success: false, error: "Ten nguoi ky la bat buoc" });
      }
      if (!signatureDataUrl) {
        return res.status(400).json({ success: false, error: "Du lieu chu ky la bat buoc" });
      }
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const result = await GuestSignatureService.submit(
        cardId, elementId, signerName, signatureDataUrl, message, guestToken, { ipAddress, userAgent }
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
