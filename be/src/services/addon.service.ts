import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import crypto from "node:crypto";
import { HttpError } from "../lib/http-error";
import { generateVietQrUrl } from "../lib/vietqr";
import { ADDON_CATALOG, getAddonByCode, AddonItem } from "../config/addon-catalog";
import { AccountEntitlementService } from "./account-entitlement.service";

export class AddonService {
  private static readonly ORDER_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 giờ

  /**
   * Lấy danh mục Addon kèm trạng thái khả dụng cho Account (nếu đã đăng nhập)
   */
  static async getCatalog(accountId?: string) {
    if (!accountId) {
      return {
        items: ADDON_CATALOG.map((item) => ({
          ...item,
          isEligible: true,
          ineligibilityReason: undefined,
        })),
        accountQuota: null,
      };
    }

    const entitlement = await AccountEntitlementService.getEffectivePlan(accountId);
    const account = await prisma.account.findUniqueOrThrow({
      where: { id: accountId },
      select: {
        extraCards: true,
        extraPhotos: true,
        extraViews: true,
        extraDomains: true,
        extraProfiles: true,
        planExpiresAt: true,
      },
    });

    const items = ADDON_CATALOG.map((item) => {
      let isEligible = true;
      let ineligibilityReason: string | undefined;

      // 1. Gia hạn thời gian: Chỉ áp dụng cho gói BASIC
      if (item.category === "time") {
        if (entitlement.planCode === "VIP") {
          isEligible = false;
          ineligibilityReason = "Gói VIP có thời hạn vĩnh viễn, không cần gia hạn thời gian";
        } else if (entitlement.planCode === "FREE") {
          isEligible = false;
          ineligibilityReason = "Gói gia hạn chỉ áp dụng cho Gói Tiêu Chuẩn (BASIC). Vui lòng nâng cấp gói";
        }
      }

      // 2. Tên miền riêng: Yêu cầu nâng cấp gói trả phí (BASIC hoặc VIP)
      if (item.category === "custom_domain") {
        if (entitlement.planCode === "FREE") {
          isEligible = false;
          ineligibilityReason = "Cần nâng cấp lên gói trả phí để kết nối tên miền riêng";
        }
      }

      if (item.requiredPlanCode && entitlement.planCode === "FREE") {
        isEligible = false;
        ineligibilityReason = ineligibilityReason || "Cần nâng cấp gói dịch vụ để sử dụng tiện ích này";
      }

      return {
        ...item,
        isEligible,
        ineligibilityReason,
      };
    });

    return {
      items,
      accountQuota: {
        currentPlanCode: entitlement.planCode,
        currentPlanName: entitlement.planName,
        planExpiresAt: account.planExpiresAt,
        extraCards: account.extraCards,
        extraPhotos: account.extraPhotos,
        extraViews: account.extraViews,
        extraDomains: account.extraDomains,
        extraProfiles: account.extraProfiles,
      },
    };
  }

