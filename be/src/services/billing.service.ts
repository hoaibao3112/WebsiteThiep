import { prisma } from "../lib/prisma";
import { AccountEntitlementService, EffectivePlanDTO } from "./account-entitlement.service";

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface PlanCatalogItem {
  id: string;
  code: string;
  name: string;
  price: number;
  durationDays: number | null;
  maxPhotos: number;
  hasWatermark: boolean;
  allowCustomDomain: boolean;
  allowMusicUpload: boolean;
  allowTelegramNoti: boolean;
  allowPremiumTemplates: boolean;
  features: unknown;
  sortOrder: number;
}

export interface BillingSummary {
  accountId: string;
  effectivePlan: EffectivePlanDTO;
  activeOrderId: string | null;
  activeOrderStatus: string | null;
}

// ────────────────────────────────────────────────────────────
// SERVICE
// ────────────────────────────────────────────────────────────

export class BillingService {
  /**
   * Return the active Plan catalog (visible purchasable plans).
   * Marketing translations remain frontend-owned; API is authoritative for code, price, duration, capabilities.
   */
  static async getPlanCatalog(): Promise<PlanCatalogItem[]> {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        price: true,
        durationDays: true,
        maxPhotos: true,
        hasWatermark: true,
        allowCustomDomain: true,
        allowMusicUpload: true,
        allowTelegramNoti: true,
        allowPremiumTemplates: true,
        features: true,
        sortOrder: true,
      },
    });

    return plans;
  }

  /**
   * Account billing summary: effective plan + active order (if any).
   */
  static async getBillingSummary(accountId: string): Promise<BillingSummary> {
    const [effectivePlan, activeOrder] = await Promise.all([
      AccountEntitlementService.getEffectivePlan(accountId),
      prisma.order.findFirst({
        where: {
          accountId,
          status: { in: ["PENDING", "AWAITING_REVIEW"] },
          expiredAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true },
      }),
    ]);

    return {
      accountId,
      effectivePlan,
      activeOrderId: activeOrder?.id ?? null,
      activeOrderStatus: activeOrder?.status ?? null,
    };
  }
}
