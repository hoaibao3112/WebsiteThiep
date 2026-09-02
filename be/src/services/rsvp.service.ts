import { prisma } from "../lib/prisma";
import { checkRateLimit } from "../lib/rate-limiter";
import { RsvpSubmitInput } from "../lib/validators/rsvp.schema";
import { rsvpNotificationQueue } from "../queues/rsvp-notification.queue";

export class RsvpService {
  /**
   * Submit phản hồi RSVP
   */
  static async submitRsvp(
    input: RsvpSubmitInput,
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    const { cardId, guestCode, guestToken, fullName, phone, status, guestCount, side, note } =
      input;

    // 1. Rate limiting bằng Redis: 1 IP chỉ được gửi tối đa 5 lần trong 5 phút
    if (meta?.ipAddress) {
      await checkRateLimit(
        `ratelimit:rsvp:${meta.ipAddress}:${cardId}`,
        5,
        300,
        "Bạn đã gửi xác nhận quá nhiều lần. Vui lòng thử lại sau 5 phút!"
      );
    }

    // 2. Kiểm tra thiệp tồn tại & đang hoạt động
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: {
        id: true,
        slug: true,
        status: true,
        expiredAt: true,
        telegramChatId: true,
        accountId: true,
      },
    });

    if (!card) {
      throw new Error("Thiệp không tồn tại");
    }

    if (card.status !== "ACTIVE" || (card.expiredAt && card.expiredAt <= new Date())) {
      throw new Error("Thiệp đã hết hạn hoặc tạm dừng nhận phản hồi");
    }

    // 3. Tìm Guest ID nếu có guestCode
    let guestId: string | null = null;
    let resolvedName = fullName;
    let resolvedPhone = phone;
    if (guestCode || guestToken) {
      const guest = await prisma.guest.findFirst({
        where: { cardId, OR: [...(guestToken ? [{ guestToken }] : []), ...(guestCode ? [{ guestCode }] : [])] },
      });
      if (guest) { guestId = guest.id; resolvedName = guest.fullName; resolvedPhone = guest.phone || undefined; }
    }

    // 4. Lưu bản ghi RSVP vào Database
    const rsvp = guestId ? await prisma.rsvpResponse.upsert({
      where: { cardId_guestId: { cardId, guestId } },
      create: {
        accountId: card.accountId,
        cardId,
        guestId,
        fullName: resolvedName,
        phone: resolvedPhone,
        status,
        guestCount,
        side,
        note,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      }, update: { fullName: resolvedName, phone: resolvedPhone, status, guestCount, side, note, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent },
    }) : await prisma.rsvpResponse.create({ data: { accountId: card.accountId, cardId, fullName, phone, status, guestCount, side, note, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent } });

    // 5. Đẩy Job vào hàng đợi BullMQ để bắn thông báo ngầm (Telegram/Zalo)
    if (card.telegramChatId) {
      await rsvpNotificationQueue.add("send-telegram-rsvp", {
        cardSlug: card.slug,
        telegramChatId: card.telegramChatId,
        fullName,
        phone: phone || undefined,
        status,
        guestCount,
        note: note || undefined,
        side,
      });
    }

    return rsvp;
  }

  /**
   * Lấy thống kê RSVP cho Dashboard của Host
   */
  static async getRsvpStats(userId: string, cardId: string) {
    // Multi-tenant check: Chỉ chủ sở hữu thiệp mới xem được thống kê
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
    });
    if (!card) throw new Error("Không tìm thấy thiệp hoặc bạn không có quyền truy cập");

    const [totalAttending, totalDeclined, totalUndecided, totalGuestsCount, responses] =
      await Promise.all([
        prisma.rsvpResponse.count({
          where: { cardId, status: "ATTENDING" },
        }),
        prisma.rsvpResponse.count({
          where: { cardId, status: "DECLINED" },
        }),
        prisma.rsvpResponse.count({
          where: { cardId, status: "UNDECIDED" },
        }),
        prisma.rsvpResponse.aggregate({
          where: { cardId, status: "ATTENDING" },
          _sum: { guestCount: true },
        }),
        prisma.rsvpResponse.findMany({
          where: { cardId },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    return {
      summary: {
        attendingCount: totalAttending,
        declinedCount: totalDeclined,
        undecidedCount: totalUndecided,
        totalAttendingGuests: totalGuestsCount._sum.guestCount || 0,
      },
      responses,
    };
  }
}
