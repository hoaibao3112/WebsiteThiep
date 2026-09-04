import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { WishService } from "../services/wish.service";
import { WishSubmitSchema } from "../lib/validators/wish.schema";

export class WishController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = WishSubmitSchema.parse(req.body);
      const ipAddress =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

      const wish = await WishService.submitWish(validated, { ipAddress });
      res.status(201).json({
        success: true,
        message: "Gửi lời chúc thành công!",
        data: wish,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = req.params.cardId as string;
      const limit = Number(req.query.limit) || 20;
      const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

      const data = await WishService.listWishes(cardId, limit, cursor);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  }
}
