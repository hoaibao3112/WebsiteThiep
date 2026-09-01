import { prisma } from "../lib/prisma";
import { generateVietQrUrl } from "../lib/vietqr";
import { CreateOrderInput, SepayWebhookPayload } from "../lib/validators/order.schema";
import { Prisma } from "@prisma/client";
import crypto from "node:crypto";

export class OrderService {
  /**
   * Tạo đơn hàng nâng cấp gói và sinh link VietQR động
   */
  static async createOrder(userId: string, input: CreateOrderInput, idempotencyKey: string) {
    const { cardId, planId } = input;

    // 1. Kiểm tra card & plan
    const [card, plan] = await Promise.all([
      prisma.card.findFirst({ where: { id: cardId, userId } }),
      prisma.plan.findUnique({ where: { id: planId } }),
    ]);

    if (!card) throw new Error("Thiệp không tồn tại");
    if (!plan) throw new Error("Gói dịch vụ không tồn tại");

    const accountId = card.accountId;
    const existingOrder = await prisma.order.findUnique({
      where: { accountId_idempotencyKey: { accountId, idempotencyKey } },
      include: { plan: true },
    });
    if (existingOrder) {
      if (existingOrder.cardId !== cardId || existingOrder.planId !== planId) {
        throw new Error("Idempotency-Key đã được dùng cho yêu cầu khác");
      }
      return { order: existingOrder, replayed: true };
    }

    if (plan.price <= 0) {
      // Nếu là gói Free, nâng cấp trực tiếp
      await prisma.card.update({
        where: { id: cardId, accountId },
        data: { planId: plan.id, status: "ACTIVE" },
      });
      return { success: true, message: "Kích hoạt gói miễn phí thành công" };
    }

    // 2. Tạo mã đơn hàng ngẫu nhiên duy nhất (VD: THIEP + 6 số)
    const orderCode = `THIEP${crypto.randomInt(100000, 1000000)}`;
    const pollingToken = crypto.randomBytes(32).toString("base64url");
    const pollingTokenHash = crypto.createHash("sha256").update(pollingToken).digest("hex");
    const expiredAt = new Date(Date.now() + 30 * 60 * 1000); // 30 phút

    const order = await prisma.order.create({
      data: {
        accountId,
        idempotencyKey,
        pollingTokenHash,
        orderCode,
        userId,
        cardId,
        planId,
        amount: plan.price,
        status: "PENDING",
        paymentGateway: "VIETQR_SEPAY",
        expiredAt,
      },
      include: {
        plan: true,
      },
    });

    // 3. Sinh VietQR động chuẩn Napas 247
    const bankCode = process.env.BANK_CODE || "VCB";
    const bankAccount = process.env.BANK_ACCOUNT || "1034829596";
    const bankAccountName = process.env.BANK_ACCOUNT_NAME || "TRAN HOAI BAO";

    const qrUrl = generateVietQrUrl({
      bankCode,
      accountNumber: bankAccount,
      accountName: bankAccountName,
      amount: plan.price,
      description: orderCode, // Nội dung chuyển khoản là OrderCode để webhook tự nhận diện
    });

    return {
      order,
      paymentInfo: {
        orderCode,
        amount: plan.price,
        bankCode,
        bankAccount,
        bankAccountName,
        qrUrl,
        expiredAt,
        pollingToken,
      },
    };
  }

  /**
   * Xử lý Webhook tự động từ SePay (Idempotent Webhook Processing)
   */
  static async processSepayWebhook(payload: SepayWebhookPayload) {
    const {
      id: gatewayTxId,
      gateway,
      content,
      transferAmount,
      accountNumber,
      transactionDate,
    } = payload;

    console.log(`[Webhook SePay] Received payload:`, {
      gatewayTxId,
      content,
      transferAmount,
    });

    // 1. Chống lặp giao dịch (Idempotency): Kiểm tra transaction đã xử lý chưa
    const existingTx = await prisma.paymentTransaction.findUnique({
      where: {
        gateway_gatewayTxId: {
          gateway: "VIETQR_SEPAY",
          gatewayTxId: String(gatewayTxId),
        },
      },
    });

    if (existingTx) {
      console.log(`[Webhook SePay] Transaction ${gatewayTxId} already processed.`);
      return { success: true, message: "Transaction already processed" };
    }

    // 2. Tìm mã đơn hàng trong nội dung chuyển khoản (Regex tìm chuỗi THIEP + 6 số)
    const match = content.match(/THIEP\d{6}/i);
    if (!match) {
      console.log(`[Webhook SePay] No OrderCode found in content: "${content}"`);
      return { success: false, message: "OrderCode not found in transaction content" };
    }

    const orderCode = match[0].toUpperCase();

    // 3. Tìm đơn hàng tương ứng trong Database
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: { plan: true, card: true },
    });

    if (!order) {
      console.error(`[Webhook SePay] Order ${orderCode} not found in database!`);
      return { success: true, ignored: true, message: "Order not found" };
    }

    const expectedAccount = process.env.BANK_ACCOUNT;
    if (!expectedAccount) throw new Error("BANK_ACCOUNT chưa được cấu hình");
    if (accountNumber !== expectedAccount) {
      return { success: true, ignored: true, message: "Unexpected receiving account" };
    }
    if (order.status !== "PENDING" || order.expiredAt <= new Date()) {
      return { success: true, ignored: true, message: "Order is not payable" };
    }

    // 4. Kiểm tra số tiền chuyển khoản
    if (transferAmount < order.amount) {
      console.error(
        `[Webhook SePay] Amount mismatch: Expected ${order.amount}, got ${transferAmount}`
      );
      return { success: true, ignored: true, message: "Insufficient transfer amount" };
    }

    // 5. Thực hiện Transaction: Cập nhật Order -> Kích hoạt Card -> Ghi log PaymentTransaction
    await prisma.$transaction(async (tx) => {
      // Ghi nhận PaymentTransaction
      await tx.paymentTransaction.create({
        data: {
          accountId: order.accountId,
          orderId: order.id,
          gateway: "VIETQR_SEPAY",
          gatewayTxId: String(gatewayTxId),
          amount: transferAmount,
          accountNumber,
          transactionTime: new Date(transactionDate),
          rawPayload: payload as unknown as Prisma.InputJsonValue,
        },
      });

      // Cập nhật Order sang PAID
      await tx.order.update({
        where: { id: order.id, accountId: order.accountId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      // Kích hoạt / Gia hạn thời hạn gói cho Card (Cộng dồn nếu thiệp vẫn còn hạn)
      const durationDays = order.plan.durationDays;
      let expiredAt: Date | null = null;

      if (durationDays) {
        const now = new Date();
        const currentExpiredAt = order.card.expiredAt;
        const baseDate =
          currentExpiredAt && currentExpiredAt > now ? currentExpiredAt : now;
        expiredAt = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      }

      await tx.card.update({
        where: { id: order.cardId, accountId: order.accountId },
        data: {
          planId: order.planId,
          status: "ACTIVE",
          expiredAt,
        },
      });
    });

    console.log(
      `[Webhook SePay] Successfully activated VIP for card ${order.cardId} via order ${orderCode}!`
    );
    return { success: true, message: "Order activated successfully" };
  }

  /**
   * Kiểm tra trạng thái đơn hàng (Polling từ Frontend)
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
        card: {
          select: {
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!order || order.pollingTokenHash !== pollingTokenHash) return null;
    const { pollingTokenHash: _pollingTokenHash, ...safeOrder } = order;
    return safeOrder;
  }
}
