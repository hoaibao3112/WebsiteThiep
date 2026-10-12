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
  "botanical-sage",
  "oriental-crimson",
  "polaroid-kraft",
]);

// ── CÁC PHONG CÁCH THIẾT KẾ BÌA KẾT NGHỆ THUẬT ──
export const AlbumCoverDesignPresetSchema = z.enum([
  "velvet-stitched", // Nhung đỏ hoàng gia chỉ khâu (như mẫu trong ảnh)
  "gold-foil-floral", // Ép kim hoa văn hoàng gia cổ điển
  "vintage-leather-wax", // Da thuộc vintage kết hợp con dấu sáp niêm phong
  "botanical-sage-glass", // Xanh sage thảo mộc kết hợp kính mờ glassmorphism
  "minimal-monochrome", // Đen tuyền tối giản chuẩn studio Hàn Quốc
  "polaroid-farewell", // Đính kèm ảnh kỷ niệm polaroid & chữ ký viết tay
  "oriental-red-songhy", // Á Đông truyền thống chữ Song Hỷ dát vàng
]);

export const AlbumBackCoverBorderStyleSchema = z.enum([
  "stitched-dashed",
  "gold-double",
  "ornate-corners",
  "minimal-solid",
  "none",
]);

export const AlbumBackCoverBadgeIconSchema = z.enum([
  "heart",
  "wax-seal",
  "song-hy",
  "infinity",
  "none",
]);

// ── CẤU HÌNH CHI TIẾT TRANG BÌA KẾT (BACK COVER) ──
export const AlbumBackCoverConfigSchema = z.object({
  enabled: z.boolean().default(true),
  designPreset: AlbumCoverDesignPresetSchema.default("velvet-stitched"),
  title: z.string().max(120).default("Forever & Always"),
  subtitle: z.string().max(500).default(
    "Cảm ơn bạn đã dõi theo và sẻ chia những khoảnh khắc hạnh phúc cùng chúng mình!"
  ),
  signatureText: z.string().max(120).optional().default(""),
  buttonText: z.string().max(60).default("Quay lại trang bìa"),
  photoUrl: z.string().url("Đường dẫn ảnh không hợp lệ").optional().or(z.literal("")),
  showPetals: z.boolean().default(true),
  borderStyle: AlbumBackCoverBorderStyleSchema.default("stitched-dashed"),
  badgeIcon: AlbumBackCoverBadgeIconSchema.default("heart"),
  customBgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu Hex không hợp lệ").optional(),
  customTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu Hex không hợp lệ").optional(),
});

// ── THƯ VIỆN PRESETS THIẾT KẾ BÌA KẾT ĐƯỢC QUẢN LÝ TỪ BACKEND ──
export interface AlbumBackCoverPresetMeta {
  id: z.infer<typeof AlbumCoverDesignPresetSchema>;
  name: string;
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultButtonText: string;
  borderStyle: z.infer<typeof AlbumBackCoverBorderStyleSchema>;
  badgeIcon: z.infer<typeof AlbumBackCoverBadgeIconSchema>;
  showPetals: boolean;
  bgGradient: string;
  accentColor: string;
  textColor: string;
  bgHex: string;
}

export const ALBUM_BACK_COVER_PRESET_CATALOG: Record<
  z.infer<typeof AlbumCoverDesignPresetSchema>,
  AlbumBackCoverPresetMeta
