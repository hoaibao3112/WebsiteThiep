import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  card: { findFirst: vi.fn() },
  guest: { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), updateMany: vi.fn() },
  rsvpResponse: { count: vi.fn(), aggregate: vi.fn() },
}));
vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import { GuestService } from "../../src/services/guest.service";

describe("GuestService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.card.findFirst.mockResolvedValue({ id: "card-1", accountId: "account-1", slug: "minh-lan", plan: { code: "VIP" } });
    db.guest.create.mockImplementation(async ({ data }) => ({ id: "guest-1", ...data }));
  });

  it("creates a cryptographically strong guest token under the current account", async () => {
    const guest = await GuestService.create("account-1", "card-1", { fullName: "Anh Nam" });
    expect(guest.guestToken).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(db.guest.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ accountId: "account-1", cardId: "card-1" }) }));
  });

  it("rejects personalized guests for a FREE card", async () => {
    db.card.findFirst.mockResolvedValue({ id: "card-1", accountId: "account-1", plan: { code: "FREE" } });
    await expect(GuestService.create("account-1", "card-1", { fullName: "Anh Nam" })).rejects.toThrow("VIP");
    expect(db.guest.create).not.toHaveBeenCalled();
  });

  it("uses accountId for card ownership", async () => {
    db.card.findFirst.mockResolvedValue(null);
    await expect(GuestService.create("other-account", "card-1", { fullName: "Anh Nam" })).rejects.toThrow();
    expect(db.card.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "card-1", accountId: "other-account" } }));
  });

  it("marks opening Zalo without claiming the invitation was sent", async () => {
    db.guest.updateMany.mockResolvedValue({ count: 1 });
    await GuestService.setDeliveryStatus("account-1", "card-1", "guest-1", "OPENED_ZALO");
    expect(db.guest.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ deliveryStatus: "OPENED_ZALO", sentAt: null }) }));
  });
});
