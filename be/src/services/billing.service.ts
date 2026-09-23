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
  activeOrder: {
    id: string;
    orderCode: string;
    planCode: string;
    planName: string;
    amount: number;
    status: string;
    paidAt: Date | null;
    expiredAt: Date;
    submittedAt: Date | null;
    reviewedAt: Date | null;
    reviewNote: string | null;
    createdAt: Date;
  } | null;
  activeOrderId: string | null;
  activeOrderStatus: string | null;
  isOwner: boolean;
  accountRole: "OWNER" | "MEMBER";
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
   * Account billing summary: effective plan + active order + ownership.
   */
  static async getBillingSummary(accountId: string, userId?: string): Promise<BillingSummary> {
    const [effectivePlan, activeOrderRecord, membership] = await Promise.all([
      AccountEntitlementService.getEffectivePlan(accountId),
      prisma.order.findFirst({
        where: {
          accountId,
          status: { in: ["PENDING", "AWAITING_REVIEW"] },
          expiredAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        include: { plan: true },
      }),
      userId
        ? prisma.accountMember.findUnique({
            where: { accountId_userId: { accountId, userId } },
            select: { role: true },
          })
        : null,
    ]);

    const role = membership?.role ?? "OWNER";
    const isOwner = role === "OWNER";

    const activeOrder = activeOrderRecord
      ? {
          id: activeOrderRecord.id,
          orderCode: activeOrderRecord.orderCode,
          planCode: activeOrderRecord.plan.code,
          planName: activeOrderRecord.plan.name,
          amount: activeOrderRecord.amount,
          status: activeOrderRecord.status,
          paidAt: activeOrderRecord.paidAt,
          expiredAt: activeOrderRecord.expiredAt,
          submittedAt: activeOrderRecord.submittedAt,
          reviewedAt: activeOrderRecord.reviewedAt,
          reviewNote: activeOrderRecord.reviewNote,
          createdAt: activeOrderRecord.createdAt,
        }
      : null;

    return {
      accountId,
      effectivePlan,
      activeOrder,
      activeOrderId: activeOrder?.id ?? null,
      activeOrderStatus: activeOrder?.status ?? null,
      isOwner,
      accountRole: role,
    };
  }
}
