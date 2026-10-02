import { describe, it, expect } from "vitest";
import { sanitizeSvg } from "../../src/lib/sanitize-svg";
import { CanvasElementSchema } from "../../src/lib/validators/card/canvas-element.schema";

describe("sanitizeSvg & CanvasElementSchema Stored XSS Protection", () => {
  it("loại bỏ thuộc tính href chứa javascript:", () => {
    const malicious = `<svg><a href="javascript:alert(1)"><text>Click</text></a></svg>`;
    const cleaned = sanitizeSvg(malicious);
    expect(cleaned).not.toContain("javascript:");
    expect(cleaned).not.toContain('href="javascript:alert(1)"');
  });

  it("loại bỏ thẻ foreignObject và iframe nguy hiểm", () => {
    const malicious = `<svg><foreignObject><iframe src="javascript:alert(1)"></iframe></foreignObject></svg>`;
    const cleaned = sanitizeSvg(malicious);
    expect(cleaned).not.toContain("foreignObject");
    expect(cleaned).not.toContain("iframe");
    expect(cleaned).not.toContain("javascript:");
  });

  it("loại bỏ thẻ animate và set", () => {
    const malicious = `<svg><rect width="100" height="100"><animate values="javascript:alert(1)"/></rect></svg>`;
    const cleaned = sanitizeSvg(malicious);
    expect(cleaned).not.toContain("<animate");
    expect(cleaned).not.toContain("javascript:");
  });

  it("giữ nguyên thẻ và thuộc tính SVG hợp lệ trong catalog", () => {
    const valid = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1"><stop offset="0%" stop-color="#ff0000"/></linearGradient></defs><circle cx="50" cy="50" r="40" fill="url(#g1)"/><use href="#g1"/></svg>`;
    const cleaned = sanitizeSvg(valid);
    expect(cleaned).toContain("<svg");
    expect(cleaned).toContain("<circle");
    expect(cleaned).toContain('href="#g1"');
  });

  it("CanvasElementSchema transform svgContent một cách an toàn", () => {
    const input = {
      id: "elem-1",
      type: "shape",
      x: 10,
      y: 20,
      width: 100,
      height: 100,
      svgContent: `<svg><a href="javascript:alert(1)"><rect width="50" height="50"/></a></svg>`,
    };

    const parsed = CanvasElementSchema.parse(input);
    expect(parsed.svgContent).toBeDefined();
    expect(parsed.svgContent).not.toContain("javascript:");
  });
});
