import { redis } from "./redis";
import { HttpError } from "./http-error";
import { logger } from "./logger";

interface MemoryRateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  /**
   * true  → Redis lỗi thì từ chối request (503). Chỉ dùng cho thao tác tốn chi phí
   *         thật và vốn đã cần Redis (vd: gửi OTP qua email).
   * false → (mặc định) Redis lỗi thì fallback in-memory theo từng instance.
   *         Giữ cho site sống thay vì 500 hàng loạt khi Redis chập chờn.
   */
  failClosed?: boolean;
}

// Fallback in-memory rate limiter khi Redis bị chớp mạng hoặc bảo trì
const memoryRateLimitMap = new Map<string, MemoryRateLimitEntry>();
const MEMORY_SWEEP_THRESHOLD = 5_000;
const MEMORY_MAX_KEYS = 20_000;

function sweepMemoryMap(now: number): void {
  if (memoryRateLimitMap.size < MEMORY_SWEEP_THRESHOLD) return;
  for (const [key, entry] of memoryRateLimitMap) {
    if (entry.resetAt <= now) memoryRateLimitMap.delete(key);
  }
  // Vẫn quá trần (bị flood key) → bỏ các key cũ nhất (Map giữ thứ tự chèn)
  while (memoryRateLimitMap.size > MEMORY_MAX_KEYS) {
    const oldest = memoryRateLimitMap.keys().next().value;
    if (oldest === undefined) break;
    memoryRateLimitMap.delete(oldest);
  }
}

function checkInMemoryRateLimit(
  key: string,
  maxCount: number,
  windowSeconds: number,
  errorMessage: string
): void {
  const now = Date.now();
  sweepMemoryMap(now);
  const entry = memoryRateLimitMap.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryRateLimitMap.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return;
  }

  entry.count += 1;
  if (entry.count > maxCount) {
    throw new HttpError(429, errorMessage, "RATE_LIMIT_EXCEEDED");
  }
}

/** Đảm bảo key luôn có TTL (phòng trường hợp process chết giữa INCR và EXPIRE). */
async function ensureTtl(key: string, windowSeconds: number): Promise<void> {
  try {
    const ttl = await redis.ttl(key);
    if (ttl === -1) await redis.expire(key, windowSeconds);
  } catch {
    // best-effort
  }
}

/**
 * Helper kiểm tra giới hạn tần suất request (Rate Limiter) dựa trên Redis.
 * Redis lỗi → mặc định fallback in-memory (có dọn dẹp + trần số key);
 * truyền `{ failClosed: true }` để từ chối thay vì fallback.
 * @param key Khóa định danh (VD: ratelimit:wish:127.0.0.1:card-id)
 * @param maxCount Số lần tối đa được phép trong khung thời gian
 * @param windowSeconds Khung thời gian hiệu lực tính bằng giây
 * @param errorMessage Thông báo lỗi trả về cho client
 */
export async function checkRateLimit(
  key: string,
  maxCount: number,
  windowSeconds: number,
  errorMessage = "Bạn đã thực hiện thao tác quá nhiều lần. Vui lòng thử lại sau ít phút!",
  options: RateLimitOptions = {}
): Promise<void> {
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    if (count > maxCount) {
      await ensureTtl(key, windowSeconds);
      throw new HttpError(429, errorMessage, "RATE_LIMIT_EXCEEDED");
    }
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    }
    const shouldFailClosed = options.failClosed ?? (process.env.NODE_ENV === "production");
    if (shouldFailClosed) {
      logger.error({ err: error, key }, "Redis rate limiter unavailable; failing closed");
      throw new HttpError(
        503,
        "Redis rate limiter unavailable",
        "RATE_LIMIT_UNAVAILABLE"
      );
    }
    logger.warn({ err: error, key }, "Redis rate limiter unavailable; using in-memory fallback limiter");
    checkInMemoryRateLimit(key, maxCount, windowSeconds, errorMessage);
  }
}