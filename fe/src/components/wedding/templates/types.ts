import { CardDetail, WeddingDataPayload } from "@/types/card.types";

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
}
