import type { NextFunction, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { GuestService } from "../services/guest.service";
import { CreateGuestSchema, DeliveryStatusSchema, ImportGuestsSchema, ListGuestsQuerySchema, UpdateGuestSchema } from "../lib/validators/guest";

const accountIdOf = (req: AuthenticatedRequest) => {
  if (!req.user?.accountId) throw new Error("Thiếu thông tin tài khoản");
  return req.user.accountId;
};

function handleGuestError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: error.errors[0]?.message || "Dữ liệu không hợp lệ",
      fieldErrors: error.flatten().fieldErrors,
    });
  }
  next(error);
}

export class GuestController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(201).json({
        success: true,
        data: await GuestService.create(accountIdOf(req), String(req.params.cardId), CreateGuestSchema.parse(req.body)),
      });
    } catch (error) {
      handleGuestError(error, res, next);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: await GuestService.list(accountIdOf(req), String(req.params.cardId), ListGuestsQuerySchema.parse(req.query)),
      });
    } catch (error) {
      handleGuestError(error, res, next);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: await GuestService.update(accountIdOf(req), String(req.params.cardId), String(req.params.guestId), UpdateGuestSchema.parse(req.body)),
      });
    } catch (error) {
      handleGuestError(error, res, next);
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: await GuestService.remove(accountIdOf(req), String(req.params.cardId), String(req.params.guestId)),
      });
    } catch (error) {
      handleGuestError(error, res, next);
    }
  }

  static async clear(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.body?.confirmCardId !== req.params.cardId) {
        return res.status(422).json({ success: false, error: "Vui lòng xác nhận đúng mã thiệp" });
      }
      res.json({
        success: true,
        data: await GuestService.remove(accountIdOf(req), String(req.params.cardId)),
      });
    } catch (error) {
      handleGuestError(error, res, next);
    }
  }

  static async delivery(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = DeliveryStatusSchema.parse(req.body);
      res.json({
        success: true,
        data: await GuestService.setDeliveryStatus(accountIdOf(req), String(req.params.cardId), String(req.params.guestId), status),
      });
    } catch (error) {
      handleGuestError(error, res, next);
    }
  }

  static async regenerateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: await GuestService.regenerateToken(accountIdOf(req), String(req.params.cardId), String(req.params.guestId)),
      });
    } catch (error) {
      handleGuestError(error, res, next);
    }
  }

  static async import(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = ImportGuestsSchema.parse(req.body);
      const items = [];
      for (const guest of input.guests) {
        items.push(await GuestService.create(accountIdOf(req), String(req.params.cardId), guest));
      }
      res.status(201).json({
        success: true,
        data: { created: items.length, updated: 0, skipped: 0, errors: [], items },
      });
    } catch (error) {
      handleGuestError(error, res, next);
    }
  }
}
