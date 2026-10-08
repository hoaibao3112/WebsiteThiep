import { EnvelopeConfig, WeddingDataPayload } from "@/types/card.types";
import { OrnamentType } from "./EnvelopeOrnament";

export interface ResolvedCoverTheme {
  slug: string;
  themeName: string;
  bgGradient: string;
  cardBg: string;
  borderColor: string;
  ornamentType: OrnamentType;
  sealColor: string;
  sealBorderColor: string;
  sealIcon: "heart" | "song-hy" | "monogram" | "flower" | "ring";
  primaryText: string;
  accentText: string;
  fontFamily: string;
  title: string;
  coupleNames: string;
  dateText: string;
  salutation: string;
  buttonText: string;
  buttonBg: string;
  buttonTextColor: string;
  soundEnabled: boolean;
  soundUrl?: string;
  musicAutoplayOnOpen: boolean;
}

/**
 * Cấu hình mặc định của 11 Mẫu Thiệp Cưới
 */
export const DEFAULT_TEMPLATE_THEMES: Record<string, Partial<ResolvedCoverTheme>> = {
  // 01. Á ĐÔNG CUNG ĐÌNH HOÀNG GIA
  "wedding-heritage-crimson-gold": {
    themeName: "Á Đông Cung Đình Hoàng Gia",
    bgGradient: "radial-gradient(ellipse at center, #3E0C12 0%, #170406 100%)",
    cardBg: "#50121A",
    borderColor: "#D4AF37",
    ornamentType: "heritage-crimson",
    sealColor: "#D4AF37",
    sealBorderColor: "#F5D77F",
    sealIcon: "song-hy",
    primaryText: "#FAF4EA",
    accentText: "#E5C158",
    fontFamily: "Playfair Display, serif",
    title: "THIỆP MỜI CƯỚI",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #D4AF37 0%, #AA8015 100%)",
    buttonTextColor: "#2B0B0E",
  },

  // 02. TẠP CHÍ EDITORIAL
  "wedding-modern-editorial-magazine": {
    themeName: "Tạp Chí Hàn Quốc Editorial",
    bgGradient: "radial-gradient(ellipse at center, #26211C 0%, #120F0D 100%)",
    cardBg: "#332B25",
    borderColor: "#C5A98E",
    ornamentType: "modern-gold",
    sealColor: "#1C1714",
    sealBorderColor: "#C5A98E",
    sealIcon: "monogram",
    primaryText: "#F7F4EF",
    accentText: "#D8C7B5",
    fontFamily: "Cinzel, serif",
    title: "WEDDING INVITATION",
    salutation: "Trân trọng kính mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #C5A98E 0%, #9B7F66 100%)",
    buttonTextColor: "#1A1512",
  },
  "wedding-modern-magazine": {
    themeName: "Tạp Chí Hàn Quốc Editorial",
    bgGradient: "radial-gradient(ellipse at center, #26211C 0%, #120F0D 100%)",
    cardBg: "#332B25",
    borderColor: "#C5A98E",
    ornamentType: "modern-gold",
    sealColor: "#1C1714",
    sealBorderColor: "#C5A98E",
    sealIcon: "monogram",
    primaryText: "#F7F4EF",
    accentText: "#D8C7B5",
    fontFamily: "Cinzel, serif",
    title: "WEDDING INVITATION",
    salutation: "Trân trọng kính mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #C5A98E 0%, #9B7F66 100%)",
    buttonTextColor: "#1A1512",
  },

  // 03. SWEET PINK LÃNG MẠN
  "wedding-sweet-editorial-romance": {
    themeName: "Sweet Pink Lãng Mạn",
    bgGradient: "radial-gradient(ellipse at center, #421822 0%, #1A070D 100%)",
    cardBg: "#52212D",
    borderColor: "#F4B5BE",
    ornamentType: "sweet-pink",
    sealColor: "#D48B96",
    sealBorderColor: "#FFDDE2",
    sealIcon: "heart",
    primaryText: "#FFF5F5",
    accentText: "#F9CBD1",
    fontFamily: "Great Vibes, cursive",
    title: "THIỆP MỜI CƯỚI",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #D48B96 0%, #A85966 100%)",
    buttonTextColor: "#FFFFFF",
  },
  "wedding-sweet-romance": {
    themeName: "Sweet Pink Lãng Mạn",
    bgGradient: "radial-gradient(ellipse at center, #421822 0%, #1A070D 100%)",
    cardBg: "#52212D",
    borderColor: "#F4B5BE",
    ornamentType: "sweet-pink",
    sealColor: "#D48B96",
    sealBorderColor: "#FFDDE2",
    sealIcon: "heart",
    primaryText: "#FFF5F5",
    accentText: "#F9CBD1",
    fontFamily: "Great Vibes, cursive",
    title: "THIỆP MỜI CƯỚI",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #D48B96 0%, #A85966 100%)",
    buttonTextColor: "#FFFFFF",
  },

  // 04. QUÝ TỘC ĐỎ RƯỢU MARSALA
  "wedding-crimson-wine-marsala": {
    themeName: "Quý Tộc Đỏ Rượu Marsala",
    bgGradient: "radial-gradient(ellipse at center, #380C12 0%, #140205 100%)",
    cardBg: "#49121A",
    borderColor: "#C69C6D",
    ornamentType: "marsala-wine",
    sealColor: "#C69C6D",
    sealBorderColor: "#EAD4B5",
    sealIcon: "heart",
    primaryText: "#FAF6F0",
    accentText: "#D8B48B",
    fontFamily: "Playfair Display, serif",
    title: "THIỆP CƯỚI",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #C69C6D 0%, #8E683E 100%)",
    buttonTextColor: "#24060A",
  },
  "wedding-crimson-marsala": {
    themeName: "Quý Tộc Đỏ Rượu Marsala",
    bgGradient: "radial-gradient(ellipse at center, #380C12 0%, #140205 100%)",
    cardBg: "#49121A",
    borderColor: "#C69C6D",
    ornamentType: "marsala-wine",
    sealColor: "#C69C6D",
    sealBorderColor: "#EAD4B5",
    sealIcon: "heart",
    primaryText: "#FAF6F0",
    accentText: "#D8B48B",
    fontFamily: "Playfair Display, serif",
    title: "THIỆP CƯỚI",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #C69C6D 0%, #8E683E 100%)",
    buttonTextColor: "#24060A",
  },

  // 05. RUSTIC XANH RÊU THIÊN NHIÊN
  "wedding-forest-green-botanical": {
    themeName: "Rustic Xanh Rêu Thiên Nhiên",
    bgGradient: "radial-gradient(ellipse at center, #172D20 0%, #08120C 100%)",
    cardBg: "#223F2E",
    borderColor: "#B88E4C",
    ornamentType: "forest-botanical",
    sealColor: "#B88E4C",
    sealBorderColor: "#E2C38F",
    sealIcon: "heart",
    primaryText: "#F4F7F4",
    accentText: "#CDB07B",
    fontFamily: "Playfair Display, serif",
    title: "SAVE THE DATE",
    salutation: "Trân trọng kính mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #B88E4C 0%, #826027 100%)",
    buttonTextColor: "#0F1A12",
  },
  "wedding-forest-botanical": {
    themeName: "Rustic Xanh Rêu Thiên Nhiên",
    bgGradient: "radial-gradient(ellipse at center, #172D20 0%, #08120C 100%)",
    cardBg: "#223F2E",
    borderColor: "#B88E4C",
    ornamentType: "forest-botanical",
    sealColor: "#B88E4C",
    sealBorderColor: "#E2C38F",
    sealIcon: "heart",
    primaryText: "#F4F7F4",
    accentText: "#CDB07B",
    fontFamily: "Playfair Display, serif",
    title: "SAVE THE DATE",
    salutation: "Trân trọng kính mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #B88E4C 0%, #826027 100%)",
    buttonTextColor: "#0F1A12",
  },

  // 06. HOA SEN THANH KHIẾT BÁO HỶ
  "wedding-pure-lotus-heritage": {
    themeName: "Hoa Sen Thanh Khiết Báo Hỷ",
    bgGradient: "radial-gradient(ellipse at center, #351C22 0%, #150A0D 100%)",
    cardBg: "#4A2730",
    borderColor: "#D4AF37",
    ornamentType: "pure-lotus",
    sealColor: "#A8424E",
    sealBorderColor: "#F5B4BE",
    sealIcon: "song-hy",
    primaryText: "#FAF7F2",
    accentText: "#D8A7AF",
    fontFamily: "Playfair Display, serif",
    title: "TRÂN TRỌNG BÁO HỶ",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #D4AF37 0%, #9F7E18 100%)",
    buttonTextColor: "#290D13",
  },
  "wedding-pure-lotus": {
    themeName: "Hoa Sen Thanh Khiết Báo Hỷ",
    bgGradient: "radial-gradient(ellipse at center, #351C22 0%, #150A0D 100%)",
    cardBg: "#4A2730",
    borderColor: "#D4AF37",
    ornamentType: "pure-lotus",
    sealColor: "#A8424E",
    sealBorderColor: "#F5B4BE",
    sealIcon: "song-hy",
    primaryText: "#FAF7F2",
    accentText: "#D8A7AF",
    fontFamily: "Playfair Display, serif",
    title: "TRÂN TRỌNG BÁO HỶ",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #D4AF37 0%, #9F7E18 100%)",
    buttonTextColor: "#290D13",
  },

  // 07. ĐIỆN ẢNH LOOKBOOK TÌNH YÊU
  "wedding-cinematic-editorial": {
    themeName: "Điện Ảnh Lookbook Tình Yêu",
    bgGradient: "radial-gradient(ellipse at center, #24221F 0%, #0F0E0D 100%)",
    cardBg: "#302E29",
    borderColor: "#BE944E",
    ornamentType: "cinematic",
    sealColor: "#BE944E",
    sealBorderColor: "#E2C389",
    sealIcon: "ring",
    primaryText: "#F8F5F0",
    accentText: "#D4B47B",
    fontFamily: "Cinzel, serif",
    title: "OUR WEDDING STORY",
    salutation: "Trân trọng kính mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #BE944E 0%, #876222 100%)",
    buttonTextColor: "#171512",
  },
  "wedding-cinematic": {
    themeName: "Điện Ảnh Lookbook Tình Yêu",
    bgGradient: "radial-gradient(ellipse at center, #24221F 0%, #0F0E0D 100%)",
    cardBg: "#302E29",
    borderColor: "#BE944E",
    ornamentType: "cinematic",
    sealColor: "#BE944E",
    sealBorderColor: "#E2C389",
    sealIcon: "ring",
    primaryText: "#F8F5F0",
    accentText: "#D4B47B",
    fontFamily: "Cinzel, serif",
    title: "OUR WEDDING STORY",
    salutation: "Trân trọng kính mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #BE944E 0%, #876222 100%)",
    buttonTextColor: "#171512",
  },

  // 08. SUỐI NGUỒN HỒ NƯỚC THIÊN NHIÊN
  "wedding-alpine-lake-romance": {
    themeName: "Suối Nguồn Hồ Nước Thiên Nhiên",
    bgGradient: "radial-gradient(ellipse at center, #1C353D 0%, #0B191E 100%)",
    cardBg: "#294C56",
    borderColor: "#C29B63",
    ornamentType: "alpine-lake",
    sealColor: "#C29B63",
    sealBorderColor: "#E7CCA4",
    sealIcon: "heart",
    primaryText: "#F2F7F7",
    accentText: "#D6B88B",
    fontFamily: "Playfair Display, serif",
    title: "LỄ THÀNH HÔN",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #C29B63 0%, #896733 100%)",
    buttonTextColor: "#102328",
  },
  "wedding-alpine-lake": {
    themeName: "Suối Nguồn Hồ Nước Thiên Nhiên",
    bgGradient: "radial-gradient(ellipse at center, #1C353D 0%, #0B191E 100%)",
    cardBg: "#294C56",
    borderColor: "#C29B63",
    ornamentType: "alpine-lake",
    sealColor: "#C29B63",
    sealBorderColor: "#E7CCA4",
    sealIcon: "heart",
    primaryText: "#F2F7F7",
    accentText: "#D6B88B",
    fontFamily: "Playfair Display, serif",
    title: "LỄ THÀNH HÔN",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #C29B63 0%, #896733 100%)",
    buttonTextColor: "#102328",
  },

  // 09. LONG PHỤNG SUM VẦY ĐỎ ĐÔ
  "wedding-imperial-dragon-crimson": {
    themeName: "Long Phụng Sum Vầy Đỏ Đô",
    bgGradient: "radial-gradient(ellipse at center, #3E0B10 0%, #170305 100%)",
    cardBg: "#541219",
    borderColor: "#D4AF37",
    ornamentType: "imperial-dragon",
    sealColor: "#D4AF37",
    sealBorderColor: "#FCE596",
    sealIcon: "song-hy",
    primaryText: "#FDF9F0",
    accentText: "#E5C25A",
    fontFamily: "Playfair Display, serif",
    title: "ĐẠI HỶ — LỄ THÀNH HÔN",
    salutation: "Trân trọng kính mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #D4AF37 0%, #9F7B12 100%)",
    buttonTextColor: "#2D070B",
  },
  "wedding-imperial-dragon": {
    themeName: "Long Phụng Sum Vầy Đỏ Đô",
    bgGradient: "radial-gradient(ellipse at center, #3E0B10 0%, #170305 100%)",
    cardBg: "#541219",
    borderColor: "#D4AF37",
    ornamentType: "imperial-dragon",
    sealColor: "#D4AF37",
    sealBorderColor: "#FCE596",
    sealIcon: "song-hy",
    primaryText: "#FDF9F0",
    accentText: "#E5C25A",
    fontFamily: "Playfair Display, serif",
    title: "ĐẠI HỶ — LỄ THÀNH HÔN",
    salutation: "Trân trọng kính mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #D4AF37 0%, #9F7B12 100%)",
    buttonTextColor: "#2D070B",
  },

  // 10. NHÀ CÓ HỶ — CỔ PHỤC VIỆT NAM
  "wedding-nha-co-hy": {
    themeName: "Nhà Có Hỷ — Cổ Phục Việt Nam",
    bgGradient: "radial-gradient(ellipse at center, #421014 0%, #180507 100%)",
    cardBg: "#5B181E",
    borderColor: "#C89B3C",
    ornamentType: "nha-co-hy",
    sealColor: "#C89B3C",
    sealBorderColor: "#F7DB8E",
    sealIcon: "song-hy",
    primaryText: "#FBF7EF",
    accentText: "#E2BD6D",
    fontFamily: "Playfair Display, serif",
    title: "NHÀ CÓ HỶ — BÁO TIN VUI",
    salutation: "Trân trọng kính mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #C89B3C 0%, #8B651B 100%)",
    buttonTextColor: "#2A090D",
  },

  // 11. VƯỜN BẠCH HOA KÍNH MỜ — SAGE BOTANICAL GLASS
  "wedding-sage-garden-glass": {
    themeName: "Vườn Bạch Hoa Kính Mờ — Sage Botanical Glass",
    bgGradient: "radial-gradient(ellipse at center, #1E2D20 0%, #0B130D 100%)",
    cardBg: "#2B3F2E",
    borderColor: "#8FB38D",
    ornamentType: "sage-garden",
    sealColor: "#8FB38D",
    sealBorderColor: "#C7DEC6",
    sealIcon: "heart",
    primaryText: "#F7FAF6",
    accentText: "#B1CFB0",
    fontFamily: "Playfair Display, serif",
    title: "WEDDING INVITATION",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #8FB38D 0%, #547752 100%)",
    buttonTextColor: "#0D1A0F",
  },

  // STYLE MẪU ĐƠN TÍM HOÀNG KIM (THEO ẢNH CHỤP CHUNGDOI)
  "peony-purple": {
    themeName: "Mẫu Đơn Tím Hoàng Kim",
    bgGradient: "radial-gradient(ellipse at center, #2A1033 0%, #13061A 100%)",
    cardBg: "#1F0B24",
    borderColor: "#D4AF37",
    ornamentType: "peony-purple",
    sealColor: "#D4AF37",
    sealBorderColor: "#FBE69E",
    sealIcon: "heart",
    primaryText: "#FAF5FF",
    accentText: "#E9D5FF",
    fontFamily: "Great Vibes, cursive",
    title: "THIỆP MỜI CƯỚI",
    salutation: "Thân Mời",
    buttonText: "Mở thiệp",
    buttonBg: "linear-gradient(135deg, #D4AF37 0%, #9F7B12 100%)",
    buttonTextColor: "#230A29",
  },
};

