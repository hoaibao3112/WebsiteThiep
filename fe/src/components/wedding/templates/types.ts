import { CardDetail, WeddingDataPayload } from "@/types/card.types";
import type { WeddingSceneDocument } from "@/types/wedding-scene.types";

export interface WeddingTemplateProps {
  card: CardDetail;
  data: WeddingDataPayload;
  primaryColor: string;
  guestName?: string;
  guestPhone?: string;
  isVipExperience?: boolean;
  onOpenRsvp: () => void;
  onOpenGift: () => void;
  onSelectPhoto: (url: string) => void;
  isPreview?: boolean;
  scene?: WeddingSceneDocument;
}
