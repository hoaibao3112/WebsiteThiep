import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  accountMember: { findUnique: vi.fn() },
  account: { findUnique: vi.fn(), updateMany: vi.fn() },
  plan: { findFirst: vi.fn() },
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
  $transaction: vi.fn(),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/vietqr", () => ({ generateVietQrUrl: () => "https://qr.test" }));
vi.mock("../../src/services/account-entitlement.service", () => ({
  AccountEntitlementService: {
    getEffectivePlan: vi.fn(),
  },
}));

import { OrderService } from "../../src/services/order.service";
import { AccountEntitlementService } from "../../src/services/account-entitlement.service";
import { HttpError } from "../../src/lib/http-error";

describe("OrderService.createOrder authorization, validation & persistent idempotency", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.BANK_CODE = "970407";
    process.env.BANK_ACCOUNT = "123456789";
    process.env.BANK_ACCOUNT_NAME = "TEST MERCHANT";

    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<any>) => {
      return callback(prismaMock);
    });

    prismaMock.accountMember.findUnique.mockResolvedValue({
      role: "OWNER",
    });

    vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValue({
      planCode: "FREE",
      planName: "Gói Dùng Thử",
      isPaid: false,
      isExpired: false,
      daysRemaining: null,
      planExpiresAt: null,
      capabilities: {
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      },
    });

    prismaMock.plan.findFirst.mockResolvedValue({
      id: "vip-plan-id",
      code: "VIP",
      name: "Gói Cao Cấp",
      price: 399000,
      durationDays: null,
      isActive: true,
    });

    prismaMock.orderRequest.findUnique.mockResolvedValue(null);
    prismaMock.order.findUnique.mockResolvedValue(null);
    prismaMock.order.findFirst.mockResolvedValue(null);
    prismaMock.order.create.mockResolvedValue({
      id: "order-1",
      orderCode: "THIEP123456",
      amount: 399000,
      status: "PENDING",
      expiredAt: new Date(Date.now() + 48 * 3600 * 1000),
      plan: { code: "VIP", name: "Gói Cao Cấp" },
    });
  });

  it("verifies the user is OWNER of the account", async () => {
    await OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "idem-key-1");

    expect(prismaMock.accountMember.findUnique).toHaveBeenCalledWith({
      where: { accountId_userId: { accountId: "acc-1", userId: "user-1" } },
      select: { role: true },
    });
  });

  it("rejects non-OWNER members with 403 FORBIDDEN", async () => {
    prismaMock.accountMember.findUnique.mockResolvedValue({
      role: "MEMBER",
    });

    await expect(
      OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "idem-key-1")
    ).rejects.toMatchObject({ status: 403, code: "OWNER_REQUIRED" });
  });

  it("rejects ordering when account already has active VIP", async () => {
    vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValue({
      planCode: "VIP",
      planName: "Gói Cao Cấp",
      isPaid: true,
      isExpired: false,
      daysRemaining: null,
      planExpiresAt: null,
      capabilities: {} as any,
    });

    await expect(
      OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "idem-key-1")
    ).rejects.toMatchObject({ status: 409, code: "ALREADY_VIP" });
  });

  it("uses backend-authoritative price from plan query", async () => {
    await OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "idem-key-1");

    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 399000,
          paymentGateway: "MANUAL",
        }),
      })
    );
    expect(prismaMock.orderRequest.create).toHaveBeenCalledWith({
      data: {
        accountId: "acc-1",
        idempotencyKey: "idem-key-1",
        planCode: "VIP",
        orderId: "order-1",
      },
    });
  });

  describe("Persistent OrderRequest Idempotency & Reuse", () => {
    it("replays the existing order when retried with same key and same plan", async () => {
      const existingOrder = {
        id: "order-locked-1",
        orderCode: "THIEPLOCKED",
        amount: 399000,
        status: "PENDING",
        expiredAt: new Date(Date.now() + 24 * 3600 * 1000),
        plan: { code: "VIP", name: "Gói Cao Cấp" },
      };

      prismaMock.orderRequest.findUnique.mockResolvedValueOnce({
        id: "req-1",
        accountId: "acc-1",
        idempotencyKey: "idem-repeat",
        planCode: "VIP",
        orderId: "order-locked-1",
        order: existingOrder,
      });

      const result = await OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "idem-repeat");

      expect(result.replayed).toBe(true);
      expect(result.order.id).toBe("order-locked-1");
      expect(result.paymentInfo.orderCode).toBe("THIEPLOCKED");
      expect(result.paymentInfo.pollingToken).toBeNull();
      // Early lookup skipped new plan creation
      expect(prismaMock.order.create).not.toHaveBeenCalled();
    });

    it("replays existing order even if account is now VIP or catalog price changed", async () => {
      const existingOrder = {
        id: "order-paid-earlier",
        orderCode: "THIEPPAID",
        amount: 299000, // Legacy locked price
        status: "PAID",
        expiredAt: new Date(),
        plan: { code: "VIP", name: "Gói Cao Cấp" },
      };

      prismaMock.orderRequest.findUnique.mockResolvedValueOnce({
        id: "req-paid",
        accountId: "acc-1",
        idempotencyKey: "idem-paid-earlier",
        planCode: "VIP",
        orderId: "order-paid-earlier",
        order: existingOrder,
      });

      // Even if account is already VIP, early lookup succeeds
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        planCode: "VIP",
        planName: "VIP",
        isPaid: true,
        isExpired: false,
        daysRemaining: null,
        planExpiresAt: null,
        capabilities: {} as any,
      });

      const result = await OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "idem-paid-earlier");

      expect(result.replayed).toBe(true);
      expect(result.order.status).toBe("PAID");
      expect(result.order.amount).toBe(299000); // Original price preserved
    });

    it("throws 409 IDEMPOTENCY_CONFLICT when key is reused with a different plan", async () => {
      prismaMock.orderRequest.findUnique.mockResolvedValueOnce({
        id: "req-2",
        accountId: "acc-1",
        idempotencyKey: "idem-clash",
        planCode: "BASIC", // previously ordered BASIC with this key
        orderId: "order-basic",
        order: { id: "order-basic" },
      });

      await expect(
        OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "idem-clash")
      ).rejects.toMatchObject({
        status: 409,
        code: "IDEMPOTENCY_CONFLICT",
      });
    });

    it("reuses an active unexpired order and creates new OrderRequest mapping for a second key", async () => {
      const activeUnexpiredOrder = {
        id: "order-active-1",
        orderCode: "THIEPACTIVE",
        amount: 399000,
        status: "PENDING",
        expiredAt: new Date(Date.now() + 40 * 3600 * 1000),
        plan: { code: "VIP", name: "Gói Cao Cấp" },
      };

      // Key K2 has no previous mapping
      prismaMock.orderRequest.findUnique.mockResolvedValue(null);
      // But active order O1 exists for this account & VIP plan
      prismaMock.order.findFirst.mockResolvedValueOnce(activeUnexpiredOrder);

      const result = await OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "key-k2");

      expect(result.replayed).toBe(true);
      expect(result.order.id).toBe("order-active-1");
      expect(prismaMock.order.create).not.toHaveBeenCalled();
      // Mapping for K2 -> O1 recorded
      expect(prismaMock.orderRequest.create).toHaveBeenCalledWith({
        data: {
          accountId: "acc-1",
          idempotencyKey: "key-k2",
          planCode: "VIP",
          orderId: "order-active-1",
        },
      });
    });
  });
});
