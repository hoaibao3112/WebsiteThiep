import { prisma } from "../lib/prisma";
import { UpsertCardInput } from "../lib/validators/card";
import { Prisma } from "@prisma/client";

export class CardService {
  /**
   * Tạo mới hoặc cập nhật thiệp
   * Enforce chặt chẽ giới hạn gói dịch vụ (Plan Limits) tại Backend
   */
  static async upsertCard(userId: string, input: UpsertCardInput, cardId?: string) {
    const { data: categoryData, events = [], ...cardSettings } = input as any;

    // 1. Kiểm tra gói dịch vụ (Plan)
    const plan = await prisma.plan.findUnique({
      where: { id: cardSettings.planId },
    });

    if (!plan) {
      throw new Error("Gói dịch vụ không tồn tại");
    }

    // 2. [HIGH] Enforce Plan Limits: Kiểm tra quyền nhạc nền tùy chỉnh
    if (cardSettings.musicUrl && cardSettings.musicUrl.trim() !== "") {
      if (!plan.allowMusicUpload) {
        throw new Error(
          `Gói dịch vụ "${plan.name}" không hỗ trợ nhạc nền tùy chỉnh. Vui lòng nâng cấp gói Tiêu Chuẩn / VIP.`
        );
      }
    }

    // 3. [HIGH] Enforce Plan Limits: Kiểm tra giới hạn số lượng ảnh
    if (Array.isArray(categoryData?.photos) && categoryData.photos.length > plan.maxPhotos) {
      throw new Error(
        `Gói dịch vụ "${plan.name}" chỉ cho phép tối đa ${plan.maxPhotos} ảnh. Bạn đang gửi ${categoryData.photos.length} ảnh.`
      );
    }

    const expiredAt = plan.durationDays
      ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000)
      : null;

    if (cardId) {
      // Cập nhật thiệp hiện có (Multi-tenant check: userId)
      const existingCard = await prisma.card.findFirst({
        where: { id: cardId, userId },
      });

      if (!existingCard) {
        throw new Error("Thiệp không tồn tại hoặc bạn không có quyền chỉnh sửa");
      }

      // Kiểm tra tổng số ảnh hiện có trong database nếu có thêm ảnh
      if (Array.isArray(categoryData?.photos)) {
        const photoCount = categoryData.photos.length;
        if (photoCount > plan.maxPhotos) {
          throw new Error(
            `Gói dịch vụ "${plan.name}" chỉ cho phép tối đa ${plan.maxPhotos} ảnh. Vui lòng nâng cấp gói VIP.`
          );
        }
      }

      return prisma.$transaction(async (tx) => {
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
        if (Array.isArray(categoryData?.events)) {
          await tx.cardEvent.deleteMany({ where: { cardId } });
          if (categoryData.events.length > 0) {
            await tx.cardEvent.createMany({
              data: categoryData.events.map((e: any, index: number) => ({
                cardId,
                eventName: e.eventName,
                eventDate: new Date(e.eventDate),
                lunarDate: e.lunarDate,
                venueName: e.venueName,
                address: e.address,
                mapUrl: e.mapUrl,
                latitude: e.latitude,
                longitude: e.longitude,
                sortOrder: index,
              })),
            });
          }
        }

        // Cập nhật gallery ảnh nếu có
        if (Array.isArray(categoryData?.photos)) {
          await tx.cardPhoto.deleteMany({ where: { cardId } });
          if (categoryData.photos.length > 0) {
            await tx.cardPhoto.createMany({
              data: categoryData.photos.map((p: any, index: number) => ({
                cardId,
                url: p.url || p,
                thumbUrl: p.thumbUrl || null,
                caption: p.caption || null,
                isCover: index === 0,
                sortOrder: index,
              })),
            });
          }
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
      if (Array.isArray(categoryData?.events) && categoryData.events.length > 0) {
        await tx.cardEvent.createMany({
          data: categoryData.events.map((e: any, index: number) => ({
            cardId: newCard.id,
            eventName: e.eventName,
            eventDate: new Date(e.eventDate),
            lunarDate: e.lunarDate,
            venueName: e.venueName,
            address: e.address,
            mapUrl: e.mapUrl,
            latitude: e.latitude,
            longitude: e.longitude,
            sortOrder: index,
          })),
        });
      }

      // Tạo ảnh gallery
      if (Array.isArray(categoryData?.photos) && categoryData.photos.length > 0) {
        await tx.cardPhoto.createMany({
          data: categoryData.photos.map((p: any, index: number) => ({
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
    const card = await prisma.card.findUnique({
      where: { slug },
      include: {
        template: true,
        plan: true,
        events: {
          orderBy: { sortOrder: "asc" },
        },
        photos: {
          orderBy: { sortOrder: "asc" },
        },
      },
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
      guestInfo = await prisma.guest.findUnique({
        where: {
          cardId_guestCode: {
            cardId: card.id,
            guestCode,
          },
        },
      });
    }

    return {
      card,
      guestInfo,
    };
  }

  /**
   * Lấy danh sách thiệp của một User (Host dashboard)
   */
  static async getUserCards(userId: string) {
    return prisma.card.findMany({
      where: { userId },
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
  static async publishCard(userId: string, cardId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new Error("Không tìm thấy thiệp hoặc bạn không có quyền thao tác");
    }

    return prisma.card.update({
      where: { id: cardId },
      data: { status: "ACTIVE" },
    });
  }
}
