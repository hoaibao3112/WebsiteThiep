import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  account: {
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
  },
  plan: {
    findUnique: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import { AccountEntitlementService } from "../../src/services/account-entitlement.service";

describe("AccountEntitlementService", () => {
  const accountId = "acc-test-123";

  beforeEach(() => {
    vi.clearAllMocks();
    db.account.updateMany.mockResolvedValue({ count: 1 });
  });

  describe("calculateBasicActivation", () => {
    const durationDays = 180;
    const now = new Date("2026-06-01T00:00:00.000Z");

    it("bắt đầu từ now khi user chưa có plan hoặc dùng FREE", () => {
      const result = AccountEntitlementService.calculateBasicActivation(null, null, durationDays, now);
      expect(result.planStartedAt).toEqual(now);
      const expectedExpiry = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      expect(result.planExpiresAt).toEqual(expectedExpiry);
    });

    it("bắt đầu từ now khi user có BASIC nhưng đã hết hạn trong quá khứ", () => {
      const pastExpiry = new Date("2026-05-15T00:00:00.000Z");
      const result = AccountEntitlementService.calculateBasicActivation("BASIC", pastExpiry, durationDays, now);
      expect(result.planStartedAt).toEqual(now);
      const expectedExpiry = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      expect(result.planExpiresAt).toEqual(expectedExpiry);
    });

    it("gia hạn (extension): nối tiếp từ currentExpiresAt khi BASIC hiện tại vẫn còn hạn", () => {
      const futureExpiry = new Date("2026-07-01T00:00:00.000Z");
      const result = AccountEntitlementService.calculateBasicActivation("BASIC", futureExpiry, durationDays, now);
      expect(result.planStartedAt).toEqual(now);
      const expectedExpiry = new Date(futureExpiry.getTime() + 180 * 24 * 60 * 60 * 1000);
      expect(result.planExpiresAt).toEqual(expectedExpiry);
    });
  });

  describe("calculateVipActivation", () => {
    it("trả về planExpiresAt = null (vĩnh viễn / lifetime)", () => {
      const now = new Date("2026-06-01T00:00:00.000Z");
      const result = AccountEntitlementService.calculateVipActivation(now);
      expect(result.planStartedAt).toEqual(now);
      expect(result.planExpiresAt).toBeNull();
    });
  });

  describe("getEffectivePlan", () => {
    const now = new Date("2026-06-01T00:00:00.000Z");

    it("trả về FREE khi account chưa được gán plan nào", async () => {
      db.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: accountId,
        currentPlanId: null,
        planStartedAt: null,
        planExpiresAt: null,
        extraPhotos: 0,
        extraDomains: 0,
        currentPlan: null,
      });

      db.plan.findUnique.mockResolvedValueOnce({
        id: "plan-free",
        code: "FREE",
        name: "Gói Miễn Phí",
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      });

      const effective = await AccountEntitlementService.getEffectivePlan(accountId, now);
      expect(effective.planCode).toBe("FREE");
      expect(effective.isPaid).toBe(false);
      expect(effective.capabilities.hasWatermark).toBe(true);
      expect(effective.capabilities.maxPhotos).toBe(5);
    });

    it("trả về VIP trọn đời khi account sở hữu gói VIP (không có ngày hết hạn)", async () => {
      db.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: accountId,
        currentPlanId: "plan-vip",
        planStartedAt: new Date("2026-01-01"),
        planExpiresAt: null,
        extraPhotos: 0,
        extraDomains: 0,
        currentPlan: {
          id: "plan-vip",
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

      const effective = await AccountEntitlementService.getEffectivePlan(accountId, now);
      expect(effective.planCode).toBe("VIP");
      expect(effective.isPaid).toBe(true);
      expect(effective.isExpired).toBe(false);
      expect(effective.daysRemaining).toBeNull();
      expect(effective.capabilities.hasWatermark).toBe(false);
      expect(effective.capabilities.allowCustomDomain).toBe(true);
    });

    it("tính đúng daysRemaining cho gói BASIC đang còn hạn", async () => {
      const expiresAt = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // Còn 10 ngày
      db.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: accountId,
        currentPlanId: "plan-basic",
        planStartedAt: new Date("2026-01-01"),
        planExpiresAt: expiresAt,
        extraPhotos: 0,
        extraDomains: 0,
        currentPlan: {
          id: "plan-basic",
          code: "BASIC",
          name: "Gói Cơ Bản",
          maxPhotos: 20,
          hasWatermark: false,
          allowCustomDomain: false,
          allowMusicUpload: true,
          allowTelegramNoti: true,
          allowPremiumTemplates: false,
        },
      });

      const effective = await AccountEntitlementService.getEffectivePlan(accountId, now);
      expect(effective.planCode).toBe("BASIC");
      expect(effective.isPaid).toBe(true);
      expect(effective.isExpired).toBe(false);
      expect(effective.daysRemaining).toBe(10);
    });

    it("tự động hạ cấp (opportunistic downgrade) xuống FREE khi gói BASIC đã hết hạn", async () => {
      const expiredAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Hết hạn 2 ngày trước
      db.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: accountId,
        currentPlanId: "plan-basic",
        planStartedAt: new Date("2026-01-01"),
        planExpiresAt: expiredAt,
        extraPhotos: 0,
        extraDomains: 0,
        currentPlan: {
          id: "plan-basic",
          code: "BASIC",
          name: "Gói Cơ Bản",
          maxPhotos: 20,
          hasWatermark: false,
          allowCustomDomain: false,
          allowMusicUpload: true,
          allowTelegramNoti: true,
          allowPremiumTemplates: false,
        },
      });

      db.plan.findUnique.mockResolvedValue({
        id: "plan-free",
        code: "FREE",
        name: "Gói Miễn Phí",
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      });

      const effective = await AccountEntitlementService.getEffectivePlan(accountId, now);

      // Phải gọi updateMany để persist FREE trong database
      expect(db.account.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          id: accountId,
          currentPlanId: "plan-basic",
        }),
        data: expect.objectContaining({
          currentPlanId: "plan-free",
        }),
      }));

      expect(effective.planCode).toBe("FREE");
      expect(effective.isPaid).toBe(false);
    });

    it("cộng dồn quyền lợi bổ sung: extraPhotos và extraDomains vào capabilities", async () => {
      db.account.findUniqueOrThrow.mockResolvedValueOnce({
        id: accountId,
        currentPlanId: "plan-free",
        planStartedAt: null,
        planExpiresAt: null,
        extraPhotos: 15, // Mua thêm 15 ảnh
        extraDomains: 1, // Mua thêm 1 tên miền riêng
        currentPlan: {
          id: "plan-free",
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

      const effective = await AccountEntitlementService.getEffectivePlan(accountId, now);

      // maxPhotos phải là 5 + 15 = 20
      expect(effective.capabilities.maxPhotos).toBe(20);
      // allowCustomDomain mở khóa vì extraDomains > 0
      expect(effective.capabilities.allowCustomDomain).toBe(true);
    });
  });
});
