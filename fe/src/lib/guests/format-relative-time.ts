/**
 * Định dạng thời gian xem thiệp thông minh và tương đối cho người dùng Việt Nam.
 * Hỗ trợ chuyển đổi timestamp thành: "Vừa xem xong", "X phút trước", "X giờ trước", "Hôm qua...", v.v.
 */

export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  // Trường hợp thời gian trong tương lai hoặc chênh lệch nhỏ do lệch đồng hồ
  if (diffInMs < 60 * 1000) {
    return "Vừa xem xong";
  }

  const diffInMinutes = Math.floor(diffInMs / (60 * 1000));
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMs / (60 * 60 * 1000));
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInMs / (24 * 60 * 60 * 1000));
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  if (diffInDays === 1) {
    return `Hôm qua lúc ${hours}:${minutes}`;
  }

  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (year === now.getFullYear()) {
    return `${day}/${month} lúc ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Định dạng ngày giờ chi tiết cho tooltip / title hover
 */
export function formatExactDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes}:${seconds} ngày ${day}/${month}/${year}`;
}
