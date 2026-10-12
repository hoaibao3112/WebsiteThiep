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

// ── CÁC PHONG CÁCH THIẾT KẾ BÌA TRƯỚC NGHỆ THUẬT (FRONT COVER) ──
export type AlbumFrontCoverPreset =
  | "photo-arch-gold" // Khung vòm hoàng gia dát vàng có ảnh cưới cô dâu chú rể
  | "photo-oval-floral" // Khung oval hoa hồng cổ điển lồng ảnh cưới
  | "photo-full-bleed" // Ảnh bìa tràn viền điện ảnh nghệ thuật (Cinematic)
  | "photo-polaroid-stitched" // Polaroid thủ công kẹp trên bìa da may chỉ
  | "photo-magazine-editorial" // Tạp chí Hàn Quốc Editorial ảnh lớn
  | "classic-leather-monogram" // Da thuộc cổ điển dập Monogram
  | "oriental-crimson-frame"; // Á Đông hoàng cung khung son dát vàng

export type AlbumFrontCoverFrameShape =
  | "arch"
  | "oval"
  | "rect"
  | "polaroid"
  | "circle"
  | "full"
  | "none";

export interface AlbumFrontCoverConfig {
  enabled: boolean;
  designPreset: AlbumFrontCoverPreset;
  photoUrl?: string;
  title: string;
  subtitle: string;
  monogram?: string;
  badgeText?: string;
  frameShape: AlbumFrontCoverFrameShape;
  theme: AlbumCoverTheme;
  customBgColor?: string;
  customTextColor?: string;
}

export interface AlbumFrontCoverPresetMeta {
  id: AlbumFrontCoverPreset;
  name: string;
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultBadgeText: string;
  frameShape: AlbumFrontCoverFrameShape;
  theme: AlbumCoverTheme;
  accentColor: string;
  textColor: string;
  bgHex: string;
  bgGradient: string;
  hasPhotoFrame: boolean;
}

export const ALBUM_FRONT_COVER_PRESET_CATALOG: Record<
  AlbumFrontCoverPreset,
  AlbumFrontCoverPresetMeta
