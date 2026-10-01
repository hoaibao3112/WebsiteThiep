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
    animationDelay: el.animationDelay !== undefined ? `${el.animationDelay}s` : undefined,
    animationDuration: el.animationDuration !== undefined ? `${el.animationDuration}s` : undefined,
  };
}

export function canvasElementAnimationClass(el: CanvasElement): string {
  const classes: string[] = [];

  if (el.animation) {
    switch (el.animation) {
      case "fade-in": classes.push("anim-fade-in"); break;
      case "slide-up": classes.push("anim-slide-up"); break;
      case "slide-down": classes.push("anim-slide-down"); break;
      case "slide-left": classes.push("anim-slide-left"); break;
      case "slide-right": classes.push("anim-slide-right"); break;
      case "zoom-in": classes.push("anim-zoom-in"); break;
      case "bounce-in": classes.push("anim-bounce-in"); break;
      case "flip-3d": classes.push("anim-flip-3d"); break;
      case "shimmer": classes.push("animate-shimmer-text"); break;
    }
  }

  if (el.loopAnimation) {
    switch (el.loopAnimation) {
      case "float": classes.push("anim-loop-float"); break;
      case "pulse": classes.push("anim-loop-pulse"); break;
      case "swing": classes.push("anim-loop-swing"); break;
      case "glow": classes.push("anim-loop-glow"); break;
    }
  }

  return classes.join(" ");
}

export function readRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function readCanvasData(value: unknown) {
  const root = readRecord(value);
  const data = { ...root, ...readRecord(root.categoryData) };
  const rawPhotos = Array.isArray(data.photos) && data.photos.length > 0
    ? data.photos
    : Array.isArray(root.photos) && root.photos.length > 0
    ? (root.photos as unknown[])
    : Array.isArray(data.photos)
    ? data.photos
    : [];

  const photos = rawPhotos.map(readRecord);
  const coverPhotoUrl =
    (typeof data.coverPhotoUrl === "string" && data.coverPhotoUrl) ||
    (typeof root.coverPhotoUrl === "string" && root.coverPhotoUrl) ||
    (photos[0] && typeof photos[0].url === "string" ? (photos[0].url as string) : undefined);

  return {
    groom: readRecord(data.groom),
    bride: readRecord(data.bride),
    coverPhotoUrl,
    events: Array.isArray(data.events) ? data.events.map(readRecord) : [],
    photos,
    greeting: typeof data.greeting === "string" ? data.greeting : (typeof data.greetingMessage === "string" ? data.greetingMessage : undefined),
    heroSubtitle: typeof data.heroSubtitle === "string" ? data.heroSubtitle : undefined,
    loveStory: Array.isArray(data.loveStory) ? data.loveStory.map(readRecord) : [],
    bankingPrimary: readRecord(data.bankingPrimary),
    bankingSecondary: readRecord(data.bankingSecondary),
  };
}
