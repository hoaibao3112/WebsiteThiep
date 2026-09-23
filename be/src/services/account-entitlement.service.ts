import { prisma } from "../lib/prisma";
import { PlanCode, Prisma } from "@prisma/client";
import { logger } from "../lib/logger";

// ────────────────────────────────────────────────────────────
// Stable DTOs — never leak full Prisma rows
// ────────────────────────────────────────────────────────────

export interface PlanCapabilities {
  maxPhotos: number;
  hasWatermark: boolean;
  allowCustomDomain: boolean;
  allowMusicUpload: boolean;
  allowTelegramNoti: boolean;
  allowPremiumTemplates: boolean;
}

export interface EffectivePlanDTO {
  planId: string;
  planCode: PlanCode;
  planName: string;
  capabilities: PlanCapabilities;
  planStartedAt: Date | null;
  planExpiresAt: Date | null;
  isExpired: boolean;
}

const FREE_PLAN_CODE: PlanCode = "FREE";

// ────────────────────────────────────────────────────────────
// SERVICE
// ────────────────────────────────────────────────────────────

export class AccountEntitlementService {
  /**
   * Resolve the effective Plan for an Account at a given point in time.
   * Expired BASIC → FREE (opportunistically persisted).
   * VIP has no expiry (lifetime).
   */
  static async getEffectivePlan(accountId: string, now: Date = new Date()): Promise<EffectivePlanDTO> {
    const account = await prisma.account.findUniqueOrThrow({
      where: { id: accountId },
      select: {
        id: true,
        currentPlanId: true,
        planStartedAt: true,
        planExpiresAt: true,
        currentPlan: {
          select: {
            id: true,
            code: true,
            name: true,
            maxPhotos: true,
            hasWatermark: true,
            allowCustomDomain: true,
            allowMusicUpload: true,
            allowTelegramNoti: true,
            allowPremiumTemplates: true,
          },
        },
      },
    });

    // No plan assigned yet → FREE
    if (!account.currentPlan || !account.currentPlanId) {
      return this.resolveFreePlan(accountId);
    }

    const plan = account.currentPlan;

    // VIP = lifetime, never expires
    if (plan.code === "VIP") {
      return this.toPlanDTO(plan, account.planStartedAt, account.planExpiresAt, false);
    }

    // BASIC with expiry check
    if (plan.code === "BASIC" && account.planExpiresAt && account.planExpiresAt <= now) {
      // Expired BASIC → opportunistically persist FREE
      await this.opportunisticDowngradeToFree(accountId, account.currentPlanId, now);
      return this.resolveFreePlan(accountId);
    }

    // Active BASIC or FREE
    const isExpired = account.planExpiresAt ? account.planExpiresAt <= now : false;
    return this.toPlanDTO(plan, account.planStartedAt, account.planExpiresAt, isExpired);
  }

  /**
   * Activate a BASIC plan for an account.
   * Extension: start from max(now, current planExpiresAt).
   */
  static calculateBasicActivation(
    currentPlanCode: PlanCode | null,
    currentExpiresAt: Date | null,
    durationDays: number,
    now: Date = new Date(),
  ): { planStartedAt: Date; planExpiresAt: Date } {
    const planStartedAt = now;
    // Extension: if the account has an unexpired BASIC, extend from the current expiry
    let baseDate = now;
    if (currentPlanCode === "BASIC" && currentExpiresAt && currentExpiresAt > now) {
      baseDate = currentExpiresAt;
    }
    const planExpiresAt = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    return { planStartedAt, planExpiresAt };
  }

  /**
   * Activate a VIP plan for an account (lifetime, no expiry).
   */
  static calculateVipActivation(now: Date = new Date()): { planStartedAt: Date; planExpiresAt: null } {
    return { planStartedAt: now, planExpiresAt: null };
  }

  // ────────────────────────────────────────────────────────
  // Internal helpers
  // ────────────────────────────────────────────────────────

  /**
   * Conditionally persist FREE — only if the same expired BASIC revision is still current.
   * Cannot overwrite a concurrent VIP approval.
   */
  private static async opportunisticDowngradeToFree(
    accountId: string,
    expiredPlanId: string,
    now: Date,
  ): Promise<void> {
    const freePlan = await prisma.plan.findUnique({ where: { code: FREE_PLAN_CODE } });
    if (!freePlan) {
      logger.error({ accountId }, "FREE plan not found — cannot downgrade expired BASIC");
      return;
    }

    const result = await prisma.account.updateMany({
      where: {
        id: accountId,
        currentPlanId: expiredPlanId, // Only overwrite the expired plan, not a concurrent VIP
        planExpiresAt: { lte: now },
      },
      data: {
        currentPlanId: freePlan.id,
        planStartedAt: now,
        planExpiresAt: null,
      },
    });

    if (result.count > 0) {
      logger.info({ accountId }, "Expired BASIC → FREE (opportunistic downgrade)");
    }
  }

  private static async resolveFreePlan(accountId: string): Promise<EffectivePlanDTO> {
    const freePlan = await prisma.plan.findUnique({
      where: { code: FREE_PLAN_CODE },
      select: {
        id: true,
        code: true,
        name: true,
        maxPhotos: true,
        hasWatermark: true,
        allowCustomDomain: true,
        allowMusicUpload: true,
        allowTelegramNoti: true,
        allowPremiumTemplates: true,
      },
    });

    if (!freePlan) {
      throw new Error("FREE plan not configured — system cannot resolve entitlement");
    }

    return this.toPlanDTO(freePlan, null, null, false);
  }

  private static toPlanDTO(
    plan: {
      id: string;
      code: PlanCode;
      name: string;
      maxPhotos: number;
      hasWatermark: boolean;
      allowCustomDomain: boolean;
      allowMusicUpload: boolean;
      allowTelegramNoti: boolean;
      allowPremiumTemplates: boolean;
    },
    planStartedAt: Date | null,
    planExpiresAt: Date | null,
    isExpired: boolean,
  ): EffectivePlanDTO {
    return {
      planId: plan.id,
      planCode: plan.code,
      planName: plan.name,
      capabilities: {
        maxPhotos: plan.maxPhotos,
        hasWatermark: plan.hasWatermark,
        allowCustomDomain: plan.allowCustomDomain,
        allowMusicUpload: plan.allowMusicUpload,
        allowTelegramNoti: plan.allowTelegramNoti,
        allowPremiumTemplates: plan.allowPremiumTemplates,
      },
      planStartedAt,
      planExpiresAt,
      isExpired,
    };
  }
}