> = {
  "photo-arch-gold": {
    id: "photo-arch-gold",
    name: "Khung Vòm Hoàng Gia Dát Vàng",
    description: "Khung vòm cung đình dát vàng lồng ảnh cưới cô dâu chú rể, tên nhũ mạ vàng và monogram dập nổi",
    defaultTitle: "HOÀNG LONG & BẢO NGỌC",
    defaultSubtitle: "OUR WEDDING PHOTOBOOK • 2026",
    defaultBadgeText: "WEDDING COLLECTION",
    frameShape: "arch",
    theme: "leather-burgundy",
    accentColor: "#D4AF37",
    textColor: "#FFFDF9",
    bgHex: "#4A0E17",
    bgGradient: "bg-gradient-to-br from-[#4A0E17] via-[#5C1D27] to-[#360810]",
    hasPhotoFrame: true,
  },
  "photo-oval-floral": {
    id: "photo-oval-floral",
    name: "Khung Oval Hoa Hồng Cổ Điển",
    description: "Khung oval baroque mạ vàng với hoa văn dây leo phương Tây ôm trọn ảnh cưới cặp đôi",
    defaultTitle: "HOÀNG LONG & BẢO NGỌC",
    defaultSubtitle: "THE WEDDING DAY • 2026",
    defaultBadgeText: "FOREVER IN LOVE",
    frameShape: "oval",
    theme: "linen-cream",
    accentColor: "#C5A059",
    textColor: "#2E241E",
    bgHex: "#F5F2EB",
    bgGradient: "bg-gradient-to-br from-[#F5F2EB] via-[#EFE9DC] to-[#E3DAC8]",
    hasPhotoFrame: true,
  },
  "photo-full-bleed": {
    id: "photo-full-bleed",
    name: "Ảnh Bìa Tràn Viền Điện Ảnh",
    description: "Ảnh cưới chân dung toàn bìa kết hợp lớp phủ mờ sang trọng và typography tối giản hiện đại",
    defaultTitle: "HOÀNG LONG & BẢO NGỌC",
    defaultSubtitle: "SAVE THE DATE • 2026",
    defaultBadgeText: "JUST MARRIED",
    frameShape: "full",
    theme: "minimalist-dark",
    accentColor: "#FFFFFF",
    textColor: "#FFFFFF",
    bgHex: "#141414",
    bgGradient: "bg-gradient-to-t from-black/90 via-black/40 to-black/20",
    hasPhotoFrame: true,
  },
  "photo-polaroid-stitched": {
    id: "photo-polaroid-stitched",
    name: "Polaroid Thủ Công Chỉ Khâu",
    description: "Ảnh cưới phong cách tấm ảnh Polaroid hoài niệm gắn trên bìa da bò thủ công dập chỉ may",
    defaultTitle: "HOÀNG LONG & BẢO NGỌC",
    defaultSubtitle: "SWEET MOMENTS • 2026",
    defaultBadgeText: "PHOTO ALBUM",
    frameShape: "polaroid",
    theme: "polaroid-kraft",
    accentColor: "#A67C52",
    textColor: "#3A291A",
    bgHex: "#E6D7C3",
    bgGradient: "bg-gradient-to-br from-[#E6D7C3] via-[#DDD0BC] to-[#CFBFA7]",
    hasPhotoFrame: true,
  },
  "photo-magazine-editorial": {
    id: "photo-magazine-editorial",
    name: "Tạp Chí Hàn Quốc Editorial",
    description: "Bố cục tạp chí cưới nghệ thuật studio Hàn Quốc, ảnh chân dung nổi bật cùng typography cao cấp",
    defaultTitle: "HOÀNG LONG & BẢO NGỌC",
    defaultSubtitle: "SPECIAL WEDDING EDITION • 2026",
    defaultBadgeText: "EDITORIAL VOGUE",
    frameShape: "rect",
    theme: "minimalist-dark",
    accentColor: "#CCA24C",
    textColor: "#F7F5F0",
    bgHex: "#1C1C1C",
    bgGradient: "bg-gradient-to-br from-[#262626] via-[#1A1A1A] to-[#111111]",
    hasPhotoFrame: true,
  },
  "classic-leather-monogram": {
    id: "classic-leather-monogram",
    name: "Da Thuộc Cổ Điển Monogram",
    description: "Vân da đỏ rượu truyền thống hoàng gia với vòng tròn Monogram chữ lồng và chữ nhũ dập chìm",
    defaultTitle: "HOÀNG LONG & BẢO NGỌC",
    defaultSubtitle: "OUR WEDDING PHOTOBOOK • 2026",
    defaultBadgeText: "WEDDING COLLECTION",
    frameShape: "none",
    theme: "leather-burgundy",
    accentColor: "#D4AF37",
    textColor: "#FFFDF9",
    bgHex: "#4A0E17",
    bgGradient: "bg-gradient-to-br from-[#4A0E17] via-[#5C1D27] to-[#360810]",
    hasPhotoFrame: false,
  },
  "oriental-crimson-frame": {
    id: "oriental-crimson-frame",
    name: "Á Đông Hoàng Cung Khung Son",
    description: "Khung son đỏ hoa văn cung đình truyền thống lồng ảnh cưới cô dâu chú rể trong trang phục cưới",
    defaultTitle: "HOÀNG LONG & BẢO NGỌC",
    defaultSubtitle: "LỄ THÀNH HÔN • 2026",
    defaultBadgeText: "TRĂM NĂM HẠNH PHÚC",
    frameShape: "arch",
    theme: "oriental-crimson",
    accentColor: "#F4C430",
    textColor: "#FFFDF6",
    bgHex: "#80121D",
    bgGradient: "bg-gradient-to-br from-[#80121D] via-[#941A26] to-[#630B13]",
    hasPhotoFrame: true,
  },
};

