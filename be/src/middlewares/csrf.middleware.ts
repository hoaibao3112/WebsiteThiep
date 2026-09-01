import crypto from "node:crypto";
import { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method) || req.path.startsWith("/auth/")) return next();
  if (req.headers.authorization?.startsWith("Bearer ") || !req.cookies?.auth_token) return next();

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
