import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  card: {
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  account: {
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import { CardElementService } from "../../src/services/card-element.service";
import { HttpError } from "../../src/lib/http-error";

describe("CardElementService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.card.findFirstOrThrow.mockResolvedValue({ updatedAt: new Date(), ...mockCard });
    db.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-abc",
      currentPlanId: "free-plan-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "free-plan-id",
        code: "FREE",
        name: "Gói Miễn Phí",
        maxPhotos: 5,
        hasWatermark: true,
        allowCustomDomain: false,
        allowMusicUpload: false,
        allowTelegramNoti: false,
        allowPremiumTemplates: false,
      },
    });
  });

  const mockCard = {
    id: "card-123",
    accountId: "account-abc",
    cardCategory: "WEDDING",
    status: "DRAFT",
    version: 2,
    template: {
      slug: "wedding-heritage-crimson-gold",
      category: "WEDDING",
    },
    categoryData: {
      cardCategory: "WEDDING",
      canvasDocument: {
        templateSlug: "wedding-heritage-crimson-gold",
        elements: [
          {
            id: "preset-gift",
            type: "preset",
            presetId: "p-wedding-gift-luxury",
            title: "Mừng cưới",
            x: 0,
            y: 0,
            width: 390,
            height: 200,
            customData: {
              groomName: "Nguyễn Văn A",
              groomBank: "VCB",
              groomAccount: "12345678",
            },
          },
          {
            id: "text-title",
            type: "text",
            content: "Lễ Thành Hôn",
            x: 20,
            y: 50,
            width: 350,
            height: 40,
            fontSize: 24,
            color: "#D4AF37",
          },
        ],
      },
    },
  };

  it("successfully patches an element's customData with multi-tenant isolation", async () => {
    db.card.findFirst.mockResolvedValueOnce(mockCard);
    db.card.updateMany.mockResolvedValueOnce({ count: 1 });

    const result = await CardElementService.patchElement("account-abc", "card-123", "preset-gift", {
      customData: {
        groomName: "Nguyễn Văn B",
        groomAccount: "88888888",
      },
    });

    expect(db.card.findFirst).toHaveBeenCalledWith({
      where: { id: "card-123", accountId: "account-abc" },
      include: { template: true },
    });

    expect(db.card.updateMany).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("preset-gift");
    expect(result.customData.groomName).toBe("Nguyễn Văn B");
    expect(result.customData.groomAccount).toBe("88888888");
    expect(result.customData.groomBank).toBe("VCB"); // Giữ nguyên trường cũ
  });

  it("successfully patches text content, fontSize, and color", async () => {
    db.card.findFirst.mockResolvedValueOnce(mockCard);
    db.card.updateMany.mockResolvedValueOnce({ count: 1 });

    const result = await CardElementService.patchElement("account-abc", "card-123", "text-title", {
      content: "Lễ Vu Quy",
      fontSize: 28,
      color: "#FF0000",
    });

    expect(result.content).toBe("Lễ Vu Quy");
    expect(result.fontSize).toBe(28);
    expect(result.color).toBe("#FF0000");
  });

  it("throws 404 when card is not found or accountId does not match", async () => {
    db.card.findFirst.mockResolvedValueOnce(null);

    await expect(
      CardElementService.patchElement("wrong-account", "card-123", "preset-gift", { content: "Test" })
    ).rejects.toThrow(HttpError);
  });

  it("throws 404 when elementId does not exist in card canvas", async () => {
    db.card.findFirst.mockResolvedValueOnce(mockCard);

    await expect(
      CardElementService.patchElement("account-abc", "card-123", "non-existent-id", { content: "Test" })
    ).rejects.toThrow(HttpError);
  });

  it("retrieves a single element by id", async () => {
    db.card.findFirst.mockResolvedValueOnce(mockCard);

    const el = await CardElementService.getElement("account-abc", "card-123", "preset-gift");
    expect(el).toBeDefined();
    expect(el.id).toBe("preset-gift");
    expect(el.presetId).toBe("p-wedding-gift-luxury");
  });

  describe("Mục 2: Validation & All Fields Patching", () => {
    it("áp dụng TẤT CẢ các field được phép trong patch (backgroundColor, borderRadius, borderWidth, borderColor, opacity, rotation, zIndex, shapeType, widgetConfig)", async () => {
      db.card.findFirst.mockResolvedValueOnce(mockCard);
      db.card.updateMany.mockResolvedValueOnce({ count: 1 });

      const result = await CardElementService.patchElement("account-abc", "card-123", "text-title", {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#CCCCCC",
        opacity: 0.85,
        rotation: 45,
        zIndex: 5,
        shapeType: "rect",
        widgetConfig: { title: "Widget Test" },
      });

      expect(result.backgroundColor).toBe("#FFFFFF");
      expect(result.borderRadius).toBe(8);
      expect(result.borderWidth).toBe(2);
      expect(result.borderColor).toBe("#CCCCCC");
      expect(result.opacity).toBe(0.85);
      expect(result.rotation).toBe(45);
      expect(result.zIndex).toBe(5);
      expect(result.shapeType).toBe("rect");
      expect(result.widgetConfig).toEqual({ title: "Widget Test" });
    });

    it("từ chối opacity ngoài khoảng 0..1 và ném HttpError 400 kèm fieldErrors", async () => {
      db.card.findFirst.mockResolvedValueOnce(mockCard);

      await expect(
        CardElementService.patchElement("account-abc", "card-123", "text-title", {
          opacity: 1.5,
        } as any)
      ).rejects.toSatisfy((err: any) => {
        expect(err).toBeInstanceOf(HttpError);
        expect(err.status).toBe(400);
        expect(err.code).toBe("INVALID_ELEMENT_DATA");
        expect(err.details).toHaveProperty("opacity");
        return true;
      });
    });

    it("từ chối svgContent chứa thẻ <script> hoặc sự kiện on*=", async () => {
      db.card.findFirst.mockResolvedValueOnce(mockCard);

      await expect(
        CardElementService.patchElement("account-abc", "card-123", "text-title", {
          svgContent: "<svg><script>alert('xss')</script></svg>",
        } as any)
      ).rejects.toSatisfy((err: any) => {
        expect(err).toBeInstanceOf(HttpError);
        expect(err.status).toBe(400);
        expect(err.code).toBe("INVALID_ELEMENT_DATA");
        expect(err.details).toHaveProperty("svgContent");
        return true;
      });

      db.card.findFirst.mockResolvedValueOnce(mockCard);
      await expect(
        CardElementService.patchElement("account-abc", "card-123", "text-title", {
          svgContent: '<svg onload="alert(1)"></svg>',
        } as any)
      ).rejects.toSatisfy((err: any) => {
        expect(err).toBeInstanceOf(HttpError);
        expect(err.status).toBe(400);
        expect(err.details).toHaveProperty("svgContent");
        return true;
      });
    });

    it("từ chối linkUrl có giao thức độc hại (javascript:, data:)", async () => {
      db.card.findFirst.mockResolvedValueOnce(mockCard);

      await expect(
        CardElementService.patchElement("account-abc", "card-123", "text-title", {
          linkUrl: "javascript:evil()",
        } as any)
      ).rejects.toSatisfy((err: any) => {
        expect(err).toBeInstanceOf(HttpError);
        expect(err.status).toBe(400);
        expect(err.code).toBe("INVALID_ELEMENT_DATA");
        expect(err.details).toHaveProperty("linkUrl");
        return true;
      });
    });

    it("chấp nhận linkUrl hợp lệ (https, tel, mailto)", async () => {
      db.card.findFirst.mockResolvedValueOnce(mockCard);
      db.card.updateMany.mockResolvedValueOnce({ count: 1 });

      const resHttps = await CardElementService.patchElement("account-abc", "card-123", "text-title", {
        linkUrl: "https://example.com/invitation",
      });
      expect(resHttps.linkUrl).toBe("https://example.com/invitation");
    });

    it("từ chối imageUrl data:image/ theo StoredImageUrlSchema", async () => {
      db.card.findFirst.mockResolvedValueOnce(mockCard);

      await expect(
        CardElementService.patchElement("account-abc", "card-123", "text-title", {
          imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
        } as any)
      ).rejects.toSatisfy((err: any) => {
        expect(err).toBeInstanceOf(HttpError);
        expect(err.status).toBe(400);
        expect(err.code).toBe("INVALID_ELEMENT_DATA");
        expect(err.details).toHaveProperty("imageUrl");
        return true;
      });
    });
  });

  describe("B5: Lost update (Optimistic Concurrency với expectedUpdatedAt)", () => {
    it("khớp expectedUpdatedAt → updateMany thành công và trả về updatedAt mới", async () => {
      const pastDate = new Date("2026-10-01T10:00:00.000Z");
      const newDate = new Date("2026-10-02T10:00:00.000Z");
      db.card.findFirst.mockResolvedValueOnce({ ...mockCard, updatedAt: pastDate });
      db.card.updateMany.mockResolvedValueOnce({ count: 1 });
      db.card.findFirstOrThrow.mockResolvedValueOnce({ updatedAt: newDate });

      const result = await CardElementService.patchElement("account-abc", "card-123", "text-title", {
        content: "Nội dung cập nhật mới",
        expectedUpdatedAt: pastDate.toISOString(),
      });

      expect(db.card.updateMany).toHaveBeenCalledWith({
        where: { id: "card-123", accountId: "account-abc", updatedAt: pastDate },
        data: expect.objectContaining({
          categoryData: expect.anything(),
        }),
      });
      expect(result.updatedAt).toEqual(newDate);
    });

    it("không khớp expectedUpdatedAt → updateMany count = 0, ném 409 CARD_VERSION_CONFLICT kèm updatedAt hiện tại", async () => {
      const pastDate = new Date("2026-10-01T10:00:00.000Z");
      const latestDate = new Date("2026-10-02T12:00:00.000Z");
      db.card.findFirst
        .mockResolvedValueOnce({ ...mockCard, updatedAt: latestDate }) // query đầu tiên của service
        .mockResolvedValueOnce({ updatedAt: latestDate }); // query lấy latest updatedAt khi conflict
      db.card.updateMany.mockResolvedValueOnce({ count: 0 }); // updateMany thất bại do stale updatedAt

      await expect(
        CardElementService.patchElement("account-abc", "card-123", "text-title", {
          content: "Nội dung cũ",
          expectedUpdatedAt: pastDate.toISOString(),
        })
      ).rejects.toSatisfy((err: any) => {
        expect(err).toBeInstanceOf(HttpError);
        expect(err.status).toBe(409);
        expect(err.code).toBe("CARD_VERSION_CONFLICT");
        expect(err.details).toEqual({ currentUpdatedAt: latestDate.toISOString() });
        return true;
      });
    });
  });

  describe("Mục 4: Shared assertCardEditable & Auto Wedding Scene Fallback", () => {
    it("ném 409 CARD_STATE_CONFLICT khi thiệp đã ARCHIVED", async () => {
      db.card.findFirst.mockResolvedValueOnce({
        ...mockCard,
        status: "ARCHIVED",
      });

      await expect(
        CardElementService.patchElement("account-abc", "card-123", "text-title", {
          content: "Sửa thiệp lưu trữ",
        })
      ).rejects.toMatchObject({
        status: 409,
        code: "CARD_STATE_CONFLICT",
      });
    });

    it("ném 409 CARD_STATE_CONFLICT khi thiệp đã EXPIRED trên gói FREE", async () => {
      db.card.findFirst.mockResolvedValueOnce({
        ...mockCard,
        status: "EXPIRED",
      });

      await expect(
        CardElementService.patchElement("account-abc", "card-123", "text-title", {
          content: "Sửa thiệp hết hạn",
        })
      ).rejects.toMatchObject({
        status: 409,
        code: "CARD_STATE_CONFLICT",
      });
    });

    it("thiệp cũ chưa có canvasDocument (chỉ có categoryData thô) → tự động dựng scene, không ném NO_CANVAS_ELEMENTS", async () => {
      const legacyCardWithoutCanvas = {
        id: "card-legacy-1",
        accountId: "account-abc",
        cardCategory: "WEDDING",
        status: "DRAFT",
        version: 0,
        template: {
          slug: "wedding-imperial-dragon-crimson",
          category: "WEDDING",
        },
        categoryData: {
          cardCategory: "WEDDING",
          groom: { fullName: "Nguyễn Văn Chú Rể" },
          bride: { fullName: "Trần Thị Cô Dâu" },
        }, // Chưa có canvasDocument!
      };

      db.card.findFirst.mockResolvedValue(legacyCardWithoutCanvas);
      db.card.updateMany.mockResolvedValue({ count: 1 });

      // getElement tự động dựng scene và tìm được element scene-ceremony-couple-g
      const element = await CardElementService.getElement("account-abc", "card-legacy-1", "scene-ceremony-couple-g");
      expect(element).toBeDefined();
      expect(element.id).toBe("scene-ceremony-couple-g");
      expect(element.content).toBe("Nguyễn Văn Chú Rể");

      // patchElement tự động dựng scene và patch thành công
      const patchResult = await CardElementService.patchElement("account-abc", "card-legacy-1", "scene-ceremony-couple-g", {
        content: "Chú rể mới",
      });
      expect(patchResult).toBeDefined();
      expect(patchResult.content).toBe("Chú rể mới");
      expect(patchResult.userEdited).toBe(true);
    });
  });
});
