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

  it("throws 429 HttpError when rate limit is exceeded", async () => {
    redisMock.incr.mockResolvedValue(6);

    const err = await checkRateLimit("login:test", 5, 60).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("sets expire on first count and allows under limit", async () => {
    redisMock.incr.mockResolvedValue(1);
    redisMock.expire.mockResolvedValue(1);

    await expect(checkRateLimit("login:test", 5, 60)).resolves.toBeUndefined();
    expect(redisMock.expire).toHaveBeenCalledWith("login:test", 60);
  });
});
