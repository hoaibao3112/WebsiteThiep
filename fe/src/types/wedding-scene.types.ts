import type { CanvasElement } from "./canvas.types";

export const WEDDING_SCENE_VERSION = 1 as const;

export type WeddingSceneBinding =
  | "groom.fullName"
  | "groom.shortName"
  | "bride.fullName"
  | "bride.shortName"
  | "coverPhotoUrl"
  | "greeting"
  | "events[0].eventDate"
  | "events[0].eventName"
  | "events[0].venueName"
  | "events[0].address"
  | "events[0].mapUrl"
  | `custom.${string}`;

export type WeddingSceneSectionId =
  | "hero"
  | "couple"
  | "parents"
  | "events"
  | "calendar"
  | "countdown"
  | "gallery"
  | "story"
  | "map"
  | "rsvp"
  | "gift"
  | "guestbook"
  | "farewell";

export interface WeddingSceneTokens {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
  headingFont: string;
  bodyFont: string;
  radius: "none" | "sm" | "md" | "lg" | "full";
  density: "airy" | "comfortable" | "compact";
  motif?: string;
}

export interface WeddingSceneSection {
  id: string;
  type: WeddingSceneSectionId;
  label: string;
  visible: boolean;
  order: number;
  elementIds: string[];
}

export interface WeddingSceneDocument {
  schemaVersion: typeof WEDDING_SCENE_VERSION;
  templateSlug: string;
  width: number;
  height: number;
  background: {
    color: string;
    pattern?: string;
    imageUrl?: string;
  };
  tokens: WeddingSceneTokens;
  sections: WeddingSceneSection[];
  elements: CanvasElement[];
  bindings: Record<string, WeddingSceneBinding>;
}
