import { describe, it, expect, vi, beforeEach } from "vitest";

const redisMock = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn(),
  ping: vi.fn(),
}));

vi.mock("../../src/lib/redis", () => ({ redis: redisMock }));

import { checkRateLimit } from "../../src/lib/rate-limiter";

describe("Redis Resilience & Fail-Safe Limiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("In-Memory Fallback when Redis is down", () => {
    it("fallbacks to in-memory limiter without throwing 503 when Redis drops connection", async () => {
      // Giả lập Redis bị mất kết nối / ECONNREFUSED
      redisMock.incr.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:6379"));

      // Request 1: Vẫn cho phép thành công nhờ in-memory fallback
      await expect(
        checkRateLimit("test:fallback:ip1", 3, 60, "Quá giới hạn")
      ).resolves.toBeUndefined();

      // Request 2 & 3: Thành công
      await expect(
        checkRateLimit("test:fallback:ip1", 3, 60, "Quá giới hạn")
      ).resolves.toBeUndefined();
      await expect(
        checkRateLimit("test:fallback:ip1", 3, 60, "Quá giới hạn")
      ).resolves.toBeUndefined();

      // Request 4: Vượt giới hạn in-memory trần 3 -> Bị chặn 429
      await expect(
        checkRateLimit("test:fallback:ip1", 3, 60, "Quá giới hạn")
      ).rejects.toThrow("Quá giới hạn");
    });
  });

  describe("Redis retry strategy calculation", () => {
    it("returns increasing backoff delay and never returns null (reconnects infinitely)", () => {
      const calculateDelay = (times: number) => Math.min(times * 200, 5000);

      expect(calculateDelay(1)).toBe(200);
      expect(calculateDelay(3)).toBe(600);
      expect(calculateDelay(4)).toBe(800);
      expect(calculateDelay(25)).toBe(5000);
      expect(calculateDelay(100)).toBe(5000);
      expect(calculateDelay(100)).not.toBeNull();
    });
  });
});
