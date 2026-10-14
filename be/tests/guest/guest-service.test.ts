import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  card: { findFirst: vi.fn() },
  account: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), updateMany: vi.fn() },
  guest: { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), updateMany: vi.fn() },
  rsvpResponse: { count: vi.fn(), aggregate: vi.fn() },
}));
vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import { GuestService } from "../../src/services/guest.service";

describe("GuestService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-1",
      currentPlanId: "vip-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "vip-id",
        code: "VIP",
        name: "VIP",
        maxPhotos: 50,
        hasWatermark: false,
        allowCustomDomain: true,
        allowMusicUpload: true,
        allowTelegramNoti: true,
        allowPremiumTemplates: true,
      },
    });
    db.card.findFirst.mockResolvedValue({ id: "card-1", accountId: "account-1", slug: "minh-lan", status: "ACTIVE", plan: { code: "VIP" } });
    db.guest.create.mockImplementation(async ({ data }) => ({ id: "guest-1", ...data }));
  });

  it("creates a cryptographically strong guest token under the current account", async () => {
    const guest = await GuestService.create("account-1", "card-1", { fullName: "Anh Nam" });
    expect(guest.guestToken).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(db.guest.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ accountId: "account-1", cardId: "card-1" }) }));
  });

  it("Fix #10: từ chối thao tác khách mời nếu thiệp bị ARCHIVED hoặc EXPIRED", async () => {
    db.card.findFirst.mockResolvedValueOnce({ id: "card-1", accountId: "account-1", slug: "minh-lan", status: "ARCHIVED", plan: { code: "VIP" } });
    await expect(GuestService.create("account-1", "card-1", { fullName: "Khách 1" })).rejects.toMatchObject({
      statusCode: 409,
      code: "CARD_STATE_CONFLICT",
    });

    db.card.findFirst.mockResolvedValueOnce({ id: "card-1", accountId: "account-1", slug: "minh-lan", status: "EXPIRED", plan: { code: "VIP" } });
    await expect(GuestService.create("account-1", "card-1", { fullName: "Khách 2" })).rejects.toMatchObject({
      statusCode: 409,
      code: "CARD_STATE_CONFLICT",
    });
  });

  it("Fix #10: cho phép thao tác khách mời khi thiệp là DRAFT hoặc ACTIVE", async () => {
    db.card.findFirst.mockResolvedValueOnce({ id: "card-1", accountId: "account-1", slug: "minh-lan", status: "DRAFT", plan: { code: "VIP" } });
    const draftGuest = await GuestService.create("account-1", "card-1", { fullName: "Khách Draft" });
    expect(draftGuest.id).toBe("guest-1");

    db.card.findFirst.mockResolvedValueOnce({ id: "card-1", accountId: "account-1", slug: "minh-lan", status: "ACTIVE", plan: { code: "VIP" } });
    const activeGuest = await GuestService.create("account-1", "card-1", { fullName: "Khách Active" });
    expect(activeGuest.id).toBe("guest-1");
  });

  it("rejects personalized guests for a FREE card", async () => {
    db.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-1",
      currentPlanId: "free-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "free-id",
        code: "FREE",
        name: "FREE",
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      },
    });
    db.card.findFirst.mockResolvedValue({ id: "card-1", accountId: "account-1", status: "ACTIVE", plan: { code: "FREE" } });
    await expect(GuestService.create("account-1", "card-1", { fullName: "Anh Nam" })).rejects.toThrow("VIP");
    expect(db.guest.create).not.toHaveBeenCalled();
  });

  it("uses accountId for card ownership", async () => {
    db.card.findFirst.mockResolvedValue(null);
    await expect(GuestService.create("other-account", "card-1", { fullName: "Anh Nam" })).rejects.toThrow();
    expect(db.card.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "card-1", accountId: "other-account" } }));
  });

  it("marks opening Zalo without resetting sentAt to null (Fix #3)", async () => {
    db.guest.updateMany.mockResolvedValue({ count: 1 });
    await GuestService.setDeliveryStatus("account-1", "card-1", "guest-1", "OPENED_ZALO");
    expect(db.guest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deliveryStatus: "OPENED_ZALO",
          sentAt: undefined,
        }),
      })
    );
  });

  it("sets sentAt timestamp when status is CONFIRMED_SENT", async () => {
    db.guest.updateMany.mockResolvedValue({ count: 1 });
    await GuestService.setDeliveryStatus("account-1", "card-1", "guest-1", "CONFIRMED_SENT");
    expect(db.guest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deliveryStatus: "CONFIRMED_SENT",
          sentAt: expect.any(Date),
        }),
      })
    );
  });
});
