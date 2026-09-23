import { Request, Response, NextFunction } from "express";
import { BillingService } from "../services/billing.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class BillingController {
  /**
   * GET /plans — Public: active Plan catalog.
   */
  static async getPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await BillingService.getPlanCatalog();
      res.status(200).json({ success: true, data: plans });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * GET /billing/summary — Authenticated: account billing summary.
   */
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(500).json({ success: false, error: "Thiếu thông tin xác thực" });
      }

      const summary = await BillingService.getBillingSummary(accountId);
      res.status(200).json({ success: true, data: summary });
    } catch (error: unknown) {
      next(error);
    }
  }
}
