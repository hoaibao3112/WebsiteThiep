import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function correlationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const headerId = req.headers["x-request-id"] || req.headers["x-correlation-id"];
  const requestId =
    typeof headerId === "string" && headerId.trim().length > 0
      ? headerId.trim()
      : crypto.randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
