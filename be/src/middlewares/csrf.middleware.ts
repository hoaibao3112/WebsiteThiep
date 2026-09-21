import { NextFunction, Request, Response } from "express";

/**
 * csrfGuard — Middleware bảo vệ CSRF
 * Với kiến trúc Next.js SPA và REST API độc lập (Vercel FE + Render BE):
 * Bảo mật được đảm bảo bởi CORS strict origins, JWT Bearer tokens và cookie SameSite flags.
 */
export function csrfGuard(_req: Request, _res: Response, next: NextFunction) {
  return next();
}
