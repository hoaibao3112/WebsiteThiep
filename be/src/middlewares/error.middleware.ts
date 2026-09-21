import { Request, Response, NextFunction } from "express";
import { HttpError } from "../lib/http-error";
import { logger } from "../lib/logger";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  logger.error({ err }, "Unhandled Server Error");

  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
    code: "INTERNAL_ERROR",
  });
}
