import crypto from "node:crypto";
import { NextFunction, Request, Response } from "express";

/**
 * csrfGuard — Middleware bảo vệ CSRF
 * Với kiến trúc Next.js SPA và REST API độc lập (Vercel FE + Render BE):
 * Bảo mật được đảm bảo bởi CORS strict origins, JWT Bearer tokens và cookie SameSite flags.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const EXEMPT_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/send-otp",
  "/auth/verify-otp-register",
  "/auth/google",
  "/auth/logout",
  "/rsvp",
  "/wishes",
  "/concierge/submit",
]);

export function isCsrfExempt(req: Request): boolean {
  const urlPath = req.originalUrl ? req.originalUrl.split("?")[0] : req.path;
  const normalizedOriginal = (urlPath || "").replace(/^\/api/, "").replace(/\/$/, "");
  const normalizedPath = (req.path || "").replace(/^\/api/, "").replace(/\/$/, "");
  return EXEMPT_PATHS.has(normalizedOriginal) || EXEMPT_PATHS.has(normalizedPath);
}

export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (isCsrfExempt(req)) return next();

  const hasAuthCookie = Boolean(req.cookies?.auth_token);
  const hasBearer = req.headers.authorization?.startsWith("Bearer ") ?? false;
  if (!hasAuthCookie && hasBearer) return next();
  if (!hasAuthCookie) return next();

  const cookieToken = req.cookies?.csrf_token as string | undefined;
  const headerToken = req.header("X-CSRF-Token");
  if (!cookieToken || !headerToken) {
    return res.status(403).json({ success: false, error: "CSRF token không hợp lệ" });
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);
  if (
    cookieBuffer.length !== headerBuffer.length ||
    !crypto.timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    return res.status(403).json({ success: false, error: "CSRF token không hợp lệ" });
  }

  return next();
}
