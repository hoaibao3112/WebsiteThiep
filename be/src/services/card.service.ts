import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import {
  DraftCardInput,
  PublishCardDataSchema,
} from "../lib/validators/card";
import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { AccountEntitlementService } from "./account-entitlement.service";

export class CardService {
  private static cardAggregateInclude(accountId: string) {
    return {
      template: true,
      plan: true,
      events: {
        where: { accountId },
        orderBy: { sortOrder: "asc" as const },
      },
      photos: {
        where: { accountId },
        orderBy: { sortOrder: "asc" as const },
      },
    };
  }

  static async createDraft(
    userId: string,
    accountId: string,
    input: DraftCardInput,
    idempotencyKey: string
  ) {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            const existing = await tx.card.findFirst({
              where: { accountId, createIdempotencyKey: idempotencyKey },
            });
            if (existing) return existing;

            const [user, effectivePlan, template] = await Promise.all([
              tx.user.findUnique({
                where: { id: userId },
                select: { role: true },
              }),
              AccountEntitlementService.getEffectivePlan(accountId, new Date(), tx),
              tx.template.findUnique({ where: { slug: input.templateSlug } }),
            ]);

            const isSystemAdmin = user?.role === "ADMIN";
            const allowPremium = isSystemAdmin || effectivePlan.capabilities.allowPremiumTemplates;

            if (
              !template ||
              !template.isActive ||
              (!allowPremium && template.isPremium) ||
              template.category !== input.data.cardCategory
            ) {
              throw new HttpError(400, "Mẫu thiệp không khả dụng cho gói hiện tại", "TEMPLATE_UNAVAILABLE");
            }

            if (effectivePlan.planCode === "FREE" && !isSystemAdmin) {
              const cardCount = await tx.card.count({ where: { accountId } });
              if (cardCount >= 2) {
                throw new HttpError(409, "Mỗi tài khoản FREE chỉ được tạo tối đa 2 thiệp", "CARD_LIMIT_REACHED");
              }
            }

            if (input.photos.length > effectivePlan.capabilities.maxPhotos) {
              throw new HttpError(
                400,
                `Gói ${effectivePlan.planName} chỉ cho phép tối đa ${effectivePlan.capabilities.maxPhotos} ảnh`,
                "PHOTO_LIMIT_EXCEEDED"
              );
            }

            const card = await tx.card.create({
              data: {
                accountId,
                userId,
                planId: effectivePlan.planId,
                templateId: template.id,
                createIdempotencyKey: idempotencyKey,
                slug: input.slug,
                cardCategory: input.data.cardCategory,
                status: "DRAFT",
                publishedAt: null,
                expiredAt: null,
                openingEffect: input.openingEffect,
                fallingEffect: input.fallingEffect,
                musicUrl: effectivePlan.capabilities.allowMusicUpload ? input.musicUrl : null,
                isAutoPlay: input.isAutoPlay,
                primaryColor: input.primaryColor,
                fontFamily: input.fontFamily,
                greetingMessage: input.greetingMessage,
                categoryData: input.data as Prisma.InputJsonValue,
                bankingPrimary: input.bankingPrimary as Prisma.InputJsonValue | undefined,
                bankingSecondary: input.bankingSecondary as Prisma.InputJsonValue | undefined,
                telegramChatId: effectivePlan.capabilities.allowTelegramNoti ? input.telegramChatId : null,
              },
            });

            if (input.events.length > 0) {
              await tx.cardEvent.createMany({
                data: input.events.map((event, sortOrder) => ({
                  accountId,
                  cardId: card.id,
                  eventName: event.eventName || "Sự kiện",
                  eventDate: event.eventDate,
                  lunarDate: event.lunarDate,
                  venueName: event.venueName || "Chưa cập nhật",
                  address: event.address || "Chưa cập nhật",
                  mapUrl: event.mapUrl || null,
                  latitude: event.latitude,
                  longitude: event.longitude,
                  sortOrder,
                })),
              });
            }

            if (input.photos.length > 0) {
              await tx.cardPhoto.createMany({
                data: input.photos.map((photo, sortOrder) => ({
                  accountId,
                  cardId: card.id,
                  url: photo.url,
                  thumbUrl: photo.thumbUrl || null,
                  caption: photo.caption || null,
                  isCover: photo.isCover ?? sortOrder === 0,
                  sortOrder,
                })),
              });
            }

            return card;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        );
      } catch (error: unknown) {
        const isRetryable =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
        if (!isRetryable) throw error;
        if (attempt === maxAttempts) {
          throw new HttpError(
            503,
            "Không thể tạo thiệp sau nhiều lần thử",
            "CARD_CREATE_RETRY_EXHAUSTED",
          );
        }
      }
    }

    throw new HttpError(503, "Không thể tạo thiệp sau nhiều lần thử", "CARD_CREATE_RETRY_EXHAUSTED");
  }

  /**
   * Lấy chi tiết thiệp cho trang công khai (Guest view)
   * Tăng viewCount bất đồng bộ (không chặn response)
   */
  static async getCardBySlug(slug: string, guestCode?: string) {
    const now = new Date();
    const identity = await prisma.card.findFirst({
      where: {
        slug,
        status: "ACTIVE",
        OR: [
          { expiredAt: null },
          { expiredAt: { gt: now } },
        ],
      },
      select: { id: true, accountId: true },
    });

    if (!identity) {
      return null;
    }

    const card = await prisma.card.findFirst({
      where: {
        id: identity.id,
        accountId: identity.accountId,
        status: "ACTIVE",
        OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
      },
      include: this.cardAggregateInclude(identity.accountId),
    });
    if (!card) return null;

    // [LOW] Tăng viewCount bất đồng bộ (Fire-and-forget, không chặn response chính)
    prisma.card
      .update({
        where: { id: card.id, accountId: card.accountId },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => {
        logger.warn({ cardId: card.id, err: err?.message || err }, "Không thể tăng viewCount");
      });

    let guestInfo = null;
    if (guestCode) {
      guestInfo = await prisma.guest.findFirst({
        where: {
          accountId: card.accountId,
          cardId: card.id,
          OR: [{ guestToken: guestCode }, { guestCode }],
        },
        select: { id: true, fullName: true, salutation: true, phone: true, guestToken: true },
      });
    }

    const effectivePlan = await AccountEntitlementService.getEffectivePlan(card.accountId);

    return {
      card,
      guestInfo,
      features: { vipOpeningExperience: effectivePlan.planCode === "VIP" },
    };
  }

  static async getOwnerCard(accountId: string, cardId: string) {
    return prisma.card.findFirst({
      where: { id: cardId, accountId },
      include: this.cardAggregateInclude(accountId),
    });
  }

  static async deleteCard(accountId: string, cardId: string) {
    const existing = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true },
    });
    if (!existing) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền xóa", "CARD_NOT_FOUND");
    }

    return prisma.card.delete({ where: { id: cardId, accountId } });
  }

  static async isSlugAvailable(slug: string, excludeCardId?: string) {
    const existing = await prisma.card.findFirst({
      where: { slug, ...(excludeCardId ? { id: { not: excludeCardId } } : {}) },
      select: { id: true },
    });
    return !existing;
  }

  static async updateDraft(accountId: string, cardId: string, input: DraftCardInput) {
    const [existing, effectivePlan] = await Promise.all([
      prisma.card.findFirst({
        where: { id: cardId, accountId },
        include: { plan: true },
      }),
      AccountEntitlementService.getEffectivePlan(accountId),
    ]);

    if (!existing) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền chỉnh sửa", "CARD_NOT_FOUND");
    }
    if (existing.status === "EXPIRED" && effectivePlan.planCode === "FREE") {
      throw new HttpError(409, "Thiệp đã hết hạn và không thể chỉnh sửa", "CARD_STATE_CONFLICT");
    }
    if (input.photos.length > effectivePlan.capabilities.maxPhotos) {
      throw new HttpError(
        400,
        `Gói ${effectivePlan.planName} chỉ cho phép tối đa ${effectivePlan.capabilities.maxPhotos} ảnh`,
        "PHOTO_LIMIT_EXCEEDED"
      );
    }

    const template = await prisma.template.findUnique({ where: { slug: input.templateSlug } });
    if (
      !template ||
      !template.isActive ||
      template.category !== input.data.cardCategory
    ) {
      throw new HttpError(400, "Mẫu thiệp không tồn tại hoặc không phù hợp với danh mục thiệp", "TEMPLATE_UNAVAILABLE");
    }

    if (template.isPremium && !effectivePlan.capabilities.allowPremiumTemplates) {
      throw new HttpError(
        403,
        effectivePlan.planCode === "FREE"
          ? "Mẫu thiệp không khả dụng cho gói FREE"
          : `Mẫu thiệp Premium không khả dụng cho gói ${effectivePlan.planName}`,
        "PLAN_ENTITLEMENT_REQUIRED",
      );
    }

    return prisma.$transaction(async (tx) => {
      const card = await tx.card.update({
        where: { id: cardId, accountId },
        data: {
          slug: input.slug,
          templateId: template.id,
          cardCategory: input.data.cardCategory,
          openingEffect: input.openingEffect,
          fallingEffect: input.fallingEffect,
          musicUrl: effectivePlan.capabilities.allowMusicUpload ? input.musicUrl : null,
          isAutoPlay: input.isAutoPlay,
          primaryColor: input.primaryColor,
          fontFamily: input.fontFamily,
          greetingMessage: input.greetingMessage,
          categoryData: input.data as Prisma.InputJsonValue,
          bankingPrimary: input.bankingPrimary as Prisma.InputJsonValue | undefined,
          bankingSecondary: input.bankingSecondary as Prisma.InputJsonValue | undefined,
          telegramChatId: effectivePlan.capabilities.allowTelegramNoti ? input.telegramChatId : null,
        },
      });

      await tx.cardEvent.deleteMany({ where: { cardId, accountId } });
      if (input.events.length > 0) {
        await tx.cardEvent.createMany({
          data: input.events.map((event, sortOrder) => ({
            accountId, cardId, eventName: event.eventName || "Sự kiện",
            eventDate: event.eventDate, lunarDate: event.lunarDate,
            venueName: event.venueName || "Chưa cập nhật",
            address: event.address || "Chưa cập nhật", mapUrl: event.mapUrl || null,
            latitude: event.latitude, longitude: event.longitude, sortOrder,
          })),
        });
      }

      await tx.cardPhoto.deleteMany({ where: { cardId, accountId } });
      if (input.photos.length > 0) {
        await tx.cardPhoto.createMany({
          data: input.photos.map((photo, sortOrder) => ({
            accountId, cardId, url: photo.url, thumbUrl: photo.thumbUrl || null,
            caption: photo.caption || null, isCover: photo.isCover ?? sortOrder === 0, sortOrder,
          })),
        });
      }
      return card;
    });
  }

  /**
   * Lấy danh sách thiệp của một User (Host dashboard)
   */
  static async getUserCards(accountId: string) {
    return prisma.card.findMany({
      where: { accountId },
      include: {
        plan: true,
        template: true,
        _count: {
          select: {
            rsvpResponses: true,
            wishes: true,
            guests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Xuất bản thiệp (Active)
   */
  static async publishCard(accountId: string, cardId: string) {
    const [card, effectivePlan] = await Promise.all([
      prisma.card.findFirst({
        where: { id: cardId, accountId },
        include: { plan: true },
      }),
      AccountEntitlementService.getEffectivePlan(accountId),
    ]);

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền thao tác", "CARD_NOT_FOUND");
    }

    if (card.status === "EXPIRED" && effectivePlan.planCode === "FREE") {
      throw new HttpError(409, "Thiệp FREE đã hết hạn và chưa thể xuất bản lại", "CARD_STATE_CONFLICT");
    }
    if (card.status === "ARCHIVED") {
      throw new HttpError(409, "Vui lòng khôi phục thiệp khỏi lưu trữ trước khi xuất bản", "CARD_STATE_CONFLICT");
    }
    if (card.status === "ACTIVE") return card;

    PublishCardDataSchema.parse(card.categoryData);

    const publishedAt = new Date();
    let expiredAt: Date | null = null;
    if (effectivePlan.planCode === "BASIC") {
      expiredAt = effectivePlan.planExpiresAt;
    } else if (effectivePlan.planCode === "FREE" && card.plan?.durationDays) {
      expiredAt = new Date(publishedAt.getTime() + card.plan.durationDays * 24 * 60 * 60 * 1_000);
    }

    return prisma.card.update({
      where: { id: cardId, accountId },
      data: { status: "ACTIVE", publishedAt, expiredAt },
    });
  }
}
