import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http-error";
import { CanvasElementSchema } from "../lib/validators/card";
import type { PatchElementBodySchema } from "../controllers/card-element.controller";
import { assertCardEditable } from "./card.service";
import { AccountEntitlementService } from "./account-entitlement.service";
import { ensureWeddingSceneData } from "./wedding-scene.service";
import { z } from "zod";

export type PatchElementData = z.infer<typeof PatchElementBodySchema>;

export class CardElementService {
  /**
   * Cập nhật một element cụ thể trong categoryData của Card
   * Đảm bảo tính cô lập đa người thuê (Multi-tenant) qua accountId.
   */
  static async patchElement(
    accountId: string,
    cardId: string,
    elementId: string,
    patch: PatchElementData,
    expectedUpdatedAt?: string | Date
  ) {
    const [card, effectivePlan] = await Promise.all([
      prisma.card.findFirst({
        where: { id: cardId, accountId },
        include: { template: true },
      }),
      AccountEntitlementService.getEffectivePlan(accountId),
    ]);

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền truy cập", "CARD_NOT_FOUND");
    }

    assertCardEditable(card, effectivePlan);

    let categoryData = (card.categoryData as Record<string, any>) || {};
    if (card.template?.category === "WEDDING" || card.cardCategory === "WEDDING") {
      categoryData = ensureWeddingSceneData(
        card.template?.slug || "wedding-heritage-crimson-gold",
        categoryData,
      ) as Record<string, any>;
    }

    let elements: any[] = [];
    let isWeddingScene = false;

    if (categoryData.canvasDocument && Array.isArray(categoryData.canvasDocument.elements)) {
      elements = categoryData.canvasDocument.elements;
      isWeddingScene = true;
    } else if (Array.isArray(categoryData.canvasElements)) {
      elements = categoryData.canvasElements;
    } else if (categoryData.canvas && Array.isArray(categoryData.canvas.elements)) {
      elements = categoryData.canvas.elements;
    } else {
      throw new HttpError(400, "Thiệp chưa có dữ liệu phần tử canvas", "NO_CANVAS_ELEMENTS");
    }

    const targetIndex = elements.findIndex((el) => String(el.id) === String(elementId));
    if (targetIndex === -1) {
      throw new HttpError(404, "Không tìm thấy phần tử trong thiệp", "ELEMENT_NOT_FOUND");
    }

    const currentEl = elements[targetIndex];
    const updatedCustomData = patch.customData !== undefined
      ? { ...(currentEl.customData || {}), ...patch.customData }
      : currentEl.customData;

    const isEditingContent =
      patch.content !== undefined ||
      patch.imageUrl !== undefined ||
      patch.widgetConfig !== undefined ||
      patch.title !== undefined;
    const userEdited = currentEl.userEdited === true || isEditingContent ? true : currentEl.userEdited;

    const { version, ...patchFields } = patch;

    // Merge tất cả các field đã validate
    const mergedEl = {
      ...currentEl,
      ...patchFields,
      ...(updatedCustomData !== undefined ? { customData: updatedCustomData } : {}),
      ...(userEdited !== undefined ? { userEdited } : {}),
      updatedAt: new Date().toISOString(),
    };

    // Validate element sau khi merge bằng CanvasElementSchema
    const parseResult = CanvasElementSchema.safeParse(mergedEl);
    if (!parseResult.success) {
      throw new HttpError(
        400,
        parseResult.error.errors[0]?.message || "Dữ liệu phần tử không hợp lệ",
        "INVALID_ELEMENT_DATA",
        parseResult.error.flatten().fieldErrors,
      );
    }

    const updatedEl = parseResult.data;
    elements[targetIndex] = updatedEl;

    // B4(c): nếu categoryData.canvasElements tồn tại thì cập nhật cùng element đó để không lệch
    if (Array.isArray(categoryData.canvasElements)) {
      const legacyIdx = categoryData.canvasElements.findIndex(
        (el: any) => String(el.id) === String(elementId)
      );
      if (legacyIdx !== -1) {
        categoryData.canvasElements[legacyIdx] = updatedEl;
      }
    }

    let updatedCategoryData: Record<string, any>;
    if (isWeddingScene) {
      updatedCategoryData = {
        ...categoryData,
        canvasDocument: {
          ...categoryData.canvasDocument,
          elements,
        },
      };
    } else if (Array.isArray(categoryData.canvasElements)) {
      updatedCategoryData = {
        ...categoryData,
        canvasElements: elements,
      };
    } else {
      updatedCategoryData = {
        ...categoryData,
        canvas: {
          ...(categoryData.canvas || {}),
          elements,
        },
      };
    }

    const targetExpectedUpdatedAt = expectedUpdatedAt || (patch.expectedUpdatedAt as string | Date | undefined);
    const whereClause: Prisma.CardWhereInput = {
      id: cardId,
      accountId,
      ...(targetExpectedUpdatedAt ? { updatedAt: new Date(targetExpectedUpdatedAt) } : {}),
    };

    const updateResult = await prisma.card.updateMany({
      where: whereClause,
      data: {
        categoryData: updatedCategoryData as Prisma.InputJsonValue,
      },
    });

    if (updateResult.count === 0) {
      const latestCard = await prisma.card.findFirst({
        where: { id: cardId, accountId },
        select: { updatedAt: true },
      });
      throw new HttpError(
        409,
        "Dữ liệu thiệp đã được cập nhật từ một phiên làm việc khác",
        "CARD_VERSION_CONFLICT",
        { currentUpdatedAt: latestCard?.updatedAt?.toISOString() },
      );
    }

    const latestCard = await prisma.card.findFirstOrThrow({
      where: { id: cardId, accountId },
      select: { updatedAt: true },
    });

    return {
      ...updatedEl,
      updatedAt: latestCard.updatedAt,
    };
  }

  /**
   * Lấy chi tiết một element trong Card
   */
  static async getElement(accountId: string, cardId: string, elementId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      include: { template: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền truy cập", "CARD_NOT_FOUND");
    }

    let categoryData = (card.categoryData as Record<string, any>) || {};
    if (card.template?.category === "WEDDING" || card.cardCategory === "WEDDING") {
      categoryData = ensureWeddingSceneData(
        card.template?.slug || "wedding-heritage-crimson-gold",
        categoryData,
      ) as Record<string, any>;
    }

    const elements: any[] =
      categoryData.canvasDocument?.elements ||
      categoryData.canvasElements ||
      categoryData.canvas?.elements ||
      [];

    const element = elements.find((el) => String(el.id) === String(elementId));
    if (!element) {
      throw new HttpError(404, "Không tìm thấy phần tử trong thiệp", "ELEMENT_NOT_FOUND");
    }

    return element;
  }
}
