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
  paymentInfo?: {
    orderCode: string;
    amount: number;
    bankCode: string | null;
    bankAccount: string | null;
    bankAccountName: string | null;
    qrUrl: string | null;
    expiredAt: Date;
  } | null;
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

    // 2. Early Idempotency Lookup via OrderRequest table
    // Retry with same key & same plan returns existing order even if account is now VIP or price changed
    const existingRequest = await prisma.orderRequest.findUnique({
      where: { accountId_idempotencyKey: { accountId, idempotencyKey } },
      include: { order: { include: { plan: true } } },
    });
    if (existingRequest) {
      if (existingRequest.planCode !== input.planCode) {
        throw new HttpError(409, "Idempotency-Key đã được dùng cho yêu cầu khác", "IDEMPOTENCY_CONFLICT");
      }
      return this.formatOrderResult(existingRequest.order, true);
    }

    // 3. Resolve target Plan
    const targetPlan = await prisma.plan.findFirst({
      where: { code: input.planCode, isActive: true },
    });
    if (!targetPlan) {
      throw new HttpError(404, "Gói dịch vụ không tồn tại hoặc đã ngưng", "PLAN_NOT_FOUND");
    }
    if (targetPlan.price <= 0) {
      throw new HttpError(400, "Gói miễn phí không cần thanh toán", "FREE_PLAN_NOT_PURCHASABLE");
    }

    // 4. Check current entitlement
    const effective = await AccountEntitlementService.getEffectivePlan(accountId);
    if (effective.planCode === "VIP") {
      throw new HttpError(409, "Tài khoản đã là VIP vĩnh viễn, không cần mua thêm", "ALREADY_VIP");
    }
    if (effective.planCode === "BASIC" && input.planCode === "BASIC" && !effective.isExpired) {
      // Allow BASIC extension — this is renewal
    }

    // 5. Validate payment configuration BEFORE creating order
    const bankCode = process.env.BANK_CODE;
    const bankAccount = process.env.BANK_ACCOUNT;
    const bankAccountName = process.env.BANK_ACCOUNT_NAME;

    if (!bankCode || !bankAccount || !bankAccountName) {
      throw new HttpError(503, "Hệ thống thanh toán chưa được cấu hình", "PAYMENT_NOT_CONFIGURED");
    }

    // 6. Expire stale orders for this account (both PENDING and AWAITING_REVIEW past expiredAt)
    await prisma.order.updateMany({
      where: {
        accountId,
        status: { in: ["PENDING", "AWAITING_REVIEW"] },
        expiredAt: { lte: new Date() },
      },
      data: { status: "EXPIRED" },
    });

    // 7. Atomic Create / Reuse order and record OrderRequest mapping
    const generateOrderCode = () =>
      `THIEP${Date.now().toString(36).slice(-3).toUpperCase()}${crypto.randomInt(10000, 100000)}`;

    let orderResult: {
      order: Prisma.OrderGetPayload<{ include: { plan: true } }>;
      isReplay: boolean;
      pollingToken: string | null;
    } | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const runTx = typeof prisma.$transaction === "function"
          ? (cb: (tx: any) => Promise<any>) =>
              prisma.$transaction(cb, {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
              })
          : (cb: (tx: any) => Promise<any>) => cb(prisma);

        orderResult = await runTx(async (tx: any) => {
          // Check raced OrderRequest mapping inside transaction
          const racedRequest = await tx.orderRequest.findUnique({
            where: { accountId_idempotencyKey: { accountId, idempotencyKey } },
            include: { order: { include: { plan: true } } },
          });
          if (racedRequest) {
            if (racedRequest.planCode !== input.planCode) {
              throw new HttpError(409, "Idempotency-Key đã được dùng cho yêu cầu khác", "IDEMPOTENCY_CONFLICT");
            }
            return { order: racedRequest.order, isReplay: true, pollingToken: null };
          }

          // Check active order for same plan to reuse
          const activeOrder = await tx.order.findFirst({
            where: {
              accountId,
              planId: targetPlan.id,
              status: { in: ["PENDING", "AWAITING_REVIEW"] },
              expiredAt: { gt: new Date() },
            },
            include: { plan: true },
          });

          let targetOrder = activeOrder;
          let isReplay = false;
          let pollingToken: string | null = null;

          if (!targetOrder) {
            const orderCode = generateOrderCode();
            pollingToken = crypto.randomBytes(32).toString("base64url");
            const pollingTokenHash = crypto.createHash("sha256").update(pollingToken).digest("hex");
            const expiredAt = new Date(Date.now() + this.ORDER_EXPIRY_MS);

            targetOrder = await tx.order.create({
              data: {
                accountId,
                idempotencyKey,
                pollingTokenHash,
                orderCode,
                userId,
                cardId: null,
                planId: targetPlan.id,
                amount: targetPlan.price,
                status: "PENDING",
                paymentGateway: "MANUAL",
                expiredAt,
              },
              include: { plan: true },
            });
          } else {
            isReplay = true;
          }

          // Persist the request-to-order mapping
          await tx.orderRequest.create({
            data: {
              accountId,
              idempotencyKey,
              planCode: input.planCode,
              orderId: targetOrder.id,
            },
          });

          return { order: targetOrder, isReplay, pollingToken };
        });

        break;
      } catch (err: unknown) {
        if (err instanceof HttpError) throw err;

        const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
        const isRetryable = isPrismaError && (err.code === "P2002" || err.code === "P2034");

        if (isRetryable && attempt < 3) {
          continue;
        }

        if (isPrismaError && err.code === "P2002") {
          // Double-check if raced mapping was committed concurrently
          const raced = await prisma.orderRequest.findUnique({
            where: { accountId_idempotencyKey: { accountId, idempotencyKey } },
            include: { order: { include: { plan: true } } },
          });
          if (raced) {
            if (raced.planCode !== input.planCode) {
              throw new HttpError(409, "Idempotency-Key đã được dùng cho yêu cầu khác", "IDEMPOTENCY_CONFLICT");
            }
            orderResult = { order: raced.order, isReplay: true, pollingToken: null };
            break;
          }
        }

        throw err;
      }
    }

    if (!orderResult) {
      throw new HttpError(503, "Không thể tạo mã đơn hàng sau nhiều lần thử", "ORDER_CREATE_RETRY_EXHAUSTED");
    }

    const { order, isReplay, pollingToken } = orderResult;

    if (isReplay) {
      return this.formatOrderResult(order, true);
    }

    // Fresh order VietQR
    const qrUrl = generateVietQrUrl({
      bankCode,
      accountNumber: bankAccount,
      accountName: bankAccountName,
      amount: order.amount,
      description: order.orderCode,
    });

    return {
      order: this.toSafeDTO(order),
      paymentInfo: {
        orderCode: order.orderCode,
        amount: order.amount,
        bankCode,
        bankAccount,
        bankAccountName,
        qrUrl,
        expiredAt: order.expiredAt,
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
    if (
      (order.status === "PENDING" || order.status === "AWAITING_REVIEW") &&
      order.expiredAt <= new Date()
    ) {
      await prisma.order.updateMany({
        where: { id: order.id, accountId, status: { in: ["PENDING", "AWAITING_REVIEW"] } },
        data: { status: "EXPIRED" },
      });
      return { ...this.toSafeDTO(order), status: "EXPIRED" };
    }

    const safeDto = this.toSafeDTO(order);
    if (order.status === "PENDING") {
      const bankCode = process.env.BANK_CODE;
      const bankAccount = process.env.BANK_ACCOUNT;
      const bankAccountName = process.env.BANK_ACCOUNT_NAME;
      if (bankCode && bankAccount && bankAccountName) {
        const qrUrl = generateVietQrUrl({
          bankCode,
          accountNumber: bankAccount,
          accountName: bankAccountName,
          amount: order.amount,
          description: order.orderCode,
        });
        safeDto.paymentInfo = {
          orderCode: order.orderCode,
          amount: order.amount,
          bankCode,
          bankAccount,
          bankAccountName,
          qrUrl,
          expiredAt: order.expiredAt,
        };
      }
    }

    return safeDto;
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
