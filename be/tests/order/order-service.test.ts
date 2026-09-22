import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  card: { findFirst: vi.fn(), update: vi.fn() },
  plan: { findFirst: vi.fn() },
  order: { findUnique: vi.fn(), create: vi.fn() },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/vietqr", () => ({ generateVietQrUrl: () => "https://qr.test" }));

import { OrderService } from "../../src/services/order.service";
import { Prisma } from "@prisma/client";

describe("OrderService.createOrder authorization", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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

  it("returns a typed not-found error for a card outside the account", async () => {
    prismaMock.card.findFirst.mockResolvedValue(null);

    await expect(
      OrderService.createOrder(
        "user-1",
        "account-1",
        { cardId: "card-from-account-2", planId: "vip-plan" },
        "0123456789abcdef",
      ),
    ).rejects.toMatchObject({ status: 404, code: "CARD_NOT_FOUND" });
  });

  it("returns a conflict when an idempotency key is reused for another request", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "existing-order",
      cardId: "different-card",
      planId: "vip-plan",
      plan: { id: "vip-plan" },
    });

    await expect(
      OrderService.createOrder(
        "user-1",
        "account-1",
        { cardId: "card-1", planId: "vip-plan" },
        "0123456789abcdef",
      ),
    ).rejects.toMatchObject({ status: 409, code: "IDEMPOTENCY_CONFLICT" });
  });

  it("replays an order when a concurrent request wins the idempotency race", async () => {
    const existingOrder = {
      id: "existing-order",
      cardId: "card-1",
      planId: "vip-plan",
      plan: { id: "vip-plan" },
    };
    prismaMock.order.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingOrder);
    prismaMock.order.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("unique conflict", {
        code: "P2002",
        clientVersion: "5.22.0",
        meta: { target: ["accountId", "idempotencyKey"] },
      }),
    );

    const result = await OrderService.createOrder(
      "user-1",
      "account-1",
      { cardId: "card-1", planId: "vip-plan" },
      "0123456789abcdef",
    );

    expect(result).toEqual({ order: existingOrder, replayed: true });
    expect(prismaMock.order.create).toHaveBeenCalledOnce();
  });

  it("returns a typed unavailable error after order-code retries are exhausted", async () => {
    prismaMock.order.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("unique conflict", {
        code: "P2002",
        clientVersion: "5.22.0",
        meta: { target: ["orderCode"] },
      }),
    );

    await expect(
      OrderService.createOrder(
        "user-1",
        "account-1",
        { cardId: "card-1", planId: "vip-plan" },
        "0123456789abcdef",
      ),
    ).rejects.toMatchObject({
      status: 503,
      code: "ORDER_CREATE_RETRY_EXHAUSTED",
    });
    expect(prismaMock.order.create).toHaveBeenCalledTimes(3);
  });
});
