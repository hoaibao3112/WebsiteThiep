import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  accountMember: { findUnique: vi.fn() },
  account: {
    findUniqueOrThrow: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  orderRequest: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  order: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  ...db,
  $transaction: vi.fn(async (callback: (tx: typeof db) => Promise<unknown>) => callback(db)),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/vietqr", () => ({ generateVietQrUrl: () => "https://vietqr.test/sample.png" }));
vi.mock("../../src/services/account-entitlement.service", () => ({
  AccountEntitlementService: {
    getEffectivePlan: vi.fn(),
  },
}));

import { AddonService } from "../../src/services/addon.service";
import { AccountEntitlementService } from "../../src/services/account-entitlement.service";
import { HttpError } from "../../src/lib/http-error";

describe("AddonService Test Suite", () => {
  const accountId = "acc-test-123";
  const userId = "usr-owner-456";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BANK_CODE = "MB";
    process.env.BANK_ACCOUNT = "0988888888";
    process.env.BANK_ACCOUNT_NAME = "NGUYEN VAN A";

    db.accountMember.findUnique.mockResolvedValue({ role: "OWNER" });
    db.account.findUniqueOrThrow.mockResolvedValue({
      extraCards: 0,
      extraPhotos: 0,
      extraViews: 0,
      extraDomains: 0,
      extraProfiles: 0,
      planExpiresAt: null,
    });
  });

  describe("getCatalog", () => {
    it("returns catalog for unauthenticated visitor with all items eligible", async () => {
      const res = await AddonService.getCatalog();
      expect(res.accountQuota).toBeNull();
      expect(res.items.length).toBeGreaterThan(0);
      expect(res.items.every((i) => i.isEligible)).toBe(true);
    });

    it("evaluates eligibility correctly for VIP accounts", async () => {
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        planCode: "VIP",
        planName: "Gói VIP",
        capabilities: { allowCustomDomain: true },
      } as any);

      const res = await AddonService.getCatalog(accountId);
      expect(res.accountQuota?.currentPlanCode).toBe("VIP");

      const timeAddon = res.items.find((i) => i.code === "ADDON_EXTEND_6M");
      expect(timeAddon?.isEligible).toBe(false);
      expect(timeAddon?.ineligibilityReason).toContain("Gói VIP có thời hạn vĩnh viễn");

      const domainAddon = res.items.find((i) => i.code === "ADDON_DOMAIN_1");
      expect(domainAddon?.isEligible).toBe(true);
    });

    it("evaluates eligibility correctly for FREE accounts", async () => {
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        planCode: "FREE",
        planName: "Gói Dùng Thử",
        capabilities: { allowCustomDomain: false },
      } as any);

      const res = await AddonService.getCatalog(accountId);
      expect(res.accountQuota?.currentPlanCode).toBe("FREE");

      const timeAddon = res.items.find((i) => i.code === "ADDON_EXTEND_6M");
      expect(timeAddon?.isEligible).toBe(false);
      expect(timeAddon?.ineligibilityReason).toContain("chỉ áp dụng cho Gói Tiêu Chuẩn");

      const domainAddon = res.items.find((i) => i.code === "ADDON_DOMAIN_1");
      expect(domainAddon?.isEligible).toBe(false);
      expect(domainAddon?.ineligibilityReason).toContain("Cần nâng cấp lên gói trả phí");

      const cardAddon = res.items.find((i) => i.code === "ADDON_CARDS_1");
      expect(cardAddon?.isEligible).toBe(true);
    });

    it("evaluates eligibility correctly for BASIC accounts", async () => {
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        planCode: "BASIC",
        planName: "Gói Tiêu Chuẩn",
        capabilities: { allowCustomDomain: false },
      } as any);

      const res = await AddonService.getCatalog(accountId);
      expect(res.accountQuota?.currentPlanCode).toBe("BASIC");

      const timeAddon = res.items.find((i) => i.code === "ADDON_EXTEND_6M");
      expect(timeAddon?.isEligible).toBe(true);

      const domainAddon = res.items.find((i) => i.code === "ADDON_DOMAIN_1");
      expect(domainAddon?.isEligible).toBe(true);
    });
  });

  describe("createAddonOrder", () => {
    it("rejects non-owner callers with 403", async () => {
      db.accountMember.findUnique.mockResolvedValueOnce({ role: "MEMBER" });

      await expect(
        AddonService.createAddonOrder(userId, accountId, "ADDON_CARDS_1", "key-1")
      ).rejects.toThrowError(HttpError);
    });

    it("rejects non-existent addonCode with 404", async () => {
      db.orderRequest.findUnique.mockResolvedValueOnce(null);

      await expect(
        AddonService.createAddonOrder(userId, accountId, "ADDON_NON_EXISTENT", "key-1")
      ).rejects.toThrow(/không tồn tại/i);
    });

    it("rejects VIP buying ADDON_EXTEND_6M with 400", async () => {
      db.orderRequest.findUnique.mockResolvedValueOnce(null);
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        planCode: "VIP",
        planName: "Gói VIP",
      } as any);

      await expect(
        AddonService.createAddonOrder(userId, accountId, "ADDON_EXTEND_6M", "key-1")
      ).rejects.toThrow(/Gói VIP có thời hạn vĩnh viễn/i);
    });

    it("rejects FREE buying ADDON_EXTEND_6M with 400", async () => {
      db.orderRequest.findUnique.mockResolvedValueOnce(null);
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        planCode: "FREE",
        planName: "Gói Dùng Thử",
      } as any);

      await expect(
        AddonService.createAddonOrder(userId, accountId, "ADDON_EXTEND_6M", "key-1")
      ).rejects.toThrow(/chỉ áp dụng cho Gói Tiêu Chuẩn/i);
    });

    it("rejects FREE buying ADDON_DOMAIN_1 with 400", async () => {
      db.orderRequest.findUnique.mockResolvedValueOnce(null);
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        planCode: "FREE",
        planName: "Gói Dùng Thử",
      } as any);

      await expect(
        AddonService.createAddonOrder(userId, accountId, "ADDON_DOMAIN_1", "key-1")
      ).rejects.toThrow(/yêu cầu tài khoản nâng cấp lên gói trả phí/i);
    });

    it("replays existing order when same idempotencyKey is used", async () => {
      db.orderRequest.findUnique.mockResolvedValueOnce({
        addonCode: "ADDON_CARDS_1",
        order: {
          id: "ord-existing",
          orderCode: "THIEP123456",
          orderType: "ADDON",
          addonCode: "ADDON_CARDS_1",
          amount: 49000,
          status: "PENDING",
          expiredAt: new Date(Date.now() + 10000),
        },
      });

      const res = await AddonService.createAddonOrder(
        userId,
        accountId,
        "ADDON_CARDS_1",
        "key-replay"
      );

      expect(res.id).toBe("ord-existing");
      expect(db.order.create).not.toHaveBeenCalled();
    });

    it("throws 409 conflict when idempotencyKey was used for a different addon", async () => {
      db.orderRequest.findUnique.mockResolvedValueOnce({
        addonCode: "ADDON_CARDS_1",
        order: { id: "ord-1" },
      });

      await expect(
        AddonService.createAddonOrder(userId, accountId, "ADDON_PHOTOS_10", "key-conflict")
      ).rejects.toThrowError(HttpError);
    });

    it("deduplicates active pending order for the same addon", async () => {
      db.orderRequest.findUnique.mockResolvedValueOnce(null);
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        planCode: "BASIC",
      } as any);
      db.order.findFirst.mockResolvedValueOnce({
        id: "ord-pending-same",
        orderCode: "THIEP999999",
        orderType: "ADDON",
        addonCode: "ADDON_CARDS_1",
        amount: 49000,
        status: "PENDING",
        expiredAt: new Date(Date.now() + 100000),
      });

      const res = await AddonService.createAddonOrder(
        userId,
        accountId,
        "ADDON_CARDS_1",
        "key-new"
      );

      expect(res.id).toBe("ord-pending-same");
      expect(db.order.create).not.toHaveBeenCalled();
    });

    it("cleans up stale expired orders and creates a new order successfully", async () => {
      db.orderRequest.findUnique.mockResolvedValueOnce(null);
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        planCode: "BASIC",
      } as any);
      db.order.findFirst.mockResolvedValueOnce(null);

      db.order.create.mockResolvedValueOnce({
        id: "ord-new-123",
        orderCode: "THIEP888888",
        orderType: "ADDON",
        addonCode: "ADDON_CARDS_2",
        amount: 69000,
        status: "PENDING",
        expiredAt: new Date(Date.now() + 48 * 3600 * 1000),
        createdAt: new Date(),
      });

      const res = await AddonService.createAddonOrder(
        userId,
        accountId,
        "ADDON_CARDS_2",
        "key-brand-new"
      );

      // Verify stale orders were marked as EXPIRED
      expect(db.order.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            accountId,
            orderType: "ADDON",
            status: "PENDING",
          }),
          data: { status: "EXPIRED" },
        })
      );

      expect(res.id).toBe("ord-new-123");
      expect(res.amount).toBe(69000);
      expect(res.paymentInfo.qrUrl).toBe("https://vietqr.test/sample.png");
    });
  });

  describe("fulfillAddon", () => {
    const txMock = db as any;

    it("increments extraCards for EXTRA_CARDS addon", async () => {
      await AddonService.fulfillAddon(
        { accountId, addonCode: "ADDON_CARDS_5", amount: 159000 },
        txMock
      );

      expect(txMock.account.update).toHaveBeenCalledWith({
        where: { id: accountId },
        data: { extraCards: { increment: 5 } },
      });
    });

    it("increments extraPhotos for EXTRA_PHOTOS addon", async () => {
      await AddonService.fulfillAddon(
        { accountId, addonCode: "ADDON_PHOTOS_10", amount: 59000 },
        txMock
      );

      expect(txMock.account.update).toHaveBeenCalledWith({
        where: { id: accountId },
        data: { extraPhotos: { increment: 10 } },
      });
    });

    it("increments extraDomains for EXTRA_DOMAINS addon", async () => {
      await AddonService.fulfillAddon(
        { accountId, addonCode: "ADDON_DOMAIN_3", amount: 150000 },
        txMock
      );

      expect(txMock.account.update).toHaveBeenCalledWith({
        where: { id: accountId },
        data: { extraDomains: { increment: 3 } },
      });
    });

    it("extends planExpiresAt for DAYS addon", async () => {
      const now = new Date();
      const futureExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      txMock.account.findUniqueOrThrow.mockResolvedValueOnce({
        planExpiresAt: futureExpiry,
      });

      await AddonService.fulfillAddon(
        { accountId, addonCode: "ADDON_EXTEND_6M", amount: 59000 },
        txMock
      );

      expect(txMock.account.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: accountId },
          data: expect.objectContaining({
            planExpiresAt: expect.any(Date),
          }),
        })
      );
    });
  });
});
