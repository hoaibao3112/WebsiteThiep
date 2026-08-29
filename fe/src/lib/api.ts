const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  static setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      // Đồng bộ cookie để Next.js server middleware đọc được phiên đăng nhập
      document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    }
  }

  static clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
    }
  }

  static async request<T = any>(
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
      });

      const data = await res.json();
      return data;
    } catch (error: any) {
      // Silently return failure without triggering Next.js dev error overlay
      return { success: false, error: error?.message || "Lỗi kết nối máy chủ" };
    }
  }
}
