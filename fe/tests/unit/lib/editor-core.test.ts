import { describe, expect, it } from "vitest";
import { applyDraftPatch, readDraftPath } from "@/lib/editor/patch-draft";
import { getTemplateFields } from "@/lib/editor/template-registry";

describe("visual editor core", () => {
  it("updates an allowlisted path immutably", () => {
    const draft = { primaryColor: "#fff", categoryData: { groom: { fullName: "Minh" } } };
    const next = applyDraftPatch(draft, "categoryData.groom.fullName", "Lan");
    expect(readDraftPath(next, "categoryData.groom.fullName")).toBe("Lan");
    expect(readDraftPath(draft, "categoryData.groom.fullName")).toBe("Minh");
    expect(() => applyDraftPatch(draft, "__proto__.polluted", "x")).toThrow();

    // categoryData root & categoryData.album3d allowed
    const withAlbum = applyDraftPatch(draft, "categoryData.album3d", { enabled: true });
    expect((withAlbum as any).categoryData?.album3d?.enabled).toBe(true);

    const withCat = applyDraftPatch(draft, "categoryData", { groom: { fullName: "Test" } });
    expect((withCat as any).categoryData?.groom?.fullName).toBe("Test");
  });

  it("returns fields appropriate for each template", () => {
    expect(getTemplateFields("wedding-minimalist-gold").some((field) => field.path === "primaryColor")).toBe(true);
    expect(getTemplateFields("unknown-template")).toHaveLength(0);
  });
});
