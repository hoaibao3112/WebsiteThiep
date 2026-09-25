import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  card: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  plan: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
  account: {
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
  },
  template: {
    findUnique: vi.fn(),
  },
  guest: {
    findFirst: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { CardService } from "../../src/services/card.service";
import { HttpError } from "../../src/lib/http-error";
import { auditCardExpiryCandidates } from "../../src/scripts/audit-card-expiry";

describe("Card lifecycle and account entitlement interaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Publishing under Paid (BASIC/VIP) vs FREE plans", () => {
    it("sets expiredAt=null when published under an active VIP plan", async () => {
      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: "account-vip",
        currentPlanId: "plan-vip-id",
        planStartedAt: new Date(),
        planExpiresAt: null,
        currentPlan: {
          id: "plan-vip-id",
          code: "VIP",
          name: "Gói VIP",
          maxPhotos: 50,
          hasWatermark: false,
          allowCustomDomain: true,
          allowMusicUpload: true,
          allowTelegramNoti: true,
          allowPremiumTemplates: true,
        },
      });

      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-vip-1",
        accountId: "account-vip",
        status: "DRAFT",
        categoryData: { cardCategory: "WEDDING", groom: { fullName: "Anh" }, bride: { fullName: "Em" } },
        plan: { code: "VIP", durationDays: null },
        template: { isPremium: true },
        photos: [],
      });

      prismaMock.card.update.mockImplementation(async ({ data }: any) => ({
        id: "card-vip-1",
        ...data,
      }));

      const published = await CardService.publishCard("account-vip", "card-vip-1");

      expect(published.status).toBe("ACTIVE");
      expect(published.expiredAt).toBeNull();
      expect(prismaMock.card.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "ACTIVE",
            expiredAt: null,
          }),
        })
      );
    });

    it("sets expiredAt=null when published under an active BASIC plan", async () => {
      const basicExpiry = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: "account-basic",
        currentPlanId: "plan-basic-id",
        planStartedAt: new Date(),
        planExpiresAt: basicExpiry,
        currentPlan: {
          id: "plan-basic-id",
          code: "BASIC",
          name: "Gói Tiêu Chuẩn",
          maxPhotos: 20,
          hasWatermark: false,
          allowCustomDomain: false,
          allowMusicUpload: true,
          allowTelegramNoti: false,
          allowPremiumTemplates: false,
        },
      });

      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-basic-1",
        accountId: "account-basic",
        status: "DRAFT",
        categoryData: { cardCategory: "WEDDING", groom: { fullName: "Anh" }, bride: { fullName: "Em" } },
        plan: { code: "BASIC", durationDays: 180 },
        template: { isPremium: false },
        photos: [],
      });

      prismaMock.card.update.mockImplementation(async ({ data }: any) => ({
        id: "card-basic-1",
        ...data,
      }));

      const published = await CardService.publishCard("account-basic", "card-basic-1");

      expect(published.status).toBe("ACTIVE");
      expect(published.expiredAt).toBeNull(); // Spec 23/09: paid publish stays forever
    });

    it("sets finite expiredAt from backend FREE duration for FREE plan first publish", async () => {
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
        id: "card-free-1",
        accountId: "account-free",
        status: "DRAFT",
        publishedAt: null,
        expiredAt: null,
        categoryData: { cardCategory: "WEDDING", groom: { fullName: "Anh" }, bride: { fullName: "Em" } },
        plan: { code: "FREE", durationDays: 7 },
        template: { isPremium: false },
        photos: [],
      });

      prismaMock.plan.findUnique.mockResolvedValueOnce({
        durationDays: 7,
      });

      prismaMock.card.update.mockImplementation(async ({ data }: any) => ({
        id: "card-free-1",
        ...data,
      }));

      const published = await CardService.publishCard("account-free", "card-free-1");

      expect(published.status).toBe("ACTIVE");
      expect(published.expiredAt).toBeInstanceOf(Date);
      expect(published.expiredAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it("does not extend expiration on repeated publish call for an already active card", async () => {
      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: "account-free",
        currentPlanId: "plan-free-id",
        currentPlan: {
          id: "plan-free-id",
          code: "FREE",
          name: "FREE",
          maxPhotos: 5,
          allowPremiumTemplates: false,
        },
      });

      const fixedExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const existingActiveCard = {
        id: "card-active",
        accountId: "account-free",
        status: "ACTIVE",
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        expiredAt: fixedExpiry,
      };

      prismaMock.card.findFirst.mockResolvedValueOnce(existingActiveCard);

      const res = await CardService.publishCard("account-free", "card-active");

      expect(res.status).toBe("ACTIVE");
      expect(prismaMock.card.update).not.toHaveBeenCalled();
    });
  });

  describe("Draft publish restrictions after downgrade", () => {
    it("rejects draft publish if template is premium and account downgraded to FREE", async () => {
      // Account downgraded to FREE
      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: "account-downgraded",
        currentPlanId: "plan-free-id",
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
        id: "card-premium-draft",
        accountId: "account-downgraded",
        status: "DRAFT",
        categoryData: { groomName: "Anh", brideName: "Em", weddingDate: "2026-10-10" },
        template: { isPremium: true },
        photos: [],
      });

      await expect(
        CardService.publishCard("account-downgraded", "card-premium-draft")
      ).rejects.toSatisfy((err: unknown) => {
        expect(err).toBeInstanceOf(HttpError);
        const httpErr = err as HttpError;
        expect(httpErr.statusCode).toBe(400);
        expect(httpErr.code).toBe("TEMPLATE_UNAVAILABLE");
        return true;
      });
    });

    it("rejects draft publish if photos exceed current FREE quota after downgrade", async () => {
      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: "account-downgraded",
        currentPlanId: "plan-free-id",
        currentPlan: {
          id: "plan-free-id",
          code: "FREE",
          name: "Gói Miễn Phí",
          maxPhotos: 5,
          allowPremiumTemplates: true,
        },
      });

      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-over-photo-draft",
        accountId: "account-downgraded",
        status: "DRAFT",
        categoryData: { groomName: "Anh", brideName: "Em", weddingDate: "2026-10-10" },
        template: { isPremium: false },
        photos: [{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }, { id: "p5" }, { id: "p6" }],
      });

      await expect(
        CardService.publishCard("account-downgraded", "card-over-photo-draft")
      ).rejects.toSatisfy((err: unknown) => {
        expect(err).toBeInstanceOf(HttpError);
        const httpErr = err as HttpError;
        expect(httpErr.statusCode).toBe(400);
        expect(httpErr.code).toBe("PHOTO_LIMIT_EXCEEDED");
        return true;
      });
    });

    it("rejects publish if card is EXPIRED under FREE plan", async () => {
      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: "account-free",
        currentPlanId: "plan-free-id",
        currentPlan: {
          id: "plan-free-id",
          code: "FREE",
          name: "Gói Miễn Phí",
          maxPhotos: 5,
          allowPremiumTemplates: false,
        },
      });

      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-expired",
        accountId: "account-free",
        status: "EXPIRED",
        categoryData: { groomName: "A", brideName: "B" },
      });

      await expect(
        CardService.publishCard("account-free", "card-expired")
      ).rejects.toThrow("Thiệp FREE đã hết hạn");
    });

    it("rejects publish if card is ARCHIVED", async () => {
      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: "account-free",
        currentPlanId: "plan-free-id",
        currentPlan: {
          id: "plan-free-id",
          code: "FREE",
          name: "Gói Miễn Phí",
          maxPhotos: 5,
          allowPremiumTemplates: false,
        },
      });

      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-archived",
        accountId: "account-free",
        status: "ARCHIVED",
      });

      await expect(
        CardService.publishCard("account-free", "card-archived")
      ).rejects.toThrow("Vui lòng khôi phục thiệp");
    });
  });

  describe("Public viewing of paid cards after account downgrade", () => {
    it("allows public viewing of a card published under paid plan (expiredAt=null) even after account downgraded to FREE", async () => {
      // Step 1: getCardBySlug checks card identity with active status and expiredAt=null
      prismaMock.card.findFirst
        .mockResolvedValueOnce({
          id: "card-published-when-paid",
          accountId: "account-now-free",
        })
        .mockResolvedValueOnce({
          id: "card-published-when-paid",
          accountId: "account-now-free",
          slug: "dam-cuoi-anh-em",
          status: "ACTIVE",
          expiredAt: null,
          categoryData: {},
          template: { category: "WEDDING", slug: "minimalist" },
        });

      prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: "account-now-free",
        currentPlanId: "free-id",
        currentPlan: {
          id: "free-id",
          code: "FREE",
          name: "FREE",
          maxPhotos: 5,
          allowPremiumTemplates: false,
        },
      });

      const result = await CardService.getCardBySlug("dam-cuoi-anh-em");

      expect(result).not.toBeNull();
      expect(result?.card.id).toBe("card-published-when-paid");
      expect(result?.card.status).toBe("ACTIVE");
      expect(result?.card.expiredAt).toBeNull();
      expect(result?.features.vipOpeningExperience).toBe(false); // VIP experience relies on current account plan
    });
  });

  describe("Legacy card expiry audit tool", () => {
    it("accurately identifies cards published under paid orders vs genuine free cards", async () => {
      const mockCards = [
        {
          id: "c-paid-1",
          accountId: "acc-paid-1",
          slug: "paid-wedding",
          status: "ACTIVE",
          publishedAt: new Date("2026-05-01"),
          expiredAt: new Date("2026-06-01"), // Legacy bug had set expiry
          account: {
            orders: [
              {
                id: "ord-1",
                status: "PAID",
                paidAt: new Date("2026-04-30"),
                plan: { code: "BASIC" },
              },
            ],
          },
        },
        {
          id: "c-free-1",
          accountId: "acc-free-1",
          slug: "free-wedding",
          status: "ACTIVE",
          publishedAt: new Date("2026-05-10"),
          expiredAt: new Date("2026-05-17"),
          account: {
            orders: [], // No paid orders
          },
        },
        {
          id: "c-ambiguous-1",
          accountId: "acc-ambiguous-1",
          slug: "ambiguous-wedding",
          status: "ACTIVE",
          publishedAt: null, // Missing publish date
          expiredAt: new Date("2026-05-17"),
          account: {
            orders: [
              {
                id: "ord-2",
                status: "PAID",
                paidAt: new Date("2026-04-30"),
                plan: { code: "BASIC" },
              },
            ],
          },
        },
      ];

      prismaMock.card.findMany.mockResolvedValueOnce(mockCards);

      const report = await auditCardExpiryCandidates(prismaMock as any);

      expect(report.totalActiveCardsWithExpiry).toBe(3);
      expect(report.candidatesToClearExpiry).toHaveLength(1);
      expect(report.candidatesToClearExpiry[0].cardId).toBe("c-paid-1");
      expect(report.candidatesToClearExpiry[0].evidence.orderId).toBe("ord-1");

      expect(report.validFreeCards).toHaveLength(1);
      expect(report.validFreeCards[0].cardId).toBe("c-free-1");

      expect(report.ambiguousCards).toHaveLength(1);
      expect(report.ambiguousCards[0].cardId).toBe("c-ambiguous-1");
    });
  });
});
