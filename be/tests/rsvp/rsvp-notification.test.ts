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

  it("Fix #7: passes resolvedName and resolvedPhone to Telegram queue when guest is matched", async () => {
    prismaMock.card.findUnique.mockResolvedValue({
      id: "card-1",
      slug: "wedding",
      status: "ACTIVE",
      expiredAt: null,
      telegramChatId: "chat-1",
      accountId: "account-1",
    });
    prismaMock.guest.findFirst.mockResolvedValue({
      id: "guest-123",
      fullName: "Bác Ba Phi (Resolved)",
      phone: "0901234567",
    });
    prismaMock.rsvpResponse.upsert.mockResolvedValue({ id: "rsvp-upserted" });
    queueMock.add.mockResolvedValue({});

    await RsvpService.submitRsvp({
      cardId: "card-1",
      fullName: "Tên nhập bậy",
      phone: "0999999999",
      guestToken: "valid-guest-token",
      status: "ATTENDING",
      guestCount: 2,
      side: "GROOM",
    });

    expect(queueMock.add).toHaveBeenCalledWith(
      "send-telegram-rsvp",
      expect.objectContaining({
        fullName: "Bác Ba Phi (Resolved)",
        phone: "0901234567",
      })
    );
  });

  it("tìm guest với điều kiện OR khi truyền cả guestToken và guestCode đồng thời", async () => {
    prismaMock.card.findUnique.mockResolvedValue({
      id: "card-1",
      slug: "wedding",
      status: "ACTIVE",
      expiredAt: null,
      telegramChatId: null,
      accountId: "account-1",
    });
    prismaMock.guest.findFirst.mockResolvedValue({
      id: "guest-both",
      fullName: "Cô Tư",
      phone: "0911223344",
    });
    prismaMock.rsvpResponse.upsert.mockResolvedValue({ id: "rsvp-both" });

    await RsvpService.submitRsvp({
      cardId: "card-1",
      fullName: "Guest Raw",
      guestToken: "uuid-token-xyz",
      guestCode: "CODE123",
      status: "ATTENDING",
      guestCount: 1,
      side: "BRIDE",
    });

    expect(prismaMock.guest.findFirst).toHaveBeenCalledWith({
      where: {
        accountId: "account-1",
        cardId: "card-1",
        OR: [
          { guestToken: "uuid-token-xyz" },
          { guestCode: "CODE123" },
        ],
      },
    });

    expect(prismaMock.rsvpResponse.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cardId_guestId: { cardId: "card-1", guestId: "guest-both" } },
        create: expect.objectContaining({
          fullName: "Cô Tư",
          phone: "0911223344",
        }),
      })
    );
  });
});
