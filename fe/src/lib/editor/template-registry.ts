export type EditorFieldType = "text" | "image" | "color" | "font" | "effect" | "music";
export interface EditorField { id: string; type: EditorFieldType; label: string; path: string; maxLength?: number; allowedValues?: readonly string[] }

const COMMON: readonly EditorField[] = [
  { id: "groom-name", type: "text", label: "Tên chú rể", path: "categoryData.groom.fullName", maxLength: 120 },
  { id: "bride-name", type: "text", label: "Tên cô dâu", path: "categoryData.bride.fullName", maxLength: 120 },
  { id: "greeting", type: "text", label: "Lời mời", path: "greetingMessage", maxLength: 500 },
  { id: "primary-color", type: "color", label: "Màu chủ đạo", path: "primaryColor" },
  { id: "font-family", type: "font", label: "Font chữ", path: "fontFamily", allowedValues: ["Inter", "Playfair Display", "Cinzel", "Quicksand", "Outfit"] },
  { id: "opening-effect", type: "effect", label: "Hiệu ứng mở", path: "openingEffect", allowedValues: ["NONE", "WAX_SEAL", "GATE_OPEN", "GIFT_BOX"] },
  { id: "falling-effect", type: "effect", label: "Hiệu ứng rơi", path: "fallingEffect", allowedValues: ["NONE", "PETAL", "HEART", "SNOW", "CONFETTI", "BALLOON"] },
  { id: "music", type: "music", label: "Nhạc nền", path: "musicUrl" },
  { id: "cover", type: "image", label: "Ảnh bìa", path: "data.coverPhotoUrl" },
];
const REGISTRY: Record<string, readonly EditorField[]> = {
  "wedding-minimalist-gold": COMMON,
  "wedding-hong-xanh-luxury": COMMON,
  "birthday-glow-party": COMMON,
  "newborn-little-prince": COMMON,
  "newborn-sweet-angel": COMMON,
};
export function getTemplateFields(slug: string): readonly EditorField[] { return REGISTRY[slug] ?? []; }
export function isAllowedEditorPath(path: string): boolean { return Object.values(REGISTRY).some((fields) => fields.some((field) => field.path === path)); }
