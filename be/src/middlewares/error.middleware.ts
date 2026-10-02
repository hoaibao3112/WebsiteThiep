import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { HttpError } from "../lib/http-error";
import { logger } from "../lib/logger";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // 1. Lỗi Multer (upload file)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: "Kích thước tập tin vượt quá giới hạn cho phép",
        code: "LIMIT_FILE_SIZE",
      });
    }
    return res.status(400).json({
      success: false,
      error: `Lỗi tải lên tập tin: ${err.message}`,
      code: err.code,
    });
  }

  // 2. Lỗi HTTP có mã trạng thái rõ ràng (throw từ services)
  if (err instanceof HttpError) {
    const details = err.details as Record<string, any> | undefined;
    const currentVersion = details?.currentVersion ?? undefined;
    return res.status(err.status).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(currentVersion !== undefined ? { currentVersion } : {}),
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
  }

  // 2. Lỗi validation Zod — trả 400 với chi tiết field errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Dữ liệu không hợp lệ",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // 3. Lỗi Prisma đã biết — map sang HTTP status phù hợp
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2028: Transaction timeout / expired
    if (err.code === "P2028") {
      return res.status(503).json({
        success: false,
        error: "Thời gian xử lý giao dịch quá hạn, vui lòng thử lại",
        code: "TX_TIMEOUT",
      });
    }
    // P2025: Record not found (findUniqueOrThrow, update on non-existent)
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy dữ liệu yêu cầu",
        code: "NOT_FOUND",
      });
    }
    // P2002: Unique constraint violation
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Dữ liệu đã tồn tại trong hệ thống",
        code: "DUPLICATE_ENTRY",
      });
    }
  }

  // 4. Lỗi CORS
  if (err instanceof Error && err.message.startsWith("CORS:")) {
    return res.status(403).json({
      success: false,
      error: "Truy cập từ nguồn không được phép",
      code: "CORS_REJECTED",
    });
  }

  // 5. Fallback — lỗi chưa xác định
  logger.error({ err }, "Unhandled Server Error");

  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
    code: "INTERNAL_ERROR",
  });
}
