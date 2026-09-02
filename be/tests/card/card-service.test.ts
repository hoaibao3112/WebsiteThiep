import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  plan: { findFirst: vi.fn() },
  template: { findUnique: vi.fn() },
  card: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  cardEvent: { createMany: vi.fn() },
  cardPhoto: { createMany: vi.fn() },
}));

const prismaMock = vi.hoisted(() => ({
  ...db,
  $transaction: vi.fn(async (callback: (tx: typeof db) => Promise<unknown>) => callback(db)),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));

import { CardService } from "../../src/services/card.service";
import type { DraftCardInput } from "../../src/lib/validators/card";

const input: DraftCardInput = {
  slug: "minh-va-lan",
  templateSlug: "wedding-minimalist-gold",
  openingEffect: "WAX_SEAL",
  fallingEffect: "PETAL",
  primaryColor: "#D4AF37",
  fontFamily: "Inter",
  isAutoPlay: true,
  photos: [],
  events: [],
  data: {
    cardCategory: "WEDDING",
    groom: { fullName: "" },
    bride: { fullName: "" },
    events: [],
    loveStory: [],
  },
};

describe("CardService.createDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.plan.findFirst.mockResolvedValue({ id: "free-id", code: "FREE", maxPhotos: 5 });
    db.template.findUnique.mockResolvedValue({
      id: "template-id",
      slug: input.templateSlug,
      category: "WEDDING",
      isActive: true,
      isPremium: false,
    });
    db.card.findFirst.mockResolvedValue(null);
    db.card.count.mockResolvedValue(0);
    db.card.create.mockResolvedValue({ id: "card-1", status: "DRAFT" });
  });

  it("assigns FREE plan and tenant identity on the server", async () => {
    await CardService.createDraft("user-1", "account-1", input, "request-1");

    expect(db.card.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        accountId: "account-1",
        userId: "user-1",
        planId: "free-id",
        templateId: "template-id",
        status: "DRAFT",
        expiredAt: null,
        createIdempotencyKey: "request-1",
      }),
    }));
  });

  it("rejects creation when the account already owns two cards", async () => {
    db.card.count.mockResolvedValue(2);

    await expect(
      CardService.createDraft("user-1", "account-1", input, "request-2")
    ).rejects.toThrow("tối đa 2 thiệp");
    expect(db.card.create).not.toHaveBeenCalled();
  });

  it("returns the existing card for a repeated idempotency key", async () => {
    db.card.findFirst.mockResolvedValue({ id: "existing-card", status: "DRAFT" });

    const result = await CardService.createDraft("user-1", "account-1", input, "request-1");

    expect(result).toMatchObject({ id: "existing-card" });
    expect(db.card.count).not.toHaveBeenCalled();
  });

  it("rejects a premium template in the FREE flow", async () => {
    db.template.findUnique.mockResolvedValue({
      id: "premium-id",
      category: "WEDDING",
      isActive: true,
      isPremium: true,
    });

    await expect(
      CardService.createDraft("user-1", "account-1", input, "request-3")
    ).rejects.toThrow("không khả dụng cho gói FREE");
  });
});

describe("CardService lifecycle reads and publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads an owner card using accountId", async () => {
    db.card.findFirst.mockResolvedValue({ id: "card-1" });

    await CardService.getOwnerCard("account-1", "card-1");

    expect(db.card.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "card-1", accountId: "account-1" },
    }));
  });

  it("does not return a draft through the public slug read", async () => {
    db.card.findFirst.mockResolvedValue(null);

    const result = await CardService.getCardBySlug("minh-va-lan");

    expect(result).toBeNull();
    expect(db.card.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        slug: "minh-va-lan",
        status: "ACTIVE",
        expiredAt: { gt: expect.any(Date) },
      }),
    }));
  });

  it("sets the seven-day expiry only on first publish", async () => {
    db.card.findFirst.mockResolvedValue({
      id: "card-1",
      accountId: "account-1",
      status: "DRAFT",
      publishedAt: null,
      expiredAt: null,
      plan: { durationDays: 7 },
      categoryData: {
        cardCategory: "WEDDING",
        groom: { fullName: "Minh" },
        bride: { fullName: "Lan" },
        events: [{
          eventName: "Lễ cưới",
          eventDate: "2026-10-01T10:00:00.000Z",
          venueName: "Nhà hàng Hoa Sen",
          address: "123 Nguyễn Huệ, Quận 1",
        }],
      },
    });
    db.card.update.mockImplementation(async ({ data }) => ({ id: "card-1", ...data }));

    const result = await CardService.publishCard("account-1", "card-1");

    expect(result.status).toBe("ACTIVE");
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(result.expiredAt.getTime() - result.publishedAt.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    expect(db.card.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "card-1", accountId: "account-1" },
    }));
  });

  it("does not extend expiry when an active card is published again", async () => {
    const publishedAt = new Date("2026-09-02T00:00:00.000Z");
    const expiredAt = new Date("2026-09-09T00:00:00.000Z");
    db.card.findFirst.mockResolvedValue({
      id: "card-1",
      status: "ACTIVE",
      publishedAt,
      expiredAt,
      plan: { durationDays: 7 },
      categoryData: { cardCategory: "WEDDING" },
    });

    const result = await CardService.publishCard("account-1", "card-1");

    expect(result.expiredAt).toBe(expiredAt);
    expect(db.card.update).not.toHaveBeenCalled();
  });

  it("permanently deletes only within the current account", async () => {
    db.card.findFirst.mockResolvedValue({ id: "card-1", accountId: "account-1" });
    db.card.delete.mockResolvedValue({ id: "card-1" });

    await CardService.deleteCard("account-1", "card-1");

    expect(db.card.findFirst).toHaveBeenCalledWith({
      where: { id: "card-1", accountId: "account-1" },
      select: { id: true },
    });
    expect(db.card.delete).toHaveBeenCalledWith({
      where: { id: "card-1", accountId: "account-1" },
    });
  });
});
