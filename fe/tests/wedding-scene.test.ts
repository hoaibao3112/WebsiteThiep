import { describe, expect, it } from "vitest";
import { createWeddingSceneFromWeddingData, hydrateWeddingScene, isWeddingSceneDocument } from "@/lib/editor/wedding-scene";
import type { WeddingDataPayload } from "@/types/card.types";

const data: WeddingDataPayload = {
  cardCategory: "WEDDING",
  groom: { fullName: "Nguyễn Văn Anh" },
  bride: { fullName: "Trần Minh Thơ" },
  greeting: "Mời bạn đến chung vui",
};

describe("wedding scene migration", () => {
  it("creates a versioned scene with sections for each wedding template", () => {
    const scene = createWeddingSceneFromWeddingData(data, "wedding-forest-green-botanical");
    expect(isWeddingSceneDocument(scene)).toBe(true);
    expect(scene.templateSlug).toBe("wedding-forest-green-botanical");
    expect(scene.sections.length).toBeGreaterThan(3);
    expect(scene.elements.find((element) => element.id === "scene-groom")?.content).toContain("Văn Anh");
  });

  it("hydrates bound content without changing layout", () => {
    const scene = createWeddingSceneFromWeddingData(data);
    const hydrated = hydrateWeddingScene(scene, {
      ...data,
      groom: { fullName: "Lê Nam" },
      bride: { fullName: "Phạm Hoa" },
    });
    expect(hydrated.elements).toHaveLength(scene.elements.length);
    expect(hydrated.elements.find((element) => element.id === "scene-groom")?.content).toBe("Lê Nam");
    expect(hydrated.elements.find((element) => element.id === "scene-bride")?.content).toBe("Phạm Hoa");
  });
});

