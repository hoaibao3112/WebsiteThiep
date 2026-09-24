import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  plan: { findFirst: vi.fn(), findUnique: vi.fn() },
  template: { findUnique: vi.fn() },
  account: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
  },
  card: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  cardEvent: { createMany: vi.fn(), deleteMany: vi.fn() },
  cardPhoto: { createMany: vi.fn(), deleteMany: vi.fn() },
}));

const prismaMock = vi.hoisted(() => ({
  ...db,
  $transaction: vi.fn(async (callback: (tx: typeof db) => Promise<unknown>) => callback(db)),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));

import { CardService } from "../../src/services/card.service";
import { ensureWeddingScene } from "../../src/services/wedding-scene.service";
import type { DraftCardInput } from "../../src/lib/validators/card";
import { Prisma } from "@prisma/client";

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

describe("ensureWeddingScene", () => {
  const weddingSlugs = [
    "wedding-heritage-crimson-gold",
    "wedding-modern-editorial-magazine",
    "wedding-sweet-editorial-romance",
    "wedding-crimson-wine-marsala",
    "wedding-forest-green-botanical",
    "wedding-pure-lotus-heritage",
    "wedding-cinematic-editorial",
    "wedding-alpine-lake-romance",
    "wedding-imperial-dragon-crimson",
  ];

  it.each(weddingSlugs)("creates a complete backend scene for %s", (templateSlug) => {
    const result = ensureWeddingScene({ ...input, templateSlug });
    expect(result.cardCategory).toBe("WEDDING");
    if (result.cardCategory !== "WEDDING") throw new Error("Expected wedding data");
    expect(result.canvasDocument).toMatchObject({ schemaVersion: 1, templateSlug });
    expect(result.canvasDocument?.elements.length).toBeGreaterThanOrEqual(12);
    expect(result.canvasDocument?.elements.some((element) => element.type === "widget")).toBe(true);
  });

  it("preserves an explicitly empty saved scene", () => {
    const emptySceneData = {
      ...input,
      data: {
        ...input.data,
        canvasDocument: {
          schemaVersion: 1,
          templateSlug: input.templateSlug,
          width: 390,
          height: 1200,
          background: { color: "#ffffff" },
          tokens: {},
          sections: [],
          elements: [],
          bindings: {},
        },
      },
    } as DraftCardInput;
    const result = ensureWeddingScene(emptySceneData);
    expect(result.cardCategory === "WEDDING" && result.canvasDocument?.elements).toEqual([]);
  });
});

describe("CardService.createDraft", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof db) => Promise<unknown>) => callback(db),
    );
    db.user.findUnique.mockResolvedValue({ role: "USER" });
    db.plan.findFirst.mockResolvedValue({ id: "free-id", code: "FREE", maxPhotos: 5 });
    db.plan.findUnique.mockResolvedValue({
      id: "free-id",
      code: "FREE",
      name: "Gói Dùng Thử",
      maxPhotos: 5,
      hasWatermark: true,
      allowCustomDomain: false,
      allowMusicUpload: false,
      allowTelegramNoti: false,
      allowPremiumTemplates: false,
    });
    db.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-1",
      currentPlanId: "free-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "free-id",
        code: "FREE",
        name: "Gói Dùng Thử",
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      },
    });
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

  it("classifies the FREE card limit as a conflict", async () => {
    db.card.count.mockResolvedValue(2);

    await expect(
      CardService.createDraft("user-1", "account-1", input, "request-limit"),
    ).rejects.toMatchObject({
      status: 409,
      code: "CARD_LIMIT_REACHED",
    });
  });

  it("returns a typed unavailable error after serialization retries are exhausted", async () => {
    prismaMock.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("serialization conflict", {
        code: "P2034",
        clientVersion: "5.22.0",
      }),
    );

    await expect(
      CardService.createDraft("user-1", "account-1", input, "request-retry"),
    ).rejects.toMatchObject({
      status: 503,
      code: "CARD_CREATE_RETRY_EXHAUSTED",
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(3);
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
    ).rejects.toThrow("không khả dụng cho gói hiện tại");
  });
});

