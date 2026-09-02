import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "@/lib/api";

vi.unmock("@/lib/api");

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ApiClient error contract", () => {
  beforeEach(() => mockFetch.mockReset());

  it("returns failure for non-2xx even when the body claims success", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ success: true, error: "Slug đã tồn tại" }),
    });

    const result = await ApiClient.request("/cards", { method: "POST" });

    expect(result).toMatchObject({ success: false, status: 409, error: "Slug đã tồn tại" });
  });

  it("returns a safe failure when the response is not JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => { throw new SyntaxError("Unexpected token"); },
    });

    const result = await ApiClient.request("/cards");

    expect(result).toEqual({
      success: false,
      status: 502,
      error: "Máy chủ trả về dữ liệu không hợp lệ",
    });
  });
});
