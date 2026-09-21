import { afterEach, describe, expect, it, vi } from "vitest";

const redisMock = vi.hoisted(() => ({ incr: vi.fn(), expire: vi.fn() }));
vi.mock("../../src/lib/redis", () => ({ redis: redisMock }));
import { checkRateLimit } from "../../src/lib/rate-limiter";

describe("production rate limit dependency", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("fails closed when Redis is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    redisMock.incr.mockRejectedValue(new Error("offline"));

    await expect(checkRateLimit("login:test", 5, 60)).rejects.toThrow("Redis");
  });
});
