import crypto from "crypto";
import { redis } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { checkRateLimit } from "../lib/rate-limiter";
import { mailQueue } from "../queues/mail.queue";
import { MailService } from "./mail.service";

const OTP_TTL_SECONDS = 300; // 5 phút
const EMAIL_COOLDOWN_SECONDS = 60; // 60s giữa 2 lần xin mã
const MAX_IP_HOURLY_REQUESTS = 10; // Tối đa 10 lần gửi OTP / giờ / IP
const MAX_VERIFY_ATTEMPTS = 5; // Tối đa 5 lần nhập sai

export class OtpService {
  /**
   * Sinh mã OTP 6 số và gửi qua Email bất đồng bộ (BullMQ)
   */
  static async sendRegisterOtp(email: string, clientIp: string): Promise<{ cooldown: number }> {
    const normalizedEmail = email.toLowerCase().trim();

    // 6. [REQUIRED] Check email tồn tại TRƯỚC khi cho gửi OTP đăng ký
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error("Email này đã được đăng ký trong hệ thống. Vui lòng chọn Đăng Nhập!");
    }

    // 2. [CRITICAL] Rate limit theo IP (chống spam mail/harassment)
    if (clientIp) {
      await checkRateLimit(
        `ratelimit:otp:ip:${clientIp}`,
        MAX_IP_HOURLY_REQUESTS,
        3600,
        "Địa chỉ IP của bạn đã yêu cầu gửi mã OTP quá nhiều lần trong 1 giờ. Vui lòng thử lại sau!"
      );
    }

    // Rate limit theo Email: kiểm tra cooldown 60s
    const cooldownKey = `otp:cooldown:${normalizedEmail}`;
    const inCooldown = await redis.get(cooldownKey);
    if (inCooldown) {
      const ttl = await redis.ttl(cooldownKey);
      throw new Error(`Vui lòng chờ ${ttl > 0 ? ttl : 60} giây trước khi yêu cầu mã OTP mới.`);
    }

    // Sinh mã OTP 6 số ngẫu nhiên chuẩn an toàn
    const otp = crypto.randomInt(100000, 999999).toString();

    // Lưu OTP vào Redis với TTL 5 phút
    const otpKey = `otp:register:${normalizedEmail}`;
    await redis.set(otpKey, otp, "EX", OTP_TTL_SECONDS);

    // Đặt cooldown 60s cho email
    await redis.set(cooldownKey, "1", "EX", EMAIL_COOLDOWN_SECONDS);

    // Reset bộ đếm số lần nhập sai cũ (nếu có)
    const attemptsKey = `otp:attempts:${normalizedEmail}`;
    await redis.del(attemptsKey);

    // 7. [HIGH] Đẩy job gửi mail vào BullMQ queue xử lý bất đồng bộ (kèm fallback trực tiếp nếu Redis offline)
    if (redis.status === "ready") {
      try {
        await mailQueue.add("send-otp-email", {
          email: normalizedEmail,
          otp,
        });
      } catch (queueErr) {
        console.warn("[OtpService] BullMQ warning, fallback sending mail directly:", queueErr);
        setImmediate(() => {
          MailService.sendOtpEmail(normalizedEmail, otp).catch((err) => {
            console.error("[OtpService] Fallback send mail failed:", err);
          });
        });
      }
    } else {
      // Redis offline -> Gửi email trực tiếp bất đồng bộ qua MailService
      setImmediate(() => {
        MailService.sendOtpEmail(normalizedEmail, otp).catch((err) => {
          console.error("[OtpService] Direct send mail failed:", err);
        });
      });
    }

    return { cooldown: EMAIL_COOLDOWN_SECONDS };
  }

  /**
   * 1. [CRITICAL] Xác thực mã OTP và chống brute-force
   */
  static async verifyRegisterOtp(email: string, otpInput: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const otpKey = `otp:register:${normalizedEmail}`;
    const attemptsKey = `otp:attempts:${normalizedEmail}`;

    const savedOtp = await redis.get(otpKey);

    if (!savedOtp) {
      throw new Error("Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới.");
    }

    // Kiểm tra số lần đã thử sai
    const attemptsStr = await redis.get(attemptsKey);
    const currentAttempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

    if (currentAttempts >= MAX_VERIFY_ATTEMPTS) {
      // Đã vượt quá 5 lần -> Xóa luôn OTP hiện tại
      await redis.del(otpKey);
      await redis.del(attemptsKey);
      throw new Error("Bạn đã nhập sai mã OTP quá 5 lần. Mã đã bị hủy để đảm bảo an toàn, vui lòng yêu cầu mã mới.");
    }

    // So khớp mã OTP
    if (savedOtp !== otpInput.trim()) {
      const newAttempts = await redis.incr(attemptsKey);
      if (newAttempts === 1) {
        await redis.expire(attemptsKey, OTP_TTL_SECONDS);
      }

      if (newAttempts >= MAX_VERIFY_ATTEMPTS) {
        await redis.del(otpKey);
        await redis.del(attemptsKey);
        throw new Error("Bạn đã nhập sai mã OTP quá 5 lần. Mã đã bị hủy để đảm bảo an toàn, vui lòng yêu cầu mã mới.");
      }

      const remaining = MAX_VERIFY_ATTEMPTS - newAttempts;
      throw new Error(`Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`);
    }

    // Verify thành công -> Xóa sạch key OTP và attempts
    await redis.del(otpKey);
    await redis.del(attemptsKey);

    return true;
  }
}
