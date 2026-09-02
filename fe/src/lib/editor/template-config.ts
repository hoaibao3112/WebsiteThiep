import type { CardCategory } from "@/types/card.types";

export type TemplateVariant = "minimalist-gold" | "hong-xanh-luxury" | "glow-party" | "little-prince" | "sweet-angel";

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
  "wedding-minimalist-gold": { slug: "wedding-minimalist-gold", category: "WEDDING", variant: "minimalist-gold", label: "Minimalist Gold", defaultPrimaryColor: "#BE944E", defaultFontFamily: "Playfair Display", sections: ["hero", "couple", "events", "story", "rsvp"] },
  "wedding-hong-xanh-luxury": { slug: "wedding-hong-xanh-luxury", category: "WEDDING", variant: "hong-xanh-luxury", label: "Hồng Xanh Luxury", defaultPrimaryColor: "#B76E79", defaultFontFamily: "Cinzel", sections: ["hero", "couple", "story", "events", "rsvp"] },
  "birthday-glow-party": { slug: "birthday-glow-party", category: "BIRTHDAY", variant: "glow-party", label: "Glow Party", defaultPrimaryColor: "#F97316", defaultFontFamily: "Outfit", sections: ["hero", "gallery", "message", "events", "rsvp"] },
  "newborn-little-prince": { slug: "newborn-little-prince", category: "NEWBORN", variant: "little-prince", label: "Little Prince", defaultPrimaryColor: "#4169A1", defaultFontFamily: "Quicksand", sections: ["hero", "milestones", "family", "events", "rsvp"] },
  "newborn-sweet-angel": { slug: "newborn-sweet-angel", category: "NEWBORN", variant: "sweet-angel", label: "Sweet Angel", defaultPrimaryColor: "#D989A6", defaultFontFamily: "Quicksand", sections: ["hero", "family", "milestones", "events", "rsvp"] },
};

export function getTemplateConfig(slug?: string, category?: CardCategory): TemplateConfig | undefined {
  if (slug && TEMPLATE_CONFIGS[slug]) return TEMPLATE_CONFIGS[slug];
  return Object.values(TEMPLATE_CONFIGS).find((config) => config.category === category);
}
