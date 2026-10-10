import crypto from "crypto";
import { redis } from "../lib/redis";
import { checkRateLimit } from "../lib/rate-limiter";
import { MailService } from "./mail.service";
import { HttpError } from "../lib/http-error";
import { logger } from "../lib/logger";

const OTP_TTL_SECONDS = 300; // 5 phút
const EMAIL_COOLDOWN_SECONDS = 60; // 60s giữa 2 lần xin mã
const MAX_IP_HOURLY_REQUESTS = 10; // Tối đa 10 lần gửi OTP / giờ / IP
const MAX_VERIFY_ATTEMPTS = 5; // Tối đa 5 lần nhập sai

/**
 * OTP không bao giờ lưu plaintext trong Redis — chỉ lưu HMAC(email:otp) với key là JWT_SECRET.
 * Lộ Redis cũng không lộ được mã còn hiệu lực.
 */
export function hashOtp(email: string, otp: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET chưa được cấu hình");
  return crypto.createHmac("sha256", secret).update(`${email}:${otp}`).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export class OtpService {
  /**
   * Sinh mã OTP 6 số và gửi qua Email
   */
  static async sendRegisterOtp(email: string, clientIp: string): Promise<{ cooldown: number }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit theo IP (chống spam mail/harassment). Gửi mail tốn chi phí thật và OTP
    // vốn lưu trong Redis nên nếu Redis lỗi thì từ chối luôn (fail-closed).
    if (clientIp) {
      await checkRateLimit(
        `ratelimit:otp:ip:${clientIp}`,
        MAX_IP_HOURLY_REQUESTS,
        3600,
        "Địa chỉ IP của bạn đã yêu cầu gửi mã OTP quá nhiều lần trong 1 giờ. Vui lòng thử lại sau!",
        { failClosed: true }
      );
    }

    // Cooldown 60s theo email — SET NX atomic để 2 request song song không cùng qua được
    const cooldownKey = `otp:cooldown:${normalizedEmail}`;
    const acquired = await redis.set(cooldownKey, "1", "EX", EMAIL_COOLDOWN_SECONDS, "NX");
    if (acquired !== "OK") {
      const ttl = await redis.ttl(cooldownKey);
      throw new HttpError(429, `Vui lòng chờ ${ttl > 0 ? ttl : 60} giây trước khi yêu cầu mã OTP mới.`, "OTP_COOLDOWN");
    }

    // randomInt(min, max) loại trừ max → dùng 1_000_000 để cover đủ 100000–999999
    const otp = crypto.randomInt(100000, 1_000_000).toString();

    const otpKey = `otp:register:${normalizedEmail}`;
    const attemptsKey = `otp:attempts:${normalizedEmail}`;
    await redis.set(otpKey, hashOtp(normalizedEmail, otp), "EX", OTP_TTL_SECONDS);

    // Reset bộ đếm số lần nhập sai cũ (nếu có)
    await redis.del(attemptsKey);

    try {
      await MailService.sendOtpEmail(normalizedEmail, otp);
    } catch (mailErr) {
      logger.error({ err: mailErr }, "[OtpService] Lỗi khi gửi OTP qua MailService");
      await redis.del(otpKey);
      await redis.del(cooldownKey);
      throw new HttpError(
        500,
        "Không thể gửi mã xác thực tới Gmail của bạn lúc này. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau!",
        "MAIL_SEND_FAILED"
      );
    }

    return { cooldown: EMAIL_COOLDOWN_SECONDS };
  }

  /**
   * Xác thực mã OTP và chống brute-force.
   * Bộ đếm được INCR TRƯỚC khi so sánh (atomic) → N request song song cũng chỉ có tối đa
   * MAX_VERIFY_ATTEMPTS lần so sánh.
   */
  static async verifyRegisterOtp(email: string, otpInput: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const otpKey = `otp:register:${normalizedEmail}`;
    const attemptsKey = `otp:attempts:${normalizedEmail}`;

    const savedHash = await redis.get(otpKey);
    if (!savedHash) {
      throw new HttpError(400, "Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới.", "OTP_EXPIRED_OR_NOT_FOUND");
    }

    const attempts = await redis.incr(attemptsKey);
    if (attempts === 1) {
      await redis.expire(attemptsKey, OTP_TTL_SECONDS);
    }

    const lockOut = async () => {
      await redis.del(otpKey);
      await redis.del(attemptsKey);
      throw new HttpError(
        400,
        "Bạn đã nhập sai mã OTP quá 5 lần. Mã đã bị hủy để đảm bảo an toàn, vui lòng yêu cầu mã mới.",
        "OTP_MAX_ATTEMPTS_EXCEEDED"
      );
    };

    if (attempts > MAX_VERIFY_ATTEMPTS) {
      return lockOut();
    }

    if (!safeEqualHex(savedHash, hashOtp(normalizedEmail, otpInput.trim()))) {
      if (attempts >= MAX_VERIFY_ATTEMPTS) {
        return lockOut();
      }
      const remaining = MAX_VERIFY_ATTEMPTS - attempts;
      throw new HttpError(400, `Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`, "OTP_INVALID");
    }

    // Verify thành công -> Xóa sạch key OTP và attempts
    await redis.del(otpKey);
    await redis.del(attemptsKey);

    return true;
  }
}
