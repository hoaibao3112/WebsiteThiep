import { prisma } from "../lib/prisma";
import { UpsertCardInput } from "../lib/validators/card";
import { Prisma } from "@prisma/client";

export class CardService {
  /**
   * Tạo mới hoặc cập nhật thiệp
   */
  static async upsertCard(userId: string, input: UpsertCardInput, cardId?: string) {
    const { data: categoryData, events = [], ...cardSettings } = input as any;

    // Tính toán hạn sử dụng nếu là tạo mới
    const plan = await prisma.plan.findUnique({
      where: { id: cardSettings.planId },
    });

    if (!plan) {
      throw new Error("Gói dịch vụ không tồn tại");
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

      return prisma.$transaction(async (tx) => {
        // Cập nhật card
        const updated = await tx.card.update({
          where: { id: cardId },
          data: {
            slug: cardSettings.slug,
            templateId: cardSettings.templateId,
            openingEffect: cardSettings.openingEffect,
            fallingEffect: cardSettings.fallingEffect,
            musicUrl: cardSettings.musicUrl,
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
        if (Array.isArray(categoryData.events)) {
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
          musicUrl: cardSettings.musicUrl,
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
      if (Array.isArray(categoryData.events) && categoryData.events.length > 0) {
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

      return newCard;
    });
  }

  /**
   * Lấy chi tiết thiệp cho trang công khai (Guest view)
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
      throw new Error("Không tìm thấy thiệp");
    }

    return prisma.card.update({
      where: { id: cardId },
      data: { status: "ACTIVE" },
    });
  }
}
