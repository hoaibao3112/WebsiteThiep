import { describe, expect, it } from "vitest";
import {
  DraftCardSchema,
  PublishCardDataSchema,
  UpdateDraftCardSchema,
  WeddingSceneDocumentSchema,
} from "../../src/lib/validators/card";
import {
  ensureWeddingScene,
  ensureWeddingSceneData,
} from "../../src/services/wedding-scene.service";
import { WEDDING_SCENE_SECTION_TYPES } from "../../src/lib/validators/card/wedding-scene.schema";

const ALL_10_TEMPLATES = [
  "wedding-blank",
  "wedding-heritage-crimson-gold",
  "wedding-modern-editorial-magazine",
  "wedding-sweet-editorial-romance",
  "wedding-crimson-wine-marsala",
  "wedding-forest-green-botanical",
  "wedding-pure-lotus-heritage",
  "wedding-cinematic-editorial",
  "wedding-alpine-lake-romance",
  "wedding-imperial-dragon-crimson",
] as const;

function makeDraftInput(templateSlug: string) {
  return {
    slug: `test-card-${templateSlug}`,
    templateSlug,
    openingEffect: "WAX_SEAL" as const,
    fallingEffect: "PETAL" as const,
    primaryColor: "#D4AF37",
    fontFamily: "Inter",
    data: {
      cardCategory: "WEDDING" as const,
      groom: {
        fullName: "Nguyen Van Chu Re",
        shortName: "Chu Re",
      },
      bride: {
        fullName: "Tran Thi Co Dau",
        shortName: "Co Dau",
      },
      events: [
        {
          eventName: "Lễ Thành Hôn",
          eventDate: new Date("2026-12-25T11:00:00.000Z"),
          venueName: "Trung tâm Tiệc cưới Trống Đồng",
          address: "72 Quan Hoa, Cầu Giấy, Hà Nội",
          mapUrl: "https://maps.google.com/?q=test",
        },
      ],
      loveStory: [
        {
          title: "Ngày đầu gặp gỡ",
          date: "2024-01-01",
          description: "Một chiều thu Hà Nội...",
        },
      ],
    },
  };
}

