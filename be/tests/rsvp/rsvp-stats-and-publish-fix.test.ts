import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  card: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  plan: { findUnique: vi.fn() },
  account: { findUniqueOrThrow: vi.fn() },
  rsvpResponse: {
    count: vi.fn(),
    aggregate: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));

import { RsvpService } from "../../src/services/rsvp.service";
import { CardService } from "../../src/services/card.service";
import { HttpError } from "../../src/lib/http-error";

// ─────────────────────────────────────────────────────────────────────────────
// RsvpService.getRsvpStats
// ─────────────────────────────────────────────────────────────────────────────
describe("RsvpService.getRsvpStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ném 404 CARD_NOT_FOUND khi accountId không sở hữu card (multi-tenant isolation)", async () => {
    prismaMock.card.findFirst.mockResolvedValueOnce(null);

    await expect(
      RsvpService.getRsvpStats("hacker-account", "card-of-other-account")
    ).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.statusCode).toBe(404);
      expect(httpErr.code).toBe("CARD_NOT_FOUND");
      return true;
    });

    expect(prismaMock.rsvpResponse.count).not.toHaveBeenCalled();
  });

  it("trả về thống kê đúng: ATTENDING/DECLINED/UNDECIDED và tổng guestCount", async () => {
    prismaMock.card.findFirst.mockResolvedValueOnce({ id: "card-1", accountId: "account-1" });
    prismaMock.rsvpResponse.count
      .mockResolvedValueOnce(10)  // ATTENDING
      .mockResolvedValueOnce(3)   // DECLINED
      .mockResolvedValueOnce(2);  // UNDECIDED
    prismaMock.rsvpResponse.aggregate.mockResolvedValueOnce({
      _sum: { guestCount: 24 },
    });
    prismaMock.rsvpResponse.findMany.mockResolvedValueOnce([
      { id: "r-1", status: "ATTENDING", guestCount: 3 },
      { id: "r-2", status: "DECLINED", guestCount: 0 },
    ]);

    const result = await RsvpService.getRsvpStats("account-1", "card-1");

    expect(result.summary).toEqual({
      attendingCount: 10,
      declinedCount: 3,
      undecidedCount: 2,
      totalAttendingGuests: 24,
    });
    expect(result.responses).toHaveLength(2);
  });

  it("trả về 0 cho totalAttendingGuests khi aggregate._sum.guestCount là null", async () => {
    prismaMock.card.findFirst.mockResolvedValueOnce({ id: "card-1", accountId: "account-1" });
    prismaMock.rsvpResponse.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    prismaMock.rsvpResponse.aggregate.mockResolvedValueOnce({
      _sum: { guestCount: null },
    });
    prismaMock.rsvpResponse.findMany.mockResolvedValueOnce([]);

    const result = await RsvpService.getRsvpStats("account-1", "card-1");

    expect(result.summary.totalAttendingGuests).toBe(0);
    expect(result.responses).toHaveLength(0);
  });

  it("query rsvpResponse với đúng accountId và cardId (multi-tenant scoping)", async () => {
    prismaMock.card.findFirst.mockResolvedValueOnce({ id: "card-xyz", accountId: "account-abc" });
    prismaMock.rsvpResponse.count.mockResolvedValue(0);
    prismaMock.rsvpResponse.aggregate.mockResolvedValueOnce({ _sum: { guestCount: null } });
    prismaMock.rsvpResponse.findMany.mockResolvedValueOnce([]);

    await RsvpService.getRsvpStats("account-abc", "card-xyz");

    expect(prismaMock.rsvpResponse.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountId: "account-abc", cardId: "card-xyz" }),
      })
    );
    expect(prismaMock.rsvpResponse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountId: "account-abc", cardId: "card-xyz" }),
      })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CardService.publishCard — Fix Bug #1: durationDays fallback
// ─────────────────────────────────────────────────────────────────────────────
describe("CardService.publishCard — durationDays fallback fix (Bug #1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dùng freePlan.durationDays=7, KHÔNG dùng card.plan.durationDays=180 khi user downgrade từ BASIC sang FREE", async () => {
    prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
      id: "account-downgraded",
      currentPlanId: "plan-free-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "plan-free-id",
        code: "FREE",
        name: "Gói Miễn Phí",
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      },
    });

    // Card tạo khi còn BASIC — card.plan.durationDays = 180
    prismaMock.card.findFirst.mockResolvedValueOnce({
      id: "card-downgraded",
      accountId: "account-downgraded",
      status: "DRAFT",
      publishedAt: null,
      expiredAt: null,
      categoryData: {
        cardCategory: "WEDDING",
        groom: { fullName: "Anh" },
        bride: { fullName: "Em" },
      },
      plan: { code: "BASIC", durationDays: 180 }, // Plan lúc tạo thiệp
      template: { isPremium: false },
      photos: [],
    });

    // FREE plan trong DB có durationDays = 7
    prismaMock.plan.findUnique.mockResolvedValueOnce({ durationDays: 7 });
    prismaMock.card.update.mockImplementation(async ({ data }: any) => ({
      id: "card-downgraded",
      publishedAt: data.publishedAt,
      ...data,
    }));

    const published = await CardService.publishCard("account-downgraded", "card-downgraded");

    expect(published.status).toBe("ACTIVE");
    expect(published.expiredAt).toBeInstanceOf(Date);

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const oneEightyDaysMs = 180 * 24 * 60 * 60 * 1000;
    const expiryMs = published.expiredAt!.getTime() - published.publishedAt.getTime();

    // Phải là 7 ngày — không phải 180 ngày từ plan BASIC cũ
    expect(expiryMs).toBe(sevenDaysMs);
    expect(expiryMs).not.toBe(oneEightyDaysMs);
  });

  it("khi freePlan không có trong DB, fallback cứng về 7 ngày mặc định", async () => {
    prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
      id: "account-free",
      currentPlanId: "plan-free-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "plan-free-id",
        code: "FREE",
        name: "Gói Miễn Phí",
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      },
    });

    prismaMock.card.findFirst.mockResolvedValueOnce({
      id: "card-free",
      accountId: "account-free",
      status: "DRAFT",
      publishedAt: null,
      expiredAt: null,
      categoryData: {
        cardCategory: "WEDDING",
        groom: { fullName: "A" },
        bride: { fullName: "B" },
      },
      plan: null,
      template: { isPremium: false },
      photos: [],
    });

    // freePlan không tìm thấy trong DB
    prismaMock.plan.findUnique.mockResolvedValueOnce(null);
    prismaMock.card.update.mockImplementation(async ({ data }: any) => ({
      id: "card-free",
      publishedAt: data.publishedAt,
      ...data,
    }));

    const published = await CardService.publishCard("account-free", "card-free");

    expect(published.expiredAt).toBeInstanceOf(Date);
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const expiryMs = published.expiredAt!.getTime() - published.publishedAt.getTime();
    expect(expiryMs).toBe(sevenDaysMs);
  });
});
