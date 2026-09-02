import { prisma } from "../lib/prisma";
import {
  DraftCardInput,
  PublishCardDataSchema,
  UpsertCardInput,
} from "../lib/validators/card";
import { Prisma } from "@prisma/client";

export class CardService {
  private static readonly cardAggregateInclude = {
    template: true,
    plan: true,
    events: { orderBy: { sortOrder: "asc" as const } },
    photos: { orderBy: { sortOrder: "asc" as const } },
  };

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

            const [plan, template] = await Promise.all([
              tx.plan.findFirst({ where: { code: "FREE", isActive: true } }),
              tx.template.findUnique({ where: { slug: input.templateSlug } }),
            ]);

            if (!plan) throw new Error("Gói FREE chưa được cấu hình hoặc đã tạm ngưng");
            if (
              !template ||
              !template.isActive ||
              template.isPremium ||
              template.category !== input.data.cardCategory
            ) {
              throw new Error("Mẫu thiệp không khả dụng cho gói FREE");
            }

            const cardCount = await tx.card.count({ where: { accountId } });
            if (cardCount >= 2) {
              throw new Error("Mỗi tài khoản FREE chỉ được tạo tối đa 2 thiệp");
            }
            if (input.photos.length > plan.maxPhotos) {
              throw new Error(`Gói FREE chỉ cho phép tối đa ${plan.maxPhotos} ảnh`);
            }

            const card = await tx.card.create({
              data: {
                accountId,
                userId,
                planId: plan.id,
                templateId: template.id,
                createIdempotencyKey: idempotencyKey,
                slug: input.slug,
                cardCategory: input.data.cardCategory,
                status: "DRAFT",
                publishedAt: null,
                expiredAt: null,
                openingEffect: input.openingEffect,
                fallingEffect: input.fallingEffect,
                musicUrl: plan.allowMusicUpload ? input.musicUrl : null,
                isAutoPlay: input.isAutoPlay,
                primaryColor: input.primaryColor,
                fontFamily: input.fontFamily,
                greetingMessage: input.greetingMessage,
                categoryData: input.data as Prisma.InputJsonValue,
                bankingPrimary: input.bankingPrimary as Prisma.InputJsonValue | undefined,
                bankingSecondary: input.bankingSecondary as Prisma.InputJsonValue | undefined,
                telegramChatId: plan.allowTelegramNoti ? input.telegramChatId : null,
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
        if (!isRetryable || attempt === maxAttempts) throw error;
      }
    }

    throw new Error("Không thể tạo thiệp sau nhiều lần thử");
  }

  /**
   * Tạo mới hoặc cập nhật thiệp
   * Enforce chặt chẽ giới hạn gói dịch vụ (Plan Limits) tại Backend
   */
  static async upsertCard(userId: string, input: UpsertCardInput, cardId?: string) {
    const { data: categoryData, events = [], ...cardSettings } = input as any;

    const photosList = Array.isArray(input.photos) && input.photos.length > 0
      ? input.photos
      : Array.isArray(categoryData?.photos)
      ? categoryData.photos
      : [];

    const eventsList = Array.isArray(input.events) && input.events.length > 0
      ? input.events
      : Array.isArray(categoryData?.events)
      ? categoryData.events
      : [];

    // 1. Kiểm tra gói dịch vụ (Plan)
    const plan = await prisma.plan.findUnique({
      where: { id: cardSettings.planId },
    });

    if (!plan) {
      throw new Error("Gói dịch vụ không tồn tại");
    }

    const membership = await prisma.accountMember.findFirst({
      where: { userId },
      select: { accountId: true },
    });
    if (!membership) throw new Error("Tài khoản chưa được khởi tạo");
    const accountId = membership.accountId;

    // 2. [HIGH] Enforce Plan Limits: Kiểm tra quyền nhạc nền tùy chỉnh
    if (cardSettings.musicUrl && cardSettings.musicUrl.trim() !== "") {
      if (!plan.allowMusicUpload) {
        throw new Error(
          `Gói dịch vụ "${plan.name}" không hỗ trợ nhạc nền tùy chỉnh. Vui lòng nâng cấp gói Tiêu Chuẩn / VIP.`
        );
      }
    }

    // 3. [HIGH] Enforce Plan Limits: Kiểm tra giới hạn số lượng ảnh
    if (photosList.length > plan.maxPhotos) {
      throw new Error(
        `Gói dịch vụ "${plan.name}" chỉ cho phép tối đa ${plan.maxPhotos} ảnh. Bạn đang gửi ${photosList.length} ảnh.`
      );
    }

    const expiredAt = plan.durationDays
      ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000)
      : null;

