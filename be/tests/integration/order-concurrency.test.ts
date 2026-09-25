import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  accountMember: { findUnique: vi.fn() },
  plan: { findFirst: vi.fn() },
  orderRequest: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  order: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));
vi.mock("../../src/lib/vietqr", () => ({ generateVietQrUrl: () => "https://qr.test/mock" }));
vi.mock("../../src/services/account-entitlement.service", () => ({
  AccountEntitlementService: {
    getEffectivePlan: vi.fn(),
  },
}));

import { OrderService } from "../../src/services/order.service";
import { AccountEntitlementService } from "../../src/services/account-entitlement.service";
import { HttpError } from "../../src/lib/http-error";

describe("Order concurrency and idempotency alias integration contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BANK_CODE = "970407";
    process.env.BANK_ACCOUNT = "123456789";
    process.env.BANK_ACCOUNT_NAME = "TEST MERCHANT";

    db.$transaction.mockImplementation(async (callback: (tx: typeof db) => Promise<any>) => {
      return callback(db);
    });

    db.accountMember.findUnique.mockResolvedValue({
      role: "OWNER",
    });

    vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValue({
      planCode: "FREE",
      planName: "Gói FREE",
      isPaid: false,
      isExpired: false,
      daysRemaining: null,
      planExpiresAt: null,
      capabilities: {} as any,
    });

    db.plan.findFirst.mockResolvedValue({
      id: "vip-plan-id",
      code: "VIP",
      name: "VIP",
      price: 399000,
      durationDays: null,
      isActive: true,
    });
  });

  it("handles K1 creates O1, K2 reuses O1, and subsequent retries both return O1", async () => {
    const o1 = {
      id: "o-1",
      orderCode: "THIEPO1",
      amount: 399000,
      status: "PENDING",
      expiredAt: new Date(Date.now() + 48 * 3600 * 1000),
      plan: { code: "VIP", name: "VIP" },
    };

    // Step 1: K1 creates O1
    db.orderRequest.findUnique.mockResolvedValueOnce(null); // K1 not found
    db.order.findFirst.mockResolvedValueOnce(null); // No active order
    db.order.create.mockResolvedValueOnce(o1);

    const resK1 = await OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "k1");
    expect(resK1.order.id).toBe("o-1");
    expect(resK1.replayed).toBe(false);

    // Step 2: K2 arrives while O1 is active -> reuses O1 and records mapping for K2
    db.orderRequest.findUnique.mockResolvedValueOnce(null); // K2 not found
    db.order.findFirst.mockResolvedValueOnce(o1); // O1 is found active

    const resK2 = await OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "k2");
    expect(resK2.order.id).toBe("o-1");
    expect(resK2.replayed).toBe(true);
    expect(db.orderRequest.create).toHaveBeenCalledWith({
      data: {
        accountId: "acc-1",
        idempotencyKey: "k2",
        planCode: "VIP",
        orderId: "o-1",
      },
    });

    // Step 3: O1 is paid/approved
    const o1Approved = { ...o1, status: "PAID", paidAt: new Date() };

    // Step 4: Retry K1 returns approved O1
    db.orderRequest.findUnique.mockResolvedValueOnce({
      id: "req-k1",
      accountId: "acc-1",
      idempotencyKey: "k1",
      planCode: "VIP",
      orderId: "o-1",
      order: o1Approved,
    });
    const resK1Retry = await OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "k1");
    expect(resK1Retry.order.id).toBe("o-1");
    expect(resK1Retry.order.status).toBe("PAID");

    // Step 5: Retry K2 returns approved O1
    db.orderRequest.findUnique.mockResolvedValueOnce({
      id: "req-k2",
      accountId: "acc-1",
      idempotencyKey: "k2",
      planCode: "VIP",
      orderId: "o-1",
      order: o1Approved,
    });
    const resK2Retry = await OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "k2");
    expect(resK2Retry.order.id).toBe("o-1");
    expect(resK2Retry.order.status).toBe("PAID");
  });

  it("permits same idempotency key across different tenants independently", async () => {
    // Tenant 1
    db.orderRequest.findUnique.mockResolvedValueOnce(null);
    db.order.findFirst.mockResolvedValueOnce(null);
    db.order.create.mockResolvedValueOnce({
      id: "order-tenant-1",
      orderCode: "THIEPT1",
      amount: 399000,
      status: "PENDING",
      expiredAt: new Date(Date.now() + 48 * 3600 * 1000),
      plan: { code: "VIP", name: "VIP" },
    });

    const resT1 = await OrderService.createOrder("user-t1", "acc-tenant-1", { planCode: "VIP" }, "shared-idem-key");
    expect(resT1.order.id).toBe("order-tenant-1");

    // Tenant 2
    db.orderRequest.findUnique.mockResolvedValueOnce(null);
    db.order.findFirst.mockResolvedValueOnce(null);
    db.order.create.mockResolvedValueOnce({
      id: "order-tenant-2",
      orderCode: "THIEPT2",
      amount: 399000,
      status: "PENDING",
      expiredAt: new Date(Date.now() + 48 * 3600 * 1000),
      plan: { code: "VIP", name: "VIP" },
    });

    const resT2 = await OrderService.createOrder("user-t2", "acc-tenant-2", { planCode: "VIP" }, "shared-idem-key");
    expect(resT2.order.id).toBe("order-tenant-2");
    expect(resT1.order.id).not.toBe(resT2.order.id);
  });

  it("rolls back transaction cleanly when an error occurs mid-transaction", async () => {
    db.orderRequest.findUnique.mockResolvedValueOnce(null);
    db.order.findFirst.mockResolvedValueOnce(null);
    db.order.create.mockRejectedValueOnce(new Error("Database write failure"));

    await expect(
      OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "fail-key")
    ).rejects.toThrow("Database write failure");

    expect(db.orderRequest.create).not.toHaveBeenCalled();
  });
});
