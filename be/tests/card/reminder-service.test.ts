import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  card: { findFirst: vi.fn() },
  cardEvent: { findFirst: vi.fn() },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));

import { ReminderService } from "../../src/services/reminder.service";

describe("ReminderService - Fix #8 (Public endpoint security)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Fix #8: trả 404 CARD_NOT_FOUND cho thiệp DRAFT và không xử lý categoryData", async () => {
    // findFirst lọc { id, status: "ACTIVE" } nên thiệp DRAFT sẽ trả về null
    prismaMock.card.findFirst.mockResolvedValueOnce(null);

    await expect(
      ReminderService.getGoogleCalendarUrl("draft-card-id", "element-1")
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "CARD_NOT_FOUND",
    });

    expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
      where: { id: "draft-card-id", status: "ACTIVE" },
      select: expect.objectContaining({ status: true, categoryData: true }),
    });
  });

  it("Fix #8: trả 404 CARD_NOT_FOUND cho thiệp ARCHIVED", async () => {
    prismaMock.card.findFirst.mockResolvedValueOnce(null);

    await expect(
      ReminderService.generateIcsForCard("archived-card-id", "element-1")
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "CARD_NOT_FOUND",
    });

    expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
      where: { id: "archived-card-id", status: "ACTIVE" },
      select: expect.objectContaining({ status: true, categoryData: true }),
    });
  });

  it("cho phép lấy Google Calendar URL và ICS bình thường khi thiệp ACTIVE", async () => {
    prismaMock.card.findFirst.mockResolvedValueOnce({
      id: "active-card-id",
      status: "ACTIVE",
      categoryData: {
        canvasDocument: {
          elements: [
            {
              id: "element-1",
              widgetConfig: {
                reminderEventTitle: "Lễ Thành Hôn Tuấn & Lan",
                reminderEventDate: "2026-11-20T10:00:00.000Z",
                reminderEventLocation: "Trung tâm tiệc cưới White Palace",
                reminderDurationMinutes: 180,
              },
            },
          ],
        },
      },
    });

    const url = await ReminderService.getGoogleCalendarUrl("active-card-id", "element-1");
    expect(url).toContain("https://calendar.google.com/calendar/render");
    expect(url).toContain("action=TEMPLATE");

    prismaMock.card.findFirst.mockResolvedValueOnce({
      id: "active-card-id",
      status: "ACTIVE",
      categoryData: {
        canvasDocument: {
          elements: [
            {
              id: "element-1",
              widgetConfig: {
                reminderEventTitle: "Lễ Thành Hôn Tuấn & Lan",
                reminderEventDate: "2026-11-20T10:00:00.000Z",
                reminderEventLocation: "Trung tâm tiệc cưới White Palace",
                reminderDurationMinutes: 180,
              },
            },
          ],
        },
      },
    });

    const ics = await ReminderService.generateIcsForCard("active-card-id", "element-1");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:Lễ Thành Hôn Tuấn & Lan");
    expect(ics).toContain("LOCATION:Trung tâm tiệc cưới White Palace");
    expect(ics).toContain("END:VCALENDAR");
  });
});