/**
 * Hàm giải quyết cấu hình bìa thiệp hoàn chỉnh:
 * Ưu tiên các trường người dùng chỉnh sửa từ backend, kết hợp fallback theo mẫu thiệp
 */
export function resolveCoverTheme(
  templateSlug?: string,
  envelopeConfig?: EnvelopeConfig,
  weddingData?: Partial<WeddingDataPayload>,
  activeGuestName?: string
): ResolvedCoverTheme {
  // 1. Xác định default template base
  const cleanSlug = templateSlug || "wedding-heritage-crimson-gold";
  const defaultBase =
    DEFAULT_TEMPLATE_THEMES[cleanSlug] ||
    DEFAULT_TEMPLATE_THEMES["peony-purple"] ||
    DEFAULT_TEMPLATE_THEMES["wedding-heritage-crimson-gold"]!;

  // 2. Nếu người dùng chọn styleId cụ thể (ví dụ: peony-purple, red, emerald)
  const selectedStyleBase = envelopeConfig?.styleId
    ? DEFAULT_TEMPLATE_THEMES[envelopeConfig.styleId] || {}
    : {};

  // 3. Tên Cô dâu & Chú rể
  const groomName =
    envelopeConfig?.groomName ||
    weddingData?.groom?.shortName ||
    weddingData?.groom?.fullName ||
    "Chú rể";
  const brideName =
    envelopeConfig?.brideName ||
    weddingData?.bride?.shortName ||
    weddingData?.bride?.fullName ||
    "Cô dâu";
  const coupleNames = `${groomName} & ${brideName}`;

  // 4. Ngày cưới
  const dateText =
    envelopeConfig?.weddingDateText ||
    weddingData?.headerDate ||
    (weddingData?.events && weddingData.events[0]?.eventDate
      ? new Date(weddingData.events[0].eventDate).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "19 tháng 12, 2026");

  // 5. Lời mời khách
  const salutation =
    activeGuestName
      ? `Trân trọng kính mời: ${activeGuestName}`
      : envelopeConfig?.salutation ||
        selectedStyleBase.salutation ||
        defaultBase.salutation ||
        "Thân Mời";

  // 6. Tiêu đề bìa
  const title =
    envelopeConfig?.coverTitle ||
    envelopeConfig?.title ||
    selectedStyleBase.title ||
    defaultBase.title ||
    "THIỆP MỜI CƯỚI";

  // 7. Chữ nút bấm
  const buttonText =
    envelopeConfig?.buttonText ||
    selectedStyleBase.buttonText ||
    defaultBase.buttonText ||
    "Mở thiệp";

  return {
    slug: cleanSlug,
    themeName: envelopeConfig?.styleName || selectedStyleBase.themeName || defaultBase.themeName || "Mặc định",
    bgGradient: envelopeConfig?.bgGradient || selectedStyleBase.bgGradient || defaultBase.bgGradient || "radial-gradient(ellipse at center, #26102D 0%, #110515 100%)",
    cardBg: envelopeConfig?.cardBg || selectedStyleBase.cardBg || defaultBase.cardBg || "#1F0B24",
    borderColor: envelopeConfig?.borderColor || selectedStyleBase.borderColor || defaultBase.borderColor || "#D4AF37",
    ornamentType: (envelopeConfig?.ornamentType as OrnamentType) || selectedStyleBase.ornamentType || defaultBase.ornamentType || "peony-purple",
    sealColor: envelopeConfig?.sealColor || selectedStyleBase.sealColor || defaultBase.sealColor || "#D4AF37",
    sealBorderColor: selectedStyleBase.sealBorderColor || defaultBase.sealBorderColor || "#F8E7A2",
    sealIcon: envelopeConfig?.sealIcon || selectedStyleBase.sealIcon || defaultBase.sealIcon || "heart",
    primaryText: selectedStyleBase.primaryText || defaultBase.primaryText || "#FAF5FF",
    accentText: selectedStyleBase.accentText || defaultBase.accentText || "#E9D5FF",
    fontFamily: envelopeConfig?.fontFamily || selectedStyleBase.fontFamily || defaultBase.fontFamily || "Great Vibes, cursive",
    title,
    coupleNames,
    dateText,
    salutation,
    buttonText,
    buttonBg: selectedStyleBase.buttonBg || defaultBase.buttonBg || "linear-gradient(135deg, #D4AF37 0%, #A07810 100%)",
    buttonTextColor: selectedStyleBase.buttonTextColor || defaultBase.buttonTextColor || "#1F0B24",
    soundEnabled: envelopeConfig?.soundEnabled !== false,
    soundUrl: envelopeConfig?.soundUrl,
    musicAutoplayOnOpen: envelopeConfig?.musicAutoplayOnOpen !== false,
  };
}
