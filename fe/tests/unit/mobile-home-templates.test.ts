import { describe, it, expect } from "vitest";
import { MASTER_TEMPLATES } from "@/lib/templates-data";

describe("Homepage & Mobile Templates Data Validation", () => {
  it("should contain all master wedding templates", () => {
    expect(MASTER_TEMPLATES.length).toBeGreaterThanOrEqual(9);
    expect(MASTER_TEMPLATES.every((t) => t.category === "WEDDING")).toBe(true);
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

  it("should have valid music metadata (musicTitle and musicUrl) for all 12 templates", () => {
    MASTER_TEMPLATES.forEach((template) => {
      expect(template.musicTitle).toBeTruthy();
      expect(template.musicUrl).toBeTruthy();
      expect(template.musicUrl).toMatch(/^\/music\/.*\.mp3$/);
    });
  });
});
