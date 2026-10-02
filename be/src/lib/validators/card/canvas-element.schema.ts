import { z } from "zod";

export const StoredImageUrlSchema = z.string().refine(
  (value) =>
    /^https?:\/\//i.test(value) ||
    value.startsWith("/uploads/") ||
    value.startsWith("/images/") ||
    (value.startsWith("/") && !value.startsWith("//")),
  "Ảnh không hợp lệ hoặc chưa được tải lên máy chủ"
);

export const CanvasElementSchema = z
  .object({
    id: z.string(),
    type: z.enum(["text", "image", "shape", "sticker", "preset", "widget", "stock"]),
    content: z.string().default(""),
    x: z.number().min(-2000).max(10000), // Tọa độ X (px) - giới hạn hợp lý
    y: z.number().min(-2000).max(100000), // Tọa độ Y (px) - giới hạn hợp lý
    width: z.number().min(0).max(10000), // Chiều rộng (px)
    height: z.number().min(0).max(100000), // Chiều cao (px)
    rotation: z.number().min(-360).max(360).default(0), // Góc xoay độ (-360 đến 360)
    zIndex: z.number().default(1), // Thứ tự lớp hiển thị
    // Styling & Typography
    fontSize: z.number().min(1).max(500).optional(),
    fontFamily: z.string().max(100).optional(),
    color: z.string().max(100).optional(),
    backgroundColor: z.string().max(100).optional(),
    opacity: z.number().min(0).max(1).optional(),
    textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
    isBold: z.boolean().optional(),
    isItalic: z.boolean().optional(),
    isUnderline: z.boolean().optional(),
    isStrike: z.boolean().optional(),
    isUppercase: z.boolean().optional(),
    letterSpacing: z.number().optional(),
    lineHeight: z.number().optional(),
    padding: z.number().optional(),
    borderRadius: z.number().min(0).max(1000).optional(),
    borderWidth: z.number().min(0).max(100).optional(),
    borderColor: z.string().max(100).optional(),
    shadow: z.string().optional(),
    isLocked: z.boolean().optional(),
    userEdited: z.boolean().optional(),
    bindingDetached: z.boolean().optional(),
    shapeType: z.enum([
      "line",
      "rect",
      "circle",
      "corner",
      "square",
      "triangle",
      "arch",
      "heart",
      "star",
      "diamond",
      "hexagon",
      "oval",
      "ribbon",
      "wavy-line",
      "dashed-line",
      "flourish-line",
    ]).optional(),
    presetId: z.string().optional(),
    stockId: z.string().optional(),
    svgContent: z.string().refine((svg) => {
      if (!svg) return true;
      const lower = svg.toLowerCase();
      if (lower.includes("<script") || /on[a-z]+\s*=/i.test(svg)) {
        return false;
      }
      return true;
    }, "svgContent không được chứa thẻ script hoặc sự kiện nguy hiểm").optional(),
    svgType: z.enum(["frame", "divider", "custom"]).optional(),
    imageUrl: z.union([StoredImageUrlSchema, z.literal("")]).optional(),
    title: z.string().max(500).optional(),
    animation: z.string().optional(),
    loopAnimation: z.string().optional(),
    linkUrl: z.string().refine((url) => {
      if (!url) return true;
      return /^(https?:\/\/|tel:|mailto:)/i.test(url);
    }, "linkUrl chỉ cho phép giao thức http, https, tel hoặc mailto").optional(),
    // Đối xứng (Flip)
    flipX: z.boolean().optional(),
    flipY: z.boolean().optional(),
    widgetType: z.enum([
      "calendar",
      "countdown",
      "map",
      "contact",
      "rsvp",
      "album",
      "guest-name",
      "gift",
      "envelope",
      "timeline",
      "dress-code",
      "love-story",
      "menu",
      "procession-route",
      "lace-vow-card",
      "swan-ceremony",
    ]).optional(),
    customData: z.record(z.any()).optional(),
    widgetConfig: z.object({
      title: z.string().max(160).optional(),
      description: z.string().max(1_000).optional(),
      buttonLabel: z.string().max(80).optional(),
      eventDate: z.string().max(80).optional(),
      url: z.string().max(2_000).optional(),
      phone: z.string().max(30).optional(),
      showTitle: z.boolean().optional(),
    }).passthrough().optional(),
    updatedAt: z.string().optional(),
  });

export type CanvasElement = z.infer<typeof CanvasElementSchema>;

export const CanvasDocumentSchema = z
  .object({
    width: z.number().default(420),
    height: z.number().default(720),
    backgroundColor: z.string().default("#FFFFFF"),
    backgroundPattern: z.string().default("none"),
    fallingEffect: z.string().default("none"),
    elements: z.array(CanvasElementSchema).default([]),
  })
  .passthrough();

export type CanvasDocument = z.infer<typeof CanvasDocumentSchema>;

