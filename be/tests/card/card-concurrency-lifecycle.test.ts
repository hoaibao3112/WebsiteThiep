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
    updateMany: vi.fn(),
    findFirstOrThrow: vi.fn(),
    delete: vi.fn(),
  },
  cardEvent: {
    findMany: vi.fn().mockResolvedValue([]),
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  cardPhoto: {
    findMany: vi.fn().mockResolvedValue([]),
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  ...db,
  $transaction: vi.fn(async (callback: (tx: typeof db) => Promise<unknown>) => callback(db)),
}));

vi.mock("../../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../../src/services/account-entitlement.service", () => ({
  AccountEntitlementService: {
    getEffectivePlan: vi.fn().mockResolvedValue({
      planCode: "BASIC",
      planName: "Gói Cơ Bản",
      capabilities: {
        maxPhotos: 30,
        hasWatermark: false,
        allowCustomDomain: false,
        allowMusicUpload: true,
        allowTelegramNoti: true,
        allowPremiumTemplates: false,
      },
    }),
  },
}));

import { CardService } from "../../src/services/card.service";
import type { DraftCardInput } from "../../src/lib/validators/card";

describe("Card Concurrency, Slug Lock & Multi-tenant Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCardBase = {
    id: "card-123",
    accountId: "account-owner",
    slug: "thiep-cuoi-long-ngoc",
    status: "DRAFT",
    templateId: "tpl-1",
    categoryData: { cardCategory: "WEDDING" },
    musicUrl: null,
    telegramChatId: null,
    updatedAt: new Date("2026-10-22T10:00:00.000Z"),
    plan: { code: "BASIC" },
    template: { slug: "wedding-modern-gold", category: "WEDDING" },
  };

  const mockInput: DraftCardInput = {
    templateSlug: "wedding-modern-gold",
    slug: "thiep-cuoi-long-ngoc",
    openingEffect: "WAX_SEAL",
    fallingEffect: "PETAL",
    primaryColor: "#BE944E",
    fontFamily: "Inter",
    isAutoPlay: true,
    musicUrl: "https://example.com/audio.mp3",
    data: {
      cardCategory: "WEDDING",
      groom: { fullName: "Nguyễn Long", shortName: "Long" },
      bride: { fullName: "Lê Ngọc", shortName: "Ngọc" },
      events: [],
    },
    events: [],
    photos: [],
  };

  describe("Optimistic Concurrency Control (Version Lock)", () => {
    it("thành công khi expectedUpdatedAt trùng khớp với database", async () => {
      // 1. Tìm thấy card hiện tại
      prismaMock.card.findFirst.mockResolvedValueOnce(mockCardBase);
      // 2. isSlugAvailable -> trả về null (slug hợp lệ chưa ai dùng)
      prismaMock.card.findFirst.mockResolvedValueOnce(null);
      // 3. template hợp lệ
      prismaMock.template.findUnique.mockResolvedValueOnce({
        id: "tpl-1",
        slug: "wedding-modern-gold",
        category: "WEDDING",
        isActive: true,
        isPremium: false,
      });

      // 4. updateMany thành công (count = 1)
      prismaMock.card.updateMany.mockResolvedValueOnce({ count: 1 });
      // 5. findFirstOrThrow trả về card mới nhất sau update
      prismaMock.card.findFirstOrThrow.mockResolvedValueOnce({
        ...mockCardBase,
        updatedAt: new Date("2026-10-22T10:05:00.000Z"),
      });

      const updated = await CardService.updateDraft(
        "account-owner",
        "card-123",
        mockInput,
        "2026-10-22T10:00:00.000Z"
      );

      expect(updated).toBeDefined();
      expect(prismaMock.card.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: "card-123",
            accountId: "account-owner",
            updatedAt: new Date("2026-10-22T10:00:00.000Z"),
          }),
        })
      );
    });

    it("ném lỗi 409 CARD_VERSION_CONFLICT khi expectedUpdatedAt bị lệch do có request khác lưu trước", async () => {
      // 1. Tìm thấy card
      prismaMock.card.findFirst.mockResolvedValueOnce(mockCardBase);
      // 2. isSlugAvailable
      prismaMock.card.findFirst.mockResolvedValueOnce(null);
      // 3. template hợp lệ
      prismaMock.template.findUnique.mockResolvedValueOnce({
        id: "tpl-1",
        slug: "wedding-modern-gold",
        category: "WEDDING",
        isActive: true,
        isPremium: false,
      });

      // 4. updateMany count = 0 (do updatedAt không khớp)
      prismaMock.card.updateMany.mockResolvedValueOnce({ count: 0 });
      // 5. Fix: Mock latest card lookup (sau updateMany count=0)
      prismaMock.card.findFirst.mockResolvedValueOnce({
        version: 3,
        updatedAt: new Date("2026-10-22T10:05:00.000Z"),
      });

      await expect(
        CardService.updateDraft(
          "account-owner",
          "card-123",
          mockInput,
          "2026-10-22T09:00:00.000Z" // stale timestamp
        )
      ).rejects.toMatchObject({
        statusCode: 409,
        code: "CARD_VERSION_CONFLICT",
      });
    });
  });

  describe("Active Card Slug Protection", () => {
    it("cho phép đổi slug khi thiệp ở trạng thái DRAFT", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        ...mockCardBase,
        status: "DRAFT",
        slug: "slug-cu",
      });
      prismaMock.card.findFirst.mockResolvedValueOnce(null); // isSlugAvailable
      prismaMock.template.findUnique.mockResolvedValueOnce({
        id: "tpl-1",
        slug: "wedding-modern-gold",
        category: "WEDDING",
        isActive: true,
        isPremium: false,
      });
      prismaMock.card.updateMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.card.findFirstOrThrow.mockResolvedValueOnce({
        ...mockCardBase,
        slug: "slug-moi",
      });

      const res = await CardService.updateDraft("account-owner", "card-123", {
        ...mockInput,
        slug: "slug-moi",
      });
      expect(res).toBeDefined();
    });

    it("ném lỗi 409 SLUG_LOCKED khi cố tình thay đổi slug của thiệp đã ACTIVE", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        ...mockCardBase,
        status: "ACTIVE",
        slug: "thiep-cuoi-da-phat-hanh",
      });
      prismaMock.card.findFirst.mockResolvedValueOnce(null); // isSlugAvailable

      await expect(
        CardService.updateDraft("account-owner", "card-123", {
          ...mockInput,
          slug: "doi-slug-khac-khong-hop-le",
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        code: "SLUG_LOCKED",
      });
    });
  });

  describe("Multi-tenant Isolation Security", () => {
    it("ném lỗi 404 CARD_NOT_FOUND khi tài khoản khác cố gắng sửa thiệp", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce(null); // Không tìm thấy thiệp của tài khoản này

      await expect(
        CardService.updateDraft("hacker-account", "card-123", mockInput)
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "CARD_NOT_FOUND",
      });
    });

    it("ném lỗi 404 CARD_NOT_FOUND khi tài khoản khác cố gắng xóa thiệp", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce(null);

      await expect(
        CardService.deleteCard("hacker-account", "card-123")
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "CARD_NOT_FOUND",
      });
      expect(prismaMock.card.delete).not.toHaveBeenCalled();
    });
  });

  describe("Slug Availability Checks", () => {
    it("trả về true khi slug chưa ai sử dụng", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce(null);
      const isAvailable = await CardService.isSlugAvailable("slug-hoan-toan-moi");
      expect(isAvailable).toBe(true);
    });

    it("trả về false khi slug đã tồn tại bởi thiệp khác", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({ id: "other-card" });
      const isAvailable = await CardService.isSlugAvailable("slug-trung-lap", "current-card");
      expect(isAvailable).toBe(false);
      expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
        where: { slug: "slug-trung-lap", id: { not: "current-card" } },
        select: { id: true },
      });
    });
  });
});
