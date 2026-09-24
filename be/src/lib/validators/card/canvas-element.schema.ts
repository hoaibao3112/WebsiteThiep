import { z } from "zod";

export const CanvasElementSchema = z
  .object({
    id: z.string(),
    type: z.enum(["text", "image", "shape", "sticker", "preset", "widget", "stock"]),
    content: z.string().default(""),
    x: z.number(), // Tọa độ X (px) - do người dùng tự do kéo thả
    y: z.number(), // Tọa độ Y (px) - do người dùng tự do kéo thả
    width: z.number().min(5), // Chiều rộng (px) - do người dùng kéo to nhỏ
    height: z.number().min(5), // Chiều cao (px) - do người dùng kéo to nhỏ
    rotation: z.number().default(0), // Góc xoay độ (0-360)
    zIndex: z.number().default(1), // Thứ tự lớp hiển thị
    // Styling & Typography
    fontSize: z.number().optional(),
    fontFamily: z.string().optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
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
    borderRadius: z.number().optional(),
    borderWidth: z.number().optional(),
    borderColor: z.string().optional(),
    shadow: z.string().optional(),
    isLocked: z.boolean().optional(),
    shapeType: z.enum(["line", "rect", "circle", "corner", "square", "triangle"]).optional(),
    presetId: z.string().optional(),
    stockId: z.string().optional(),
    svgContent: z.string().optional(),
    svgType: z.enum(["frame", "divider", "custom"]).optional(),
    imageUrl: z.string().optional(),
    title: z.string().optional(),
    animation: z.string().optional(),
    loopAnimation: z.string().optional(),
    linkUrl: z.string().optional(),
    // Đối xứng (Flip)
    flipX: z.boolean().optional(),
    flipY: z.boolean().optional(),
    widgetType: z.enum(["calendar", "countdown", "map", "contact", "rsvp", "album", "guest-name", "gift", "envelope"]).optional(),
    widgetConfig: z.object({
      title: z.string().max(160).optional(),
      description: z.string().max(1_000).optional(),
      buttonLabel: z.string().max(80).optional(),
      eventDate: z.string().max(80).optional(),
      url: z.string().max(2_000).optional(),
      phone: z.string().max(30).optional(),
      showTitle: z.boolean().optional(),
    }).optional(),
  })
  .passthrough();

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