    if (cardId) {
      // Cập nhật thiệp hiện có (Multi-tenant check: userId)
      const existingCard = await prisma.card.findFirst({
        where: { id: cardId, userId, accountId },
      });

      if (!existingCard) {
        throw new Error("Thiệp không tồn tại hoặc bạn không có quyền chỉnh sửa");
      }

      return prisma.$transaction(async (tx) => {
        // Kiểm tra nếu đổi slug mà slug mới đã bị thiệp khác sử dụng
        if (cardSettings.slug !== existingCard.slug) {
          const slugConflict = await tx.card.findFirst({
            where: {
              slug: cardSettings.slug,
              id: { not: cardId },
            },
          });
          if (slugConflict) {
            throw new Error(
              `Đường dẫn "${cardSettings.slug}" đã được sử dụng bởi một thiệp khác. Vui lòng chọn đường dẫn khác.`
            );
          }
        }

        // Cập nhật card
        const updated = await tx.card.update({
          where: { id: cardId },
          data: {
            slug: cardSettings.slug,
            templateId: cardSettings.templateId,
            openingEffect: cardSettings.openingEffect,
            fallingEffect: cardSettings.fallingEffect,
            musicUrl: plan.allowMusicUpload ? cardSettings.musicUrl : null,
            isAutoPlay: cardSettings.isAutoPlay,
            primaryColor: cardSettings.primaryColor,
            fontFamily: cardSettings.fontFamily,
            greetingMessage: cardSettings.greetingMessage,
            categoryData: categoryData as Prisma.InputJsonValue,
            bankingPrimary: cardSettings.bankingPrimary as Prisma.InputJsonValue,
            bankingSecondary: cardSettings.bankingSecondary as Prisma.InputJsonValue,
            telegramChatId: cardSettings.telegramChatId,
          },
        });

        // Cập nhật danh sách sự kiện nếu có
        await tx.cardEvent.deleteMany({ where: { cardId, accountId } });
        if (eventsList.length > 0) {
          await tx.cardEvent.createMany({
            data: eventsList.map((e: any, index: number) => ({
              accountId,
              cardId,
              eventName: e.eventName || "Sự Kiện",
              eventDate: new Date(e.eventDate),
              lunarDate: e.lunarDate,
              venueName: e.venueName || "Địa điểm tổ chức",
              address: e.address || "Địa chỉ",
              mapUrl: e.mapUrl,
              latitude: e.latitude,
              longitude: e.longitude,
              sortOrder: index,
            })),
          });
        }

        // Cập nhật gallery ảnh nếu có
        await tx.cardPhoto.deleteMany({ where: { cardId, accountId } });
        if (photosList.length > 0) {
          await tx.cardPhoto.createMany({
            data: photosList.map((p: any, index: number) => ({
              accountId,
              cardId,
              url: p.url || p,
              thumbUrl: p.thumbUrl || null,
              caption: p.caption || null,
              isCover: index === 0,
              sortOrder: index,
            })),
          });
        }

        return updated;
      });
    }

