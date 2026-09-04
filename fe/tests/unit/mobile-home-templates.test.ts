import { describe, it, expect } from "vitest";
import { MASTER_TEMPLATES } from "@/lib/templates-data";

describe("Homepage & Mobile Templates Data Validation", () => {
  it("should contain exactly 12 master templates across Wedding, Birthday, and Newborn", () => {
    expect(MASTER_TEMPLATES.length).toBe(12);
  });

  it("should have all 9 standardized wedding templates", () => {
    const weddingTemplates = MASTER_TEMPLATES.filter((t) => t.category === "WEDDING");
    expect(weddingTemplates.length).toBe(9);

    const expectedSlugs = [
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

    expectedSlugs.forEach((slug) => {
      const found = weddingTemplates.find((t) => t.slug === slug);
      expect(found).toBeDefined();
      expect(found?.name).toBeTruthy();
      expect(found?.imageUrl).toBeTruthy();
      expect(found?.demoSlug).toBe(slug);
    });
  });

  it("should have birthday and newborn templates for cross-category selection", () => {
    const birthdayTemplates = MASTER_TEMPLATES.filter((t) => t.category === "BIRTHDAY");
    const newbornTemplates = MASTER_TEMPLATES.filter((t) => t.category === "NEWBORN");

    expect(birthdayTemplates.length).toBe(1);
    expect(birthdayTemplates[0].slug).toBe("birthday-glow-party");

    expect(newbornTemplates.length).toBe(2);
    expect(newbornTemplates.map((t) => t.slug)).toContain("newborn-little-prince");
    expect(newbornTemplates.map((t) => t.slug)).toContain("newborn-sweet-angel");
  });

  it("should provide valid metadata for mobile template preview modal", () => {
    MASTER_TEMPLATES.forEach((template) => {
      expect(template.id).toBeTruthy();
      expect(template.price).toMatch(/đ$/);
      expect(template.style).toBeTruthy();
      expect(template.features).toBeInstanceOf(Array);
      expect(template.features?.length).toBeGreaterThan(0);
      expect(template.tags).toBeInstanceOf(Array);
      expect(template.tags?.length).toBeGreaterThan(0);
    });
  });
});
