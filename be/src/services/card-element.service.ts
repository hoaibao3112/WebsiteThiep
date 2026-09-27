import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";

interface PatchElementData {
  customData?: Record<string, unknown>;
  content?: string;
  imageUrl?: string;
  title?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export class CardElementService {
  /**
   * Cập nhật một element cụ thể trong categoryData của Card
   * Đảm bảo tính cô lập đa người thuê (Multi-tenant) qua accountId.
   */
  static async patchElement(
    accountId: string,
    cardId: string,
    elementId: string,
    patch: PatchElementData
  ) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true, categoryData: true, cardCategory: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền truy cập", "CARD_NOT_FOUND");
    }

    const categoryData = (card.categoryData as Record<string, any>) || {};
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

    const updatedEl = {
      ...currentEl,
      ...(patch.content !== undefined ? { content: patch.content } : {}),
      ...(patch.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.x !== undefined ? { x: patch.x } : {}),
      ...(patch.y !== undefined ? { y: patch.y } : {}),
      ...(patch.width !== undefined ? { width: patch.width } : {}),
      ...(patch.height !== undefined ? { height: patch.height } : {}),
      ...(patch.fontSize !== undefined ? { fontSize: patch.fontSize } : {}),
      ...(patch.fontFamily !== undefined ? { fontFamily: patch.fontFamily } : {}),
      ...(patch.color !== undefined ? { color: patch.color } : {}),
      ...(updatedCustomData !== undefined ? { customData: updatedCustomData } : {}),
      updatedAt: new Date().toISOString(),
    };

    elements[targetIndex] = updatedEl;

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

    await prisma.card.update({
      where: { id: cardId, accountId },
      data: {
        categoryData: updatedCategoryData,
      },
    });

    return updatedEl;
  }

  /**
   * Lấy chi tiết một element trong Card
   */
  static async getElement(accountId: string, cardId: string, elementId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true, categoryData: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền truy cập", "CARD_NOT_FOUND");
    }

    const categoryData = (card.categoryData as Record<string, any>) || {};
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
