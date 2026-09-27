import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { HttpError } from "../lib/http-error";
import { logger } from "../lib/logger";
import { CreateWeddingMemoryInput, ToggleMemoryInput } from "../schemas/wedding-memory.schema";
import Redis from "ioredis";

export class WeddingMemoryService {
  /**
   * Khách tải ảnh + lời chúc lên thiệp
   */
  static async createMemory(slug: string, input: CreateWeddingMemoryInput, ipAddress?: string) {
    const card = await prisma.card.findFirst({
      where: { slug },
      select: { id: true, accountId: true, status: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới", "CARD_NOT_FOUND");
    }

    const memory = await prisma.weddingMemory.create({
      data: {
        accountId: card.accountId,
        cardId: card.id,
        guestId: input.guestId || null,
        senderName: input.senderName,
        relationship: input.relationship || null,
        message: input.message || null,
        photoUrl: input.photoUrl,
        thumbUrl: input.thumbUrl || input.photoUrl,
        frameType: input.frameType || "polaroid",
        isApproved: true,
        ipAddress: ipAddress || null,
      },
    });

    // Realtime Pub/Sub: Bắn event để Màn hình LED nhận tức thì
    try {
      const channel = `wedding:memories:${card.id}`;
      const payload = JSON.stringify({
        event: "NEW_MEMORY",
        data: memory,
      });
      await redis.publish(channel, payload);
    } catch (err) {
      logger.warn({ err }, "Không thể publish event memory qua Redis");
    }

    return memory;
  }

  /**
   * Lấy danh sách ảnh công khai (đã duyệt) để hiển thị trên thiệp
   */
  static async getPublicMemories(slug: string, limit = 50) {
    const card = await prisma.card.findFirst({
      where: { slug },
      select: { id: true, accountId: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới", "CARD_NOT_FOUND");
    }

    const memories = await prisma.weddingMemory.findMany({
      where: {
        cardId: card.id,
        isApproved: true,
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: Math.min(limit, 100),
    });

    return memories;
  }

  /**
   * Lấy toàn bộ ảnh dành cho Host quản lý (kể cả ảnh đã ẩn)
   */
  static async getAdminMemories(accountId: string, cardId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc không có quyền truy cập", "CARD_NOT_FOUND");
    }

    const memories = await prisma.weddingMemory.findMany({
      where: { accountId, cardId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return memories;
  }

  /**
   * Bật/tắt duyệt hoặc ghim ảnh (Host)
   */
  static async toggleMemory(accountId: string, cardId: string, memoryId: string, input: ToggleMemoryInput) {
    const memory = await prisma.weddingMemory.findFirst({
      where: { id: memoryId, accountId, cardId },
    });

    if (!memory) {
      throw new HttpError(404, "Không tìm thấy ảnh kỷ niệm", "MEMORY_NOT_FOUND");
    }

    const updated = await prisma.weddingMemory.update({
      where: { id: memoryId },
      data: {
        ...(input.isApproved !== undefined ? { isApproved: input.isApproved } : {}),
        ...(input.isPinned !== undefined ? { isPinned: input.isPinned } : {}),
      },
    });

    // Thông báo cho màn hình LED cập nhật
    try {
      const channel = `wedding:memories:${cardId}`;
      const payload = JSON.stringify({
        event: updated.isApproved ? "UPDATE_MEMORY" : "HIDE_MEMORY",
        data: updated,
      });
      await redis.publish(channel, payload);
    } catch (err) {
      logger.warn({ err }, "Lỗi publish toggleMemory event");
    }

    return updated;
  }

  /**
   * Xóa ảnh kỷ niệm
   */
  static async deleteMemory(accountId: string, cardId: string, memoryId: string) {
    const memory = await prisma.weddingMemory.findFirst({
      where: { id: memoryId, accountId, cardId },
    });

    if (!memory) {
      throw new HttpError(404, "Không tìm thấy ảnh kỷ niệm", "MEMORY_NOT_FOUND");
    }

    await prisma.weddingMemory.delete({
      where: { id: memoryId },
    });

    try {
      const channel = `wedding:memories:${cardId}`;
      await redis.publish(channel, JSON.stringify({ event: "DELETE_MEMORY", data: { id: memoryId } }));
    } catch (err) {
      logger.warn({ err }, "Lỗi publish deleteMemory event");
    }

    return { success: true };
  }

  /**
   * Lắng nghe Redis Pub/Sub cho Server-Sent Events (SSE)
   */
  static subscribeCardMemories(cardId: string, onMessage: (payload: { event: string; data: unknown }) => void): () => void {
    const sub: Redis = redis.duplicate();
    const channel = `wedding:memories:${cardId}`;

    sub.subscribe(channel, (err) => {
      if (err) {
        logger.error({ err, channel }, "Không thể subscribe channel Redis");
      }
    });

    sub.on("message", (_ch, message) => {
      try {
        const parsed = JSON.parse(message);
        onMessage(parsed);
      } catch (err) {
        logger.warn({ err }, "Lỗi parse message từ Redis channel");
      }
    });

    return () => {
      sub.unsubscribe(channel).catch(() => {});
      sub.quit().catch(() => {});
    };
  }
}
