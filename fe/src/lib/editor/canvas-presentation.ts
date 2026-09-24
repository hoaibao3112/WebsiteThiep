import type { CSSProperties } from "react";
import type { CanvasElement } from "@/types/canvas.types";

export function safeCanvasLink(value?: string): string | undefined {
  if (!value || /[\u0000-\u0020\\]/.test(value)) return undefined;
  if (/^https?:\/\//i.test(value)) {
    try { return new URL(value).href; } catch { return undefined; }
  }
  if (/^tel:\+?[\d()-]+$/.test(value)) return value;
  if (/^mailto:[^@]+@[^@]+$/.test(value)) return value;
  return undefined;
}

export function canvasElementStyle(el: CanvasElement): CSSProperties {
  return {
    position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height,
    zIndex: el.zIndex ?? 1, opacity: el.opacity ?? 1,
    fontFamily: el.fontFamily, fontSize: el.fontSize ?? 28,
    color: el.color ?? "#292524", backgroundColor: el.backgroundColor ?? "transparent",
    textAlign: el.textAlign ?? "center", fontWeight: el.isBold ? "bold" : "normal",
    fontStyle: el.isItalic ? "italic" : "normal",
    textDecoration: [el.isUnderline && "underline", el.isStrike && "line-through"].filter(Boolean).join(" ") || "none",
    textTransform: el.isUppercase ? "uppercase" : "none",
    letterSpacing: el.letterSpacing, lineHeight: el.lineHeight ?? 1.25,
    whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: el.padding ?? 0,
    borderRadius: el.borderRadius, borderWidth: el.borderWidth,
    borderColor: el.borderColor, borderStyle: el.borderWidth ? "solid" : undefined,
    boxShadow: el.shadow,
    transform: [el.rotation ? `rotate(${el.rotation}deg)` : "", el.flipX ? "scaleX(-1)" : "", el.flipY ? "scaleY(-1)" : ""].filter(Boolean).join(" ") || undefined,
  };
}

export function readRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function readCanvasData(value: unknown) {
  const root = readRecord(value);
  const data = { ...root, ...readRecord(root.categoryData) };
  return {
    groom: readRecord(data.groom), bride: readRecord(data.bride),
    coverPhotoUrl: typeof data.coverPhotoUrl === "string" ? data.coverPhotoUrl : undefined,
  };
}