> = {
  "velvet-stitched": {
    id: "velvet-stitched",
    name: "Nhung Đỏ Hoàng Gia (Chỉ Khâu)",
    description: "Nhung đỏ rượu trầm quý phái với đường may chỉ khâu tinh xảo và cánh hoa bay",
    defaultTitle: "Forever & Always",
    defaultSubtitle: "Cảm ơn bạn đã dõi theo và sẻ chia những khoảnh khắc hạnh phúc cùng chúng mình!",
    defaultButtonText: "Quay lại trang bìa",
    borderStyle: "stitched-dashed",
    badgeIcon: "heart",
    showPetals: true,
    bgGradient: "bg-gradient-to-br from-[#4A0E17] via-[#5C1D27] to-[#360810]",
    accentColor: "#D4AF37",
    textColor: "#FFFDF9",
    bgHex: "#4A0E17",
  },
  "gold-foil-floral": {
    id: "gold-foil-floral",
    name: "Ép Kim Dát Vàng Cổ Điển",
    description: "Khung viền mạ vàng 24k hoàng gia với hoa văn góc baroque sang trọng",
    defaultTitle: "With Love & Gratitude",
    defaultSubtitle: "Sự hiện diện và lời chúc của bạn là món quà ý nghĩa nhất trong ngày trọng đại của chúng tôi.",
    defaultButtonText: "Xem lại từ đầu",
    borderStyle: "ornate-corners",
    badgeIcon: "infinity",
    showPetals: false,
    bgGradient: "bg-gradient-to-br from-[#231A12] via-[#2F2318] to-[#18120B]",
    accentColor: "#CCA24C",
    textColor: "#FDF8EE",
    bgHex: "#231A12",
  },
  "vintage-leather-wax": {
    id: "vintage-leather-wax",
    name: "Da Thuộc Niêm Phong Sáp",
    description: "Vân da thủ công phong cách cổ điển phương Tây đính kèm con dấu sáp 3D dập nổi",
    defaultTitle: "Happy Ending",
    defaultSubtitle: "Khởi đầu cho hành trình mới ngập tràn hạnh phúc và yêu thương.",
    defaultButtonText: "Quay lại bìa sách",
    borderStyle: "gold-double",
    badgeIcon: "wax-seal",
    showPetals: false,
    bgGradient: "bg-gradient-to-br from-[#3D2314] via-[#4A2D1B] to-[#2E190D]",
    accentColor: "#C99A52",
    textColor: "#F7EFE6",
    bgHex: "#3D2314",
  },
  "botanical-sage-glass": {
    id: "botanical-sage-glass",
    name: "Kính Mờ Thảo Mộc Sage",
    description: "Nền xanh thảo mộc nhẹ nhàng kết hợp hiệu ứng kính mờ glassmorphism và lá cây",
    defaultTitle: "Tình Yêu Đơm Hoa",
    defaultSubtitle: "Cảm ơn bạn đã luôn đồng hành và tưới mát cho tình yêu của chúng mình.",
    defaultButtonText: "Về trang đầu",
    borderStyle: "minimal-solid",
    badgeIcon: "heart",
    showPetals: true,
    bgGradient: "bg-gradient-to-br from-[#2C3E2D] via-[#374C38] to-[#1F2E20]",
    accentColor: "#A3C2A1",
    textColor: "#F5FAF5",
    bgHex: "#2C3E2D",
  },
  "minimal-monochrome": {
    id: "minimal-monochrome",
    name: "Tối Giản Chuẩn Studio Hàn Quốc",
    description: "Đen tuyền obsidian lịch lãm cùng typography thanh thoát và chữ ký cặp đôi",
    defaultTitle: "Our Beginning",
    defaultSubtitle: "Trân trọng từng khoảnh khắc được sẻ chia cùng những người thân yêu nhất.",
    defaultButtonText: "Xem lại album",
    borderStyle: "minimal-solid",
    badgeIcon: "none",
    showPetals: false,
    bgGradient: "bg-gradient-to-br from-[#1C1C1F] via-[#141416] to-[#0D0D0E]",
    accentColor: "#E0E0E0",
    textColor: "#FFFFFF",
    bgHex: "#1C1C1F",
  },
  "polaroid-farewell": {
    id: "polaroid-farewell",
    name: "Ảnh Kỷ Niệm Polaroid",
    description: "Khung ảnh cưới kỷ niệm đính kèm lời cảm ơn viết tay ấm áp",
    defaultTitle: "Mãi Mãi Bên Nhau",
    defaultSubtitle: "Cảm ơn bạn đã là một phần đẹp đẽ trong câu chuyện tình yêu của chúng mình!",
    defaultButtonText: "Quay lại trang bìa",
    borderStyle: "stitched-dashed",
    badgeIcon: "heart",
    showPetals: true,
    bgGradient: "bg-gradient-to-br from-[#382622] via-[#45302C] to-[#291B18]",
    accentColor: "#E8B4A2",
    textColor: "#FFF9F7",
    bgHex: "#382622",
  },
  "oriental-red-songhy": {
    id: "oriental-red-songhy",
    name: "Hỷ Sự Á Đông Truyền Thống",
    description: "Sắc đỏ son may mắn cùng chữ Song Hỷ dát vàng chúc phúc trăm năm hòa hợp",
    defaultTitle: "Trăm Năm Tình Viên Mãn",
    defaultSubtitle: "Tạ ơn trời đất tác hợp, cảm ơn quan viên hai họ và quý quan khách đã đến chung vui.",
    defaultButtonText: "Về trang bìa",
    borderStyle: "gold-double",
    badgeIcon: "song-hy",
    showPetals: true,
    bgGradient: "bg-gradient-to-br from-[#80121D] via-[#941A26] to-[#630B13]",
    accentColor: "#F4C430",
    textColor: "#FFFDF6",
    bgHex: "#80121D",
  },
};

export const Album3DConfigSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().max(120).default("Album Ảnh Cưới Kỷ Niệm"),
  coverTitle: z.string().max(120).optional(),
  coverSubtitle: z.string().max(120).optional(),
  coverTheme: AlbumCoverThemeSchema.default("leather-burgundy"),
  soundEnabled: z.boolean().default(true),
  autoPlayInterval: z.number().int().min(0).max(60).default(0),
  pages: z.array(Album3DPageSchema).default([]),
  backCover: AlbumBackCoverConfigSchema.default({
    enabled: true,
    designPreset: "velvet-stitched",
    title: "Forever & Always",
    subtitle: "Cảm ơn bạn đã dõi theo và sẻ chia những khoảnh khắc hạnh phúc cùng chúng mình!",
    signatureText: "",
    buttonText: "Quay lại trang bìa",
    photoUrl: "",
    showPetals: true,
    borderStyle: "stitched-dashed",
    badgeIcon: "heart",
  }),
});

export type Album3DConfig = z.infer<typeof Album3DConfigSchema>;
export type Album3DPage = z.infer<typeof Album3DPageSchema>;
export type AlbumBackCoverConfig = z.infer<typeof AlbumBackCoverConfigSchema>;
export type AlbumCoverTheme = z.infer<typeof AlbumCoverThemeSchema>;
export type AlbumCoverDesignPreset = z.infer<typeof AlbumCoverDesignPresetSchema>;
export type AlbumBackCoverBorderStyle = z.infer<typeof AlbumBackCoverBorderStyleSchema>;
export type AlbumBackCoverBadgeIcon = z.infer<typeof AlbumBackCoverBadgeIconSchema>;
