import type { CardCategory } from "@/types/card.types";

export type TemplateVariant =
  | "minimalist-gold"
  | "hong-xanh-luxury"
  | "wedding-heritage-crimson-gold"
  | "wedding-modern-editorial-magazine"
  | "wedding-sweet-editorial-romance"
  | "wedding-crimson-wine-marsala"
  | "wedding-forest-green-botanical"
  | "wedding-pure-lotus-heritage"
  | "wedding-cinematic-editorial"
  | "wedding-alpine-lake-romance"
  | "wedding-imperial-dragon-crimson"
  | "glow-party"
  | "little-prince"
  | "sweet-angel";

export interface TemplateConfig {
  slug: string;
  category: CardCategory;
  variant: TemplateVariant;
  label: string;
  defaultPrimaryColor: string;
  defaultFontFamily: string;
  sections: readonly string[];
  vipOnly?: boolean;
}

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  // ── 9 MẪU THIỆP CƯỚI ĐỘC BẢN CHUẨN HOÁ ──
  "wedding-heritage-crimson-gold": {
    slug: "wedding-heritage-crimson-gold",
    category: "WEDDING",
    variant: "wedding-heritage-crimson-gold",
    label: "Á Đông Cung Đình",
    defaultPrimaryColor: "#8B1E2D",
    defaultFontFamily: "Playfair Display",
    sections: ["hero", "couple", "events", "gallery", "guestbook", "rsvp"],
  },
  "wedding-modern-editorial-magazine": {
    slug: "wedding-modern-editorial-magazine",
    category: "WEDDING",
    variant: "wedding-modern-editorial-magazine",
    label: "Tạp Chí Hàn Quốc",
    defaultPrimaryColor: "#543A2C",
    defaultFontFamily: "Inter",
    sections: ["hero", "couple", "events", "calendar", "gallery", "rsvp"],
  },
  "wedding-sweet-editorial-romance": {
    slug: "wedding-sweet-editorial-romance",
    category: "WEDDING",
    variant: "wedding-sweet-editorial-romance",
    label: "Sweet Pink Lãng Mạn",
    defaultPrimaryColor: "#B84A39",
    defaultFontFamily: "Great Vibes",
    sections: ["hero", "countdown", "parents", "map", "about", "calendar", "timeline", "rsvp", "gift"],
  },
  "wedding-crimson-wine-marsala": {
    slug: "wedding-crimson-wine-marsala",
    category: "WEDDING",
    variant: "wedding-crimson-wine-marsala",
    label: "Đỏ Rượu Marsala",
    defaultPrimaryColor: "#6B1724",
    defaultFontFamily: "Playfair Display",
    sections: ["hero", "arch-welcome", "events", "countdown-dual", "gallery", "rsvp", "gift"],
  },
  "wedding-forest-green-botanical": {
    slug: "wedding-forest-green-botanical",
    category: "WEDDING",
    variant: "wedding-forest-green-botanical",
    label: "Rustic Xanh Rêu",
    defaultPrimaryColor: "#3D4A34",
    defaultFontFamily: "Outfit",
    sections: ["hero", "calendar-card", "facing-couple", "unified-events", "gallery", "rsvp", "farewell"],
  },
  "wedding-pure-lotus-heritage": {
    slug: "wedding-pure-lotus-heritage",
    category: "WEDDING",
    variant: "wedding-pure-lotus-heritage",
    label: "Hoa Sen Báo Hỷ",
    defaultPrimaryColor: "#3B5E43",
    defaultFontFamily: "Playfair Display",
    sections: ["hero", "lotus-crest", "events", "calendar", "rsvp", "gallery", "lotus-farewell"],
  },
  "wedding-cinematic-editorial": {
    slug: "wedding-cinematic-editorial",
    category: "WEDDING",
    variant: "wedding-cinematic-editorial",
    label: "Điện Ảnh Lookbook",
    defaultPrimaryColor: "#1C1C1C",
    defaultFontFamily: "Cinzel",
    sections: ["hero", "love-story", "fall-in-love", "calendar-kiss", "promex-map", "sunshine-poster", "rsvp"],
  },
  "wedding-alpine-lake-romance": {
    slug: "wedding-alpine-lake-romance",
    category: "WEDDING",
    variant: "wedding-alpine-lake-romance",
    label: "Suối Nguồn Hồ Ngọc",
    defaultPrimaryColor: "#2B6B6D",
    defaultFontFamily: "Playfair Display",
    sections: ["hero", "lake-calendar", "washi-poem", "lake-gallery", "rsvp", "gift-pastel", "songhy-illustration"],
  },
  "wedding-imperial-dragon-crimson": {
    slug: "wedding-imperial-dragon-crimson",
    category: "WEDDING",
    variant: "wedding-imperial-dragon-crimson",
    label: "Long Phụng Đỏ Đô",
    defaultPrimaryColor: "#6E1719",
    defaultFontFamily: "Playfair Display",
    sections: ["hero-dragon", "chibi-songhy", "date-circle", "map", "gift-dual-cards", "seal-farewell"],
  },

  // ── MẪU CŨ ĐỂ TƯƠNG THÍCH NGƯỢC (BACKWARD COMPATIBILITY) ──
  "wedding-minimalist-gold": {
    slug: "wedding-minimalist-gold",
    category: "WEDDING",
    variant: "wedding-heritage-crimson-gold",
    label: "Hoàng Gia Cung Đình (Legacy)",
    defaultPrimaryColor: "#BE944E",
    defaultFontFamily: "Playfair Display",
    sections: ["hero", "couple", "events", "story", "rsvp"],
  },
  "wedding-hong-xanh-luxury": {
    slug: "wedding-hong-xanh-luxury",
    category: "WEDDING",
    variant: "wedding-sweet-editorial-romance",
    label: "Hồng Xanh Luxury (Legacy)",
    defaultPrimaryColor: "#B76E79",
    defaultFontFamily: "Cinzel",
    sections: ["hero", "couple", "story", "events", "rsvp"],
  },

  // ── SINH NHẬT & THÔI NÔI ──
  "birthday-glow-party": {
    slug: "birthday-glow-party",
    category: "BIRTHDAY",
    variant: "glow-party",
    label: "Glow Party",
    defaultPrimaryColor: "#F97316",
    defaultFontFamily: "Outfit",
    sections: ["hero", "gallery", "message", "events", "rsvp"],
  },
  "newborn-little-prince": {
    slug: "newborn-little-prince",
    category: "NEWBORN",
    variant: "little-prince",
    label: "Little Prince",
    defaultPrimaryColor: "#4169A1",
    defaultFontFamily: "Quicksand",
    sections: ["hero", "milestones", "family", "events", "rsvp"],
  },
  "newborn-sweet-angel": {
    slug: "newborn-sweet-angel",
    category: "NEWBORN",
    variant: "sweet-angel",
    label: "Sweet Angel",
    defaultPrimaryColor: "#D989A6",
    defaultFontFamily: "Quicksand",
    sections: ["hero", "family", "milestones", "events", "rsvp"],
  },
};

export function getTemplateConfig(slug?: string, category?: CardCategory): TemplateConfig | undefined {
  if (slug && TEMPLATE_CONFIGS[slug]) return TEMPLATE_CONFIGS[slug];
  if (category) {
    return Object.values(TEMPLATE_CONFIGS).find((config) => config.category === category);
  }
  return undefined;
}
