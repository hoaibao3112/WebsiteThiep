import { EventEmitter } from "node:events";
import type Redis from "ioredis";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { HttpError } from "../lib/http-error";
import { logger } from "../lib/logger";
import { checkRateLimit } from "../lib/rate-limiter";
import { cleanProfanity, containsProfanity } from "../lib/profanity-filter";
import { MediaService } from "./media.service";
import {
  CreateWeddingMemoryInput,
  ToggleMemoryInput,
  MemorySafeDTO,
} from "../schemas/wedding-memory.schema";

export const MEMORY_PUBLIC_SELECT = {
  id: true,
  senderName: true,
  relationship: true,
  message: true,
  photoUrl: true,
  thumbUrl: true,
  frameType: true,
  isPinned: true,
  createdAt: true,
} as const;

// Single shared Redis subscriber for all SSE clients in this process
const memoryEventEmitter = new EventEmitter();
memoryEventEmitter.setMaxListeners(0);

let sharedSubscriber: Redis | null = null;
const subscribedChannels = new Set<string>();

function getSharedSubscriber(): Redis {
  if (!sharedSubscriber) {
    sharedSubscriber = redis.duplicate();
    sharedSubscriber.on("message", (channel, message) => {
      try {
        const parsed = JSON.parse(message);
        memoryEventEmitter.emit(channel, parsed);
      } catch (err) {
        logger.warn({ err, channel }, "Lỗi parse message từ Redis channel");
      }
    });
    sharedSubscriber.on("error", (err) => {
      logger.error({ err }, "Redis shared subscriber error");
    });
  }
  return sharedSubscriber;
}

