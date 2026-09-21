import crypto from "node:crypto";
import { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method) || req.path.startsWith("/auth/")) return next();
  
  // 1. Authorization Bearer token tuyệt đối không thể bị tấn công bởi CSRF
  if (req.headers.authorization?.startsWith("Bearer ")) return next();

  // 2. Nếu không có cookie auth_token thì không có nguy cơ CSRF
  if (!req.cookies?.auth_token) return next();

  // 3. Kiểm tra Origin & Referer từ client
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
  const host = req.headers.host;
  const rawAllowed = process.env.ALLOWED_ORIGINS || "";
  const allowedList = rawAllowed
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const isTrustedOrigin =
    !origin ||
    allowedList.includes("*") ||
    (origin && allowedList.includes(origin)) ||
    (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) ||
    (origin && /\.vercel\.app$/.test(new URL(origin).hostname)) ||
    (host && origin && origin.includes(host));

  if (isTrustedOrigin) {
    return next();
  }

  // 4. Nếu là cross-origin không xác định, bắt buộc kiểm tra double-submit token
  const cookieToken = req.cookies.csrf_token as string | undefined;
  const headerToken = req.header("X-CSRF-Token");
  if (!cookieToken || !headerToken) {
    return res.status(403).json({ success: false, error: "CSRF token không hợp lệ" });
  }
  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);
  if (cookieBuffer.length !== headerBuffer.length || !crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
    return res.status(403).json({ success: false, error: "CSRF token không hợp lệ" });
  }
  return next();
}
