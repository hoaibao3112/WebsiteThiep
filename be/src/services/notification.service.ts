/**
 * Notification Service - Gửi thông báo Telegram Bot & Zalo ZNS
 */
import { logger } from "../lib/logger";
import { telegramCircuit } from "../lib/circuit-breaker";

export interface RsvpNotificationData {
  cardSlug: string;
  telegramChatId?: string;
  fullName: string;
  phone?: string;
  status: "ATTENDING" | "DECLINED" | "UNDECIDED";
  guestCount: number;
  note?: string;
  side: string;
}

export async function dispatchTelegramNotification(
  data: RsvpNotificationData
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = data.telegramChatId;

  if (!botToken || !chatId) {
    logger.info({ chatId }, "[Notification] Telegram skipped: Missing BOT_TOKEN or ChatId");
    return false;
  }

  const statusIcon =
    data.status === "ATTENDING"
      ? "✅ SẼ THAM DỰ"
      : data.status === "DECLINED"
      ? "❌ RẤT TIẾC KHÔNG THỂ ĐẾN"
      : "❓ CHƯA CHẮC CHẮN";

  const appUrl = (process.env.APP_URL || "https://cardvite.vn").replace(/\/$/, "");
  const cardLink = `${appUrl}/thiep/${data.cardSlug}`;

  const message = `
💌 <b>CÓ PHẢN HỒI RSVP MỚI!</b>
----------------------------------
👤 <b>Khách mời:</b> ${data.fullName}
📞 <b>Số điện thoại:</b> ${data.phone || "Không để lại"}
🎯 <b>Trạng thái:</b> ${statusIcon}
👥 <b>Số người:</b> ${data.guestCount} người
💬 <b>Lời nhắn:</b> ${data.note || "Không có"}
🔗 <b>Link thiệp:</b> <a href="${cardLink}">${cardLink}</a>
----------------------------------
<i>Hệ thống quản lý thiệp cưới online CardVite</i>
  `.trim();

  try {
    return await telegramCircuit.execute(async () => {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        const err = new Error(`Telegram API error: ${errBody}`);
        logger.error({ chatId, errBody }, "[Notification] Telegram send failed");
        throw err; // Để circuit breaker đếm failure
      }

      logger.info({ chatId }, "[Notification] Telegram sent successfully");
      return true;
    });
  } catch (error) {
    logger.error({ error }, "[Notification] Telegram send error (circuit may be OPEN)");
    return false;
  }
}
