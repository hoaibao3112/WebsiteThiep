import { Response, NextFunction } from "express";
import { ManualPaymentReviewService } from "../services/manual-payment-review.service";
import {
  AdminListQuerySchema,
  ApproveOrderSchema,
  RejectOrderSchema,
} from "../lib/validators/order.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { logger } from "../lib/logger";

export class AdminPaymentController {
  /**
   * GET /admin/payment-orders — Paginated review queue.
   */
  static async listQueue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Inline parse cho query params (không dùng validate middleware cho query)
      const query = AdminListQuerySchema.parse(req.query);
      const result = await ManualPaymentReviewService.listReviewQueue(query);
      res.status(200).json({ success: true, data: result });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * GET /admin/payment-orders/:orderId — Order detail.
   */
  static async getDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId as string;
      const detail = await ManualPaymentReviewService.getOrderDetail(orderId);
      if (!detail) {
        return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
      }
      res.status(200).json({ success: true, data: detail });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * POST /admin/payment-orders/:orderId/approve — Approve with received amount.
   */
  static async approve(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.userId;
      if (!adminUserId) {
        return res.status(500).json({ success: false, error: "Thiếu thông tin xác thực" });
      }

      const orderId = req.params.orderId as string;
      // Inline parse — ZodError sẽ được global error handler bắt
      const validated = ApproveOrderSchema.parse(req.body);

      const detail = await ManualPaymentReviewService.approveOrder(orderId, adminUserId, validated);

      logger.info(
        { orderId, adminUserId, receivedAmount: validated.receivedAmount },
        "[AdminPayment] Order approved via API",
      );

      res.status(200).json({ success: true, data: detail });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * POST /admin/payment-orders/:orderId/reject — Reject with required reason.
   */
  static async reject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.userId;
      if (!adminUserId) {
        return res.status(500).json({ success: false, error: "Thiếu thông tin xác thực" });
      }

      const orderId = req.params.orderId as string;
      const validated = RejectOrderSchema.parse(req.body);

      const detail = await ManualPaymentReviewService.rejectOrder(orderId, adminUserId, validated);

      logger.info(
        { orderId, adminUserId, reason: validated.reason },
        "[AdminPayment] Order rejected via API",
      );

      res.status(200).json({ success: true, data: detail });
    } catch (error: unknown) {
      next(error);
    }
  }
}
