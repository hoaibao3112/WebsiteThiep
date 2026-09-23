import { z } from "zod";
import { parseAllowedOrigins } from "./security";

const BaseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  JWT_SECRET: z.string().min(32).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_HOST: z.string().min(1).optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  SEPAY_WEBHOOK_SECRET: z.string().min(16).optional(),
  BANK_CODE: z.string().min(1).optional(),
  BANK_ACCOUNT: z.string().min(1).optional(),
  BANK_ACCOUNT_NAME: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
});

export function validateRuntimeEnv(input: NodeJS.ProcessEnv) {
  const env = BaseEnvSchema.parse(input);
  if (env.NODE_ENV === "production") {
    const required = ["JWT_SECRET", "DATABASE_URL"] as const;
    const missing = required.filter((key) => !env[key]);
    if (missing.length) {
      throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
    }

    // Bank variables required for payment QR generation
    const bankVars = ["BANK_CODE", "BANK_ACCOUNT", "BANK_ACCOUNT_NAME"] as const;
    const missingBank = bankVars.filter((key) => !env[key]);
    if (missingBank.length > 0) {
      console.warn(`[WARN] Thanh toán VietQR sẽ không hoạt động — thiếu: ${missingBank.join(", ")}`);
    }

    const optionalServices = [
      "REDIS_HOST",
      "ALLOWED_ORIGINS",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ] as const;
    const missingOptional = optionalServices.filter((key) => !env[key]);
    if (missingOptional.length > 0) {
      console.warn(`[WARN] Chú ý: Chưa cấu hình các biến môi trường tùy chọn: ${missingOptional.join(", ")}`);
    }

    if (env.ALLOWED_ORIGINS) {
      parseAllowedOrigins(env.ALLOWED_ORIGINS);
    }
  }
  return env;
}

