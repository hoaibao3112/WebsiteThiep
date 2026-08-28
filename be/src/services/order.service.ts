import { prisma } from "../lib/prisma";
import { generateVietQrUrl } from "../lib/vietqr";
import { CreateOrderInput, SepayWebhookPayload } from "../lib/validators/order.schema";
import { Prisma } from "@prisma/client";

export class OrderService {
  /**
   * Tạo đơn hàng nâng cấp gói và sinh link VietQR động
   */
  static async createOrder(userId: string, input: CreateOrderInput) {
    const { cardId, planId } = input;

    // 1. Kiểm tra card & plan
    const [card, plan] = await Promise.all([
      prisma.card.findFirst({ where: { id: cardId, userId } }),
      prisma.plan.findUnique({ where: { id: planId } }),
    ]);

    if (!card) throw new Error("Thiệp không tồn tại");
    if (!plan) throw new Error("Gói dịch vụ không tồn tại");

    if (plan.price <= 0) {
      // Nếu là gói Free, nâng cấp trực tiếp
      await prisma.card.update({
        where: { id: cardId },
        data: { planId: plan.id, status: "ACTIVE" },
      });
      return { success: true, message: "Kích hoạt gói miễn phí thành công" };
    }

    // 2. Tạo mã đơn hàng ngẫu nhiên duy nhất (VD: THIEP + 6 số)
    const orderCode = `THIEP${Math.floor(100000 + Math.random() * 900000)}`;
    const expiredAt = new Date(Date.now() + 30 * 60 * 1000); // 30 phút

    const order = await prisma.order.create({
      data: {
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
    const bankCode = process.env.BANK_CODE || "MB";
    const bankAccount = process.env.BANK_ACCOUNT || "0988888888";
    const bankAccountName = process.env.BANK_ACCOUNT_NAME || "NGUYEN VAN A";

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
      return { success: false, message: "Order not found" };
    }

    // 4. Kiểm tra số tiền chuyển khoản
    if (transferAmount < order.amount) {
      console.error(
        `[Webhook SePay] Amount mismatch: Expected ${order.amount}, got ${transferAmount}`
      );
      return { success: false, message: "Insufficient transfer amount" };
    }

    // 5. Thực hiện Transaction: Cập nhật Order -> Kích hoạt Card -> Ghi log PaymentTransaction
    await prisma.$transaction(async (tx) => {
      // Ghi nhận PaymentTransaction
      await tx.paymentTransaction.create({
        data: {
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
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      // Kích hoạt thời hạn gói cho Card
      const durationDays = order.plan.durationDays;
      const expiredAt = durationDays
        ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
        : null;

      await tx.card.update({
        where: { id: order.cardId },
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
  static async checkOrderStatus(orderCode: string) {
    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: {
        id: true,
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

    return order;
  }
}
