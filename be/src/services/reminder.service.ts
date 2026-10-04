import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

interface ReminderConfig {
  eventTitle: string;
  eventDescription?: string;
  eventLocation?: string;
  startDate: Date;
  durationMinutes: number;
}

export class ReminderService {
  static async getGoogleCalendarUrl(cardId: string, elementId: string): Promise<string> {
    const config = await ReminderService.resolveConfig(cardId, elementId);
    return ReminderService.generateGoogleCalendarUrl(config);
  }

  static async generateIcsForCard(cardId: string, elementId: string): Promise<string> {
    const config = await ReminderService.resolveConfig(cardId, elementId);
    return ReminderService.generateIcsContent(config);
  }

  private static async resolveConfig(cardId: string, elementId: string): Promise<ReminderConfig> {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, status: true, categoryData: true },
    });

    if (!card) throw new HttpError(404, "Thiep khong ton tai", "CARD_NOT_FOUND");

    const categoryData = card.categoryData as Record<string, unknown>;
    const canvasDoc = categoryData?.canvasDocument as Record<string, unknown> | undefined;
    const elements = Array.isArray(canvasDoc?.elements) ? canvasDoc.elements : [];

    const element = elements.find(
      (el: Record<string, unknown>) => el.id === elementId
    ) as Record<string, unknown> | undefined;

    const widgetConfig = (element?.widgetConfig as Record<string, unknown>) ?? {};

    let startDate: Date;
    const rawDate =
      (widgetConfig.reminderEventDate as string | undefined) ||
      (widgetConfig.eventDate as string | undefined);

    if (rawDate) {
      startDate = new Date(rawDate);
    } else {
      const firstEvent = await prisma.cardEvent.findFirst({
        where: { cardId },
        orderBy: { eventDate: "asc" },
        select: { eventDate: true, venueName: true, address: true },
      });
      startDate = firstEvent?.eventDate ?? new Date();
    }

    if (isNaN(startDate.getTime())) {
      throw new HttpError(400, "Ngay su kien khong hop le", "INVALID_EVENT_DATE");
    }

    return {
      eventTitle: (widgetConfig.reminderEventTitle as string) || "Le Cuoi",
      eventDescription: (widgetConfig.reminderEventDescription as string) || undefined,
      eventLocation: (widgetConfig.reminderEventLocation as string) || undefined,
      startDate,
      durationMinutes: (widgetConfig.reminderDurationMinutes as number) || 240,
    };
  }

  static generateGoogleCalendarUrl(config: ReminderConfig): string {
    const endDate = new Date(config.startDate.getTime() + config.durationMinutes * 60_000);
    const formatDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: config.eventTitle,
      dates: `${formatDate(config.startDate)}/${formatDate(endDate)}`,
      ...(config.eventDescription ? { details: config.eventDescription } : {}),
      ...(config.eventLocation ? { location: config.eventLocation } : {}),
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  static generateIcsContent(config: ReminderConfig): string {
    const endDate = new Date(config.startDate.getTime() + config.durationMinutes * 60_000);
    const formatIcs = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@weddingcard`;
    const now = formatIcs(new Date());
    const escape = (str: string) =>
      str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Card//VN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatIcs(config.startDate)}`,
      `DTEND:${formatIcs(endDate)}`,
      `SUMMARY:${escape(config.eventTitle)}`,
      ...(config.eventDescription ? [`DESCRIPTION:${escape(config.eventDescription)}`] : []),
      ...(config.eventLocation ? [`LOCATION:${escape(config.eventLocation)}`] : []),
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    return lines.join("\r\n");
  }
}
