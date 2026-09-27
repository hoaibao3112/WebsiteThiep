import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  card: { findFirst: vi.fn(), update: vi.fn() },
  account: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
  },
  guest: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  rsvpResponse: {
    count: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import { GuestService } from "../../src/services/guest.service";

describe("Guest Tracking and Filter Logic", () => {
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
    db.card.findFirst.mockResolvedValue({
      id: "card-1",
      accountId: "account-1",
      slug: "wedding-card",
      plan: { code: "VIP" },
    });
    db.guest.findMany.mockResolvedValue([]);
    db.guest.count.mockResolvedValue(0);
    db.rsvpResponse.count.mockResolvedValue(0);
    db.rsvpResponse.aggregate.mockResolvedValue({ _sum: { guestCount: 0 } });
  });

  it("áp dụng điều kiện lọc statusFilter 'viewed' (khách đã mở xem thiệp)", async () => {
    await GuestService.list("account-1", "card-1", {
      statusFilter: "viewed",
    });

    expect(db.guest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          cardId: "card-1",
          accountId: "account-1",
          openedAt: { not: null },
        }),
      })
    );
  });

  it("áp dụng điều kiện lọc statusFilter 'sent_unopened' (đã gửi nhưng chưa mở thiệp)", async () => {
    await GuestService.list("account-1", "card-1", {
      statusFilter: "sent_unopened",
    });

    expect(db.guest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          cardId: "card-1",
          accountId: "account-1",
          deliveryStatus: { not: "NOT_SENT" },
          openedAt: null,
        }),
      })
    );
  });

  it("áp dụng điều kiện lọc statusFilter 'not_sent' (chưa gửi thiệp)", async () => {
    await GuestService.list("account-1", "card-1", {
      statusFilter: "not_sent",
    });

    expect(db.guest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          cardId: "card-1",
          accountId: "account-1",
          deliveryStatus: "NOT_SENT",
        }),
      })
    );
  });

  it("áp dụng điều kiện lọc statusFilter 'responded' (đã phản hồi RSVP)", async () => {
    await GuestService.list("account-1", "card-1", {
      statusFilter: "responded",
    });

    expect(db.guest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          cardId: "card-1",
          accountId: "account-1",
          rsvpResponses: { some: {} },
        }),
      })
    );
  });

  it("trả về đầy đủ các trường metrics tracking (viewed, notSent, sentUnopened, confirmedSent)", async () => {
    db.guest.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(4)  // notSent
      .mockResolvedValueOnce(2)  // sentUnopened
      .mockResolvedValueOnce(5)  // viewed
      .mockResolvedValueOnce(6); // confirmedSent
    db.rsvpResponse.count.mockResolvedValueOnce(3); // responded
    db.rsvpResponse.aggregate.mockResolvedValueOnce({ _sum: { guestCount: 7 } }); // attendingPeople

    const result = await GuestService.list("account-1", "card-1", {
      statusFilter: "all",
    });

    expect(result.metrics).toEqual({
      total: 10,
      notSent: 4,
      sentUnopened: 2,
      viewed: 5,
      confirmedSent: 6,
      responded: 3,
      attendingPeople: 7,
    });
  });
});
