"use client";

import React, { useMemo } from "react";
import DOMPurify from "dompurify";

export interface SafeSvgProps {
  svg: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  ariaLabel?: string;
  role?: string;
}

if (typeof window !== "undefined" && DOMPurify.addHook) {
  // Hook chỉ cho phép liên kết nội bộ "#id"
  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    const attrName = data.attrName.toLowerCase();
    if (attrName === "href" || attrName === "xlink:href") {
      const val = (data.attrValue || "").trim();
      if (!val.startsWith("#")) {
        data.keepAttr = false;
      }
    }
  });
}

/**
 * Component render SVG an toàn chống Stored XSS bằng DOMPurify profile svg.
 */
export const SafeSvg: React.FC<SafeSvgProps> = ({
  svg,
  className,
  style,
  onClick,
  ariaLabel,
  role = "img",
}) => {
  const cleanSvg = useMemo(() => {
    if (!svg || typeof svg !== "string") return "";
    return DOMPurify.sanitize(svg, {
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
    });
  }, [svg]);

  if (!cleanSvg) return null;

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: cleanSvg }}
    />
  );
};
