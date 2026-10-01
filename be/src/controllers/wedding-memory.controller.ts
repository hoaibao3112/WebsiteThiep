import { Request, Response, NextFunction } from "express";
import { WeddingMemoryService } from "../services/wedding-memory.service";
import { CreateWeddingMemorySchema, ToggleMemorySchema } from "../schemas/wedding-memory.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const DEMO_SLUGS = new Set([
  "wedding-heritage-crimson-gold",
  "wedding-modern-editorial-magazine",
  "wedding-minimalist-pure-monochrome",
  "wedding-glassmorphic-blush-rose",
  "wedding-royal-luxury-regal-navy",
  "wedding-traditional-red-lantern",
  "wedding-botanical-boho-terracotta",
  "wedding-indochine-vintage-elegance",
  "wedding-modern-luxury-pearl",
]);

export class WeddingMemoryController {
  /**
   * POST /api/cards/:slug/memories
   * Khách tại bàn tiệc tải ảnh + lời chúc lên
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;

      if (DEMO_SLUGS.has(slug) || slug.startsWith("demo-")) {
        return res.status(400).json({
          success: false,
          error: "Thiệp mẫu demo chỉ dùng để xem trước, không hỗ trợ nhận ảnh kỷ niệm. Vui lòng tạo thiệp cưới riêng từ tài khoản của bạn để kích hoạt tính năng này.",
        });
      }

      const parsed = CreateWeddingMemorySchema.parse(req.body);
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined;

      const memory = await WeddingMemoryService.createMemory(slug, parsed, ipAddress);
      return res.status(201).json({
        success: true,
        message: "Gửi ảnh kỷ niệm thành công",
        data: memory,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Thông tin gửi ảnh không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }

  /**
   * GET /api/cards/:slug/memories
   * Lấy danh sách ảnh kỷ niệm công khai đã duyệt
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;

      if (DEMO_SLUGS.has(slug) || slug.startsWith("demo-")) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const limit = Number(req.query.limit) || 50;
      const memories = await WeddingMemoryService.getPublicMemories(slug, limit);

      return res.status(200).json({
        success: true,
        data: memories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cards/:slug/memories/stream
   * Server-Sent Events (SSE) stream dành riêng cho Màn hình LED sân khấu
   */
  static async stream(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const card = await prisma.card.findFirst({
        where: { slug },
        select: { id: true, accountId: true },
      });

      if (!card) {
        return res.status(404).json({ success: false, error: "Không tìm thấy thiệp cưới" });
      }

      // Thiết lập header SSE chuẩn Nginx/Cloudflare
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // Vô hiệu hoá buffer Nginx để đẩy data realtime tức thì
      res.flushHeaders?.();

      // Gửi event chào mừng
      res.write(`event: connected\ndata: ${JSON.stringify({ cardId: card.id, timestamp: Date.now() })}\n\n`);

      // Heartbeat giữ kết nối không bị timeout (mỗi 25 giây)
      const heartbeat = setInterval(() => {
        res.write(`: ping\n\n`);
      }, 25000);

      // Đăng ký nhận message từ Redis Pub/Sub
      const unsubscribe = WeddingMemoryService.subscribeCardMemories(card.id, (payload) => {
        res.write(`event: ${payload.event}\ndata: ${JSON.stringify(payload.data)}\n\n`);
      });

      // Dọn dẹp khi client ngắt kết nối (màn hình LED tắt tab)
      req.on("close", () => {
        clearInterval(heartbeat);
        unsubscribe();
        res.end();
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cards/:cardId/memories/admin
   * Lấy danh sách ảnh dành cho Host quản lý
   */
  static async adminList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Chưa xác thực" });

      const cardId = req.params.cardId as string;
      const memories = await WeddingMemoryService.getAdminMemories(accountId, cardId);

      return res.status(200).json({
        success: true,
        data: memories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/cards/:cardId/memories/:memoryId
   * Ẩn/hiện hoặc ghim ảnh kỷ niệm
   */
  static async toggle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Chưa xác thực" });

      const cardId = req.params.cardId as string;
      const memoryId = req.params.memoryId as string;
      const parsed = ToggleMemorySchema.parse(req.body);

      const memory = await WeddingMemoryService.toggleMemory(accountId, cardId, memoryId, parsed);
      return res.status(200).json({
        success: true,
        data: memory,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/cards/:cardId/memories/:memoryId
   * Xóa ảnh vi phạm
   */
  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) return res.status(401).json({ success: false, error: "Chưa xác thực" });

      const cardId = req.params.cardId as string;
      const memoryId = req.params.memoryId as string;

      const result = await WeddingMemoryService.deleteMemory(accountId, cardId, memoryId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
