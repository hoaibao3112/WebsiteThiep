import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { OrderService } from "../services/order.service";
import { CreateOrderSchema, SepayWebhookPayloadSchema } from "../lib/validators/order.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import crypto from "node:crypto";

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
      const idempotencyKey = req.header("Idempotency-Key");
      if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
        return res.status(400).json({ success: false, error: "Idempotency-Key không hợp lệ" });
      }
      const result = await OrderService.createOrder(userId, validated, idempotencyKey);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
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

  static async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderCode = req.params.orderCode as string;
      const pollingToken = req.header("X-Polling-Token");
      if (!pollingToken) return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
      const order = await OrderService.checkOrderStatus(orderCode, pollingToken);

      if (!order) {
        return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
      }

      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
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

  static async handleSepayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Xác thực Webhook SePay theo nguyên tắc Default Deny
      const secret = process.env.SEPAY_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(503).json({ success: false, error: "Webhook chưa được cấu hình" });
      }
      {
        const authHeader = req.headers["authorization"];
        const expected = `Apikey ${secret}`;
        const received = typeof authHeader === "string" ? authHeader : "";
        const valid = received.length === expected.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
        if (!valid) {
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
}
