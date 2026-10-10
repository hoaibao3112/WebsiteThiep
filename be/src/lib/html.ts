/**
 * Escape ký tự đặc biệt cho Telegram `parse_mode: "HTML"`.
 * Mọi dữ liệu do khách nhập (tên, ghi chú, SĐT...) PHẢI qua hàm này trước khi
 * nhúng vào message, nếu không Telegram trả 400 "can't parse entities".
 */
export function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Cắt chuỗi về tối đa `max` ký tự (thêm "…" nếu bị cắt). */
export function truncate(input: unknown, max: number): string {
  const s = String(input ?? "");
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}