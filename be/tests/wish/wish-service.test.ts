import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  card: { findFirst: vi.fn() },
  wish: { create: vi.fn(), findMany: vi.fn() },
}));
vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/rate-limiter", () => ({ checkRateLimit: vi.fn() }));

import { WishService } from "../../src/services/wish.service";

describe("WishService public lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.card.findFirst.mockResolvedValue({ id: "card-1", accountId: "account-1", status: "ACTIVE" });
    prismaMock.wish.create.mockResolvedValue({ id: "wish-1" });
    prismaMock.wish.findMany.mockResolvedValue([]);
  });

  it("accepts submissions only for an active, unexpired card", async () => {
    await WishService.submitWish({
      cardId: "card-1",
      senderName: "An",
      content: "Chúc mừng",
      emoji: "❤",
    });

    expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
      where: {
        id: "card-1",
        status: "ACTIVE",
        OR: [{ expiredAt: null }, { expiredAt: { gt: expect.any(Date) } }],
      },
      select: { id: true, status: true, accountId: true },
    });
  });

  it("scopes public wish listing through the eligible card account", async () => {
    await WishService.listWishes("card-1");

    expect(prismaMock.wish.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { accountId: "account-1", cardId: "card-1", isApproved: true },
      select: {
        id: true,
        senderName: true,
        relationship: true,
        content: true,
        emoji: true,
        createdAt: true,
      },
    }));
  });

  it("projects public DTO on wish submission without ipAddress or accountId", async () => {
    prismaMock.wish.create.mockResolvedValueOnce({
      id: "wish-2",
      senderName: "Binh",
      relationship: "Bạn cô dâu",
      content: "Chúc hai bạn trăm năm hạnh phúc",
      emoji: "🎉",
      createdAt: new Date(),
    });

    const result = await WishService.submitWish(
      {
        cardId: "card-1",
        senderName: "Binh",
        relationship: "Bạn cô dâu",
        content: "Chúc hai bạn trăm năm hạnh phúc",
        emoji: "🎉",
      },
      { ipAddress: "192.168.1.100" }
    );

    expect(prismaMock.wish.create).toHaveBeenCalledWith({
      data: {
        accountId: "account-1",
        cardId: "card-1",
        senderName: "Binh",
        relationship: "Bạn cô dâu",
        content: "Chúc hai bạn trăm năm hạnh phúc",
        emoji: "🎉",
        isApproved: true,
        ipAddress: "192.168.1.100",
      },
      select: {
        id: true,
        senderName: true,
        relationship: true,
        content: true,
        emoji: true,
        createdAt: true,
      },
    });

    expect(result).not.toHaveProperty("ipAddress");
    expect(result).not.toHaveProperty("accountId");
    expect(result).toHaveProperty("id", "wish-2");
    expect(result).toHaveProperty("senderName", "Binh");
  });
});
