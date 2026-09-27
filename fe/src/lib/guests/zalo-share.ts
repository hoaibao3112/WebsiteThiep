export const DEFAULT_INVITATION =
  "Trân trọng kính mời {danh_xung} {ten_khach} đến chung vui cùng chúng tôi. Xem thiệp và xác nhận tham dự tại: {link_thiep}";

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
 * Mở Zalo thông minh:
 * - Nếu khách có số điện thoại, mở trực tiếp hộp chat cá nhân zalo.me/<phone>
 * - Nếu chưa có số điện thoại, mở zalo.me chung
 */
export function openZaloShare(_url: string, phone?: string | null) {
  const digits = phone ? phone.replace(/[^0-9]/g, "") : "";
  if (digits.length >= 9) {
    window.open(`https://zalo.me/${digits}`, "_blank", "noopener,noreferrer");
  } else {
    window.open("https://zalo.me/", "_blank", "noopener,noreferrer");
  }
}
