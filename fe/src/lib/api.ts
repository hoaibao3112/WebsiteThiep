const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let memoryCsrfToken: string | null = null;
let memoryAuthToken: string | null = null;

export function setApiClientTokens(tokens: { csrfToken?: string | null; authToken?: string | null }) {
  if (tokens.csrfToken !== undefined) {
    memoryCsrfToken = tokens.csrfToken;
    if (typeof window !== "undefined") {
      if (tokens.csrfToken) sessionStorage.setItem("csrf_token", tokens.csrfToken);
      else sessionStorage.removeItem("csrf_token");
    }
  }
  if (tokens.authToken !== undefined) {
    memoryAuthToken = tokens.authToken;
    if (typeof window !== "undefined") {
      if (tokens.authToken) sessionStorage.setItem("auth_token", tokens.authToken);
      else sessionStorage.removeItem("auth_token");
    }
  }
}

/**
 * ApiClient — Client HTTP cho Backend API
 *
 * Bảo mật:
 * - Xác thực thông qua HTTPS HTTPOnly / Secure Cookie kết hợp Authorization Bearer header
 * - Tự động đính kèm credentials: "include" trong mọi request
 * - Tự động đồng bộ X-CSRF-Token từ Cookie, SessionStorage hoặc Header phản hồi
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

    // Đính kèm Authorization Bearer token nếu có (hỗ trợ cross-domain Render/Vercel)
    if (!headers["Authorization"] && typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("auth_token") || memoryAuthToken;
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }
    }

    const method = (options.method || "GET").toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method) && typeof document !== "undefined") {
      const cookieCsrf = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith("csrf_token="))
        ?.slice("csrf_token=".length);
      const storageCsrf = sessionStorage.getItem("csrf_token");
      const effectiveCsrf = cookieCsrf ? decodeURIComponent(cookieCsrf) : (storageCsrf || memoryCsrfToken);
      if (effectiveCsrf && !headers["X-CSRF-Token"]) {
        headers["X-CSRF-Token"] = effectiveCsrf;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Tự động gửi HTTPS Secure Cookie
      });

      // Tự động lưu X-CSRF-Token từ response header nếu backend trả về
      const responseCsrf = res.headers.get("X-CSRF-Token");
      if (responseCsrf) {
        setApiClientTokens({ csrfToken: responseCsrf });
      }

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

      // Tự động bắt token hoặc csrfToken trong response payload
      if (data && typeof data === "object") {
        const payload = data as Record<string, unknown>;
        const dataField = payload.data as Record<string, unknown> | undefined;
        const newAuth = (dataField?.token as string) || (payload.token as string);
        const newCsrf = (dataField?.csrfToken as string) || (payload.csrfToken as string);
        if (newAuth || newCsrf) {
          setApiClientTokens({
            ...(newAuth ? { authToken: newAuth } : {}),
            ...(newCsrf ? { csrfToken: newCsrf } : {}),
          });
        }
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
