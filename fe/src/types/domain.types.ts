export type DomainStatus = "PENDING_DNS" | "VERIFYING" | "ACTIVE" | "FAILED";

export interface CustomDomainCardInfo {
  id: string;
  slug: string;
  status?: string;
  template?: {
    name?: string;
    thumbnailUrl?: string;
  } | null;
}

export interface CustomDomainItem {
  id: string;
  accountId: string;
  cardId: string;
  domain: string;
  status: DomainStatus;
  targetType: string;
  targetValue: string;
  verificationTxt?: string | null;
  sslStatus?: string | null;
  lastCheckedAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  card: CustomDomainCardInfo;
}

export interface DomainListResponse {
  defaultDomain: {
    host: string;
    urlPattern: string;
    isDefault: boolean;
  };
  capabilities: {
    allowCustomDomain: boolean;
    planCode: "FREE" | "BASIC" | "VIP";
    planName: string;
  };
  domains: CustomDomainItem[];
}

export interface DnsRecordGuidance {
  type: string;
  name: string;
  value: string;
  description: string;
}

export interface CreateCustomDomainResponse {
  domain: CustomDomainItem;
  dnsRecords: DnsRecordGuidance[];
}

export interface PublicCardDomainLookup {
  id: string;
  slug: string;
  status: string;
  accountId: string;
  domain: string;
}
