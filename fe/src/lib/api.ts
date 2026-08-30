const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * ApiClient — Client HTTP cho Backend API
 *
 * Bảo mật:
 * - JWT được lưu trong HTTPOnly cookie (không thể bị XSS đọc)
 * - Cookie tự động được gửi kèm mọi request nhờ credentials: 'include'
 * - Token KHÔNG còn được lưu trong localStorage
 */
export class ApiClient {
  /**
   * Gọi Next.js Route Handler để set JWT vào HTTPOnly cookie
   * Thay thế cho localStorage.setItem('auth_token')
   */
  static async setToken(token: string): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      // Silently fail - session route unavailable
    }
  }

  /**
   * Xóa HTTPOnly cookie khi logout
   * Thay thế cho localStorage.removeItem('auth_token')
   */
  static async clearToken(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // Silently fail
    }
  }

  static async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
    // Auto-detect FormData: let the browser set Content-Type with the correct boundary
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Tự động gửi HTTPOnly cookie với mọi request
      });

      const data = await res.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Lỗi kết nối máy chủ";
      return { success: false, error: message };
    }
  }
}
