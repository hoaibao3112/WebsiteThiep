import DOMPurify from "isomorphic-dompurify";

// Cấu hình DOMPurify cho SVG an toàn
const SANITIZE_OPTIONS = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ["use"],
  ADD_ATTR: ["href", "xlink:href"],
  FORBID_TAGS: [
    "script",
    "foreignObject",
    "iframe",
    "object",
    "embed",
    "style",
    "animate",
    "set",
    "audio",
    "video",
  ],
  FORBID_ATTR: [
    "onload",
    "onerror",
    "onclick",
    "onmouseover",
    "onfocus",
    "onblur",
    "formaction",
  ],
};

// Hook kiểm tra thuộc tính href / xlink:href chỉ cho phép liên kết nội bộ "#id"
DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
  const attrName = data.attrName.toLowerCase();
  if (attrName === "href" || attrName === "xlink:href") {
    const val = data.attrValue.trim();
    // Chỉ cho phép fragment identifier (#icon-id) cho SVG <use> hoặc <linearGradient>
    if (!val.startsWith("#")) {
      data.keepAttr = false;
    }
  }
});

/**
 * Làm sạch chuỗi SVG đầu vào, loại bỏ triệt để XSS và các thẻ/thuộc tính nguy hiểm.
 */
export function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== "string") {
    return "";
  }
  const clean = DOMPurify.sanitize(svg, SANITIZE_OPTIONS);
  return typeof clean === "string" ? clean.trim() : "";
}
