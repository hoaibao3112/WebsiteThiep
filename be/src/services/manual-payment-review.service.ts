import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { logger } from "../lib/logger";
import { HttpError } from "../lib/http-error";
import { AccountEntitlementService } from "./account-entitlement.service";

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface ReviewQueueItem {
  id: string;
  orderCode: string;
  amount: number;
  status: string;
  planCode: string;
  planName: string;
  accountId: string;
  accountName: string;
  buyerEmail: string;
  buyerName: string | null;
  submittedAt: Date | null;
  createdAt: Date;
  expiredAt: Date;
  account: { id: string; name: string };
  user: { email: string; name: string | null };
  plan: { code: string; name: string };
}

export interface ReviewOrderDetail extends ReviewQueueItem {
  reviewedAt: Date | null;
  reviewedByEmail: string | null;
  reviewNote: string | null;
  paidAt: Date | null;
}

export interface ApproveInput {
  receivedAmount: number;
  bankReference?: string;
  note?: string;
}

export interface RejectInput {
  reason: string;
}

// ────────────────────────────────────────────────────────────
// SERVICE (ADMIN-only boundary)
// ────────────────────────────────────────────────────────────

const MAX_SERIALIZABLE_RETRIES = 3;

export class ManualPaymentReviewService {
  /**
   * Paginated list of orders for ADMIN review queue.
   * Explicitly safe select — no tenant-facing service may reuse this.
   */
  static async listReviewQueue(params: {
    status?: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: ReviewQueueItem[]; total: number }> {
    const { status, page, pageSize } = params;

    const where: Prisma.OrderWhereInput = {};
    if (status) {
      where.status = status as Prisma.EnumOrderStatusFilter["equals"];
    } else {
      where.status = { in: ["AWAITING_REVIEW", "PAID", "REJECTED"] };
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          orderCode: true,
          amount: true,
          status: true,
          accountId: true,
          submittedAt: true,
          createdAt: true,
          expiredAt: true,
          plan: { select: { code: true, name: true } },
          account: { select: { id: true, name: true } },
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items: items.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        amount: o.amount,
        status: o.status,
        planCode: o.plan.code,
        planName: o.plan.name,
        accountId: o.accountId,
        accountName: o.account?.name || "Tài khoản",
        buyerEmail: o.user?.email || "—",
        buyerName: o.user?.name || null,
        submittedAt: o.submittedAt,
        createdAt: o.createdAt,
        expiredAt: o.expiredAt,
        account: {
          id: o.accountId,
          name: o.account?.name || "Tài khoản",
        },
        user: {
          email: o.user?.email || "—",
          name: o.user?.name || null,
        },
        plan: {
          code: o.plan.code,
          name: o.plan.name,
        },
      })),
      total,
    };
  }

  /**
   * Scoped detail by { id, accountId }.
   */
  static async getOrderDetail(orderId: string): Promise<ReviewOrderDetail | null> {
    const o = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderCode: true,
        amount: true,
        status: true,
        accountId: true,
        submittedAt: true,
        createdAt: true,
        expiredAt: true,
        paidAt: true,
        reviewedAt: true,
        reviewNote: true,
        plan: { select: { code: true, name: true } },
        account: { select: { id: true, name: true } },
        user: { select: { email: true, name: true } },
        reviewedBy: { select: { email: true } },
      },
    });

    if (!o) return null;

    return {
      id: o.id,
      orderCode: o.orderCode,
      amount: o.amount,
      status: o.status,
      planCode: o.plan.code,
      planName: o.plan.name,
      accountId: o.accountId,
      accountName: o.account?.name || "Tài khoản",
      buyerEmail: o.user?.email || "—",
      buyerName: o.user?.name || null,
      submittedAt: o.submittedAt,
      createdAt: o.createdAt,
      expiredAt: o.expiredAt,
      paidAt: o.paidAt,
      reviewedAt: o.reviewedAt,
      reviewedByEmail: o.reviewedBy?.email ?? null,
      reviewNote: o.reviewNote,
      account: {
        id: o.accountId,
        name: o.account?.name || "Tài khoản",
      },
      user: {
        email: o.user?.email || "—",
        name: o.user?.name || null,
      },
      plan: {
        code: o.plan.code,
        name: o.plan.name,
      },
    };
  }

  /**
   * Approve order — Serializable transaction with bounded retry.
   * - Conditional Order transition as concurrency gate.
   * - Re-reads Account entitlement inside every retry.
   * - Rejects BASIC approval if Account is already VIP.
   * - Creates PaymentTransaction with stable dedupe key.
   * - Updates Account Plan + Card lifecycle.
   */
  static async approveOrder(
    orderId: string,
    adminUserId: string,
    input: ApproveInput,
  ): Promise<ReviewOrderDetail> {
    const { receivedAmount, bankReference, note } = input;

    for (let attempt = 1; attempt <= MAX_SERIALIZABLE_RETRIES; attempt++) {
      try {
        const result = await prisma.$transaction(
          async (tx) => {
            // 1. Lock/transition the Order
            const transition = await tx.order.updateMany({
              where: {
                id: orderId,
                status: "AWAITING_REVIEW",
                expiredAt: { gt: new Date() },
              },
              data: {
                status: "PAID",
                paidAt: new Date(),
                reviewedAt: new Date(),
                reviewedById: adminUserId,
                reviewNote: note ?? null,
              },
            });

            if (transition.count !== 1) {
              throw new HttpError(
                409,
                "Đơn hàng không ở trạng thái chờ duyệt hoặc đã bị xử lý",
                "ORDER_NOT_APPROVABLE",
              );
            }

            // 2. Read the Order for details
            const order = await tx.order.findUniqueOrThrow({
              where: { id: orderId },
              include: { plan: true },
            });

            // 3. Verify received amount
            if (receivedAmount < order.amount) {
              // Rollback by throwing — the transition count guard prevents double-approve anyway
              throw new HttpError(
                422,
                `Số tiền nhận được (${receivedAmount.toLocaleString("vi-VN")}đ) thấp hơn yêu cầu (${order.amount.toLocaleString("vi-VN")}đ)`,
                "INSUFFICIENT_AMOUNT",
              );
            }

            // 4. Re-read Account entitlement to prevent concurrent downgrade
            const accountEntitlement = await AccountEntitlementService.getEffectivePlan(order.accountId);
            if (order.plan.code === "BASIC" && accountEntitlement.planCode === "VIP") {
              throw new HttpError(
                409,
                "Tài khoản đã được nâng cấp VIP — không thể duyệt đơn BASIC",
                "CONCURRENT_VIP_UPGRADE",
              );
            }

            // 5. Create PaymentTransaction with stable dedupe key
            const txDedupeKey = bankReference
              ? `REF:${bankReference.trim().toUpperCase()}`
              : `MANUAL:${orderId}`;

            await tx.paymentTransaction.create({
              data: {
                accountId: order.accountId,
                orderId: order.id,
                gateway: "MANUAL",
                gatewayTxId: txDedupeKey,
                amount: receivedAmount,
                bankCode: null,
                accountNumber: null,
                transactionTime: new Date(),
                rawPayload: {
                  type: "MANUAL_APPROVAL",
                  adminUserId,
                  receivedAmount,
                  bankReference: bankReference ?? null,
                  note: note ?? null,
                  approvedAt: new Date().toISOString(),
                } satisfies Record<string, unknown>,
              },
            });

            // 6. Update Account Plan and expiry
            const now = new Date();
            if (order.plan.code === "VIP") {
              const { planStartedAt, planExpiresAt } = AccountEntitlementService.calculateVipActivation(now);
              await tx.account.update({
                where: { id: order.accountId },
                data: {
                  currentPlanId: order.planId,
                  planStartedAt,
                  planExpiresAt,
                },
              });
            } else if (order.plan.code === "BASIC" && order.plan.durationDays) {
              const currentAccount = await tx.account.findUniqueOrThrow({
                where: { id: order.accountId },
                select: { currentPlan: { select: { code: true } }, planExpiresAt: true },
              });

              const { planStartedAt, planExpiresAt } =
                AccountEntitlementService.calculateBasicActivation(
                  currentAccount.currentPlan?.code ?? null,
                  currentAccount.planExpiresAt,
                  order.plan.durationDays,
                  now,
                );

              await tx.account.update({
                where: { id: order.accountId },
                data: {
                  currentPlanId: order.planId,
                  planStartedAt,
                  planExpiresAt,
                },
              });
            }

            // 7. Card lifecycle: set expiredAt = null on ACTIVE, reactivate EXPIRED
            await tx.card.updateMany({
              where: { accountId: order.accountId, status: "ACTIVE" },
              data: { expiredAt: null, planId: order.planId },
            });
            await tx.card.updateMany({
              where: { accountId: order.accountId, status: "EXPIRED" },
              data: { status: "ACTIVE", expiredAt: null, planId: order.planId },
            });
            // DRAFT and ARCHIVED remain unchanged

            return orderId;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );

        // Success — fetch and return detail
        const detail = await this.getOrderDetail(result);
        if (!detail) throw new HttpError(500, "Lỗi hệ thống sau khi duyệt đơn", "INTERNAL_ERROR");

        logger.info(
          { orderId, adminUserId, receivedAmount },
          "[ManualPayment] Order approved successfully",
        );

        return detail;
      } catch (err) {
        // P2034 = Serializable transaction conflict — retry
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2034" &&
          attempt < MAX_SERIALIZABLE_RETRIES
        ) {
          logger.warn(
            { orderId, attempt },
            "[ManualPayment] Serializable conflict — retrying",
          );
          continue;
        }
        throw err;
      }
    }

    throw new HttpError(503, "Không thể xử lý đơn hàng — vui lòng thử lại", "SERIALIZABLE_RETRY_EXHAUSTED");
  }

  /**
   * Reject order — requires reason, does NOT touch entitlement.
   */
  static async rejectOrder(
    orderId: string,
    adminUserId: string,
    input: RejectInput,
  ): Promise<ReviewOrderDetail> {
    const result = await prisma.order.updateMany({
      where: {
        id: orderId,
        status: "AWAITING_REVIEW",
      },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: adminUserId,
        reviewNote: input.reason,
      },
    });

    if (result.count !== 1) {
      throw new HttpError(
        409,
        "Đơn hàng không ở trạng thái chờ duyệt hoặc đã bị xử lý",
        "ORDER_NOT_REJECTABLE",
      );
    }

    const detail = await this.getOrderDetail(orderId);
    if (!detail) throw new HttpError(500, "Lỗi hệ thống sau khi từ chối đơn", "INTERNAL_ERROR");

    logger.info(
      { orderId, adminUserId, reason: input.reason },
      "[ManualPayment] Order rejected",
    );

    return detail;
  }
}
