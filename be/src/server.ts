import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { apiRouter } from "./routes/api.router";
import { logger } from "./lib/logger";
import { isOriginAllowed, parseAllowedOrigins } from "./config/security";
import { errorHandler } from "./middlewares/error.middleware";
import { validateRuntimeEnv } from "./config/env";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";

validateRuntimeEnv(process.env);

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// -----------------------------------------------------------------------
// MIDDLEWARES — Security & Observability
// -----------------------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);
app.use(cookieParser());


const defaultOrigins = "https://website-thiep.vercel.app,http://localhost:3000,http://127.0.0.1:3000";
const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS || defaultOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "X-CSRF-Token"],
    exposedHeaders: ["X-CSRF-Token"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Morgan HTTP request logger — pipe vào Pino để format đồng nhất
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// -----------------------------------------------------------------------
// RATE LIMITING — Bảo vệ toàn bộ API khỏi brute-force & DoS
// -----------------------------------------------------------------------

// Global: 200 requests / 15 phút / IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Quá nhiều yêu cầu, vui lòng thử lại sau." },
  skip: (req) => (req.originalUrl || req.path).startsWith("/api/webhooks"), // Bỏ qua webhook SePay
});

// Auth routes: 15 requests / 15 phút / IP (chống brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút." },
});

// OTP: 5 requests / 15 phút / IP (chống spam OTP)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Quá nhiều yêu cầu OTP, vui lòng đợi 15 phút." },
});

app.use(globalLimiter);

// -----------------------------------------------------------------------
// STATIC FILES & HEALTH CHECK
// -----------------------------------------------------------------------
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/images", express.static(path.join(process.cwd(), "public", "images")));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "Digital Card Platform API",
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------------------------------------------------
// API ROUTES — Áp dụng rate limiter riêng cho auth
// -----------------------------------------------------------------------
app.use("/api/auth/send-otp", otpLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/verify-otp-register", authLimiter);
app.use("/api", apiRouter);

// -----------------------------------------------------------------------
// GLOBAL ERROR HANDLER
// -----------------------------------------------------------------------
app.use(errorHandler);

// -----------------------------------------------------------------------
// SERVER START + GRACEFUL SHUTDOWN
// -----------------------------------------------------------------------
const server = app.listen(PORT, () => {
  logger.info(`🚀 Card Platform Backend running at http://localhost:${PORT}`);
});

// Graceful Shutdown — đảm bảo không mất dữ liệu khi restart/deploy
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Gracefully shutting down...`);

  server.close(async () => {
    logger.info("HTTP server closed.");

    // Đóng kết nối Database
    try {
      await prisma.$disconnect();
      logger.info("Prisma disconnected.");
    } catch (err) {
      logger.error({ err }, "Error disconnecting Prisma");
    }

    // Đóng kết nối Redis
    try {
      await redis.quit();
      logger.info("Redis disconnected.");
    } catch (err) {
      logger.warn({ err }, "Redis disconnect warning (may not be initialized)");
    }

    logger.info("Graceful shutdown complete. Exiting.");
    process.exit(0);
  });

  // Force exit sau 10 giây nếu server không đóng được
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Bắt Promise rejection chưa được handle — tránh crash âm thầm trong production
process.on("unhandledRejection", (reason, promise) => {
  logger.error({ reason, promise: String(promise) }, "Unhandled Promise Rejection — cần review code để thêm .catch()");
});

// Bắt exception đồng bộ chưa được handle — log rồi shutdown an toàn
process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception — server sẽ tự shutdown");
  gracefulShutdown("uncaughtException");
});

export default app;
