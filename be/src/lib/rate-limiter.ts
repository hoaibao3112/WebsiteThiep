import { redis } from "./redis";
import { HttpError } from "./http-error";
import { logger } from "./logger";

interface MemoryRateLimitEntry {
  count: number;
  resetAt: number;
}

// Fallback in-memory rate limiter khi Redis bị chớp mạng hoặc bảo trì
const memoryRateLimitMap = new Map<string, MemoryRateLimitEntry>();

function checkInMemoryRateLimit(
  key: string,
  maxCount: number,
  windowSeconds: number,
  errorMessage: string
): void {
  const now = Date.now();
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

/**
 * Helper kiểm tra giới hạn tần suất request (Rate Limiter) dựa trên Redis.
 * Nếu Redis gặp sự cố kết nối, tự động chuyển sang bộ nhớ in-memory (fail-open an toàn có trần bảo vệ).
 * @param key Khóa định danh (VD: ratelimit:wish:127.0.0.1:card-id)
 * @param maxCount Số lần tối đa được phép trong khung thời gian
 * @param windowSeconds Khung thời gian hiệu lực tính bằng giây
 * @param errorMessage Thông báo lỗi trả về cho client
 */
export async function checkRateLimit(
  key: string,
  maxCount: number,
  windowSeconds: number,
  errorMessage = "Bạn đã thực hiện thao tác quá nhiều lần. Vui lòng thử lại sau ít phút!"
): Promise<void> {
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    if (count > maxCount) {
      throw new HttpError(429, errorMessage, "RATE_LIMIT_EXCEEDED");
    }
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    }
    if (process.env.NODE_ENV === "production") {
      logger.error({ err: error, key }, "Redis rate limiter failed in production; failing closed");
      throw new Error(`Redis rate limiter unavailable: ${error instanceof Error ? error.message : String(error)}`);
    }
    // Ghi log cảnh báo và fallback sang in-memory rate limiting để không làm sập luồng đăng nhập/OTP
    logger.warn({ err: error, key }, "Redis rate limiter unavailable; using in-memory fallback limiter");
    checkInMemoryRateLimit(key, maxCount, windowSeconds, errorMessage);
  }
}
