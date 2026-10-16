import { randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import { AccountEntitlementService } from "./account-entitlement.service";
import { CardService } from "./card.service";
import { VercelDomainService } from "./vercel-domain.service";
import { CreateCustomDomainInput } from "../lib/validators/domain.validator";
import { logger } from "../lib/logger";

const DEFAULT_PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "websitethiep.com";

export class DomainService {
  /**
   * Lấy danh sách tên miền của tài khoản và thông tin cấu hình mặc định
   */
  static async listDomains(accountId: string) {
    const [domains, effectivePlan] = await Promise.all([
      prisma.customDomain.findMany({
        where: { accountId },
        include: {
          card: {
            select: {
              id: true,
              slug: true,
              status: true,
              template: {
                select: {
                  name: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      AccountEntitlementService.getEffectivePlan(accountId),
    ]);

    return {
      defaultDomain: {
        host: DEFAULT_PLATFORM_DOMAIN,
        urlPattern: `${DEFAULT_PLATFORM_DOMAIN}/s/<slug-thiệp>`,
        isDefault: true,
      },
      capabilities: {
        allowCustomDomain: effectivePlan.capabilities.allowCustomDomain,
        planCode: effectivePlan.planCode,
        planName: effectivePlan.planName,
      },
      domains,
    };
  }

  /**
   * Kết nối tên miền riêng cho 1 thiệp cưới (VIP Only)
   */
  static async createCustomDomain(accountId: string, input: CreateCustomDomainInput) {
    const effectivePlan = await AccountEntitlementService.getEffectivePlan(accountId);

    if (!effectivePlan.capabilities.allowCustomDomain) {
      throw new HttpError(
        403,
        `Gói hiện tại (${effectivePlan.planName}) không hỗ trợ tên miền riêng. Vui lòng nâng cấp lên gói VIP để sử dụng tính năng này.`,
        "PLAN_ENTITLEMENT_REQUIRED"
      );
    }

    // Kiểm tra quyền sở hữu thiệp
    const card = await prisma.card.findFirst({
      where: { id: input.cardId, accountId },
      select: { id: true, slug: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới hoặc bạn không có quyền sở hữu", "CARD_NOT_FOUND");
    }

    // Kiểm tra xem thiệp này đã có domain riêng chưa
    const existingCardDomain = await prisma.customDomain.findUnique({
      where: { cardId: input.cardId },
    });

    if (existingCardDomain) {
      throw new HttpError(
        409,
        `Thiệp này đã được kết nối với tên miền "${existingCardDomain.domain}". Vui lòng gỡ tên miền cũ trước khi kết nối tên miền mới.`,
        "CARD_DOMAIN_ALREADY_EXISTS"
      );
    }

    // Kiểm tra xem domain đã bị ai đăng ký trên hệ thống chưa
    const existingDomain = await prisma.customDomain.findUnique({
      where: { domain: input.domain },
    });

    if (existingDomain) {
      throw new HttpError(
        409,
        `Tên miền "${input.domain}" đã được kết nối với một thiệp cưới khác trên hệ thống.`,
        "DOMAIN_ALREADY_IN_USE"
      );
    }

    // Tạo token xác minh quyền sở hữu
    const verificationTxt = `wst-verify=${randomBytes(8).toString("hex")}`;

    // Đăng ký tên miền với Vercel API
    const vercelResult = await VercelDomainService.addDomainToProject(input.domain);

    const customDomain = await prisma.customDomain.create({
      data: {
        accountId,
        cardId: input.cardId,
        domain: input.domain,
        status: vercelResult.verified ? "ACTIVE" : "PENDING_DNS",
        targetType: "CNAME",
        targetValue: vercelResult.recommendedCname || "cname.vercel-dns.com",
        verificationTxt,
        sslStatus: vercelResult.sslIssued ? "ISSUED" : "PENDING",
        lastCheckedAt: new Date(),
        errorMessage: vercelResult.errorMessage || null,
      },
      include: {
        card: {
          select: {
            id: true,
            slug: true,
            template: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      domain: customDomain,
      dnsRecords: [
        {
          type: "CNAME",
          name: "@ (hoặc www)",
          value: customDomain.targetValue,
          description: "Bản ghi chính để trỏ tên miền về máy chủ thiệp cưới",
        },
        {
          type: "TXT",
          name: "_wst-verify",
          value: verificationTxt,
          description: "Bản ghi xác minh quyền sở hữu tên miền (tùy chọn)",
        },
      ],
    };
  }

  /**
   * Kích hoạt xác thực lại DNS và SSL cho tên miền
   */
  static async verifyDomain(accountId: string, domainId: string) {
    const customDomain = await prisma.customDomain.findFirst({
      where: { id: domainId, accountId },
    });

    if (!customDomain) {
      throw new HttpError(404, "Không tìm thấy cấu hình tên miền", "DOMAIN_NOT_FOUND");
    }

    // Gọi verify qua Vercel hoặc fallback DNS
    const result = await VercelDomainService.verifyDomainOnVercel(customDomain.domain);

    const updated = await prisma.customDomain.update({
      where: { id: domainId, accountId },
      data: {
        status: result.verified ? "ACTIVE" : "PENDING_DNS",
        sslStatus: result.sslIssued ? "ISSUED" : "PENDING",
        lastCheckedAt: new Date(),
        errorMessage: result.errorMessage || null,
      },
      include: {
        card: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Gỡ bỏ tên miền riêng
   */
  static async deleteCustomDomain(accountId: string, domainId: string) {
    const customDomain = await prisma.customDomain.findFirst({
      where: { id: domainId, accountId },
    });

    if (!customDomain) {
      throw new HttpError(404, "Không tìm thấy cấu hình tên miền", "DOMAIN_NOT_FOUND");
    }

    // Xóa khỏi Vercel Project
    await VercelDomainService.removeDomainFromProject(customDomain.domain);

    // Xóa record trong DB
    await prisma.customDomain.delete({
      where: { id: domainId, accountId },
    });

    return { success: true };
  }

  /**
   * Đổi slug đường dẫn mặc định của thiệp cưới
   */
  static async updateCardSlug(accountId: string, cardId: string, newSlug: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true, slug: true, status: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới hoặc bạn không có quyền chỉnh sửa", "CARD_NOT_FOUND");
    }

    if (card.slug === newSlug) {
      return card;
    }

    const isAvailable = await CardService.isSlugAvailable(newSlug, cardId);
    if (!isAvailable) {
      throw new HttpError(409, "Đường dẫn (slug) này đã có người sử dụng. Vui lòng chọn tên khác.", "SLUG_TAKEN");
    }

    const updatedCard = await prisma.card.update({
      where: { id: cardId, accountId },
      data: { slug: newSlug },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
    });

    return updatedCard;
  }

  /**
   * Tra cứu thiệp theo Custom Domain (Dùng cho Next.js Middleware Rewrite)
   * Public, không cần xác thực
   */
  static async lookupCardByDomain(domain: string) {
    if (!domain) return null;
    const cleanDomain = domain.toLowerCase().trim();

    try {
      const record = await prisma.customDomain.findFirst({
        where: {
          domain: cleanDomain,
          status: "ACTIVE",
        },
        include: {
          card: {
            select: {
              id: true,
              slug: true,
              status: true,
              expiredAt: true,
            },
          },
        },
      });

      if (!record || !record.card) return null;

      // Kiểm tra thiệp có còn hạn không
      const now = new Date();
      if (record.card.status !== "ACTIVE") return null;
      if (record.card.expiredAt && record.card.expiredAt < now) return null;

      return {
        cardId: record.card.id,
        slug: record.card.slug,
      };
    } catch (err: unknown) {
      logger.error({ domain: cleanDomain, err }, "Error looking up card by domain");
      return null;
    }
  }
}
