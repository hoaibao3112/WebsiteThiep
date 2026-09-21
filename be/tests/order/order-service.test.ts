import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  card: { findFirst: vi.fn(), update: vi.fn() },
  plan: { findFirst: vi.fn() },
  order: { findUnique: vi.fn(), create: vi.fn() },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/vietqr", () => ({ generateVietQrUrl: () => "https://qr.test" }));

import { OrderService } from "../../src/services/order.service";

describe("OrderService.createOrder authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.card.findFirst.mockResolvedValue({ id: "card-1", accountId: "account-1" });
    prismaMock.plan.findFirst.mockResolvedValue({
      id: "vip-plan",
      code: "VIP",
      price: 399000,
      isActive: true,
    });
    prismaMock.order.findUnique.mockResolvedValue(null);
    prismaMock.order.create.mockResolvedValue({ id: "order-1", orderCode: "THIEPABC123" });
  });

  it("authorizes the card by accountId and selects only an active plan", async () => {
    await OrderService.createOrder(
      "user-1",
      "account-1",
      { cardId: "card-1", planId: "vip-plan" },
      "0123456789abcdef",
    );

    expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
      where: { id: "card-1", accountId: "account-1" },
    });
    expect(prismaMock.plan.findFirst).toHaveBeenCalledWith({
      where: { id: "vip-plan", isActive: true },
    });
  });
});
