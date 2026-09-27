import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnvelopeConfigSchema } from "../../src/schemas/envelope.schema";

const prismaMock = vi.hoisted(() => ({
  card: { findFirst: vi.fn(), update: vi.fn() },
}));
vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));

import { EnvelopeService } from "../../src/services/envelope.service";

describe("EnvelopeService & EnvelopeConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStyles", () => {
    it("returns list of dynamic envelope styles from backend", async () => {
      const styles = await EnvelopeService.getStyles();
      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThanOrEqual(3);

      const vintageCream = styles.find((s) => s.id === "vintage-cream");
      expect(vintageCream).toBeDefined();
      expect(vintageCream?.name).toBe("Kem cổ điển");
      expect(vintageCream?.envelopeColor).toBe("#7B96A8");

      const beige = styles.find((s) => s.id === "beige");
      expect(beige?.name).toBe("Beige");

      const red = styles.find((s) => s.id === "red");
      expect(red?.name).toBe("Đỏ");
    });
  });

  describe("getCardEnvelopeConfig", () => {
    it("retrieves envelope configuration scoped to accountId (multi-tenant)", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        categoryData: {
          envelopeConfig: {
            styleId: "beige",
            styleName: "Beige",
            groomName: "Mai Lan",
            brideName: "Tuấn Minh",
            title: "We're getting married!",
            fontFamily: "Playfair Display",
            buttonText: "CHẠM ĐỂ MỞ",
            monogram: "ML",
          },
        },
        openingEffect: "WAX_SEAL",
      });

      const config = await EnvelopeService.getCardEnvelopeConfig("account-1", "card-1");
      expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
        where: { id: "card-1", accountId: "account-1" },
        select: { categoryData: true, openingEffect: true },
      });
      expect(config?.styleId).toBe("beige");
      expect(config?.monogram).toBe("ML");
    });

    it("throws 404 when card is not found or belongs to another tenant", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce(null);

      await expect(
        EnvelopeService.getCardEnvelopeConfig("wrong-account", "card-1")
      ).rejects.toThrow("Không tìm thấy thiệp cưới");
    });
  });

  describe("updateCardEnvelopeConfig", () => {
    it("updates envelopeConfig in categoryData and enforces WAX_SEAL opening effect", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-1",
        categoryData: { isReverseOrder: false },
        openingEffect: "NONE",
      });

      prismaMock.card.update.mockResolvedValueOnce({
        id: "card-1",
        slug: "lan-minh-2026",
        openingEffect: "WAX_SEAL",
        categoryData: {
          isReverseOrder: false,
          envelopeConfig: {
            styleId: "red",
            styleName: "Đỏ",
            groomName: "Tuấn Minh",
            brideName: "Mai Lan",
            title: "We're getting married!",
            fontFamily: "Great Vibes",
            buttonText: "CHẠM ĐỂ MỞ",
            monogram: "ML",
          },
        },
        updatedAt: new Date(),
      });

      const result = await EnvelopeService.updateCardEnvelopeConfig("account-1", "card-1", {
        styleId: "red",
        styleName: "Đỏ",
        groomName: "Tuấn Minh",
        brideName: "Mai Lan",
        title: "We're getting married!",
        fontFamily: "Great Vibes",
        buttonText: "CHẠM ĐỂ MỞ",
        monogram: "ML",
      });

      expect(prismaMock.card.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "card-1", accountId: "account-1" },
          data: expect.objectContaining({
            openingEffect: "WAX_SEAL",
          }),
        })
      );
      expect(result.openingEffect).toBe("WAX_SEAL");
    });
  });

  describe("EnvelopeConfigSchema validation", () => {
    it("validates valid envelope payload successfully", () => {
      const parsed = EnvelopeConfigSchema.parse({
        styleId: "vintage-cream",
        groomName: "Tuấn Minh",
        brideName: "Mai Lan",
        title: "We're getting married!",
        fontFamily: "Aquarelle",
        buttonText: "CHẠM ĐỂ MỞ",
        monogram: "ML",
      });
      expect(parsed.styleId).toBe("vintage-cream");
      expect(parsed.monogram).toBe("ML");
    });

    it("applies defaults for missing optional fields", () => {
      const parsed = EnvelopeConfigSchema.parse({});
      expect(parsed.styleId).toBe("vintage-cream");
      expect(parsed.title).toBe("We're getting married!");
      expect(parsed.buttonText).toBe("CHẠM ĐỂ MỞ");
    });
  });
});
