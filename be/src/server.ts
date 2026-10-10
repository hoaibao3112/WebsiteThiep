import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
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

const isProduction = process.env.NODE_ENV === "production";
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

// Production BẮT BUỘC cấu hình ALLOWED_ORIGINS (đã enforce trong validateRuntimeEnv).
// Danh sách mặc định (có localhost) CHỈ dùng cho dev/test để tránh mở CORS credentialed cho localhost ở prod.
const devDefaultOrigins = "https://website-thiep.vercel.app,http://localhost:3000,http://127.0.0.1:3000";
const allowedOrigins = parseAllowedOrigins(
  process.env.ALLOWED_ORIGINS ?? (isProduction ? "" : devDefaultOrigins)
);

app.use(cors(createCorsOptions(allowedOrigins)));

// -----------------------------------------------------------------------
// BODY PARSER — giới hạn theo route
// Mặc định 100kb cho mọi endpoint (đặc biệt endpoint public). Chỉ các route
// editor đã đăng nhập mới được nâng lên 10MB; chữ ký tay (data URL) 3MB.
// -----------------------------------------------------------------------
const smallJson = express.json({ limit: "100kb" });
const signatureJson = express.json({ limit: "3mb" });
const largeJson = express.json({ limit: "10mb" });

const LARGE_JSON_ROUTES: readonly RegExp[] = [
  /^\/api\/cards\/?$/,
  /^\/api\/cards\/[^/]+\/?$/,
  /^\/api\/cards\/[^/]+\/elements\/[^/]+\/?$/,
  /^\/api\/cards\/[^/]+\/(envelope-config|album-3d|google-drive-import)\/?$/,
  /^\/api\/cards\/[^/]+\/guests\/import\/?$/,
];
const SIGNATURE_SUBMIT_ROUTE = /^\/api\/cards\/[^/]+\/signature\/[^/]+\/submit\/?$/;

export function selectJsonParser(req: Request) {
  const urlPath = (req.originalUrl || req.url || "").split("?")[0];
  if (SIGNATURE_SUBMIT_ROUTE.test(urlPath)) return signatureJson;

  // Chỉ cho phép body lớn khi request có mang credential (authGuard sẽ verify sau đó).
  // Request ẩn danh luôn bị giới hạn 100kb để không thể ép server parse 10MB.
  const hasCredential =
    Boolean(req.headers.authorization?.startsWith("Bearer ")) || Boolean(req.cookies?.auth_token);
  if (hasCredential && LARGE_JSON_ROUTES.some((re) => re.test(urlPath))) return largeJson;

  return smallJson;
}

app.use((req: Request, res: Response, next: NextFunction) => selectJsonParser(req)(req, res, next));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Morgan HTTP request logger — pipe vào Pino để format đồng nhất
app.use(
  morgan(isProduction ? "combined" : "dev", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
    // Health/ready check gọi liên tục — không log để tránh nhiễu
    skip: (req: Request) => req.path === "/health" || req.path === "/ready",
  })
);

// -----------------------------------------------------------------------
// RATE LIMITING — Bảo vệ toàn bộ API khỏi brute-force & DoS
// -----------------------------------------------------------------------

const isPublicCardRoute = (req: Request) =>
  req.method === "GET" && (req.originalUrl || req.path).split("?")[0].startsWith("/api/cards/by-slug");

const isEditorRoute = (req: Request) =>
  (req.method === "PUT" || req.method === "PATCH") && (req.originalUrl || req.path).split("?")[0].startsWith("/api/cards");

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

// Global: 200 requests / 15 phút / IP (bỏ qua public card reads, editor routes và health check)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) =>
    req.path === "/health" || req.path === "/ready" || isPublicCardRoute(req) || isEditorRoute(req),
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
    const rawPath = (req.originalUrl || req.url || req.path).split("?")[0];
    const slug = rawPath.replace(/^\/api\/cards\/by-slug\/?/, "").split("/")[0] || "";
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

// AI chatbot: mỗi request tốn tiền (embedding + LLM) → 20 tin nhắn / 10 phút / IP
const aiChatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Bạn nhắn quá nhanh, vui lòng thử lại sau ít phút nhé!" },
});

app.use(globalLimiter);

// -----------------------------------------------------------------------
// STATIC FILES
// -----------------------------------------------------------------------
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/images", express.static(path.join(process.cwd(), "public", "images")));

// -----------------------------------------------------------------------
// HEALTH CHECKS
//  - /health : LIVENESS — chỉ cho biết process còn sống. KHÔNG phụ thuộc DB/Redis,
//              để Render không restart/fail deploy chỉ vì dependency chập chờn.
//  - /ready  : READINESS — kiểm tra DB + Redis (dùng cho monitoring/alert).
// -----------------------------------------------------------------------
function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "Digital Card Platform API",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", async (_req: Request, res: Response) => {
  const checks: { db: "ok" | "error"; redis: "ok" | "error" } = { db: "ok", redis: "ok" };

  await Promise.all([
    withTimeout(prisma.$queryRaw`SELECT 1`, 3000, "Database ping").catch((err: unknown) => {
      logger.warn({ err }, "Readiness check database failed");
      checks.db = "error";
    }),
    withTimeout(redis.ping(), 3000, "Redis ping").catch((err: unknown) => {
      logger.warn({ err }, "Readiness check redis failed");
      checks.redis = "error";
    }),
  ]);

  const isReady = checks.db === "ok" && checks.redis === "ok";
  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ok" : "degraded",
    service: "Digital Card Platform API",
    checks,
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

// AI chatbot (public, tốn chi phí LLM)
app.use("/api/ai/chat", aiChatLimiter);

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
    }, 10_000).unref();
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
