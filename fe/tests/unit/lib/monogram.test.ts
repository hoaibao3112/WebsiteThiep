import { describe, expect, it } from "vitest";
import { getMonogram } from "@/lib/guest/monogram";

describe("getMonogram", () => {
  it("uses the first letters of both names", () => {
    expect(getMonogram("Nguyễn Văn Quân", "Trần Thu Hà")).toBe("N·T");
  });
  it("falls back safely when one or both names are missing", () => {
    expect(getMonogram("", "Trần Hà")).toBe("T");
    expect(getMonogram("", "")).toBe("♥");
  });
});
