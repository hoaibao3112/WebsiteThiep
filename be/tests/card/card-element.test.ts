import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  card: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import { CardElementService } from "../../src/services/card-element.service";
import { HttpError } from "../../src/lib/http-error";

describe("CardElementService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCard = {
    id: "card-123",
    accountId: "account-abc",
    cardCategory: "WEDDING",
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
            fontSize: 24,
            color: "#D4AF37",
          },
        ],
      },
    },
  };

  it("successfully patches an element's customData with multi-tenant isolation", async () => {
    db.card.findFirst.mockResolvedValueOnce(mockCard);
    db.card.update.mockResolvedValueOnce({ ...mockCard });

    const result = await CardElementService.patchElement("account-abc", "card-123", "preset-gift", {
      customData: {
        groomName: "Nguyễn Văn B",
        groomAccount: "88888888",
      },
    });

    expect(db.card.findFirst).toHaveBeenCalledWith({
      where: { id: "card-123", accountId: "account-abc" },
      select: { id: true, categoryData: true, cardCategory: true },
    });

    expect(db.card.update).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("preset-gift");
    expect(result.customData.groomName).toBe("Nguyễn Văn B");
    expect(result.customData.groomAccount).toBe("88888888");
    expect(result.customData.groomBank).toBe("VCB"); // Giữ nguyên trường cũ
  });

  it("successfully patches text content, fontSize, and color", async () => {
    db.card.findFirst.mockResolvedValueOnce(mockCard);
    db.card.update.mockResolvedValueOnce({ ...mockCard });

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
});
