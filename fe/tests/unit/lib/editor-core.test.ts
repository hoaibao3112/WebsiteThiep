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
  });

  it("returns fields appropriate for each template", () => {
    expect(getTemplateFields("wedding-minimalist-gold").some((field) => field.path === "primaryColor")).toBe(true);
    expect(getTemplateFields("unknown-template")).toHaveLength(0);
  });
});
