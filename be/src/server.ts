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
import { createCorsOptions, parseAllowedOrigins } from "./config/security";
import { errorHandler } from "./middlewares/error.middleware";
import { validateRuntimeEnv } from "./config/env";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";

import { AuthService } from "./services/auth.service";

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

app.use(cors(createCorsOptions(allowedOrigins)));

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

const isPublicCardRoute = (req: Request) =>
  req.method === "GET" && req.path.startsWith("/api/cards/by-slug");

const isEditorRoute = (req: Request) =>
  (req.method === "PUT" || req.method === "PATCH") && req.path.startsWith("/api/cards");

// Trích xuất userId từ JWT (Bearer token hoặc cookie) cho editor limiter
export const extractUserIdFromReq = (req: Request): string | null => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }
    if (token) {
      const decoded = AuthService.verifyToken(token);
      if (decoded?.userId) {
        return decoded.userId;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

// Global: 200 requests / 15 phút / IP (bỏ qua public card reads và editor routes vì có limiter riêng)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => isPublicCardRoute(req) || isEditorRoute(req),
  message: { success: false, error: "Quá nhiều yêu cầu, vui lòng thử lại sau." },
});

// Public Card Read (GET /api/cards/by-slug/*): nới 600 requests / 15 phút / (slug + IP)
const publicCardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req: Request) => {
    const slug = req.path.replace(/^\/api\/cards\/by-slug\/?/, "").split("/")[0] || "";
    return `${req.ip || "unknown"}_${slug}`;
  },
  message: { success: false, error: "Quá nhiều yêu cầu xem thiệp, vui lòng thử lại sau." },
});

// Editor routes (PUT/PATCH /api/cards/*): rate limit riêng theo userId (đọc từ JWT) thay vì IP
const editorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600, // Thoải mái cho drag-and-drop và autosave
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req: Request) => {
    const userId = extractUserIdFromReq(req);
    return userId ? `user_${userId}` : (req.ip || "unknown");
  },
  message: { success: false, error: "Bạn thao tác chỉnh sửa quá nhanh, vui lòng chờ trong giây lát." },
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
// API ROUTES — Áp dụng rate limiter riêng cho auth, public card, editor
// -----------------------------------------------------------------------
app.use("/api/auth/send-otp", otpLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/verify-otp-register", authLimiter);

// Public Card Read (by-slug)
app.use("/api/cards/by-slug", publicCardLimiter);

// Editor routes (PUT / PATCH /api/cards/*)
app.use("/api/cards", (req, res, next) => {
  if (req.method === "PUT" || req.method === "PATCH") {
    return editorLimiter(req, res, next);
  }
  next();
});

app.use("/api", apiRouter);

// -----------------------------------------------------------------------
// GLOBAL ERROR HANDLER
// -----------------------------------------------------------------------
app.use(errorHandler);

// -----------------------------------------------------------------------
// SERVER START + GRACEFUL SHUTDOWN
// -----------------------------------------------------------------------
if (process.env.NODE_ENV !== "test") {
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
}

export default app;