  /**
   * Tạo đơn hàng mua Addon (OWNER role)
   */
  static async createAddonOrder(
    userId: string,
    accountId: string,
    addonCode: string,
    idempotencyKey: string,
  ) {
    // 1. Kiểm tra quyền OWNER
    const membership = await prisma.accountMember.findUnique({
      where: { accountId_userId: { accountId, userId } },
      select: { role: true },
    });
    if (!membership || membership.role !== "OWNER") {
      throw new HttpError(403, "Chỉ chủ tài khoản (OWNER) mới có thể mua tiện ích", "OWNER_REQUIRED");
    }

    // 2. Idempotency Lookup
    const existingRequest = await prisma.orderRequest.findUnique({
      where: { accountId_idempotencyKey: { accountId, idempotencyKey } },
      include: { order: true },
    });
    if (existingRequest) {
      if (existingRequest.addonCode !== addonCode) {
        throw new HttpError(409, "Idempotency-Key đã được dùng cho yêu cầu khác", "IDEMPOTENCY_CONFLICT");
      }
      return this.formatOrderSafeDTO(existingRequest.order);
    }

    // 3. Resolve Addon from Catalog
    const addon = getAddonByCode(addonCode);
    if (!addon) {
      throw new HttpError(404, "Tiện ích không tồn tại hoặc đã ngừng cung cấp", "ADDON_NOT_FOUND");
    }

    // 4. Validate điều kiện gói
    const entitlement = await AccountEntitlementService.getEffectivePlan(accountId);
    if (addon.category === "time") {
      if (entitlement.planCode === "VIP") {
        throw new HttpError(400, "Gói VIP có thời hạn vĩnh viễn, không cần gia hạn thời gian", "PLAN_INELIGIBLE_FOR_ADDON");
      }
      if (entitlement.planCode === "FREE") {
        throw new HttpError(400, "Gói gia hạn chỉ áp dụng cho Gói Tiêu Chuẩn (BASIC). Vui lòng nâng cấp gói trước.", "PLAN_INELIGIBLE_FOR_ADDON");
      }
    }
    if (addon.category === "custom_domain" && entitlement.planCode === "FREE") {
      throw new HttpError(400, "Tiện ích tên miền riêng yêu cầu tài khoản nâng cấp lên gói trả phí (BASIC/VIP)", "PLAN_UPGRADE_REQUIRED");
    }
    if (addon.requiredPlanCode && entitlement.planCode === "FREE") {
      throw new HttpError(400, "Tiện ích này yêu cầu tài khoản phải nâng cấp lên gói trả phí", "PLAN_UPGRADE_REQUIRED");
    }

    // 5. Dọn dẹp đơn PENDING quá hạn (stale order cleanup)
    await prisma.order.updateMany({
      where: {
        accountId,
        orderType: "ADDON",
        status: "PENDING",
        expiredAt: { lte: new Date() },
      },
      data: { status: "EXPIRED" },
    });

    // 6. Kiểm tra đơn hàng trùng lặp đang PENDING cùng addonCode
    const pendingSameAddonOrder = await prisma.order.findFirst({
      where: {
        accountId,
        orderType: "ADDON",
        addonCode,
        status: { in: ["PENDING", "AWAITING_REVIEW"] },
        expiredAt: { gt: new Date() },
      },
    });
    if (pendingSameAddonOrder) {
      return this.formatOrderSafeDTO(pendingSameAddonOrder);
    }

    // 6. Tạo đơn hàng mới trong Transaction
    const now = new Date();
    const expiredAt = new Date(now.getTime() + this.ORDER_EXPIRY_MS);
    const orderCodeSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const orderCode = `THIEP${orderCodeSuffix}`;
    const rawPollingToken = crypto.randomBytes(32).toString("hex");
    const pollingTokenHash = crypto.createHash("sha256").update(rawPollingToken).digest("hex");

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          accountId,
          userId,
          orderCode,
          orderType: "ADDON",
          addonCode: addon.code,
          addonMetadata: {
            name: addon.name,
            price: addon.price,
            badge: addon.badge,
            quotaType: addon.quotaType,
            quotaValue: addon.quotaValue,
          },
          amount: addon.price,
          status: "PENDING",
          paymentGateway: "MANUAL",
          idempotencyKey,
          pollingTokenHash,
          expiredAt,
        },
      });

      await tx.orderRequest.create({
        data: {
          accountId,
          idempotencyKey,
          addonCode: addon.code,
          orderId: createdOrder.id,
        },
      });

      return createdOrder;
    });

    return this.formatOrderSafeDTO(order);
  }

  /**
   * Kích hoạt quyền lợi Addon sau khi Order chuyển sang PAID
   */
  static async fulfillAddon(
    order: { accountId: string; addonCode: string | null; amount: number },
    tx: Prisma.TransactionClient,
  ) {
    if (!order.addonCode) return;
    const addon = getAddonByCode(order.addonCode);
    if (!addon) return;

    const now = new Date();

    switch (addon.quotaType) {
      case "DAYS": {
        // Gia hạn thời gian: Tăng planExpiresAt thêm n ngày
        const acc = await tx.account.findUniqueOrThrow({
          where: { id: order.accountId },
          select: { planExpiresAt: true },
        });
        const currentExp = acc.planExpiresAt && acc.planExpiresAt > now ? acc.planExpiresAt : now;
        const newExpiresAt = new Date(currentExp.getTime() + addon.quotaValue * 24 * 60 * 60 * 1000);
        await tx.account.update({
          where: { id: order.accountId },
          data: { planExpiresAt: newExpiresAt },
        });
        break;
      }

      case "EXTRA_CARDS": {
        await tx.account.update({
          where: { id: order.accountId },
          data: { extraCards: { increment: addon.quotaValue } },
        });
        break;
      }

      case "EXTRA_PHOTOS": {
        await tx.account.update({
          where: { id: order.accountId },
          data: { extraPhotos: { increment: addon.quotaValue } },
        });
        break;
      }

      case "EXTRA_VIEWS": {
        await tx.account.update({
          where: { id: order.accountId },
          data: { extraViews: { increment: addon.quotaValue } },
        });
        break;
      }

      case "EXTRA_DOMAINS": {
        await tx.account.update({
          where: { id: order.accountId },
          data: { extraDomains: { increment: addon.quotaValue } },
        });
        break;
      }

      case "EXTRA_PROFILES": {
        await tx.account.update({
          where: { id: order.accountId },
          data: { extraProfiles: { increment: addon.quotaValue } },
        });
        break;
      }

      case "SYSTEM_DOMAIN": {
        // Tên miền hệ thống: tăng quyền sở hữu subdomain/domain
        await tx.account.update({
          where: { id: order.accountId },
          data: { extraDomains: { increment: 1 } },
        });
        break;
      }
    }
  }

  private static formatOrderSafeDTO(order: any) {
    const bankCode = process.env.BANK_CODE || process.env.PAYMENT_BANK_CODE || "MB";
    const accountNumber = process.env.BANK_ACCOUNT || process.env.PAYMENT_BANK_ACCOUNT || "0988888888";
    const bankAccountName = process.env.BANK_ACCOUNT_NAME || process.env.PAYMENT_BANK_NAME || "NGUYEN VAN A";

    const qrUrl = generateVietQrUrl({
      bankCode,
      accountNumber,
      accountName: bankAccountName,
      amount: order.amount,
      description: order.orderCode,
    });

    const addon = order.addonCode ? getAddonByCode(order.addonCode) : null;

    return {
      id: order.id,
      orderCode: order.orderCode,
      orderType: order.orderType,
      addonCode: order.addonCode,
      addonName: addon?.name ?? (order.addonMetadata as any)?.name ?? "Tiện ích bổ sung",
      amount: order.amount,
      status: order.status,
      paidAt: order.paidAt,
      expiredAt: order.expiredAt,
      submittedAt: order.submittedAt,
      createdAt: order.createdAt,
      paymentInfo: {
        orderCode: order.orderCode,
        amount: order.amount,
        bankCode,
        bankAccount: accountNumber,
        bankAccountName,
        qrUrl,
        expiredAt: order.expiredAt,
      },
    };
  }
}
