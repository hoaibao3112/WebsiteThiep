/**
 * Notification Service - Gửi thông báo Telegram Bot & Zalo ZNS
 */

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
    console.log(
      `[Notification] Telegram skipped: Missing BOT_TOKEN or ChatId (${chatId})`
    );
    return false;
  }

  const statusIcon =
    data.status === "ATTENDING"
      ? "✅ SẼ THAM DỰ"
      : data.status === "DECLINED"
      ? "❌ RẤT TIẾC KHÔNG THỂ ĐẾN"
      : "❓ CHƯA CHẮC CHẮN";

  const message = `
💌 <b>CÓ PHẢN HỒI RSVP MỚI!</b>
----------------------------------
👤 <b>Khách mời:</b> ${data.fullName}
📞 <b>Số điện thoại:</b> ${data.phone || "Không để lại"}
🎯 <b>Trạng thái:</b> ${statusIcon}
👥 <b>Số người:</b> ${data.guestCount} người
💬 <b>Lời nhắn:</b> ${data.note || "Không có"}
🔗 <b>Link thiệp:</b> /thiep/${data.cardSlug}
----------------------------------
<i>Hệ thống quản lý thiệp cưới online</i>
  `.trim();

  try {
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
      console.error("[Notification] Telegram send failed:", errBody);
      return false;
    }

    console.log(`[Notification] Telegram sent successfully to chat ${chatId}`);
    return true;
  } catch (error) {
    console.error("[Notification] Telegram send error:", error);
    return false;
  }
}
