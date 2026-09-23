export type PlanCode = "FREE" | "BASIC" | "VIP";

export type OrderStatus = "PENDING" | "AWAITING_REVIEW" | "PAID" | "REJECTED" | "EXPIRED";

export type AccountMemberRole = "OWNER" | "MEMBER";

export interface PlanCapabilities {
  maxPhotos: number;
  hasWatermark: boolean;
  allowCustomDomain: boolean;
  allowMusicUpload: boolean;
  allowTelegramNoti: boolean;
  allowPremiumTemplates: boolean;
}

export interface PlanCatalogItem {
  id: string;
  code: PlanCode;
  name: string;
  price: number;
  durationDays: number | null;
  maxPhotos: number;
  hasWatermark: boolean;
  allowCustomDomain: boolean;
  allowMusicUpload: boolean;
  allowTelegramNoti: boolean;
  allowPremiumTemplates: boolean;
  features: string[] | null;
  sortOrder: number;
}

export interface EffectivePlanSummary {
  planCode: PlanCode;
  planName: string;
  isPaid: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  planExpiresAt: string | null;
  capabilities: PlanCapabilities;
}

export interface PaymentOrder {
  id: string;
  orderCode: string;
  planCode: PlanCode;
  planName: string;
  amount: number;
  status: OrderStatus;
  paidAt: string | null;
  expiredAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
}

export interface PaymentInfo {
  orderCode: string;
  amount: number;
  bankCode: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
  qrUrl: string | null;
  expiredAt: string;
  pollingToken?: string | null;
}

export interface CreateOrderResponse {
  order: PaymentOrder;
  paymentInfo: PaymentInfo;
  replayed: boolean;
}

export interface BillingSummary {
  effectivePlan: EffectivePlanSummary;
  activeOrder: PaymentOrder | null;
  isOwner: boolean;
  accountRole: AccountMemberRole;
}

export interface AdminPaymentOrder {
  id: string;
  orderCode: string;
  amount: number;
  status: OrderStatus;
  paymentGateway: string;
  expiredAt: string;
  submittedAt: string | null;
  paidAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  account: {
    id: string;
    name: string;
    currentPlan: {
      code: PlanCode;
      name: string;
    };
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
  };
  reviewer?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  plan: {
    id: string;
    code: PlanCode;
    name: string;
    price: number;
  };
}

export interface AdminPaymentListResponse {
  items: AdminPaymentOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