describe("Wedding Scene Contract & 10 Templates Validation", () => {
  it("defines standard, template, and legacy section types in WEDDING_SCENE_SECTION_TYPES", () => {
    expect(WEDDING_SCENE_SECTION_TYPES.length).toBeGreaterThanOrEqual(40);
    expect(WEDDING_SCENE_SECTION_TYPES).toContain("hero");
    expect(WEDDING_SCENE_SECTION_TYPES).toContain("envelope");
    expect(WEDDING_SCENE_SECTION_TYPES).toContain("signatures");
    expect(WEDDING_SCENE_SECTION_TYPES).toContain("arch-calendar");
    expect(WEDDING_SCENE_SECTION_TYPES).toContain("polaroid-calendar");
    expect(WEDDING_SCENE_SECTION_TYPES).toContain("announcement");
  });

  describe("Round-trip validation across all 10 templates", () => {
    for (const slug of ALL_10_TEMPLATES) {
      it(`successfully passes round-trip for template: ${slug}`, () => {
        const rawInput = makeDraftInput(slug);

        // 1. DraftCardSchema parses input
        const parsedDraft = DraftCardSchema.parse(rawInput);
        expect(parsedDraft.templateSlug).toBe(slug);

        // 2. ensureWeddingScene generates/ensures the wedding canvasDocument
        const enrichedData = ensureWeddingScene(parsedDraft);
        expect(enrichedData.canvasDocument).toBeDefined();

        // 3. WeddingSceneDocumentSchema directly validates canvasDocument
        const validScene = WeddingSceneDocumentSchema.parse(enrichedData.canvasDocument);
        expect(validScene.schemaVersion).toBe(1);
        expect(validScene.templateSlug).toBe(slug);
        if (slug !== "wedding-blank") {
          expect(validScene.elements.length).toBeGreaterThan(0);
        } else {
          expect(validScene.elements.length).toBe(0);
        }

        // 4. JSON serialize -> deserialize (simulate DB JSONB save & read)
        const serialized = JSON.stringify({ ...parsedDraft, data: enrichedData });
        const restored = JSON.parse(serialized);

        // Date in events will be ISO string in restored JSON
        expect(typeof restored.data.events[0].eventDate).toBe("string");

        // 5. UpdateDraftCardSchema parses the restored draft
        const updated = UpdateDraftCardSchema.parse(restored);
        expect(updated.data.canvasDocument).toBeDefined();

        // 6. PublishCardDataSchema successfully validates the published state
        const publishCheck = PublishCardDataSchema.safeParse(updated.data);
        expect(publishCheck.success).toBe(true);
      });
    }
  });

  describe("Section schema constraints & rejection", () => {
    it("rejects unsupported/arbitrary section types", () => {
      const invalidScene = {
        schemaVersion: 1,
        templateSlug: "wedding-blank",
        width: 390,
        height: 1200,
        background: { color: "#FFFFFF" },
        tokens: {
          primary: "#2A2A2A",
          secondary: "#F0F0F0",
          accent: "#BE944E",
          surface: "#FFFFFF",
          text: "#1A1A1A",
          headingFont: "Playfair Display",
          bodyFont: "Inter",
          radius: "sm",
          density: "comfortable",
        },
        sections: [
          {
            id: "sec-invalid",
            type: "alien-unsupported-section-type",
            label: "Alien Section",
            visible: true,
            order: 0,
            elementIds: [],
          },
        ],
        elements: [],
        bindings: {},
      };

      const result = WeddingSceneDocumentSchema.safeParse(invalidScene);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("type");
      }
    });

    it("accepts legacy section aliases for backward compatibility", () => {
      const legacyScene = {
        schemaVersion: 1,
        templateSlug: "wedding-heritage-crimson-gold",
        width: 390,
        height: 1200,
        background: { color: "#FFFDF8" },
        tokens: {
          primary: "#8B1E2D",
          secondary: "#F4E8D0",
          accent: "#C9A45C",
          surface: "#FFFDF8",
          text: "#2E1B1B",
          headingFont: "Playfair Display",
          bodyFont: "Inter",
          radius: "sm",
          density: "comfortable",
        },
        sections: [
          {
            id: "sec-legacy",
            type: "arch-welcome",
            label: "Arch Welcome",
            visible: true,
            order: 0,
            elementIds: [],
          },
        ],
        elements: [],
        bindings: {},
      };

      expect(WeddingSceneDocumentSchema.safeParse(legacyScene).success).toBe(true);
    });
  });

  describe("Preservation of custom elements and event date bindings", () => {
    it("preserves previously added custom elements without dropping them", () => {
      const initial = ensureWeddingSceneData("wedding-blank", {
        cardCategory: "WEDDING",
        groom: { fullName: "Groom" },
        bride: { fullName: "Bride" },
      });

      // User manually adds a custom sticker / text element
      const customElement = {
        id: "custom-user-sticker-1",
        type: "image",
        content: "https://example.com/sticker.png",
        x: 100,
        y: 200,
        width: 80,
        height: 80,
        zIndex: 10,
      };

      const modifiedCategoryData = {
        ...initial,
        canvasDocument: {
          ...initial.canvasDocument,
          elements: [...initial.canvasDocument.elements, customElement],
        },
      };

      // Calling ensureWeddingSceneData again (e.g. on subsequent draft update)
      const reEnsured = ensureWeddingSceneData("wedding-blank", modifiedCategoryData);
      const foundCustom = reEnsured.canvasDocument.elements.find(
        (el: any) => el.id === "custom-user-sticker-1"
      );
      expect(foundCustom).toBeDefined();
      expect(foundCustom.content).toBe("https://example.com/sticker.png");
    });

    it("preserves event date formatting and bindings across Date to ISO string serialization", () => {
      const eventDate = new Date("2026-11-20T09:30:00.000Z");
      const dataWithDate = {
        cardCategory: "WEDDING" as const,
        groom: { fullName: "Hoang" },
        bride: { fullName: "Ngan" },
        events: [
          {
            eventName: "Lễ Vu Quy",
            eventDate,
            venueName: "Tư Gia",
            address: "123 Đường Láng",
            mapUrl: "https://maps.google.com",
          },
        ],
      };

      const result = ensureWeddingSceneData("wedding-heritage-crimson-gold", dataWithDate);
      expect(result.canvasDocument.bindings).toBeDefined();

      // Serialize to JSON and parse back
      const jsonStr = JSON.stringify(result);
      const parsedBack = JSON.parse(jsonStr);

      expect(parsedBack.canvasDocument.schemaVersion).toBe(1);
      expect(WeddingSceneDocumentSchema.safeParse(parsedBack.canvasDocument).success).toBe(true);
    });
  });
});
