import { z } from "zod";

export const Album3DPageSchema = z.object({
  id: z.string(),
  url: z.string().url("Đường dẫn ảnh không hợp lệ"),
  caption: z.string().max(200, "Chú thích không quá 200 ký tự").optional(),
  aspectRatio: z.enum(["portrait", "landscape", "square"]).optional().default("portrait"),
  sortOrder: z.number().int().default(0),
});

export const AlbumCoverThemeSchema = z.enum([
  "leather-burgundy",
  "linen-cream",
  "royal-gold",
  "minimalist-dark",
]);

export const Album3DConfigSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().max(120).default("Album Ảnh Cưới Kỷ Niệm"),
  coverTitle: z.string().max(120).optional(),
  coverSubtitle: z.string().max(120).optional(),
  coverTheme: AlbumCoverThemeSchema.default("leather-burgundy"),
  soundEnabled: z.boolean().default(true),
  autoPlayInterval: z.number().int().min(0).max(60).default(0),
  pages: z.array(Album3DPageSchema).default([]),
});

export type Album3DConfig = z.infer<typeof Album3DConfigSchema>;
export type Album3DPage = z.infer<typeof Album3DPageSchema>;
