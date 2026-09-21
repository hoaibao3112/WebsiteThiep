import { describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  card: { findUnique: vi.fn() },
  guest: { findFirst: vi.fn() },
  rsvpResponse: { create: vi.fn(), upsert: vi.fn() },
}));
const queueMock = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/rate-limiter", () => ({ checkRateLimit: vi.fn() }));
vi.mock("../../src/queues/rsvp-notification.queue", () => ({ rsvpNotificationQueue: queueMock }));

import { RsvpService } from "../../src/services/rsvp.service";

describe("RSVP notification failure", () => {
  it("returns the committed RSVP when Telegram enqueue fails", async () => {
    prismaMock.card.findUnique.mockResolvedValue({
      id: "card-1",
      slug: "wedding",
      status: "ACTIVE",
      expiredAt: null,
      telegramChatId: "chat-1",
      accountId: "account-1",
    });
    prismaMock.rsvpResponse.create.mockResolvedValue({ id: "rsvp-1" });
    queueMock.add.mockRejectedValue(new Error("Redis unavailable"));

    await expect(RsvpService.submitRsvp({
      cardId: "card-1",
      fullName: "An",
      status: "ATTENDING",
      guestCount: 1,
      side: "MUTUAL",
    })).resolves.toMatchObject({ id: "rsvp-1" });
  });
});