describe("CardService lifecycle reads and publish", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-1",
      currentPlanId: "free-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "free-id",
        code: "FREE",
        name: "Gói Dùng Thử",
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      },
    });
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
        OR: [
          { expiredAt: null },
          { expiredAt: { gt: expect.any(Date) } },
        ],
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

  it("scopes the public view-count mutation to the resolved account", async () => {
    db.card.findFirst
      .mockResolvedValueOnce({ id: "card-1", accountId: "account-1" })
      .mockResolvedValueOnce({
        id: "card-1",
        accountId: "account-1",
        plan: { code: "FREE" },
      });
    db.card.update.mockResolvedValue({ id: "card-1" });

    await CardService.getCardBySlug("minh-va-lan");

    expect(db.card.update).toHaveBeenCalledWith({
      where: { id: "card-1", accountId: "account-1" },
      data: { viewCount: { increment: 1 } },
    });
  });

  it("rechecks public eligibility on the tenant-scoped aggregate read", async () => {
    db.card.findFirst
      .mockResolvedValueOnce({ id: "card-1", accountId: "account-1" })
      .mockResolvedValueOnce(null);

    const result = await CardService.getCardBySlug("minh-va-lan");

    expect(result).toBeNull();
    expect(db.card.findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          id: "card-1",
          accountId: "account-1",
          status: "ACTIVE",
          OR: [
            { expiredAt: null },
            { expiredAt: { gt: expect.any(Date) } },
          ],
        },
      }),
    );
  });

  it("returns a typed not-found error when an account cannot access a card", async () => {
    db.card.findFirst.mockResolvedValue(null);

    await expect(
      CardService.updateDraft("account-1", "card-from-account-2", input),
    ).rejects.toMatchObject({ status: 404, code: "CARD_NOT_FOUND" });
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

describe("CardService.updateDraft template premium & plan permissions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof db) => Promise<unknown>) => callback(db),
    );
    db.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-1",
      currentPlanId: "free-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "free-id",
        code: "FREE",
        name: "Gói Dùng Thử",
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      },
    });
  });

  it("rejects updating to a premium template when the card is on a FREE plan", async () => {
    db.card.findFirst.mockResolvedValue({
      id: "card-1",
      accountId: "account-1",
      status: "DRAFT",
      plan: {
        code: "FREE",
        name: "Gói Dùng Thử",
        maxPhotos: 5,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      },
    });

    db.template.findUnique.mockResolvedValue({
      id: "premium-template-id",
      slug: "wedding-modern-editorial-magazine",
      category: "WEDDING",
      isActive: true,
      isPremium: true,
    });

    const updateInput: DraftCardInput = {
      ...input,
      templateSlug: "wedding-modern-editorial-magazine",
    };

    await expect(
      CardService.updateDraft("account-1", "card-1", updateInput)
    ).rejects.toThrow("Mẫu thiệp không khả dụng cho gói FREE");

    expect(db.card.update).not.toHaveBeenCalled();
  });

  it("successfully updates to a premium template when the card is on a VIP plan with allowPremiumTemplates=true", async () => {
    db.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-1",
      currentPlanId: "vip-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "vip-id",
        code: "VIP",
        name: "Gói Cao Cấp (VIP)",
        maxPhotos: 50,
        hasWatermark: false,
        allowCustomDomain: true,
        allowMusicUpload: true,
        allowTelegramNoti: true,
        allowPremiumTemplates: true,
      },
    });

    db.card.findFirst.mockResolvedValue({
      id: "card-1",
      accountId: "account-1",
      status: "DRAFT",
      plan: {
        code: "VIP",
        name: "Gói Cao Cấp (VIP)",
        maxPhotos: 50,
        allowMusicUpload: true,
        allowTelegramNoti: true,
        allowPremiumTemplates: true,
      },
    });

    db.template.findUnique.mockResolvedValue({
      id: "premium-template-id",
      slug: "wedding-modern-editorial-magazine",
      category: "WEDDING",
      isActive: true,
      isPremium: true,
    });

    db.card.update.mockResolvedValue({
      id: "card-1",
      templateId: "premium-template-id",
      slug: input.slug,
    });

    const updateInput: DraftCardInput = {
      ...input,
      templateSlug: "wedding-modern-editorial-magazine",
    };

    const result = await CardService.updateDraft("account-1", "card-1", updateInput);

    expect(result).toMatchObject({
      id: "card-1",
      templateId: "premium-template-id",
    });
    expect(db.card.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "card-1", accountId: "account-1" },
      data: expect.objectContaining({
        templateId: "premium-template-id",
      }),
    }));
  });

  it("successfully updates to a premium template when the card is on a BASIC plan with allowPremiumTemplates=true", async () => {
    db.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-1",
      currentPlanId: "basic-id",
      planStartedAt: new Date(),
      planExpiresAt: new Date(Date.now() + 86400000),
      currentPlan: {
        id: "basic-id",
        code: "BASIC",
        name: "Gói Tiêu Chuẩn",
        maxPhotos: 20,
        hasWatermark: false,
        allowCustomDomain: true,
        allowMusicUpload: true,
        allowTelegramNoti: false,
        allowPremiumTemplates: true,
      },
    });

    db.card.findFirst.mockResolvedValue({
      id: "card-1",
      accountId: "account-1",
      status: "DRAFT",
      plan: {
        code: "BASIC",
        name: "Gói Tiêu Chuẩn",
        maxPhotos: 20,
        allowMusicUpload: true,
        allowTelegramNoti: false,
        allowPremiumTemplates: true,
      },
    });

    db.template.findUnique.mockResolvedValue({
      id: "premium-template-id",
      slug: "wedding-heritage-crimson-gold",
      category: "WEDDING",
      isActive: true,
      isPremium: true,
    });

    db.card.update.mockResolvedValue({
      id: "card-1",
      templateId: "premium-template-id",
      slug: input.slug,
    });

    const updateInput: DraftCardInput = {
      ...input,
      templateSlug: "wedding-heritage-crimson-gold",
    };

    const result = await CardService.updateDraft("account-1", "card-1", updateInput);

    expect(result).toMatchObject({
      id: "card-1",
      templateId: "premium-template-id",
    });
  });

  it("rejects updating when photo count exceeds the plan limits", async () => {
    db.card.findFirst.mockResolvedValue({
      id: "card-1",
      accountId: "account-1",
      status: "DRAFT",
      plan: {
        code: "FREE",
        name: "Gói Dùng Thử",
        maxPhotos: 5,
        allowPremiumTemplates: false,
      },
    });

    const updateInput: DraftCardInput = {
      ...input,
      photos: Array.from({ length: 6 }, (_, i) => ({
        url: `https://example.com/photo-${i}.jpg`,
      })),
    };

    await expect(
      CardService.updateDraft("account-1", "card-1", updateInput)
    ).rejects.toThrow("tối đa 5 ảnh");
  });
});

