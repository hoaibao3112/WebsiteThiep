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

// In-memory fallback khi Redis chập chờn hoặc chưa bật
interface MemoryOtpEntry {
  hash: string;
  expiresAt: number;
  attempts: number;
}
const memoryOtpMap = new Map<string, MemoryOtpEntry>();
const memoryCooldownMap = new Map<string, number>();

export class OtpService {
  /**
   * Sinh mã OTP 6 số và gửi qua Email
   */
  static async sendRegisterOtp(email: string, clientIp: string): Promise<{ cooldown: number }> {
    const normalizedEmail = email.toLowerCase().trim();
    const isProd = process.env.NODE_ENV === "production";
    const isLocal = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp.includes("127.0.0.1");

    // Rate limit theo IP (chống spam mail/harassment). Chỉ kích hoạt ở production cho IP thực
    if (clientIp && isProd && !isLocal) {
      try {
        await checkRateLimit(
          `ratelimit:otp:ip:${clientIp}`,
          MAX_IP_HOURLY_REQUESTS,
          3600,
          "Địa chỉ IP của bạn đã yêu cầu gửi mã OTP quá nhiều lần trong 1 giờ. Vui lòng thử lại sau!",
          { failClosed: false }
        );
      } catch (err) {
        if (err instanceof HttpError) throw err;
      }
    }

    const now = Date.now();
    const cooldownSecs = isProd ? EMAIL_COOLDOWN_SECONDS : 5;
    const cooldownKey = `otp:cooldown:${normalizedEmail}`;

    // Kiểm tra cooldown: thử Redis nếu ready, fallback in-memory nếu Redis lỗi/chưa ready
    if (redis.status === "ready") {
      try {
        const acquired = await redis.set(cooldownKey, "1", "EX", cooldownSecs, "NX");
        if (acquired !== "OK") {
          const ttl = await redis.ttl(cooldownKey);
          throw new HttpError(429, `Vui lòng chờ ${ttl > 0 ? ttl : cooldownSecs} giây trước khi yêu cầu mã OTP mới.`, "OTP_COOLDOWN");
        }
      } catch (err) {
        if (err instanceof HttpError) throw err;
        // Redis chập chờn -> fallback in-memory
        const memCd = memoryCooldownMap.get(normalizedEmail);
        if (memCd && memCd > now) {
          const remaining = Math.ceil((memCd - now) / 1000);
          throw new HttpError(429, `Vui lòng chờ ${remaining} giây trước khi yêu cầu mã OTP mới.`, "OTP_COOLDOWN");
        }
        memoryCooldownMap.set(normalizedEmail, now + cooldownSecs * 1000);
      }
    } else {
      // In-memory cooldown
      const memCd = memoryCooldownMap.get(normalizedEmail);
      if (memCd && memCd > now) {
        const remaining = Math.ceil((memCd - now) / 1000);
        throw new HttpError(429, `Vui lòng chờ ${remaining} giây trước khi yêu cầu mã OTP mới.`, "OTP_COOLDOWN");
      }
      memoryCooldownMap.set(normalizedEmail, now + cooldownSecs * 1000);
    }

    // randomInt(min, max) loại trừ max → dùng 1_000_000 để cover đủ 100000–999999
    const otp = crypto.randomInt(100000, 1_000_000).toString();
    const otpKey = `otp:register:${normalizedEmail}`;
    const attemptsKey = `otp:attempts:${normalizedEmail}`;
    const hashedOtp = hashOtp(normalizedEmail, otp);

    if (redis.status === "ready") {
      try {
        await redis.set(otpKey, hashedOtp, "EX", OTP_TTL_SECONDS);
        await redis.del(attemptsKey);
      } catch {
        memoryOtpMap.set(normalizedEmail, {
          hash: hashedOtp,
          expiresAt: now + OTP_TTL_SECONDS * 1000,
          attempts: 0,
        });
      }
    } else {
      memoryOtpMap.set(normalizedEmail, {
        hash: hashedOtp,
        expiresAt: now + OTP_TTL_SECONDS * 1000,
        attempts: 0,
      });
    }

    try {
      await MailService.sendOtpEmail(normalizedEmail, otp);
    } catch (mailErr) {
      logger.error({ err: mailErr }, "[OtpService] Lỗi khi gửi OTP qua MailService");
      if (redis.status === "ready") {
        try {
          await redis.del(otpKey);
          await redis.del(cooldownKey);
        } catch {}
      }
      memoryOtpMap.delete(normalizedEmail);
      memoryCooldownMap.delete(normalizedEmail);
      throw new HttpError(
        500,
        "Không thể gửi mã xác thực tới Gmail của bạn lúc này. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau!",
        "MAIL_SEND_FAILED"
      );
    }

    return { cooldown: cooldownSecs };
  }

  /**
   * Xác thực mã OTP và chống brute-force.
   */
  static async verifyRegisterOtp(email: string, otpInput: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    let savedHash: string | null = null;
    let attempts = 0;

    const otpKey = `otp:register:${normalizedEmail}`;
    const attemptsKey = `otp:attempts:${normalizedEmail}`;

    if (redis.status === "ready") {
      try {
        savedHash = await redis.get(otpKey);
        if (savedHash) {
          attempts = await redis.incr(attemptsKey);
          if (attempts === 1) await redis.expire(attemptsKey, OTP_TTL_SECONDS);
        }
      } catch {
        // Fallback to in-memory check below
      }
    }

    if (!savedHash) {
      const mem = memoryOtpMap.get(normalizedEmail);
      if (mem && mem.expiresAt > now) {
        savedHash = mem.hash;
        mem.attempts += 1;
        attempts = mem.attempts;
      }
    }

    if (!savedHash) {
      throw new HttpError(400, "Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới.", "OTP_EXPIRED_OR_NOT_FOUND");
    }

    const lockOut = async () => {
      if (redis.status === "ready") {
        try {
          await redis.del(otpKey);
          await redis.del(attemptsKey);
        } catch {}
      }
      memoryOtpMap.delete(normalizedEmail);
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
    if (redis.status === "ready") {
      try {
        await redis.del(otpKey);
        await redis.del(attemptsKey);
      } catch {}
    }
    memoryOtpMap.delete(normalizedEmail);

    return true;
  }
}
