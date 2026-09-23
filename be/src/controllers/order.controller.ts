import { Response, NextFunction } from "express";
import { ZodError } from "zod";
import { OrderService } from "../services/order.service";
import { CreateOrderSchema, SubmitTransferParamsSchema } from "../lib/validators/order.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { HttpError } from "../lib/http-error";

export class OrderController {
  /**
   * POST /orders — Create an account-level order (OWNER only).
   */
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const accountId = req.user?.accountId;
      if (!userId || !accountId) {
        return res.status(500).json({
          success: false,
          error: "Thiếu thông tin xác thực - lỗi hệ thống",
        });
      }

      const validated = CreateOrderSchema.parse(req.body);
      const idempotencyKey = req.header("Idempotency-Key");
      if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
        return res.status(400).json({ success: false, error: "Idempotency-Key không hợp lệ" });
      }

      const result = await OrderService.createOrder(userId, accountId, validated, idempotencyKey);
      res.status(result.replayed ? 200 : 201).json({ success: true, data: result });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }

  /**
   * POST /orders/:orderId/submit-transfer — Confirm bank transfer (OWNER only).
   */
  static async submitTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(500).json({ success: false, error: "Thiếu thông tin xác thực" });
      }

      const { orderId } = SubmitTransferParamsSchema.parse(req.params);
      const order = await OrderService.submitTransfer(accountId, orderId);
      res.status(200).json({ success: true, data: order });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
        });
      }
      next(error);
    }
  }

  /**
   * GET /orders/:orderId — Get order detail (authenticated OWNER).
   */
  static async getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(500).json({ success: false, error: "Thiếu thông tin xác thực" });
      }

      const orderId = req.params.orderId as string;
      const order = await OrderService.getAccountOrder(accountId, orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
      }
      res.status(200).json({ success: true, data: order });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * GET /orders/:orderCode/status — Legacy polling (backward compatibility).
   */
  static async checkStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orderCode = req.params.orderCode as string;
      const pollingToken = req.header("X-Polling-Token");
      if (!pollingToken) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
      const order = await OrderService.checkOrderStatus(orderCode, pollingToken);

      if (!order) {
        return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
      }

      res.status(200).json({ success: true, data: order });
    } catch (error: unknown) {
      next(error);
    }
  }
}
