import { Request, Response, NextFunction } from "express";
import { ReminderService } from "../services/reminder.service";

export class ReminderController {
  static async getGoogleCalendarUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = req.params.cardId as string;
      const elementId = req.query.elementId as string;
      if (!elementId) {
        return res.status(400).json({ success: false, error: "elementId la bat buoc" });
      }
      const url = await ReminderService.getGoogleCalendarUrl(cardId, elementId);
      res.json({ success: true, url });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async downloadIcs(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = req.params.cardId as string;
      const elementId = req.query.elementId as string;
      if (!elementId) {
        return res.status(400).json({ success: false, error: "elementId la bat buoc" });
      }
      const icsContent = await ReminderService.generateIcsForCard(cardId, elementId);
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=\"wedding-reminder.ics\"");
      res.send(icsContent);
    } catch (error: unknown) {
      next(error);
    }
  }
}
