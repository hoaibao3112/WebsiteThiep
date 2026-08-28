export type CardCategory = "WEDDING" | "BIRTHDAY" | "NEWBORN";
export type CeremonyType = "ANNOUNCEMENT_ONLY" | "FULL_MONTH" | "ONE_YEAR";
export type OpeningEffectType = "NONE" | "WAX_SEAL" | "GATE_OPEN" | "GIFT_BOX";
export type FallingEffectType = "NONE" | "PETAL" | "HEART" | "SNOW" | "CONFETTI" | "BALLOON";

export interface EventItem {
  id?: string;
  eventName: string;
  eventDate: string | Date;
  lunarDate?: string;
  venueName: string;
  address: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface PhotoItem {
  id?: string;
  url: string;
  thumbUrl?: string;
  caption?: string;
  isCover?: boolean;
}

export interface WeddingDataPayload {
  cardCategory: "WEDDING";
  groom: {
    fullName: string;
    shortName?: string;
    avatarUrl?: string;
    birthOrder?: string;
    parents?: {
      fatherName?: string;
      motherName?: string;
      isPassedAwayFather?: boolean;
      isPassedAwayMother?: boolean;
    };
    story?: string;
  };
  bride: {
    fullName: string;
    shortName?: string;
    avatarUrl?: string;
    birthOrder?: string;
    parents?: {
      fatherName?: string;
      motherName?: string;
      isPassedAwayFather?: boolean;
      isPassedAwayMother?: boolean;
    };
    story?: string;
  };
  greeting?: string;
  loveStory?: Array<{
    title: string;
    date: string;
    description?: string;
    imageUrl?: string;
  }>;
  events: EventItem[];
}

export interface BirthdayDataPayload {
  cardCategory: "BIRTHDAY";
  celebrantName: string;
  avatarUrl?: string;
  age?: number;
  birthDate?: string | Date;
  greeting?: string;
  themeMood?: string;
  hobbies?: string[];
  events: EventItem[];
}

export interface NewbornDataPayload {
  cardCategory: "NEWBORN";
  babyName: string;
  nickname?: string;
  gender: "BOY" | "GIRL" | "OTHER";
  birthDate: string | Date;
  birthTime?: string;
  weight?: string;
  height?: string;
  avatarUrl?: string;
  parents?: {
    fatherName?: string;
    motherName?: string;
  };
  ceremonyType: CeremonyType;
  greeting?: string;
  events?: EventItem[];
}

export type CategoryDataPayload =
  | WeddingDataPayload
  | BirthdayDataPayload
  | NewbornDataPayload;

export interface CardDetail {
  id: string;
  slug: string;
  cardCategory: CardCategory;
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "ARCHIVED";
  openingEffect: OpeningEffectType;
  fallingEffect: FallingEffectType;
  musicUrl?: string | null;
  isAutoPlay: boolean;
  primaryColor: string;
  fontFamily: string;
  greetingMessage?: string | null;
  categoryData: CategoryDataPayload;
  bankingPrimary?: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
  } | null;
  bankingSecondary?: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
  } | null;
  events: EventItem[];
  photos: PhotoItem[];
}
