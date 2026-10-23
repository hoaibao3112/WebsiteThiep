/**
 * Lời mời mặc định — dùng các placeholder:
 *   {danh_xung}  → Anh / Chị / Bạn / Gia đình ...
 *   {ten_khach}  → Họ tên đầy đủ của khách
 *   {link_thiep} → URL thiệp cá nhân hóa
 *
 * Khi gửi qua Zalo: link sẽ tự động hiển thị ảnh bìa thiệp đẹp,
 * tên khách mời, tên cặp đôi, ngày cưới và địa điểm.
 */
export const DEFAULT_INVITATION =
  `💌 Kính mời {danh_xung} {ten_khach}\n\nChúng tôi trân trọng kính mời {danh_xung} đến chung vui trong ngày trọng đại của chúng mình.\n\n✨ Xem thiệp & xác nhận tham dự tại:\n{link_thiep}`;

/**
 * Mẫu lời mời ngắn gọn hơn dùng khi người dùng chọn "Ngắn gọn"
 */
export const SHORT_INVITATION =
  `Kính mời {danh_xung} {ten_khach} xem thiệp và xác nhận tham dự: {link_thiep}`;

export function buildGuestInvitation(
  template: string,
  guest: { salutation: string; fullName: string; url: string }
) {
  return template
    .replaceAll("{danh_xung}", guest.salutation)
    .replaceAll("{ten_khach}", guest.fullName)
    .replaceAll("{link_thiep}", guest.url);
}

export async function copyInvitation(message: string) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(message);
  }
}

/**
 * Kiểm tra xem người dùng đang truy cập bằng điện thoại hay máy tính
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Mở Zalo thông minh:
 * - target === "web": Mở thẳng Zalo Web (chat.zalo.me) — giải pháp hoàn hảo cho PC, không bao giờ bị redirect.zalo.me quay treo
 * - target === "app" (hoặc mặc định trên mobile): Mở zalo.me/<phone> để kích hoạt app Zalo
 */
export function openZaloShare(
  _url: string,
  phone?: string | null,
  target: "app" | "web" = "app"
) {
  if (target === "web") {
    window.open("https://chat.zalo.me/", "_blank", "noopener,noreferrer");
    return;
  }

  const digits = phone ? phone.replace(/[^0-9]/g, "") : "";
  if (digits.length >= 9) {
    window.open(`https://zalo.me/${digits}`, "_blank", "noopener,noreferrer");
  } else {
    window.open("https://zalo.me/", "_blank", "noopener,noreferrer");
  }
}
