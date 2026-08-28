import { prisma } from "../lib/prisma";
import { cleanProfanity, containsProfanity } from "../lib/profanity-filter";
import { checkRateLimit } from "../lib/rate-limiter";
import { WishSubmitInput } from "../lib/validators/wish.schema";

export class WishService {
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
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, status: true },
    });

    if (!card) {
      throw new Error("Thiệp không tồn tại");
    }

    if (card.status !== "ACTIVE" && card.status !== "DRAFT") {
      throw new Error("Thiệp đã hết hạn hoặc tạm dừng nhận lời chúc");
    }

    // 3. Kiểm tra và làm sạch từ ngữ phản cảm
    const cleanedContent = cleanProfanity(content);
    const hasProfanity = containsProfanity(content);

    // Tự động kiểm duyệt: nếu chứa từ cấm thì để isApproved = false
    const isApproved = !hasProfanity;

    const wish = await prisma.wish.create({
      data: {
        cardId,
        senderName: senderName.trim(),
        relationship: relationship?.trim(),
        content: cleanedContent.trim(),
        emoji: emoji || "❤️",
        isApproved,
        ipAddress: meta?.ipAddress,
      },
    });

    return wish;
  }

  /**
   * Lấy danh sách lời chúc công khai (Cursor-based Pagination)
   */
  static async listWishes(cardId: string, limit = 20, cursor?: string) {
    const items = await prisma.wish.findMany({
      where: {
        cardId,
        isApproved: true,
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
