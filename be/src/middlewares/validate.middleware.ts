import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware factory: validate request body với Zod schema
 *
 * Cách dùng:
 * apiRouter.post('/rsvp', validate(RsvpSchema), RsvpController.submit)
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formatted = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        error: "Dữ liệu không hợp lệ",
        details: formatted,
      });
      return;
    }

    // Gán lại body đã được parse & sanitize bởi Zod
    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory: validate query params với Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const formatted = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        error: "Query params không hợp lệ",
        details: formatted,
      });
      return;
    }

    req.query = result.data;
    next();
  };
}
