export const DEFAULT_INVITATION = "Trân trọng kính mời {danh_xung} {ten_khach} đến chung vui cùng chúng tôi. Xem thiệp và xác nhận tham dự tại: {link_thiep}";
export function buildGuestInvitation(template: string, guest: { salutation: string; fullName: string; url: string }) {
  return template.replaceAll("{danh_xung}", guest.salutation).replaceAll("{ten_khach}", guest.fullName).replaceAll("{link_thiep}", guest.url);
}
export async function copyInvitation(message: string) { await navigator.clipboard.writeText(message); }
export function openZaloShare(_url: string) { window.open("https://zalo.me/", "_blank", "noopener,noreferrer"); }
