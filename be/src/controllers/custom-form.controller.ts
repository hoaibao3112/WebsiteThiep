import { Request, Response, NextFunction } from "express";
import { CustomFormService } from "../services/custom-form.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class CustomFormController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = req.params.cardId as string;
      const elementId = req.params.elementId as string;
      const { formData, guestToken } = req.body as {
        formData: Record<string, unknown>;
        guestToken?: string;
      };
      if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
        return res.status(400).json({ success: false, error: "formData khong hop le" });
      }
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const result = await CustomFormService.submit(cardId, elementId, formData, guestToken, { ipAddress, userAgent });
      res.status(201).json(result);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Unauthorized" });
      const cardId = req.params.cardId as string;
      const elementId = req.params.elementId as string;
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const data = await CustomFormService.getSubmissions(accountId, cardId, elementId, page, limit);
      res.json({ success: true, ...data });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Unauthorized" });
      const cardId = req.params.cardId as string;
      const submissionId = req.params.submissionId as string;
      const result = await CustomFormService.deleteSubmission(accountId, cardId, submissionId);
      res.json(result);
    } catch (error: unknown) {
      next(error);
    }
  }
}