export class WeddingMemoryService {
  /**
   * Khách tải ảnh + lời chúc lên thiệp qua multipart form-data
   */
  static async createMemory(
    slug: string,
    input: CreateWeddingMemoryInput,
    file: Express.Multer.File,
    ipAddress: string
  ): Promise<MemorySafeDTO> {
    if (!file) {
      throw new HttpError(400, "Vui lòng chọn ảnh để tải lên", "PHOTO_REQUIRED");
    }

    // 1. Kiểm tra thiệp tồn tại và đang ACTIVE chưa hết hạn
    const card = await prisma.card.findFirst({
      where: { slug },
      select: { id: true, accountId: true, status: true, expiredAt: true, categoryData: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới", "CARD_NOT_FOUND");
    }

    const now = new Date();
    if (card.status !== "ACTIVE" || (card.expiredAt && card.expiredAt <= now)) {
      throw new HttpError(400, "Thiệp đã hết hạn hoặc tạm dừng nhận ảnh kỷ niệm", "CARD_INACTIVE_OR_EXPIRED");
    }

    // 2. Rate limit Redis: 5 ảnh / 5 phút trên mỗi IP + slug
    await checkRateLimit(
      `ratelimit:memory:${ipAddress}:${slug}`,
      5,
      300,
      "Bạn đã gửi quá nhiều ảnh. Vui lòng thử lại sau 5 phút!"
    );

    // 3. Giới hạn trần 300 ảnh/thiệp
    const totalCount = await prisma.weddingMemory.count({
      where: { cardId: card.id },
    });
    if (totalCount >= 300) {
      throw new HttpError(400, "Thiệp cưới đã đạt giới hạn tối đa 300 ảnh kỷ niệm", "MEMORY_CAP_REACHED");
    }

    // 4. Upload ảnh lên Cloudinary folder cardvite/<accountId>/memories
    const { photoUrl, thumbUrl } = await MediaService.uploadMemoryPhoto(file, card.accountId);

    // 5. Lọc từ cấm và xác định trạng thái duyệt (moderation)
    const cleanedSenderName = cleanProfanity(input.senderName);
    const cleanedMessage = input.message ? cleanProfanity(input.message) : null;
    const hasProfanity =
      containsProfanity(input.senderName) ||
      (input.message ? containsProfanity(input.message) : false);

    const categoryObj =
      card.categoryData && typeof card.categoryData === "object"
        ? (card.categoryData as Record<string, unknown>)
        : {};
    const requireModeration = Boolean(categoryObj.moderation ?? false);
    const isApproved = !hasProfanity && !requireModeration;

    // 6. Lưu vào Database và chỉ trả DTO an toàn
    const memory = await prisma.weddingMemory.create({
      data: {
        accountId: card.accountId,
        cardId: card.id,
        guestId: input.guestId || null,
        senderName: cleanedSenderName,
        relationship: input.relationship || null,
        message: cleanedMessage,
        photoUrl,
        thumbUrl,
        frameType: input.frameType || "polaroid",
        isApproved,
        ipAddress: ipAddress || null,
      },
      select: MEMORY_PUBLIC_SELECT,
    });

    // 7. Bắn realtime SSE nếu ảnh được duyệt
    if (isApproved) {
      try {
        const channel = `wedding:memories:${card.id}`;
        await redis.publish(
          channel,
          JSON.stringify({
            event: "NEW_MEMORY",
            data: memory,
          })
        );
      } catch (err) {
        logger.warn({ err }, "Không thể publish event memory qua Redis");
      }
    }

    return memory;
  }

  /**
   * Lấy danh sách ảnh công khai (đã duyệt) để hiển thị trên thiệp
   */
  static async getPublicMemories(slug: string, limit = 50): Promise<MemorySafeDTO[]> {
    const card = await prisma.card.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới", "CARD_NOT_FOUND");
    }

    const clampedLimit = Math.min(Math.max(1, limit), 100);

    return prisma.weddingMemory.findMany({
      where: {
        cardId: card.id,
        isApproved: true,
      },
      select: MEMORY_PUBLIC_SELECT,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: clampedLimit,
    });
  }

  /**
   * Lấy toàn bộ ảnh dành cho Host quản lý
   */
  static async getAdminMemories(accountId: string, cardId: string): Promise<MemorySafeDTO[]> {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc không có quyền truy cập", "CARD_NOT_FOUND");
    }

    return prisma.weddingMemory.findMany({
      where: { accountId, cardId },
      select: MEMORY_PUBLIC_SELECT,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Bật/tắt duyệt hoặc ghim ảnh (Host)
   */
  static async toggleMemory(
    accountId: string,
    cardId: string,
    memoryId: string,
    input: ToggleMemoryInput
  ): Promise<MemorySafeDTO> {
    const memory = await prisma.weddingMemory.findFirst({
      where: { id: memoryId, accountId, cardId },
      select: { id: true },
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
      select: MEMORY_PUBLIC_SELECT,
    });

    // Thông báo cho màn hình LED cập nhật
    try {
      const channel = `wedding:memories:${cardId}`;
      const payload = JSON.stringify({
        event: updated ? (input.isApproved === false ? "HIDE_MEMORY" : "UPDATE_MEMORY") : "HIDE_MEMORY",
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
  static async deleteMemory(accountId: string, cardId: string, memoryId: string): Promise<{ success: boolean }> {
    const memory = await prisma.weddingMemory.findFirst({
      where: { id: memoryId, accountId, cardId },
      select: { id: true },
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
   * Lắng nghe Redis Pub/Sub cho SSE - Tái sử dụng 1 subscriber Redis duy nhất per-process
   */
  static subscribeCardMemories(
    cardId: string,
    onMessage: (payload: { event: string; data: unknown }) => void
  ): () => void {
    const channel = `wedding:memories:${cardId}`;
    const sub = getSharedSubscriber();

    if (!subscribedChannels.has(channel)) {
      sub.subscribe(channel).catch((err) => {
        logger.error({ err, channel }, "Không thể subscribe channel Redis");
      });
      subscribedChannels.add(channel);
    }

    memoryEventEmitter.on(channel, onMessage);

    return () => {
      memoryEventEmitter.off(channel, onMessage);
      if (memoryEventEmitter.listenerCount(channel) === 0) {
        subscribedChannels.delete(channel);
        sub.unsubscribe(channel).catch(() => {});
      }
    };
  }
}
