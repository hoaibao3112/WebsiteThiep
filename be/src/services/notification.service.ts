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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errBody = await res.text();
          const err = new Error(`Telegram API error: ${errBody}`);
          logger.error({ chatId, errBody }, "[Notification] Telegram send failed");
          throw err; // Để circuit breaker đếm failure
        }

        logger.info({ chatId }, "[Notification] Telegram sent successfully");
        return true;
      } finally {
        clearTimeout(timeout);
      }
    });
  } catch (error) {
    logger.error({ error }, "[Notification] Telegram send error (circuit may be OPEN)");
    return false;
  }
}

export interface LeadNotificationData {
  customerName?: string;
  phone: string;
  demand?: string;
  sessionId: string;
}

export async function dispatchLeadNotification(
  data: LeadNotificationData
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !adminChatId) {
    logger.info("[Notification] Telegram lead notification skipped: Missing BOT_TOKEN or ADMIN_CHAT_ID");
    return false;
  }

  const message = `
🔥 <b>CÓ KHÁCH HÀNG TIỀM NĂNG MỚI (TỪ AI CHATBOT)!</b>
----------------------------------
👤 <b>Họ tên:</b> ${data.customerName || "Khách truy cập website"}
📞 <b>SĐT / Zalo:</b> <code>${data.phone}</code>
💬 <b>Nhu cầu:</b> ${data.demand || "Tư vấn làm thiệp cưới / gói dịch vụ"}
🆔 <b>Phiên chat:</b> ${data.sessionId}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
----------------------------------
👉 <i>Hãy gọi điện hoặc nhắn tin Zalo ngay để hỗ trợ khách chốt đơn nhé!</i>
  `.trim();

  try {
    return await telegramCircuit.execute(async () => {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminChatId,
            text: message,
            parse_mode: "HTML",
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Telegram API error: ${errBody}`);
        }

        logger.info({ adminChatId }, "[Notification] Telegram lead sent successfully");
        return true;
      } finally {
        clearTimeout(timeout);
      }
    });
  } catch (error) {
    logger.error({ error }, "[Notification] Telegram lead send failed");
    return false;
  }
}

