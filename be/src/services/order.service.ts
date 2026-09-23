import { prisma } from "../lib/prisma";
import { generateVietQrUrl } from "../lib/vietqr";
import { Prisma } from "@prisma/client";
import crypto from "node:crypto";
import { logger } from "../lib/logger";
import { HttpError } from "../lib/http-error";
import { AccountEntitlementService } from "./account-entitlement.service";

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export interface CreateAccountOrderInput {
  planCode: "BASIC" | "VIP";
}

export interface OrderSafeDTO {
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
}

// ────────────────────────────────────────────────────────────
// SERVICE
// ────────────────────────────────────────────────────────────

export class OrderService {
  private static readonly ORDER_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 hours

  /**
   * Create an account-level order for BASIC/VIP.
   * - Backend-authoritative pricing.
   * - 48-hour expiry.
   * - MANUAL gateway.
   * - Reuses active same-Plan order.
   * - Prevents VIP repurchase and BASIC→VIP downgrade via order.
   */
  static async createOrder(
    userId: string,
    accountId: string,
    input: CreateAccountOrderInput,
    idempotencyKey: string,
  ) {
    // 1. Verify OWNER role
    const membership = await prisma.accountMember.findUnique({
      where: { accountId_userId: { accountId, userId } },
      select: { role: true },
    });
    if (!membership || membership.role !== "OWNER") {
      throw new HttpError(403, "Chỉ chủ tài khoản (OWNER) mới có thể tạo đơn hàng", "OWNER_REQUIRED");
    }

    // 2. Resolve target Plan
    const targetPlan = await prisma.plan.findFirst({
      where: { code: input.planCode, isActive: true },
    });
    if (!targetPlan) {
      throw new HttpError(404, "Gói dịch vụ không tồn tại hoặc đã ngưng", "PLAN_NOT_FOUND");
    }
    if (targetPlan.price <= 0) {
      throw new HttpError(400, "Gói miễn phí không cần thanh toán", "FREE_PLAN_NOT_PURCHASABLE");
    }

    // 3. Check current entitlement
    const effective = await AccountEntitlementService.getEffectivePlan(accountId);
    if (effective.planCode === "VIP") {
      throw new HttpError(409, "Tài khoản đã là VIP vĩnh viễn, không cần mua thêm", "ALREADY_VIP");
    }
    if (effective.planCode === "BASIC" && input.planCode === "BASIC" && !effective.isExpired) {
      // Allow BASIC extension — this is renewal
    }

    // 4. Expire stale orders for this account
    await prisma.order.updateMany({
      where: {
        accountId,
        status: "PENDING",
        expiredAt: { lte: new Date() },
      },
      data: { status: "EXPIRED" },
    });

    // 5. Idempotency check
    const existingOrder = await prisma.order.findUnique({
      where: { accountId_idempotencyKey: { accountId, idempotencyKey } },
      include: { plan: true },
    });
    if (existingOrder) {
      if (existingOrder.planId !== targetPlan.id) {
        throw new HttpError(409, "Idempotency-Key đã được dùng cho yêu cầu khác", "IDEMPOTENCY_CONFLICT");
      }
      return this.formatOrderResult(existingOrder, true);
    }

    // 6. Reuse active same-Plan order
    const activeOrder = await prisma.order.findFirst({
      where: {
        accountId,
        planId: targetPlan.id,
        status: { in: ["PENDING", "AWAITING_REVIEW"] },
        expiredAt: { gt: new Date() },
      },
      include: { plan: true },
    });
    if (activeOrder) {
      return this.formatOrderResult(activeOrder, true);
    }

    // 7. Create new order
    const generateOrderCode = () =>
      `THIEP${Date.now().toString(36).slice(-3).toUpperCase()}${crypto.randomInt(10000, 100000)}`;
    let orderCode = generateOrderCode();
    const pollingToken = crypto.randomBytes(32).toString("base64url");
    const pollingTokenHash = crypto.createHash("sha256").update(pollingToken).digest("hex");
    const expiredAt = new Date(Date.now() + this.ORDER_EXPIRY_MS);

    let order;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        order = await prisma.order.create({
          data: {
            accountId,
            idempotencyKey,
            pollingTokenHash,
            orderCode,
            userId,
            cardId: null, // Account-level order, no cardId
            planId: targetPlan.id,
            amount: targetPlan.price, // Backend-authoritative
            status: "PENDING",
            paymentGateway: "MANUAL",
            expiredAt,
          },
          include: { plan: true },
        });
        break;
      } catch (err) {
        if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") {
          throw err;
        }

        const rawTarget = err.meta?.target;
        const targets = Array.isArray(rawTarget)
          ? rawTarget.filter((target): target is string => typeof target === "string")
          : typeof rawTarget === "string"
            ? [rawTarget]
            : [];

        const isIdempotencyConflict = targets.some((t) => t.toLowerCase().includes("idempotencykey"));
        const isOrderCodeConflict = targets.some((t) => t.toLowerCase().includes("ordercode"));

        if (isIdempotencyConflict) {
          const racedOrder = await prisma.order.findUnique({
            where: { accountId_idempotencyKey: { accountId, idempotencyKey } },
            include: { plan: true },
          });
          if (racedOrder?.planId === targetPlan.id) {
            return this.formatOrderResult(racedOrder, true);
          }
          throw new HttpError(409, "Idempotency-Key đã được dùng cho yêu cầu khác", "IDEMPOTENCY_CONFLICT");
        }

