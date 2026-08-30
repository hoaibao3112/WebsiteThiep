import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "@/lib/api";

// Unmock ApiClient để test thực
vi.unmock("@/lib/api");

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, "localStorage", { value: mockLocalStorage });

describe("ApiClient", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockFetch.mockReset();
  });

  // ─────────────────────────────────────────────
  // Credentials & Cookie Handling
  // ─────────────────────────────────────────────

  describe("Credentials handling", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        json: async () => ({ success: true, data: {} }),
      });
    });

    it("luôn gửi credentials: 'include' để truyền HTTPS Secure Cookie", async () => {
      await ApiClient.request("/test");
      const calledOptions = mockFetch.mock.calls[0][1];
      expect(calledOptions.credentials).toBe("include");
    });
  });

  // ─────────────────────────────────────────────
  // request() — Content-Type header logic
  // ─────────────────────────────────────────────

  describe("request() — Content-Type header", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        json: async () => ({ success: true, data: {} }),
      });
    });

    it("gửi Content-Type: application/json khi body là JSON string", async () => {
      await ApiClient.request("/test", {
        method: "POST",
        body: JSON.stringify({ name: "test" }),
      });

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders["Content-Type"]).toBe("application/json");
    });

    it("KHÔNG gửi Content-Type khi body là FormData (để browser tự set multipart boundary)", async () => {
      const formData = new FormData();
      formData.append("file", new Blob(["data"], { type: "image/png" }), "test.png");

      await ApiClient.request("/upload/image", {
        method: "POST",
        body: formData,
      });

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders["Content-Type"]).toBeUndefined();
    });
  });


  // ─────────────────────────────────────────────
  // request() — Response handling
  // ─────────────────────────────────────────────

  describe("request() — Response handling", () => {
    it("trả về response JSON khi fetch thành công", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({ success: true, data: { id: "card-1" } }),
      });

      const result = await ApiClient.request("/cards/card-1");

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: "card-1" });
    });

    it("trả về { success: false, error } khi fetch throw (network error)", async () => {
      mockFetch.mockRejectedValue(new Error("Network failed"));

      const result = await ApiClient.request("/cards");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network failed");
    });

    it("gọi đúng URL từ endpoint", async () => {
      mockFetch.mockResolvedValue({ json: async () => ({ success: true }) });

      await ApiClient.request("/cards/my-cards");

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("/cards/my-cards");
    });
  });

  // ─────────────────────────────────────────────
  // FormData detection — edge cases
  // ─────────────────────────────────────────────

  describe("FormData detection — edge cases", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({ json: async () => ({ success: true }) });
    });

    it("body là undefined → vẫn set Content-Type: application/json", async () => {
      await ApiClient.request("/cards");

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders["Content-Type"]).toBe("application/json");
    });

    it("body là string rỗng → set Content-Type: application/json", async () => {
      await ApiClient.request("/ping", { method: "POST", body: "" });

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders["Content-Type"]).toBe("application/json");
    });

    it("body là FormData rỗng → KHÔNG set Content-Type", async () => {
      await ApiClient.request("/upload/music", {
        method: "POST",
        body: new FormData(),
      });

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders["Content-Type"]).toBeUndefined();
    });
  });
});
