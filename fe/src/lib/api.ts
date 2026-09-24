const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let memoryCsrfToken: string | null = null;

export function setApiClientTokens(tokens: { csrfToken?: string | null }) {
  if (tokens.csrfToken !== undefined) memoryCsrfToken = tokens.csrfToken;
}

interface ApiPayload<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface ApiResult<T> extends ApiPayload<T> {
  success: boolean;
  status?: number;
}

function getCsrfToken(): string | null {
  if (memoryCsrfToken) return memoryCsrfToken;
  if (typeof document !== "undefined" && document.cookie) {
    const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1]);
        memoryCsrfToken = decoded;
        return decoded;
      } catch {
        // ignore malformed cookie
      }
    }
  }
  return null;
}

export class ApiClient {
  static async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };
    const method = (options.method || "GET").toUpperCase();
    const token = getCsrfToken();
    if (!["GET", "HEAD", "OPTIONS"].includes(method) && token && !headers["X-CSRF-Token"]) {
      headers["X-CSRF-Token"] = token;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
      const responseCsrf =
        response.headers?.get?.("X-CSRF-Token") ??
        response.headers?.get?.("x-csrf-token") ??
        null;
      if (responseCsrf) setApiClientTokens({ csrfToken: responseCsrf });

      if (response.status === 401) {
        setApiClientTokens({ csrfToken: null });
      }

      let payload: ApiPayload<T>;
      try {
        payload = await response.json();
      } catch {
        return { success: false, status: response.status, error: "Máy chủ trả về dữ liệu không hợp lệ" };
      }
      if (response.ok === false || payload.success === false) {
        return {
          success: false,
          status: response.status,
          error: payload.error || payload.message || "Yêu cầu không thể hoàn tất",
          fieldErrors: payload.fieldErrors,
        };
      }
      return { ...payload, success: true, status: response.status };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Lỗi kết nối máy chủ" };
    }
  }
}
