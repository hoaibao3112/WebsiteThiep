export type MemoryFrameType = "polaroid" | "golden-monogram" | "floral" | "classic" | "none";

export interface WeddingMemory {
  id: string;
  accountId: string;
  cardId: string;
  guestId?: string | null;
  senderName: string;
  relationship?: string | null;
  message?: string | null;
  photoUrl: string;
  thumbUrl?: string | null;
  frameType: MemoryFrameType;
  isApproved: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMemoryPayload {
  senderName: string;
  relationship?: string;
  message?: string;
  photoUrl: string;
  thumbUrl?: string;
  frameType?: MemoryFrameType;
  guestId?: string;
}
