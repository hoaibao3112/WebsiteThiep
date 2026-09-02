const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * ApiClient — Client HTTP cho Backend API
 *
 * Bảo mật:
 * - KHÔNG sử dụng localStorage
 * - Xác thực hoàn toàn thông qua HTTPS HTTPOnly / Secure Cookie
 * - Tự động đính kèm credentials: "include" trong mọi request
 */
export class ApiClient {
  static async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; message?: string; status?: number; fieldErrors?: Record<string, string[]> }> {
    // Auto-detect FormData: let the browser set Content-Type with the correct boundary
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };
    const method = (options.method || "GET").toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method) && typeof document !== "undefined") {
      const csrfToken = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith("csrf_token="))
        ?.slice("csrf_token=".length);
      if (csrfToken) headers["X-CSRF-Token"] = decodeURIComponent(csrfToken);
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Tự động gửi HTTPS Secure Cookie
      });

      let data: { success?: boolean; data?: T; error?: string; message?: string; fieldErrors?: Record<string, string[]> };
      try {
        data = await res.json();
      } catch {
        return {
          success: false,
          status: res.status,
          error: "Máy chủ trả về dữ liệu không hợp lệ",
        };
      }

      if (res.ok === false || data.success === false) {
        return {
          success: false,
          status: res.status,
          error: data.error || data.message || "Yêu cầu không thể hoàn tất",
          fieldErrors: data.fieldErrors,
        };
      }

      return { ...data, success: true, status: res.status };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Lỗi kết nối máy chủ";
      return { success: false, error: message };
    }
  }
}
