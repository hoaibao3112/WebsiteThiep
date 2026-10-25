import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  accountMember: { findUnique: vi.fn() },
  account: {
    findUniqueOrThrow: vi.fn(),
  },
  order: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  plan: {
    findMany: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));
vi.mock("../../src/lib/vietqr", () => ({ generateVietQrUrl: () => "https://vietqr.test/sample.png" }));
vi.mock("../../src/services/account-entitlement.service", () => ({
  AccountEntitlementService: {
    getEffectivePlan: vi.fn(),
  },
}));

import { BillingService } from "../../src/services/billing.service";
import { AccountEntitlementService } from "../../src/services/account-entitlement.service";

describe("BillingService Test Suite", () => {
  const accountId = "acc-billing-123";
  const userId = "usr-owner-456";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BANK_CODE = "MB";
    process.env.BANK_ACCOUNT = "0988888888";
    process.env.BANK_ACCOUNT_NAME = "NGUYEN VAN A";

    db.accountMember.findUnique.mockResolvedValue({ role: "OWNER" });
    db.order.updateMany.mockResolvedValue({ count: 0 });
    db.order.findFirst.mockResolvedValue(null);
  });

  describe("getPlanCatalog", () => {
    it("returns active plans sorted by sortOrder", async () => {
      db.plan.findMany.mockResolvedValue([
        { id: "p1", code: "FREE", name: "Miễn Phí", price: 0, sortOrder: 1 },
        { id: "p2", code: "VIP", name: "VIP", price: 199000, sortOrder: 2 },
      ]);

      const plans = await BillingService.getPlanCatalog();
      expect(plans).toHaveLength(2);
      expect(plans[0].code).toBe("FREE");
      expect(db.plan.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: expect.any(Object),
      });
    });
  });

  describe("getBillingSummary", () => {
    it("returns effective plan, account quotas, and paid orders history accurately", async () => {
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValue({
        planId: "p-vip",
        planCode: "VIP",
        planName: "Gói VIP",
        capabilities: {
          maxPhotos: 50,
          hasWatermark: false,
          allowCustomDomain: true,
          allowMusicUpload: true,
          allowTelegramNoti: true,
          allowPremiumTemplates: true,
        },
        planStartedAt: new Date("2026-01-01"),
        planExpiresAt: null,
        isExpired: false,
        isPaid: true,
        daysRemaining: null,
      });

      db.account.findUniqueOrThrow.mockResolvedValue({
        extraCards: 10,
        extraPhotos: 20,
        extraDomains: 1,
        extraViews: 500,
        extraProfiles: 0,
        planExpiresAt: null,
      });

      db.order.findMany.mockResolvedValue([
        {
          id: "ord-vip-1",
          orderCode: "THIEPVIP1001",
          orderType: "PLAN",
          amount: 199000,
          status: "PAID",
          paidAt: new Date("2026-02-01"),
          createdAt: new Date("2026-02-01"),
          plan: { code: "VIP", name: "Gói VIP Trọn Đời" },
          addonCode: null,
          addonMetadata: null,
        },
        {
          id: "ord-addon-2",
          orderCode: "THIEPADDON1002",
          orderType: "ADDON",
          amount: 50000,
          status: "PAID",
          paidAt: new Date("2026-02-10"),
          createdAt: new Date("2026-02-10"),
          plan: null,
          addonCode: "ADDON_CARDS_10",
          addonMetadata: { name: "+10 Thiệp Cưới Cao Cấp", badge: "+10 Thiệp" },
        },
      ]);

      const summary = await BillingService.getBillingSummary(accountId, userId);

      expect(summary.accountId).toBe(accountId);
      expect(summary.isOwner).toBe(true);
      expect(summary.effectivePlan.planCode).toBe("VIP");

      // Quota assertions
      expect(summary.accountQuota).toEqual({
        extraCards: 10,
        extraPhotos: 20,
        extraDomains: 1,
        extraViews: 500,
        extraProfiles: 0,
        planExpiresAt: null,
        totalAllowedCards: 12, // 2 base + 10 extra
        totalAllowedPhotos: 70, // 50 VIP + 20 extra
        totalAllowedDomains: 2, // 1 VIP + 1 extra
      });

      // Paid orders assertions
      expect(summary.paidOrders).toHaveLength(2);
      expect(summary.paidOrders[0]).toEqual({
        id: "ord-vip-1",
        orderCode: "THIEPVIP1001",
        orderType: "PLAN",
        itemName: "Gói VIP Trọn Đời",
        itemCode: "VIP",
        amount: 199000,
        paidAt: expect.any(Date),
        createdAt: expect.any(Date),
        status: "PAID",
        badge: "VIP",
      });
      expect(summary.paidOrders[1]).toEqual({
        id: "ord-addon-2",
        orderCode: "THIEPADDON1002",
        orderType: "ADDON",
        itemName: "+10 Thiệp Cưới Cao Cấp",
        itemCode: "ADDON_CARDS_10",
        amount: 50000,
        paidAt: expect.any(Date),
        createdAt: expect.any(Date),
        status: "PAID",
        badge: "+10 Thiệp",
      });
    });

    it("handles accounts without paid orders gracefully", async () => {
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValue({
        planId: "p-free",
        planCode: "FREE",
        planName: "Gói Miễn Phí",
        capabilities: {
          maxPhotos: 10,
          hasWatermark: true,
          allowCustomDomain: false,
          allowMusicUpload: false,
          allowTelegramNoti: false,
          allowPremiumTemplates: false,
        },
        planStartedAt: null,
        planExpiresAt: null,
        isExpired: false,
        isPaid: false,
        daysRemaining: null,
      });

      db.account.findUniqueOrThrow.mockResolvedValue({
        extraCards: 0,
        extraPhotos: 0,
        extraDomains: 0,
        extraViews: 0,
        extraProfiles: 0,
        planExpiresAt: null,
      });

      db.order.findMany.mockResolvedValue([]);

      const summary = await BillingService.getBillingSummary(accountId, userId);

      expect(summary.effectivePlan.planCode).toBe("FREE");
      expect(summary.accountQuota.totalAllowedCards).toBe(2);
      expect(summary.accountQuota.totalAllowedPhotos).toBe(10);
      expect(summary.accountQuota.totalAllowedDomains).toBe(0);
      expect(summary.paidOrders).toEqual([]);
    });
  });
});
