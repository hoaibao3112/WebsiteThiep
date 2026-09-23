import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  accountMember: { findUnique: vi.fn() },
  account: { findUnique: vi.fn(), updateMany: vi.fn() },
  plan: { findFirst: vi.fn() },
  order: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
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
import { Prisma } from "@prisma/client";

describe("OrderService.createOrder authorization & validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.BANK_CODE = "970407";
    process.env.BANK_ACCOUNT = "123456789";
    process.env.BANK_ACCOUNT_NAME = "TEST MERCHANT";

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
      OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "idem-key-1"),
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
      OrderService.createOrder("user-1", "acc-1", { planCode: "VIP" }, "idem-key-1"),
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
      }),
    );
  });
});
