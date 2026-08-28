import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { CreateOrderSchema, SepayWebhookPayloadSchema } from "../lib/validators/order.schema";

export class OrderController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId || "mock-user-id";
      const validated = CreateOrderSchema.parse(req.body);

      const result = await OrderService.createOrder(userId, validated);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderCode } = req.params;
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
      // Xác thực API Key nếu SePay gửi qua Header
      const authHeader = req.headers["authorization"];
      const secret = process.env.SEPAY_WEBHOOK_SECRET;

      if (secret && authHeader && authHeader !== `Apikey ${secret}`) {
        console.warn("[Webhook SePay] Unauthorized access attempt!");
        return res.status(401).json({ success: false, error: "Unauthorized" });
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