export const DEFAULT_ALBUM_FRONT_COVER: AlbumFrontCoverConfig = {
  enabled: true,
  designPreset: "photo-arch-gold",
  photoUrl: "",
  title: "HOÀNG LONG & BẢO NGỌC",
  subtitle: "OUR WEDDING PHOTOBOOK • 2026",
  monogram: "L & N",
  badgeText: "WEDDING COLLECTION",
  frameShape: "arch",
  theme: "leather-burgundy",
};

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
    name: "Xanh Sage Thảo Mộc Kính Mờ",
    description: "Phong cách châu Âu hiện đại với lá bạch đàn thảo mộc và tấm thẻ kính mờ sang trọng",
    defaultTitle: "Thank You For Everything",
    defaultSubtitle: "Cảm ơn vì đã là một phần tươi đẹp trong câu chuyện tình yêu của chúng mình.",
    defaultButtonText: "Xem lại album",
    borderStyle: "minimal-solid",
    badgeIcon: "heart",
    showPetals: true,
    bgGradient: "bg-gradient-to-br from-[#28382B] via-[#354838] to-[#1D291F]",
    accentColor: "#A3C9A8",
    textColor: "#F4F7F4",
    bgHex: "#28382B",
  },
  "minimal-monochrome": {
    id: "minimal-monochrome",
    name: "Studio Hàn Quốc Tối Giản",
    description: "Đen tuyền tối giản chuẩn studio Hàn Quốc, tập trung vào cảm xúc và sự tinh tế",
    defaultTitle: "Always & Forever",
    defaultSubtitle: "Hôm nay, ngày mai và mãi mãi về sau.",
    defaultButtonText: "Quay lại trang đầu",
    borderStyle: "minimal-solid",
    badgeIcon: "none",
    showPetals: false,
    bgGradient: "bg-gradient-to-br from-[#1A1A1A] via-[#242424] to-[#121212]",
    accentColor: "#E0E0E0",
    textColor: "#FFFFFF",
    bgHex: "#1A1A1A",
  },
  "polaroid-farewell": {
    id: "polaroid-farewell",
    name: "Kỷ Niệm Polaroid & Chữ Ký",
    description: "Khung ảnh polaroid hoài niệm kết hợp lời cảm ơn viết tay ấm áp",
    defaultTitle: "Just Married",
    defaultSubtitle: "Những khoảnh khắc đẹp nhất khi có bạn cùng sẻ chia.",
    defaultButtonText: "Mở lại album",
    borderStyle: "stitched-dashed",
    badgeIcon: "heart",
    showPetals: true,
    bgGradient: "bg-gradient-to-br from-[#402B20] via-[#52382B] to-[#301F16]",
    accentColor: "#DDB892",
    textColor: "#FAF6F0",
    bgHex: "#402B20",
  },
  "oriental-red-songhy": {
    id: "oriental-red-songhy",
    name: "Á Đông Song Hỷ Dát Vàng",
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
  frontCover?: AlbumFrontCoverConfig;
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
  frontCover: DEFAULT_ALBUM_FRONT_COVER,
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
 * Tạo link ảnh trực tiếp (direct URL) từ File ID Google Drive
 */
export function getGoogleDriveDirectUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export const buildGoogleDriveDirectUrl = getGoogleDriveDirectUrl;

/**
 * Phân tích danh sách link Google Drive nhiều dòng
 */
export function parseMultipleGoogleDriveLinks(text: string): Array<{ fileId: string; directUrl: string }> {
  if (!text) return [];
  const lines = text.split(/[\r\n,;]+/).map((l) => l.trim()).filter(Boolean);
  const seen = new Set<string>();
  const results: Array<{ fileId: string; directUrl: string }> = [];

  for (const line of lines) {
    const fileId = extractGoogleDriveFileId(line);
    if (fileId && !seen.has(fileId)) {
      seen.add(fileId);
      results.push({
        fileId,
        directUrl: getGoogleDriveDirectUrl(fileId),
      });
    }
  }

  return results;
}