        if (isOrderCodeConflict) {
          if (attempt === 3) {
            throw new HttpError(503, "Không thể tạo mã đơn hàng sau nhiều lần thử", "ORDER_CREATE_RETRY_EXHAUSTED");
          }
          orderCode = generateOrderCode();
          continue;
        }

        throw err;
      }
    }
    if (!order) {
      throw new HttpError(503, "Không thể tạo mã đơn hàng sau nhiều lần thử", "ORDER_CREATE_RETRY_EXHAUSTED");
    }

    // 8. Generate VietQR
    const bankCode = process.env.BANK_CODE;
    const bankAccount = process.env.BANK_ACCOUNT;
    const bankAccountName = process.env.BANK_ACCOUNT_NAME;

    if (!bankCode || !bankAccount || !bankAccountName) {
      throw new HttpError(503, "Hệ thống thanh toán chưa được cấu hình", "PAYMENT_NOT_CONFIGURED");
    }

    const qrUrl = generateVietQrUrl({
      bankCode,
      accountNumber: bankAccount,
      accountName: bankAccountName,
      amount: targetPlan.price,
      description: orderCode,
    });

    return {
      order: this.toSafeDTO(order),
      paymentInfo: {
        orderCode,
        amount: targetPlan.price,
        bankCode,
        bankAccount,
        bankAccountName,
        qrUrl,
        expiredAt,
        pollingToken,
      },
      replayed: false,
    };
  }

  /**
   * Submit transfer confirmation: PENDING → AWAITING_REVIEW
   */
  static async submitTransfer(accountId: string, orderId: string): Promise<OrderSafeDTO> {
    const result = await prisma.order.updateMany({
      where: {
        id: orderId,
        accountId,
        status: "PENDING",
        expiredAt: { gt: new Date() },
      },
      data: {
        status: "AWAITING_REVIEW",
        submittedAt: new Date(),
      },
    });

    if (result.count !== 1) {
      throw new HttpError(409, "Đơn hàng không ở trạng thái chờ thanh toán hoặc đã hết hạn", "ORDER_NOT_SUBMITTABLE");
    }

    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { plan: true },
    });

    return this.toSafeDTO(order);
  }

  /**
   * Get a single order for the authenticated account owner (safe DTO).
   */
  static async getAccountOrder(accountId: string, orderId: string): Promise<OrderSafeDTO | null> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, accountId },
      include: { plan: true },
    });

    if (!order) return null;

    // Opportunistically expire
    if (order.status === "PENDING" && order.expiredAt <= new Date()) {
      await prisma.order.updateMany({
        where: { id: order.id, accountId, status: "PENDING" },
        data: { status: "EXPIRED" },
      });
      return { ...this.toSafeDTO(order), status: "EXPIRED" };
    }

    return this.toSafeDTO(order);
  }

  /**
   * Legacy polling-based status check (kept for backward compatibility).
   */
  static async checkOrderStatus(orderCode: string, pollingToken: string) {
    const pollingTokenHash = crypto.createHash("sha256").update(pollingToken).digest("hex");
    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: {
        id: true,
        pollingTokenHash: true,
        orderCode: true,
        amount: true,
        status: true,
        paidAt: true,
        expiredAt: true,
        submittedAt: true,
        card: {
          select: {
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!order || order.pollingTokenHash !== pollingTokenHash) return null;
    const { pollingTokenHash: _hash, ...safeOrder } = order;
    return safeOrder;
  }

  // ────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────

  private static formatOrderResult(
    order: Prisma.OrderGetPayload<{ include: { plan: true } }>,
    replayed: boolean,
  ) {
    const bankCode = process.env.BANK_CODE;
    const bankAccount = process.env.BANK_ACCOUNT;
    const bankAccountName = process.env.BANK_ACCOUNT_NAME;

    let qrUrl: string | null = null;
    if (bankCode && bankAccount && bankAccountName) {
      qrUrl = generateVietQrUrl({
        bankCode,
        accountNumber: bankAccount,
        accountName: bankAccountName,
        amount: order.amount,
        description: order.orderCode,
      });
    }

    return {
      order: this.toSafeDTO(order),
      paymentInfo: {
        orderCode: order.orderCode,
        amount: order.amount,
        bankCode: bankCode ?? null,
        bankAccount: bankAccount ?? null,
        bankAccountName: bankAccountName ?? null,
        qrUrl,
        expiredAt: order.expiredAt,
        pollingToken: null, // Not returned on replays
      },
      replayed,
    };
  }

  private static toSafeDTO(
    order: Prisma.OrderGetPayload<{ include: { plan: true } }>,
  ): OrderSafeDTO {
    return {
      id: order.id,
      orderCode: order.orderCode,
      planCode: order.plan.code,
      planName: order.plan.name,
      amount: order.amount,
      status: order.status,
      paidAt: order.paidAt,
      expiredAt: order.expiredAt,
      submittedAt: order.submittedAt,
      reviewedAt: order.reviewedAt,
      reviewNote: order.reviewNote,
      createdAt: order.createdAt,
    };
  }
}
