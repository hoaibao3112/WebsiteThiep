import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  order: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
  },
  plan: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
  paymentTransaction: {
    create: vi.fn(),
  },
  account: {
    findUniqueOrThrow: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  card: {
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));

import { OrderService } from "../../src/services/order.service";
import { ManualPaymentReviewService } from "../../src/services/manual-payment-review.service";

describe("Order Expiry & Approval SLA Flow", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<unknown>) => {
      return callback(prismaMock);
    });
  });

  it("chỉ expire đơn PENDING, không expire đơn AWAITING_REVIEW dù đã quá hạn expiredAt", async () => {
    const pastDate = new Date(Date.now() - 72 * 60 * 60 * 1000); // 72 tiếng trước

    const awaitingOrder = {
      id: "order-submitted-47h",
      accountId: "acc-1",
      orderCode: "THIEP99999",
      amount: 399000,
      status: "AWAITING_REVIEW",
      expiredAt: pastDate,
      submittedAt: new Date(Date.now() - 70 * 60 * 60 * 1000),
      planId: "vip-plan-id",
      plan: { code: "VIP", name: "VIP Plan", durationDays: null },
      createdAt: new Date(Date.now() - 75 * 60 * 60 * 1000),
    };

    prismaMock.order.findFirst.mockResolvedValueOnce(awaitingOrder);

    const result = await OrderService.getAccountOrder("acc-1", "order-submitted-47h");

    // Không được gọi updateMany để expire đơn AWAITING_REVIEW
    expect(prismaMock.order.updateMany).not.toHaveBeenCalled();
    expect(result?.status).toBe("AWAITING_REVIEW");
  });

  it("cho phép Admin approve đơn AWAITING_REVIEW đã quá 72h từ lúc tạo", async () => {
    const orderCreatedAt = new Date(Date.now() - 75 * 60 * 60 * 1000);
    const orderExpiredAt = new Date(Date.now() - 27 * 60 * 60 * 1000); // Hết hạn từ 27 tiếng trước

    const orderInDb = {
      id: "order-late-review",
      accountId: "acc-1",
      planId: "vip-plan",
      orderCode: "THIEP12345",
      amount: 399000,
      status: "AWAITING_REVIEW",
      createdAt: orderCreatedAt,
      expiredAt: orderExpiredAt,
      submittedAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
      plan: { code: "VIP", name: "VIP Plan", durationDays: null },
    };

    // Bước 1: tx.order.updateMany transition sang PAID thành công (count = 1)
    prismaMock.order.updateMany.mockResolvedValueOnce({ count: 1 });
    // Bước 2: tx.order.findUniqueOrThrow
    prismaMock.order.findUniqueOrThrow.mockResolvedValueOnce(orderInDb);
    // Bước 3: tx.account.findUniqueOrThrow
    prismaMock.account.findUniqueOrThrow.mockResolvedValueOnce({
      id: "acc-1",
      planId: "free-plan",
      plan: { code: "FREE" },
    });
    // Plan lookup in entitlement check
    prismaMock.plan.findUnique.mockResolvedValue({
      id: "free-plan",
      code: "FREE",
      name: "Free Plan",
      price: 0,
      durationDays: null,
      isActive: true,
    });
    // Bước 4: tx.paymentTransaction.create
    prismaMock.paymentTransaction.create.mockResolvedValueOnce({ id: "tx-1" });
    // Bước 5: tx.account.update
    prismaMock.account.update.mockResolvedValueOnce({ id: "acc-1" });
    // Bước 6: tx.card.updateMany
    prismaMock.card.updateMany.mockResolvedValue({ count: 1 });

    // Mock getOrderDetail sau khi commit transaction
    vi.spyOn(ManualPaymentReviewService, "getOrderDetail").mockResolvedValueOnce({
      id: "order-late-review",
      accountId: "acc-1",
      accountName: "Owner Name",
      accountEmail: "owner@test.com",
      orderCode: "THIEP12345",
      planId: "vip-plan",
      planCode: "VIP",
      planName: "VIP Plan",
      amount: 399000,
      status: "PAID",
      createdAt: orderCreatedAt,
      expiredAt: orderExpiredAt,
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedByEmail: "admin@test.com",
      reviewNote: "Duyệt sau cuối tuần",
      paymentTransaction: null,
    });

    const approvedDetail = await ManualPaymentReviewService.approveOrder(
      "order-late-review",
      "admin-user-id",
      {
        receivedAmount: 399000,
        bankReference: "VCB.999888",
        note: "Duyệt sau cuối tuần",
      }
    );

    expect(approvedDetail).toBeDefined();
    expect(approvedDetail.status).toBe("PAID");
    // Xác nhận updateMany không còn điều kiện expiredAt > now
    expect(prismaMock.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: "order-late-review",
        status: "AWAITING_REVIEW",
      },
      data: expect.objectContaining({
        status: "PAID",
        reviewedById: "admin-user-id",
      }),
    });
  });
});
