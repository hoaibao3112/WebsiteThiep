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
   * Lấy token hiện tại từ localStorage hoặc Cookie
   */
  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    const local = localStorage.getItem("auth_token");
    if (local) return local;

    // Fallback: đọc từ cookie
    const match = document.cookie.match(new RegExp("(^| )auth_token=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }

  /**
   * Lưu token vào localStorage + cookie
   */
  static async setToken(token: string): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("auth_token", token);
      document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    } catch {
      // Silently ignore
    }
  }

  /**
   * Xóa token khỏi localStorage + cookie
   */
  static async clearToken(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
    } catch {
      // Silently ignore
    }
  }


  static async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
    const token = this.getToken();

    // Auto-detect FormData: let the browser set Content-Type with the correct boundary
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      const data = await res.json();
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Lỗi kết nối máy chủ";
      return { success: false, error: message };
    }
  }
}