    // Tạo mới thiệp
    return prisma.$transaction(async (tx) => {
      // Kiểm tra trùng slug
      const slugExists = await tx.card.findUnique({
        where: { slug: cardSettings.slug },
      });
      if (slugExists) {
        throw new Error(`Đường dẫn "${cardSettings.slug}" đã được sử dụng. Vui lòng chọn đường dẫn khác.`);
      }

      const newCard = await tx.card.create({
        data: {
          accountId,
          userId,
          slug: cardSettings.slug,
          cardCategory: categoryData.cardCategory,
          status: "DRAFT",
          planId: plan.id,
          templateId: cardSettings.templateId,
          expiredAt,
          openingEffect: cardSettings.openingEffect,
          fallingEffect: cardSettings.fallingEffect,
          musicUrl: plan.allowMusicUpload ? cardSettings.musicUrl : null,
          isAutoPlay: cardSettings.isAutoPlay,
          primaryColor: cardSettings.primaryColor,
          fontFamily: cardSettings.fontFamily,
          greetingMessage: cardSettings.greetingMessage,
          categoryData: categoryData as Prisma.InputJsonValue,
          bankingPrimary: cardSettings.bankingPrimary as Prisma.InputJsonValue,
          bankingSecondary: cardSettings.bankingSecondary as Prisma.InputJsonValue,
          telegramChatId: cardSettings.telegramChatId,
        },
      });

      // Tạo các sự kiện
      if (eventsList.length > 0) {
        await tx.cardEvent.createMany({
          data: eventsList.map((e: any, index: number) => ({
            accountId,
            cardId: newCard.id,
            eventName: e.eventName || "Sự Kiện",
            eventDate: new Date(e.eventDate),
            lunarDate: e.lunarDate,
            venueName: e.venueName || "Địa điểm tổ chức",
            address: e.address || "Địa chỉ",
            mapUrl: e.mapUrl,
            latitude: e.latitude,
            longitude: e.longitude,
            sortOrder: index,
          })),
        });
      }

      // Tạo ảnh gallery
      if (photosList.length > 0) {
        await tx.cardPhoto.createMany({
          data: photosList.map((p: any, index: number) => ({
            accountId,
            cardId: newCard.id,
            url: p.url || p,
            thumbUrl: p.thumbUrl || null,
            caption: p.caption || null,
            isCover: index === 0,
            sortOrder: index,
          })),
        });
      }

      return newCard;
    });
  }

  /**
   * Lấy chi tiết thiệp cho trang công khai (Guest view)
   * Tăng viewCount bất đồng bộ (không chặn response)
   */
  static async getCardBySlug(slug: string, guestCode?: string) {
    const card = await prisma.card.findFirst({
      where: {
        slug,
        status: "ACTIVE",
        expiredAt: { gt: new Date() },
      },
      include: this.cardAggregateInclude,
    });

    if (!card) {
      return null;
    }

    // [LOW] Tăng viewCount bất đồng bộ (Fire-and-forget, không chặn response chính)
    prisma.card
      .update({
        where: { id: card.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => {
        console.warn(`[CardService] Không thể tăng viewCount cho thiệp ${card.id}:`, err?.message || err);
      });

    let guestInfo = null;
    if (guestCode) {
      guestInfo = await prisma.guest.findFirst({
        where: {
          cardId: card.id,
          OR: [{ guestToken: guestCode }, { guestCode }],
        },
        select: { id: true, fullName: true, salutation: true, phone: true, guestToken: true },
      });
    }

    return {
      card,
      guestInfo,
      features: { vipOpeningExperience: card.plan.code === "VIP" },
    };
  }

  static async getOwnerCard(accountId: string, cardId: string) {
    return prisma.card.findFirst({
      where: { id: cardId, accountId },
      include: this.cardAggregateInclude,
    });
  }

  static async deleteCard(accountId: string, cardId: string) {
    const existing = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true },
    });
    if (!existing) throw new Error("Không tìm thấy thiệp hoặc bạn không có quyền xóa");

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
    const existing = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      include: { plan: true },
    });
    if (!existing) throw new Error("Không tìm thấy thiệp hoặc bạn không có quyền chỉnh sửa");
    if (existing.status === "EXPIRED") throw new Error("Thiệp FREE đã hết hạn và không thể chỉnh sửa");
    if (input.photos.length > existing.plan.maxPhotos) {
      throw new Error(`Gói FREE chỉ cho phép tối đa ${existing.plan.maxPhotos} ảnh`);
    }

    const template = await prisma.template.findUnique({ where: { slug: input.templateSlug } });
    if (
      !template || !template.isActive || template.isPremium ||
      template.category !== input.data.cardCategory
    ) {
      throw new Error("Mẫu thiệp không khả dụng cho gói FREE");
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
          musicUrl: existing.plan.allowMusicUpload ? input.musicUrl : null,
          isAutoPlay: input.isAutoPlay,
          primaryColor: input.primaryColor,
          fontFamily: input.fontFamily,
          greetingMessage: input.greetingMessage,
          categoryData: input.data as Prisma.InputJsonValue,
          bankingPrimary: input.bankingPrimary as Prisma.InputJsonValue | undefined,
          bankingSecondary: input.bankingSecondary as Prisma.InputJsonValue | undefined,
          telegramChatId: existing.plan.allowTelegramNoti ? input.telegramChatId : null,
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
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      include: { plan: true },
    });

    if (!card) {
      throw new Error("Không tìm thấy thiệp hoặc bạn không có quyền thao tác");
    }

    if (card.status === "EXPIRED") {
      throw new Error("Thiệp FREE đã hết hạn và chưa thể xuất bản lại");
    }
    if (card.status === "ARCHIVED") {
      throw new Error("Vui lòng khôi phục thiệp khỏi lưu trữ trước khi xuất bản");
    }
    if (card.status === "ACTIVE") return card;

    PublishCardDataSchema.parse(card.categoryData);

    const publishedAt = new Date();
    const expiredAt = card.plan.durationDays
      ? new Date(publishedAt.getTime() + card.plan.durationDays * 24 * 60 * 60 * 1_000)
      : null;

    return prisma.card.update({
      where: { id: cardId, accountId },
      data: { status: "ACTIVE", publishedAt, expiredAt },
    });
  }
}
