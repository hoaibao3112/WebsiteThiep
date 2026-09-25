import { redis } from "./redis";
import { HttpError } from "./http-error";
import { logger } from "./logger";

/**
 * Helper kiểm tra giới hạn tần suất request (Rate Limiter) dựa trên Redis
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
      throw new HttpError(503, "Redis rate-limit service unavailable", "RATE_LIMIT_UNAVAILABLE");
    }
    // Nếu Redis có sự cố hoặc timeout, ghi log warning và không chặn luồng chính của người dùng
    logger.warn({ err: error, key }, "Redis rate limiter unavailable; development fallback accepted");
  }
}
