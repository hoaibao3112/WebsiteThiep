/**
 * Notification Service - Gửi thông báo Telegram Bot & Zalo ZNS
 */
import { logger } from "../lib/logger";
import { telegramCircuit } from "../lib/circuit-breaker";
import { escapeHtml, truncate } from "../lib/html";

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

/**
 * Gửi 1 tin nhắn HTML qua Telegram, bọc circuit breaker + timeout.
 * Throw khi Telegram trả lỗi để circuit breaker đếm failure.
 */
async function sendTelegramHtml(botToken: string, chatId: string, text: string): Promise<true> {
  return telegramCircuit.execute(async () => {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.text();
        logger.error({ chatId, status: res.status, errBody }, "[Notification] Telegram send failed");
        throw new Error(`Telegram API error: ${res.status}`);
      }
      return true as const;
    } finally {
      clearTimeout(timeout);
    }
  });
}

export async function dispatchTelegramNotification(
  data: RsvpNotificationData
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = data.telegramChatId;

  if (!botToken || !chatId) {
    logger.warn(
      { hasToken: Boolean(botToken), hasChatId: Boolean(chatId) },
      "[Notification] Telegram skipped: Missing BOT_TOKEN or ChatId"
    );
    return false;
  }

  const statusIcon =
    data.status === "ATTENDING"
      ? "✅ SẼ THAM DỰ"
      : data.status === "DECLINED"
      ? "❌ RẤT TIẾC KHÔNG THỂ ĐẾN"
      : "❓ CHƯA CHẮC CHẮN";

  const appUrl = (process.env.APP_URL || "https://cardvite.vn").replace(/\/$/, "");
  const cardLink = `${appUrl}/thiep/${encodeURIComponent(data.cardSlug)}`;

  // Mọi field do khách nhập đều phải escape — Telegram HTML parse sẽ 400 nếu có `<`, `&`...
  const message = `
💌 <b>CÓ PHẢN HỒI RSVP MỚI!</b>
----------------------------------
👤 <b>Khách mời:</b> ${escapeHtml(truncate(data.fullName, 100))}
📞 <b>Số điện thoại:</b> ${escapeHtml(data.phone || "Không để lại")}
🎯 <b>Trạng thái:</b> ${statusIcon}
👥 <b>Số người:</b> ${escapeHtml(data.guestCount)} người
💬 <b>Lời nhắn:</b> ${escapeHtml(truncate(data.note || "Không có", 500))}
🔗 <b>Link thiệp:</b> <a href="${escapeHtml(cardLink)}">${escapeHtml(cardLink)}</a>
----------------------------------
<i>Hệ thống quản lý thiệp cưới online CardVite</i>
  `.trim();

  try {
    await sendTelegramHtml(botToken, chatId, message);
    logger.info({ chatId }, "[Notification] Telegram sent successfully");
    return true;
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
    logger.warn("[Notification] Telegram lead notification skipped: Missing BOT_TOKEN or ADMIN_CHAT_ID");
    return false;
  }

  const message = `
🔥 <b>CÓ KHÁCH HÀNG TIỀM NĂNG MỚI (TỪ AI CHATBOT)!</b>
----------------------------------
👤 <b>Họ tên:</b> ${escapeHtml(truncate(data.customerName || "Khách truy cập website", 100))}
📞 <b>SĐT / Zalo:</b> <code>${escapeHtml(data.phone)}</code>
💬 <b>Nhu cầu:</b> ${escapeHtml(truncate(data.demand || "Tư vấn làm thiệp cưới / gói dịch vụ", 500))}
🆔 <b>Phiên chat:</b> ${escapeHtml(data.sessionId)}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
----------------------------------
👉 <i>Hãy gọi điện hoặc nhắn tin Zalo ngay để hỗ trợ khách chốt đơn nhé!</i>
  `.trim();

  try {
    await sendTelegramHtml(botToken, adminChatId, message);
    logger.info({ adminChatId }, "[Notification] Telegram lead sent successfully");
    return true;
  } catch (error) {
    logger.error({ error }, "[Notification] Telegram lead send failed");
    return false;
  }
}