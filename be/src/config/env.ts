import { z } from "zod";
import { parseAllowedOrigins } from "./security";

const BaseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  JWT_SECRET: z.string().min(32).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().min(1).optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  SEPAY_WEBHOOK_SECRET: z.string().min(16).optional(),
  BANK_CODE: z.string().min(1).optional(),
  BANK_ACCOUNT: z.string().min(1).optional(),
  BANK_ACCOUNT_NAME: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  APP_URL: z.string().optional(),
});

/**
 * Validate env cho HTTP server. Ở production, các biến ảnh hưởng trực tiếp
 * tới bảo mật / thanh toán / hạ tầng là BẮT BUỘC — thiếu thì fail startup
 * thay vì chạy "mù" rồi trả 503 khi khách thao tác.
 */
export function validateRuntimeEnv(input: NodeJS.ProcessEnv) {
  const env = BaseEnvSchema.parse(input);
  if (env.NODE_ENV === "production") {
    const required = [
      "JWT_SECRET",
      "DATABASE_URL",
      "ALLOWED_ORIGINS",
      "BANK_CODE",
      "BANK_ACCOUNT",
      "BANK_ACCOUNT_NAME",
    ] as const;
    const missing: string[] = required.filter((key) => !env[key]);
    if (!env.REDIS_URL && !env.REDIS_HOST) missing.push("REDIS_URL (hoặc REDIS_HOST)");

    if (missing.length) {
      throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
    }

    const missingOptional: string[] = [];
    if (!env.CLOUDINARY_CLOUD_NAME) missingOptional.push("CLOUDINARY_CLOUD_NAME");
    if (!env.CLOUDINARY_API_KEY) missingOptional.push("CLOUDINARY_API_KEY");
    if (!env.CLOUDINARY_API_SECRET) missingOptional.push("CLOUDINARY_API_SECRET");
    if (!env.TELEGRAM_BOT_TOKEN) missingOptional.push("TELEGRAM_BOT_TOKEN");
    if (!env.APP_URL) missingOptional.push("APP_URL");

    if (missingOptional.length > 0) {
      console.warn(`[WARN] Chưa cấu hình các biến môi trường tùy chọn: ${missingOptional.join(", ")}`);
    }

    // Throw sớm nếu ALLOWED_ORIGINS sai định dạng / chứa wildcard
    parseAllowedOrigins(env.ALLOWED_ORIGINS as string);
  }
  return env;
}

/**
 * Validate env cho worker process (BullMQ). Worker không cần JWT/BANK nhưng
 * BẮT BUỘC có DB + Redis, và cần TELEGRAM_BOT_TOKEN để gửi thông báo RSVP.
 */
export function validateWorkerEnv(input: NodeJS.ProcessEnv) {
  const env = BaseEnvSchema.parse(input);
  if (env.NODE_ENV === "production") {
    const missing: string[] = [];
    if (!env.DATABASE_URL) missing.push("DATABASE_URL");
    if (!env.REDIS_URL && !env.REDIS_HOST) missing.push("REDIS_URL (hoặc REDIS_HOST)");
    if (!env.TELEGRAM_BOT_TOKEN) missing.push("TELEGRAM_BOT_TOKEN");
    if (missing.length) {
      throw new Error(`Missing worker environment variables: ${missing.join(", ")}`);
    }
  }
  return env;
}