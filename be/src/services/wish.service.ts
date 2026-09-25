import { prisma } from "../lib/prisma";
import { cleanProfanity, containsProfanity } from "../lib/profanity-filter";
import { checkRateLimit } from "../lib/rate-limiter";
import { WishSubmitInput } from "../lib/validators/wish.schema";
import { HttpError } from "../lib/http-error";

export class WishService {
  private static async getPublicCard(cardId: string) {
    return prisma.card.findFirst({
      where: {
        id: cardId,
        status: "ACTIVE",
        OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
      },
      select: { id: true, status: true, accountId: true },
    });
  }

  /**
   * Gửi lời chúc mới kèm Rate Limiting
   */
  static async submitWish(
    input: WishSubmitInput,
    meta?: { ipAddress?: string }
  ) {
    const { cardId, senderName, relationship, content, emoji } = input;

    // 1. Rate limiting bằng Redis: 1 IP chỉ được gửi tối đa 5 lời chúc trong 5 phút
    if (meta?.ipAddress) {
      await checkRateLimit(
        `ratelimit:wish:${meta.ipAddress}:${cardId}`,
        5,
        300,
        "Bạn đã gửi lời chúc quá nhiều lần. Vui lòng thử lại sau 5 phút!"
      );
    }

    // 2. Kiểm tra thiệp tồn tại
    const card = await this.getPublicCard(cardId);

    if (!card) {
      throw new HttpError(404, "Thiệp không tồn tại", "CARD_NOT_FOUND");
    }

    if (card.status !== "ACTIVE" && card.status !== "DRAFT") {
      throw new HttpError(400, "Thiệp đã hết hạn hoặc tạm dừng nhận lời chúc", "CARD_INACTIVE_OR_EXPIRED");
    }

    // 3. Kiểm tra và làm sạch từ ngữ phản cảm
    const cleanedContent = cleanProfanity(content);
    const hasProfanity = containsProfanity(content);

    // Tự động kiểm duyệt: nếu chứa từ cấm thì để isApproved = false
    const isApproved = !hasProfanity;

    const wish = await prisma.wish.create({
      data: {
        accountId: card.accountId,
        cardId,
        senderName: senderName.trim(),
        relationship: relationship?.trim(),
        content: cleanedContent.trim(),
        emoji: emoji || "❤️",
        isApproved,
        ipAddress: meta?.ipAddress,
      },
      select: {
        id: true,
        senderName: true,
        relationship: true,
        content: true,
        emoji: true,
        createdAt: true,
      },
    });

    return wish;
  }

  /**
   * Lấy danh sách lời chúc công khai (Cursor-based Pagination)
   */
  static async listWishes(cardId: string, limit = 20, cursor?: string) {
    if (!cardId || cardId.startsWith("draft-") || cardId.startsWith("demo-")) {
      return { items: [], nextCursor: undefined };
    }
    const card = await this.getPublicCard(cardId);
    if (!card) {
      return { items: [], nextCursor: undefined };
    }

    const items = await prisma.wish.findMany({
      where: {
        accountId: card.accountId,
        cardId,
        isApproved: true,
      },
      select: {
        id: true,
        senderName: true,
        relationship: true,
        content: true,
        emoji: true,
        createdAt: true,
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return {
      items,
      nextCursor,
    };
  }
}
