export interface Album3DPage {
  id: string;
  url: string;
  caption?: string;
  aspectRatio?: "portrait" | "landscape" | "square";
  sortOrder: number;
}

export type AlbumCoverTheme =
  | "leather-burgundy"
  | "linen-cream"
  | "royal-gold"
  | "minimalist-dark"
  | "botanical-sage"
  | "oriental-crimson"
  | "polaroid-kraft";

// ── CÁC PHONG CÁCH THIẾT KẾ BÌA KẾT NGHỆ THUẬT (BACK COVER) ──
export type AlbumCoverDesignPreset =
  | "velvet-stitched" // Nhung đỏ hoàng gia chỉ khâu (như mẫu trong ảnh)
  | "gold-foil-floral" // Ép kim hoa văn hoàng gia cổ điển
  | "vintage-leather-wax" // Da thuộc vintage kết hợp con dấu sáp niêm phong
  | "botanical-sage-glass" // Xanh sage thảo mộc kết hợp kính mờ glassmorphism
  | "minimal-monochrome" // Đen tuyền tối giản chuẩn studio Hàn Quốc
  | "polaroid-farewell" // Đính kèm ảnh kỷ niệm polaroid & chữ ký viết tay
  | "oriental-red-songhy"; // Á Đông truyền thống chữ Song Hỷ dát vàng

export type AlbumBackCoverBorderStyle =
  | "stitched-dashed"
  | "gold-double"
  | "ornate-corners"
  | "minimal-solid"
  | "none";

export type AlbumBackCoverBadgeIcon =
  | "heart"
  | "wax-seal"
  | "song-hy"
  | "infinity"
  | "none";

export interface AlbumBackCoverConfig {
  enabled: boolean;
  designPreset: AlbumCoverDesignPreset;
  title: string;
  subtitle: string;
  signatureText?: string;
  buttonText: string;
  photoUrl?: string;
  showPetals: boolean;
  borderStyle: AlbumBackCoverBorderStyle;
  badgeIcon: AlbumBackCoverBadgeIcon;
  customBgColor?: string;
  customTextColor?: string;
}

export interface AlbumBackCoverPresetMeta {
  id: AlbumCoverDesignPreset;
  name: string;
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultButtonText: string;
  borderStyle: AlbumBackCoverBorderStyle;
  badgeIcon: AlbumBackCoverBadgeIcon;
  showPetals: boolean;
  bgGradient: string;
  accentColor: string;
  textColor: string;
  bgHex: string;
}

export const ALBUM_BACK_COVER_PRESET_CATALOG: Record<
  AlbumCoverDesignPreset,
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

export const DEFAULT_ALBUM_BACK_COVER: AlbumBackCoverConfig = {
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
};

export interface Album3DConfig {
  enabled: boolean;
  title: string; // "Album Kỷ Niệm Ngày Chung Đôi"
  coverTitle?: string; // Tên in bìa: "HOÀNG NAM & MAI LAN"
  coverSubtitle?: string; // "Our Wedding Album - 2026"
  coverMonogram?: string; // Chữ lồng monogram bìa, vd "L & N"
  coverTheme: AlbumCoverTheme; // Màu bìa sách
  soundEnabled: boolean; // Bật tiếng lật giấy mỹ thuật
  autoPlayInterval?: number; // Số giây tự lật (0 = tắt)
  pages: Album3DPage[];
  backCover?: AlbumBackCoverConfig;
}

export const DEFAULT_ALBUM_3D_CONFIG: Album3DConfig = {
  enabled: true,
  title: "Album Ảnh Cưới Kỷ Niệm",
  coverTitle: "KỶ NIỆM NGÀY CHUNG ĐÔI",
  coverSubtitle: "Our Wedding Photobook",
  coverTheme: "leather-burgundy",
  soundEnabled: true,
  autoPlayInterval: 0,
  pages: [],
  backCover: DEFAULT_ALBUM_BACK_COVER,
};

/**
 * Trích xuất Google Drive File ID từ bất kỳ định dạng link chia sẻ nào
 */
export function extractGoogleDriveFileId(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  // Pattern 1: /file/d/{id}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
  if (fileDMatch) return fileDMatch[1];

  // Pattern 2: id={id}
  const idQueryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (idQueryMatch) return idQueryMatch[1];

  // Pattern 3: /d/{id}
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  if (dMatch) return dMatch[1];

  // Pattern 4: Bare ID (chuỗi 25-50 ký tự base64url thông dụng của Google Drive)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Trích xuất Google Drive Folder ID
 */
export function extractGoogleDriveFolderId(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  // Pattern /folders/{folderId}
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{25,})/);
  if (folderMatch) return folderMatch[1];

  // Pattern id={folderId}
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (idMatch) return idMatch[1];

  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Tạo URL xem ảnh trực tiếp từ Google Drive File ID
 */
export function buildGoogleDriveDirectUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/**
 * Phân tích danh sách link Google Drive
 */
export function parseMultipleGoogleDriveLinks(text: string): Array<{ fileId: string; directUrl: string }> {
  if (!text) return [];
  const lines = text.split(/[\n,;]+/);
  const seen = new Set<string>();
  const results: Array<{ fileId: string; directUrl: string }> = [];

  for (const line of lines) {
    const fileId = extractGoogleDriveFileId(line);
    if (fileId && !seen.has(fileId)) {
      seen.add(fileId);
      results.push({
        fileId,
        directUrl: buildGoogleDriveDirectUrl(fileId),
      });
    }
  }

  return results;
}
