import { Response, NextFunction } from "express";
import { AddonService } from "../services/addon.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class AddonController {
  /**
   * GET /addons — Lấy danh mục tiện ích Addon kèm quota hiện tại của Account
   */
  static async getCatalog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Chưa xác thực tài khoản" });
      }

      const data = await AddonService.getCatalog(accountId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /addons/orders — Tạo đơn hàng mua tiện ích Addon (OWNER)
   */
  static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const accountId = req.user?.accountId;
      if (!userId || !accountId) {
        return res.status(401).json({ success: false, error: "Chưa xác thực tài khoản" });
      }

      const { addonCode } = req.body;
      if (!addonCode || typeof addonCode !== "string") {
        return res.status(400).json({ success: false, error: "Thiếu mã tiện ích addonCode" });
      }

      const idempotencyKey = req.header("Idempotency-Key") || `addon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const order = await AddonService.createAddonOrder(userId, accountId, addonCode, idempotencyKey);
      return res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}
