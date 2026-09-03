export type EditorFieldType = "text" | "image" | "color" | "font" | "effect" | "music";
export interface EditorField { id: string; type: EditorFieldType; label: string; path: string; maxLength?: number; allowedValues?: readonly string[] }

const WEDDING_FIELDS: readonly EditorField[] = [
  { id: "groom-name", type: "text", label: "Tên chú rể", path: "categoryData.groom.fullName", maxLength: 120 },
  { id: "groom-short", type: "text", label: "Tên gọi thân mật chú rể", path: "categoryData.groom.shortName", maxLength: 50 },
  { id: "groom-avatar", type: "image", label: "Ảnh đại diện chú rể", path: "categoryData.groom.avatarUrl" },
  { id: "bride-name", type: "text", label: "Tên cô dâu", path: "categoryData.bride.fullName", maxLength: 120 },
  { id: "bride-short", type: "text", label: "Tên gọi thân mật cô dâu", path: "categoryData.bride.shortName", maxLength: 50 },
  { id: "bride-avatar", type: "image", label: "Ảnh đại diện cô dâu", path: "categoryData.bride.avatarUrl" },
  { id: "cover-photo", type: "image", label: "Ảnh bìa chính (Cover)", path: "categoryData.coverPhotoUrl" },
  { id: "greeting", type: "text", label: "Lời ngỏ / Thông điệp mời", path: "greetingMessage", maxLength: 500 },
  { id: "primary-color", type: "color", label: "Màu chủ đạo", path: "primaryColor" },
  { id: "font-family", type: "font", label: "Font chữ", path: "fontFamily", allowedValues: ["Inter", "Playfair Display", "Cinzel", "Quicksand", "Outfit"] },
  { id: "opening-effect", type: "effect", label: "Hiệu ứng mở", path: "openingEffect", allowedValues: ["NONE", "WAX_SEAL", "GATE_OPEN", "GIFT_BOX"] },
  { id: "falling-effect", type: "effect", label: "Hiệu ứng rơi", path: "fallingEffect", allowedValues: ["NONE", "PETAL", "HEART", "SNOW", "CONFETTI", "BALLOON"] },
  { id: "music", type: "music", label: "Nhạc nền", path: "musicUrl" },
];

const BIRTHDAY_FIELDS: readonly EditorField[] = [
  { id: "celebrant-name", type: "text", label: "Tên chủ nhân bữa tiệc", path: "categoryData.celebrantName", maxLength: 120 },
  { id: "age", type: "text", label: "Số tuổi / Kỷ niệm", path: "categoryData.age", maxLength: 20 },
  { id: "cover-photo", type: "image", label: "Ảnh chủ nhân tiệc", path: "categoryData.avatarUrl" },
  { id: "greeting", type: "text", label: "Lời mời sinh nhật", path: "greetingMessage", maxLength: 500 },
  { id: "primary-color", type: "color", label: "Màu chủ đạo", path: "primaryColor" },
  { id: "font-family", type: "font", label: "Font chữ", path: "fontFamily", allowedValues: ["Outfit", "Inter", "Quicksand", "Playfair Display"] },
  { id: "opening-effect", type: "effect", label: "Hiệu ứng mở", path: "openingEffect", allowedValues: ["NONE", "WAX_SEAL", "GATE_OPEN", "GIFT_BOX"] },
  { id: "falling-effect", type: "effect", label: "Hiệu ứng rơi", path: "fallingEffect", allowedValues: ["BALLOON", "CONFETTI", "NONE", "HEART"] },
  { id: "music", type: "music", label: "Nhạc nền", path: "musicUrl" },
];

const NEWBORN_FIELDS: readonly EditorField[] = [
  { id: "baby-name", type: "text", label: "Tên khai sinh của bé", path: "categoryData.babyName", maxLength: 120 },
  { id: "nickname", type: "text", label: "Tên ở nhà của bé", path: "categoryData.nickname", maxLength: 50 },
  { id: "weight", type: "text", label: "Cân nặng khi sinh (kg)", path: "categoryData.weight", maxLength: 20 },
  { id: "height", type: "text", label: "Chiều cao khi sinh (cm)", path: "categoryData.height", maxLength: 20 },
  { id: "cover-photo", type: "image", label: "Ảnh thiên thần nhỏ", path: "categoryData.avatarUrl" },
  { id: "greeting", type: "text", label: "Lời ngỏ đầy tháng / thôi nôi", path: "greetingMessage", maxLength: 500 },
  { id: "primary-color", type: "color", label: "Màu chủ đạo", path: "primaryColor" },
  { id: "font-family", type: "font", label: "Font chữ", path: "fontFamily", allowedValues: ["Quicksand", "Inter", "Outfit"] },
  { id: "opening-effect", type: "effect", label: "Hiệu ứng mở", path: "openingEffect", allowedValues: ["NONE", "WAX_SEAL", "GATE_OPEN", "GIFT_BOX"] },
  { id: "falling-effect", type: "effect", label: "Hiệu ứng rơi", path: "fallingEffect", allowedValues: ["BALLOON", "CONFETTI", "PETAL", "NONE"] },
  { id: "music", type: "music", label: "Nhạc nền", path: "musicUrl" },
];

const REGISTRY: Record<string, readonly EditorField[]> = {
  // 9 MẪU THIỆP CƯỚI ĐỘC BẢN
  "wedding-heritage-crimson-gold": WEDDING_FIELDS,
  "wedding-modern-editorial-magazine": WEDDING_FIELDS,
  "wedding-sweet-editorial-romance": WEDDING_FIELDS,
  "wedding-crimson-wine-marsala": WEDDING_FIELDS,
  "wedding-forest-green-botanical": WEDDING_FIELDS,
  "wedding-pure-lotus-heritage": WEDDING_FIELDS,
  "wedding-cinematic-editorial": WEDDING_FIELDS,
  "wedding-alpine-lake-romance": WEDDING_FIELDS,
  "wedding-imperial-dragon-crimson": WEDDING_FIELDS,
  // CÁC MẪU CŨ VÀ KHÁC
  "wedding-minimalist-gold": WEDDING_FIELDS,
  "wedding-hong-xanh-luxury": WEDDING_FIELDS,
  "birthday-glow-party": BIRTHDAY_FIELDS,
  "newborn-little-prince": NEWBORN_FIELDS,
  "newborn-sweet-angel": NEWBORN_FIELDS,
};

export function getTemplateFields(slug: string): readonly EditorField[] {
  return REGISTRY[slug] ?? (slug.startsWith("wedding-") ? WEDDING_FIELDS : []);
}

export function isAllowedEditorPath(path: string): boolean {
  return Object.values(REGISTRY).some((fields) => fields.some((field) => field.path === path));
}

