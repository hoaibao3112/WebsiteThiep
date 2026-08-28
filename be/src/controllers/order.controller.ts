import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { CreateOrderSchema, SepayWebhookPayloadSchema } from "../lib/validators/order.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class OrderController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: "Thiếu thông tin xác thực - lỗi hệ thống",
        });
      }

      const validated = CreateOrderSchema.parse(req.body);
      const result = await OrderService.createOrder(userId, validated);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderCode = req.params.orderCode as string;
      const order = await OrderService.checkOrderStatus(orderCode);

      if (!order) {
        return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
      }

      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async handleSepayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Xác thực Webhook SePay theo nguyên tắc Default Deny
      const secret = process.env.SEPAY_WEBHOOK_SECRET;
      if (secret) {
        const authHeader = req.headers["authorization"];
        if (!authHeader || authHeader !== `Apikey ${secret}`) {
          console.warn("[Webhook SePay] Cảnh báo truy cập trái phép - Header Authorization không hợp lệ hoặc bị thiếu!");
          return res.status(401).json({
            success: false,
            error: "Unauthorized: Invalid or missing API key",
          });
        }
      }

      const validated = SepayWebhookPayloadSchema.parse(req.body);
      const result = await OrderService.processSepayWebhook(validated);

      res.status(200).json(result);
    } catch (error: any) {
      console.error("[Webhook SePay] Error:", error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
