import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import {
  DraftCardInput,
  PublishCardDataSchema,
} from "../lib/validators/card";
import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { AccountEntitlementService } from "./account-entitlement.service";
import { ensureWeddingScene, ensureWeddingSceneData, resolveBinding } from "./wedding-scene.service";

export function assertCardEditable(
  card: { status: string },
  effectivePlan: { planCode: string }
): void {
  if (card.status === "ARCHIVED") {
    throw new HttpError(409, "Thiệp đã lưu trữ và không thể chỉnh sửa", "CARD_STATE_CONFLICT");
  }
  if (card.status === "EXPIRED" && effectivePlan.planCode === "FREE") {
    throw new HttpError(409, "Thiệp đã hết hạn và không thể chỉnh sửa", "CARD_STATE_CONFLICT");
  }
}

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
    const existingByIdempotency = await prisma.card.findFirst({
      where: { accountId, createIdempotencyKey: idempotencyKey },
    });
    if (existingByIdempotency) return existingByIdempotency;

    const maxAttempts = 3;
    input = { ...input, data: ensureWeddingScene(input) };

    const isSlugFree = await this.isSlugAvailable(input.slug);
    if (!isSlugFree) {
      throw new HttpError(409, "Đường dẫn (slug) đã có người sử dụng", "SLUG_TAKEN");
    }

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

            if (!effectivePlan.capabilities.allowMusicUpload && input.musicUrl) {
              throw new HttpError(403, "Gói hiện tại không hỗ trợ tải lên nhạc", "PLAN_ENTITLEMENT_REQUIRED");
            }
            if (!effectivePlan.capabilities.allowTelegramNoti && input.telegramChatId) {
              throw new HttpError(403, "Gói hiện tại không hỗ trợ thông báo Telegram", "PLAN_ENTITLEMENT_REQUIRED");
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

            const bankingPrimaryValue = input.bankingPrimary === null
              ? Prisma.DbNull
              : input.bankingPrimary !== undefined
              ? (input.bankingPrimary as Prisma.InputJsonValue)
              : undefined;

            const bankingSecondaryValue = input.bankingSecondary === null
              ? Prisma.DbNull
              : input.bankingSecondary !== undefined
              ? (input.bankingSecondary as Prisma.InputJsonValue)
              : undefined;

            (input.data as any).events = input.events;
            (input.data as any).photos = input.photos;

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
                bankingPrimary: bankingPrimaryValue,
                bankingSecondary: bankingSecondaryValue,
                telegramChatId: effectivePlan.capabilities.allowTelegramNoti ? input.telegramChatId : null,
              },
            });

            if (input.events.length > 0) {
              await tx.cardEvent.createMany({
                data: input.events.map((event, sortOrder) => ({
                  accountId,
                  cardId: card.id,
                  eventName: event.eventName || "Sự kiện",
                  eventDate: event.eventDate ? new Date(event.eventDate) : new Date(),
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

    let guestInfo: {
      id: string;
      fullName: string;
      salutation: string;
      phone: string | null;
      guestToken: string;
      openedAt: Date | null;
      lastViewedAt: Date | null;
      viewCount: number;
    } | null = null;
    if (guestCode) {
      guestInfo = await prisma.guest.findFirst({
        where: {
          accountId: card.accountId,
          cardId: card.id,
          OR: [{ guestToken: guestCode }, { guestCode }],
        },
        select: {
          id: true,
          fullName: true,
          salutation: true,
          phone: true,
          guestToken: true,
          openedAt: true,
          lastViewedAt: true,
          viewCount: true,
        },
      });

      if (guestInfo) {
        const now = new Date();
        const guestId = guestInfo.id;
        const isFirstOpen = !guestInfo.openedAt;
        prisma.guest
          .update({
            where: { id: guestId },
            data: {
              openedAt: isFirstOpen ? now : undefined,
              lastViewedAt: now,
              viewCount: { increment: 1 },
            },
          })
          .catch((err) => {
            logger.warn({ guestId, err: err?.message || err }, "Không thể cập nhật tracking cho khách");
          });
      }
    }

    const effectivePlan = await AccountEntitlementService.getEffectivePlan(card.accountId);

    const responseCard = card.template?.category === "WEDDING"
      ? { ...card, categoryData: ensureWeddingSceneData(card.template.slug, card.categoryData) as Prisma.JsonValue }
      : card;

    return {
      card: responseCard,
      guestInfo,
      features: { vipOpeningExperience: effectivePlan.planCode === "VIP" },
    };
  }

  static async getOwnerCard(accountId: string, cardId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      include: this.cardAggregateInclude(accountId),
    });
    if (!card || card.template?.category !== "WEDDING") return card;
    return { ...card, categoryData: ensureWeddingSceneData(card.template.slug, card.categoryData) as Prisma.JsonValue };
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

  /**
   * Kiểm tra payload có chứa data:image/ base64 MỚI không (không tồn tại trong categoryData hiện tại).
   * Nếu có → throw 400 với field name.
   */
  private static validateNoNewBase64(input: DraftCardInput, existingCategoryData: unknown): void {
    const existingJson = JSON.stringify(existingCategoryData ?? {});
    const fieldsToCheck: Array<{ path: string; value: unknown }> = [];

    // Kiểm tra photos
    input.photos.forEach((photo, i) => {
      if (photo.url?.startsWith("data:image/")) fieldsToCheck.push({ path: `photos[${i}].url`, value: photo.url });
      if (photo.thumbUrl?.startsWith("data:image/")) fieldsToCheck.push({ path: `photos[${i}].thumbUrl`, value: photo.thumbUrl });
    });

    // Kiểm tra categoryData sâu
    const checkDeep = (obj: unknown, prefix: string) => {
      if (typeof obj === "string" && obj.startsWith("data:image/")) {
        fieldsToCheck.push({ path: prefix, value: obj });
      } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => checkDeep(item, `${prefix}[${i}]`));
      } else if (obj && typeof obj === "object") {
        for (const [key, val] of Object.entries(obj)) {
          checkDeep(val, `${prefix}.${key}`);
        }
      }
    };
    checkDeep(input.data, "data");

    const newBase64Fields: string[] = [];
    for (const field of fieldsToCheck) {
      // Nếu giá trị base64 này đã tồn tại trong categoryData cũ → cho qua
      if (typeof field.value === "string" && existingJson.includes(field.value)) continue;
      newBase64Fields.push(field.path);
    }

    if (newBase64Fields.length > 0) {
      throw new HttpError(
        400,
        `Ảnh base64 chưa được tải lên máy chủ: ${newBase64Fields.join(", ")}. Vui lòng sử dụng /media/upload trước.`,
        "BASE64_NOT_ALLOWED",
        { fieldErrors: Object.fromEntries(newBase64Fields.map(f => [f, "Vui lòng tải ảnh lên máy chủ trước khi lưu"])) },
      );
    }
  }

  static async updateDraft(accountId: string, cardId: string, input: DraftCardInput, expectedUpdatedAt?: string | Date) {
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

    assertCardEditable(existing, effectivePlan);

    // Item 2: Block NEW base64 images
    this.validateNoNewBase64(input, existing.categoryData);

    // Kiểm tra trùng slug trước (exclude chính card)
    const isSlugFree = await this.isSlugAvailable(input.slug, cardId);
    if (!isSlugFree) {
      throw new HttpError(409, "Đường dẫn (slug) đã có người sử dụng", "SLUG_TAKEN");
    }

    // Nếu status đã ACTIVE và slug khác slug hiện tại -> 409 SLUG_LOCKED
    if (existing.status === "ACTIVE" && input.slug !== existing.slug) {
      throw new HttpError(409, "Thiệp đã phát hành không thể thay đổi đường dẫn (slug)", "SLUG_LOCKED");
    }

    input = { ...input, data: ensureWeddingScene(input, existing.categoryData) };
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

    // Template premium: chỉ chặn khi template.id đổi sang premium mà plan không cho phép; giữ nguyên template cũ thì cho sửa.
    const isChangingToPremium = template.isPremium && template.id !== existing.templateId;
    if (isChangingToPremium && !effectivePlan.capabilities.allowPremiumTemplates) {
      throw new HttpError(
        403,
        effectivePlan.planCode === "FREE"
          ? "Mẫu thiệp không khả dụng cho gói FREE"
          : `Mẫu thiệp Premium không khả dụng cho gói ${effectivePlan.planName}`,
        "PLAN_ENTITLEMENT_REQUIRED",
      );
    }

    // Item 4: musicUrl / telegramChatId — undefined giữ existing, null hoặc "" xoá, có giá trị thì set
    let finalMusicUrl: string | null | undefined;
    if (input.musicUrl === undefined) {
      finalMusicUrl = undefined; // giữ nguyên (không đụng)
    } else if (input.musicUrl === null || input.musicUrl === "") {
      // Xoá giá trị — nhưng nếu plan cho phép hoặc giá trị đã null rồi thì OK
      finalMusicUrl = null;
    } else {
      // Có giá trị mới
      if (!effectivePlan.capabilities.allowMusicUpload) {
        throw new HttpError(403, "Gói hiện tại không hỗ trợ tải lên nhạc", "PLAN_ENTITLEMENT_REQUIRED");
      }
      finalMusicUrl = input.musicUrl;
    }

    let finalTelegramChatId: string | null | undefined;
    if (input.telegramChatId === undefined) {
      finalTelegramChatId = undefined; // giữ nguyên
    } else if (input.telegramChatId === null || input.telegramChatId === "") {
      finalTelegramChatId = null;
    } else {
      if (!effectivePlan.capabilities.allowTelegramNoti) {
        throw new HttpError(403, "Gói hiện tại không hỗ trợ thông báo Telegram", "PLAN_ENTITLEMENT_REQUIRED");
      }
      finalTelegramChatId = input.telegramChatId;
    }

    // bankingPrimary / Secondary: null -> Prisma.DbNull, undefined -> không đụng
    const bankingPrimaryValue = input.bankingPrimary === null
      ? Prisma.DbNull
      : input.bankingPrimary !== undefined
      ? (input.bankingPrimary as Prisma.InputJsonValue)
      : undefined;

    const bankingSecondaryValue = input.bankingSecondary === null
      ? Prisma.DbNull
      : input.bankingSecondary !== undefined
      ? (input.bankingSecondary as Prisma.InputJsonValue)
      : undefined;

    (input.data as any).events = input.events;
    (input.data as any).photos = input.photos;

    // Item 3: version-based concurrency
    const clientVersion = typeof input.version === "number" ? input.version : undefined;

    return prisma.$transaction(async (tx) => {
      const whereClause: Prisma.CardWhereInput = {
        id: cardId,
        accountId,
        // Chỉ thêm version vào where khi client GỬI version
        ...(clientVersion !== undefined ? { version: clientVersion } : {}),
      };

      const updateResult = await tx.card.updateMany({
        where: whereClause,
        data: {
          slug: input.slug,
          templateId: template.id,
          cardCategory: input.data.cardCategory,
          openingEffect: input.openingEffect,
          fallingEffect: input.fallingEffect,
          ...(finalMusicUrl !== undefined ? { musicUrl: finalMusicUrl } : {}),
          isAutoPlay: input.isAutoPlay,
          primaryColor: input.primaryColor,
          fontFamily: input.fontFamily,
          greetingMessage: input.greetingMessage,
          categoryData: input.data as Prisma.InputJsonValue,
          bankingPrimary: bankingPrimaryValue,
          bankingSecondary: bankingSecondaryValue,
          ...(finalTelegramChatId !== undefined ? { telegramChatId: finalTelegramChatId } : {}),
          version: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        const latest = await tx.card.findFirst({
          where: { id: cardId, accountId },
          select: { version: true },
        });
        throw new HttpError(
          409,
          "Dữ liệu thiệp đã được cập nhật từ một phiên làm việc khác",
          "CARD_VERSION_CONFLICT",
          { currentVersion: latest?.version ?? 0 },
        );
      }

      const card = await tx.card.findFirstOrThrow({
        where: { id: cardId, accountId },
      });

      // Item 5+8: CardEvent — chỉ update khi khác dữ liệu cũ; bỏ qua event không có eventDate
      const existingEvents = await tx.cardEvent.findMany({
        where: { cardId, accountId },
        orderBy: { sortOrder: "asc" },
      });
      const existingEventMap = new Map(existingEvents.map((e) => [e.id, e]));
      const inputEventIds = new Set(input.events.filter((e) => e.id).map((e) => e.id!));

      // Xóa events không còn trong input
      const toDeleteEventIds = existingEvents.filter((e) => !inputEventIds.has(e.id)).map((e) => e.id);
      if (toDeleteEventIds.length > 0) {
        await tx.cardEvent.deleteMany({
          where: { id: { in: toDeleteEventIds }, cardId, accountId },
        });
      }

      for (let sortOrder = 0; sortOrder < input.events.length; sortOrder += 1) {
        const event = input.events[sortOrder];

        // Item 8: eventDate thiếu → không ghi vào CardEvent (categoryData vẫn giữ)
        if (!event.eventDate) continue;

        const eventDate = new Date(event.eventDate);
        const eventPayload = {
          eventName: event.eventName || "Sự kiện",
          eventDate,
          lunarDate: event.lunarDate || null,
          venueName: event.venueName || "Chưa cập nhật",
          address: event.address || "Chưa cập nhật",
          mapUrl: event.mapUrl || null,
          latitude: event.latitude ?? null,
          longitude: event.longitude ?? null,
          sortOrder,
        };

        if (event.id && existingEventMap.has(event.id)) {
          // Item 5: So sánh, chỉ update khi khác
          const existingEvt = existingEventMap.get(event.id)!;
          const needsUpdate =
            existingEvt.eventName !== eventPayload.eventName ||
            existingEvt.eventDate.getTime() !== eventPayload.eventDate.getTime() ||
            existingEvt.lunarDate !== eventPayload.lunarDate ||
            existingEvt.venueName !== eventPayload.venueName ||
            existingEvt.address !== eventPayload.address ||
            existingEvt.mapUrl !== eventPayload.mapUrl ||
            existingEvt.latitude !== eventPayload.latitude ||
            existingEvt.longitude !== eventPayload.longitude ||
            existingEvt.sortOrder !== eventPayload.sortOrder;

          if (needsUpdate) {
            await tx.cardEvent.update({
              where: { id: event.id, cardId, accountId },
              data: eventPayload,
            });
          }
        } else {
          await tx.cardEvent.create({
            data: {
              ...eventPayload,
              accountId,
              cardId,
            },
          });
        }
      }

      // Item 5: Photos — deleteMany + createMany
      await tx.cardPhoto.deleteMany({ where: { cardId, accountId } });
      if (input.photos.length > 0) {
        await tx.cardPhoto.createMany({
          data: input.photos.map((photo, sortOrder) => ({
            accountId,
            cardId,
            url: photo.url,
            thumbUrl: photo.thumbUrl || null,
            caption: photo.caption || null,
            isCover: photo.isCover ?? sortOrder === 0,
            sortOrder,
          })),
        });
      }

      return card;
    }, { timeout: 20000, maxWait: 10000 });
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
        include: {
          plan: true,
          template: true,
          photos: { select: { id: true } },
        },
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

    // Kiểm tra quyền template & photo của draft trước khi lần đầu publish
    if (card.template?.isPremium && !effectivePlan.capabilities.allowPremiumTemplates) {
      throw new HttpError(400, "Mẫu thiệp VIP không khả dụng cho gói hiện tại", "TEMPLATE_UNAVAILABLE");
    }
    if (card.photos && card.photos.length > effectivePlan.capabilities.maxPhotos) {
      throw new HttpError(
        400,
        `Gói ${effectivePlan.planName} chỉ cho phép tối đa ${effectivePlan.capabilities.maxPhotos} ảnh`,
        "PHOTO_LIMIT_EXCEEDED"
      );
    }

    const categoryEvents = (card.categoryData as any)?.events;
    if (Array.isArray(categoryEvents)) {
      for (const ev of categoryEvents) {
        if (!ev.eventDate || (typeof ev.eventDate === "string" && !ev.eventDate.trim())) {
          throw new HttpError(400, "Vui lòng chọn ngày giờ tổ chức cho sự kiện trước khi xuất bản", "EVENT_DATE_REQUIRED");
        }
      }
    }

    PublishCardDataSchema.parse(card.categoryData);

    const now = new Date();
    const publishedAt = card.publishedAt || now;
    let expiredAt: Date | null = null;

    if (effectivePlan.isPaid || effectivePlan.planCode === "BASIC" || effectivePlan.planCode === "VIP") {
      // Paid BASIC/VIP tại thời điểm publish có expiredAt = null theo spec ngày 23/09
      expiredAt = null;
    } else {
      // FREE: dùng duration FREE được backend cấu hình; publish lặp không kéo dài hạn
      if (card.publishedAt && card.expiredAt) {
        expiredAt = card.expiredAt;
      } else {
        const freePlan = await prisma.plan.findUnique({
          where: { code: "FREE" },
          select: { durationDays: true },
        });
        const durationDays = freePlan?.durationDays ?? card.plan?.durationDays ?? 7;
        expiredAt = new Date(publishedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
      }
    }

    return prisma.card.update({
      where: { id: cardId, accountId },
      data: { status: "ACTIVE", publishedAt, expiredAt },
    });
  }
}
