import { randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { HttpError } from "../lib/http-error";
import { AccountEntitlementService } from "./account-entitlement.service";
import { CardService } from "./card.service";
import { VercelDomainService } from "./vercel-domain.service";
import { CreateCustomDomainInput, detectDomainType } from "../lib/validators/domain.validator";
import { logger } from "../lib/logger";

const DEFAULT_PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "websitethiep.com";

export interface DnsRecordItem {
  type: "A" | "CNAME" | "TXT";
  name: string;
  value: string;
  description: string;
}

export class DomainService {
  /**
   * Helper xóa cache Redis khi tên miền hoặc thiệp thay đổi
   */
  private static async invalidateDomainCache(domain: string) {
    if (!domain) return;
    const clean = domain.toLowerCase().trim();
    const alt = clean.startsWith("www.") ? clean.slice(4) : `www.${clean}`;
    try {
      await redis.del(`domain:lookup:${clean}`, `domain:lookup:${alt}`);
    } catch (err) {
      logger.warn({ domain, err }, "Failed to evict domain cache in Redis");
    }
  }

  /**
   * Lấy danh sách tên miền của tài khoản và thông tin cấu hình mặc định + Quota
   */
  static async listDomains(accountId: string) {
    const [domains, effectivePlan, account] = await Promise.all([
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
      prisma.account.findUniqueOrThrow({
        where: { id: accountId },
        select: { extraDomains: true },
      }),
    ]);

    const basePlanDomains = effectivePlan.planCode === "VIP" ? 1 : 0;
    const maxAllowedDomains = basePlanDomains + (account.extraDomains || 0);

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
      quota: {
        used: domains.length,
        max: maxAllowedDomains,
        extraDomains: account.extraDomains || 0,
      },
      domains,
    };
  }

  /**
   * Sinh danh sách bản ghi DNS phù hợp theo loại tên miền (Apex A record vs Subdomain CNAME)
   */
  static generateDnsRecords(domain: string, verificationTxt?: string | null): {
    targetType: "A" | "CNAME";
    targetValue: string;
    dnsRecords: DnsRecordItem[];
  } {
    const typeInfo = detectDomainType(domain);

    if (typeInfo.isApex) {
      // 1. Tên miền gốc (Apex Domain - VD: damcuoilongngoc.com hoặc hoanglongbaongoc.vn)
      // BẮT BUỘC dùng A record cho @ để tuân thủ RFC và tương thích nhà mạng VN (Mắt Bão, PA Việt Nam, Tenten)
      return {
        targetType: "A",
        targetValue: "76.76.21.21",
        dnsRecords: [
          {
            type: "A",
            name: "@",
            value: "76.76.21.21",
            description: "Bản ghi A trỏ tên miền gốc (@) về địa chỉ máy chủ thiệp cưới",
          },
          {
            type: "CNAME",
            name: "www",
            value: "cname.vercel-dns.com",
            description: "Bản ghi CNAME để khách mời truy cập www vẫn tự động vào thiệp",
          },
          ...(verificationTxt
            ? [
                {
                  type: "TXT" as const,
                  name: "_wst-verify",
                  value: verificationTxt,
                  description: "Bản ghi TXT xác minh quyền sở hữu tên miền (tùy chọn)",
                },
              ]
            : []),
        ],
      };
    }

    // 2. Tên miền phụ (Subdomain - VD: wedding.longngoc.vn hoặc thiep.baomai.com)
    return {
      targetType: "CNAME",
      targetValue: "cname.vercel-dns.com",
      dnsRecords: [
        {
          type: "CNAME",
          name: typeInfo.hostName,
          value: "cname.vercel-dns.com",
          description: `Bản ghi CNAME trỏ tiền tố "${typeInfo.hostName}" về máy chủ thiệp cưới`,
        },
        ...(verificationTxt
          ? [
              {
                type: "TXT" as const,
                name: `_wst-verify.${typeInfo.hostName}`,
                value: verificationTxt,
                description: "Bản ghi TXT xác minh quyền sở hữu tên miền (tùy chọn)",
              },
            ]
          : []),
      ],
    };
  }

  /**
   * Kết nối tên miền riêng cho 1 thiệp cưới (VIP Only + Quota Enforcement)
   */
  static async createCustomDomain(accountId: string, input: CreateCustomDomainInput) {
    const [effectivePlan, account, currentCount] = await Promise.all([
      AccountEntitlementService.getEffectivePlan(accountId),
      prisma.account.findUniqueOrThrow({
        where: { id: accountId },
        select: { extraDomains: true },
      }),
      prisma.customDomain.count({ where: { accountId } }),
    ]);

    // 1. Kiểm tra Quota & Slot Tên Miền (VIP base 1 + Addon extraDomains)
    const basePlanDomains = effectivePlan.planCode === "VIP" ? 1 : 0;
    const maxAllowedDomains = basePlanDomains + (account.extraDomains || 0);

    if (maxAllowedDomains === 0) {
      throw new HttpError(
        403,
        `Gói hiện tại (${effectivePlan.planName}) không hỗ trợ tên miền riêng. Vui lòng nâng cấp lên gói VIP hoặc mua thêm slot tên miền tại trang Tiện Ích.`,
        "PLAN_ENTITLEMENT_REQUIRED"
      );
    }

    if (currentCount >= maxAllowedDomains) {
      throw new HttpError(
        403,
        `Bạn đã sử dụng hết số lượng tên miền riêng cho phép (${currentCount}/${maxAllowedDomains}). Vui lòng mua thêm slot tên miền tại trang Tiện Ích (Addon Store).`,
        "DOMAIN_QUOTA_EXCEEDED"
      );
    }

    // 3. Kiểm tra quyền sở hữu thiệp
    const card = await prisma.card.findFirst({
      where: { id: input.cardId, accountId },
      select: { id: true, slug: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới hoặc bạn không có quyền sở hữu", "CARD_NOT_FOUND");
    }

    // 4. Kiểm tra xem thiệp này đã có domain riêng chưa
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

    // 5. Kiểm tra xem domain đã bị ai đăng ký trên hệ thống chưa
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

    // 6. Tạo token xác minh quyền sở hữu
    const verificationTxt = `wst-verify=${randomBytes(8).toString("hex")}`;

    // 7. Đăng ký tên miền với Vercel API
    const vercelResult = await VercelDomainService.addDomainToProject(input.domain, verificationTxt);

    // 8. Sinh hướng dẫn DNS chuẩn (A record cho Apex, CNAME cho Subdomain)
    const dnsGuidance = this.generateDnsRecords(input.domain, verificationTxt);

    const customDomain = await prisma.customDomain.create({
      data: {
        accountId,
        cardId: input.cardId,
        domain: input.domain,
        status: vercelResult.verified ? "ACTIVE" : "PENDING_DNS",
        targetType: dnsGuidance.targetType,
        targetValue: dnsGuidance.targetValue,
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

    // Invalidate cache cũ nếu có
    await this.invalidateDomainCache(input.domain);

    return {
      domain: customDomain,
      dnsRecords: dnsGuidance.dnsRecords,
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

    // Gọi verify qua Vercel hoặc fallback DNS với token xác minh
    const result = await VercelDomainService.verifyDomainOnVercel(
      customDomain.domain,
      customDomain.verificationTxt
    );

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

    // Cập nhật lại cache Redis
    await this.invalidateDomainCache(customDomain.domain);

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

    // 1. Xóa khỏi Vercel Project
    await VercelDomainService.removeDomainFromProject(customDomain.domain);

    // 2. Xóa cache Redis
    await this.invalidateDomainCache(customDomain.domain);

    // 3. Xóa record trong DB
    await prisma.customDomain.deleteMany({
      where: { id: domainId, accountId },
    });

    return { success: true };
  }

  /**
   * Đổi slug đường dẫn mặc định của thiệp cưới (Có chặn Reserved Slugs)
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

    // Tìm xem thiệp có custom domain không để xóa cache
    const linkedDomain = await prisma.customDomain.findUnique({
      where: { cardId },
      select: { domain: true },
    });

    const updatedCard = await prisma.card.update({
      where: { id: cardId, accountId },
      data: { slug: newSlug },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
    });

    if (linkedDomain?.domain) {
      await this.invalidateDomainCache(linkedDomain.domain);
    }

    return updatedCard;
  }

  /**
   * Tra cứu thiệp theo Custom Domain (Dùng cho Next.js Middleware Rewrite)
   * Public, có cache Redis 5 phút và tự động fallback www / không www
   */
  static async lookupCardByDomain(domain: string): Promise<{ cardId: string; slug: string } | null> {
    if (!domain) return null;
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!cleanDomain) return null;

    const cacheKey = `domain:lookup:${cleanDomain}`;

    // 1. Kiểm tra cache Redis trước
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        if (cached === "__NOT_FOUND__") {
          return null;
        }
        return JSON.parse(cached) as { cardId: string; slug: string };
      }
    } catch (err: unknown) {
      logger.warn({ domain: cleanDomain, err }, "Redis lookup cache read failed; falling back to DB");
    }

    // 2. Query PostgreSQL với hỗ trợ đảo www
    try {
      const altDomain = cleanDomain.startsWith("www.")
        ? cleanDomain.slice(4)
        : `www.${cleanDomain}`;

      const record = await prisma.customDomain.findFirst({
        where: {
          domain: { in: [cleanDomain, altDomain] },
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

      if (!record || !record.card) {
        // Lưu sentinel cache 60s để chống cache penetration (hàng loạt query domain rác)
        redis.setex(cacheKey, 60, "__NOT_FOUND__").catch(() => {});
        return null;
      }

      // Kiểm tra thiệp có đang hoạt động và còn hạn không
      const now = new Date();
      if (record.card.status !== "ACTIVE") {
        redis.setex(cacheKey, 60, "__NOT_FOUND__").catch(() => {});
        return null;
      }
      if (record.card.expiredAt && record.card.expiredAt < now) {
        redis.setex(cacheKey, 60, "__NOT_FOUND__").catch(() => {});
        return null;
      }

      const result = {
        cardId: record.card.id,
        slug: record.card.slug,
      };

      // Set cache 5 phút (300 giây)
      redis.setex(cacheKey, 300, JSON.stringify(result)).catch(() => {});
      return result;
    } catch (err: unknown) {
      logger.error({ domain: cleanDomain, err }, "Error looking up card by domain in DB");
      return null;
    }
  }
}
