import { describe, expect, it } from "vitest";
import { DraftCardSchema, PublishCardDataSchema } from "../../src/lib/validators/card";

const draftInput = {
  slug: "  Minh Va Lan  ",
  templateSlug: "wedding-minimalist-gold",
  openingEffect: "WAX_SEAL",
  fallingEffect: "PETAL",
  primaryColor: "#D4AF37",
  fontFamily: "Inter",
  data: {
    cardCategory: "WEDDING",
    groom: { fullName: "" },
    bride: { fullName: "" },
    events: [],
  },
};

describe("DraftCardSchema", () => {
  it("normalizes a human-entered slug and permits incomplete draft fields", () => {
    const parsed = DraftCardSchema.parse(draftInput);
    expect(parsed.slug).toBe("minh-va-lan");
    expect(parsed.data.cardCategory).toBe("WEDDING");
  });

  it("does not accept a client-selected plan", () => {
    const parsed = DraftCardSchema.parse({ ...draftInput, planId: "vip-plan" });
    expect("planId" in parsed).toBe(false);
  });

  it("rejects blob and base64 photo URLs", () => {
    const invalid = { ...draftInput, photos: [{ url: "blob:http://localhost/photo" }] };
    expect(DraftCardSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("PublishCardDataSchema", () => {
  it("rejects an incomplete wedding draft", () => {
    expect(PublishCardDataSchema.safeParse(draftInput.data).success).toBe(false);
  });

  it("accepts a wedding with names and a complete event", () => {
    const result = PublishCardDataSchema.safeParse({
      cardCategory: "WEDDING",
      groom: { fullName: "Minh" },
      bride: { fullName: "Lan" },
      events: [{
        eventName: "Lễ cưới",
        eventDate: "2026-10-01T10:00:00.000Z",
        venueName: "Nhà hàng Hoa Sen",
        address: "123 Nguyễn Huệ, Quận 1",
      }],
    });
    expect(result.success).toBe(true);
  });
});
