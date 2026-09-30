import { Request, Response, NextFunction } from "express";
import { WishService } from "../services/wish.service";

export class WishController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body đã được validate bởi middleware validate(WishSchema)
      const ipAddress = req.ip || req.socket.remoteAddress;

      const wish = await WishService.submitWish(req.body, { ipAddress });
      res.status(201).json({
        success: true,
        message: "Gửi lời chúc thành công!",
        data: wish,
      });
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      next(error);
    }
  }
}
