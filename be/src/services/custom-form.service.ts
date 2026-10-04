import { prisma } from "../lib/prisma";
import { checkRateLimit } from "../lib/rate-limiter";
import { HttpError } from "../lib/http-error";

interface CustomFormField {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating" | "number" | "phone" | "email";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  maxLength?: number;
  sortOrder: number;
}

export class CustomFormService {
  static async submit(
    cardId: string,
    elementId: string,
    formData: Record<string, unknown>,
    guestToken?: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    // 1. Rate limit: 3 submit / IP / 5 phut / elementId
    if (meta?.ipAddress) {
      await checkRateLimit(
        `ratelimit:custom-form:${meta.ipAddress}:${cardId}:${elementId}`,
        3,
        300,
        "Ban da gui form qua nhieu lan. Vui long thu lai sau 5 phut!"
      );
    }

    // 2. Validate card ton tai va ACTIVE
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, status: true, expiredAt: true, accountId: true, categoryData: true },
    });
    if (!card) throw new HttpError(404, "Thiep khong ton tai", "CARD_NOT_FOUND");
    if (card.status !== "ACTIVE" || (card.expiredAt && card.expiredAt <= new Date())) {
      throw new HttpError(400, "Thiep da het han hoac tam dung", "CARD_INACTIVE");
    }

    // 3. Lay widgetConfig tu canvasDocument
    const categoryData = card.categoryData as Record<string, unknown>;
    const canvasDoc = categoryData?.canvasDocument as Record<string, unknown> | undefined;
    const elements = Array.isArray(canvasDoc?.elements) ? canvasDoc.elements : [];
    const element = elements.find(
      (el: Record<string, unknown>) => el.id === elementId
    ) as Record<string, unknown> | undefined;

    if (!element) throw new HttpError(404, "Widget khong ton tai", "WIDGET_NOT_FOUND");

    const widgetConfig = (element.widgetConfig as Record<string, unknown>) ?? {};
    const fields: CustomFormField[] = Array.isArray(widgetConfig.customFormFields)
      ? (widgetConfig.customFormFields as CustomFormField[])
      : [];

    // 4. Validate formData theo fields config
    const errors: Record<string, string> = {};
    for (const field of fields) {
      const value = formData[field.id];
      if (field.required && (value === undefined || value === null || value === "")) {
        errors[field.id] = `"${field.label}" la bat buoc`;
        continue;
      }
      if (value !== undefined && value !== null && value !== "") {
        if (field.type === "phone") {
          const phone = String(value).replace(/\s/g, "");
          if (!/^(0|\+84)[3|5|7|8|9]\d{8}$/.test(phone)) {
            errors[field.id] = "So dien thoai khong hop le";
          }
        }
        if (field.type === "email") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
            errors[field.id] = "Email khong hop le";
          }
        }
        if (field.maxLength && String(value).length > field.maxLength) {
          errors[field.id] = `Toi da ${field.maxLength} ky tu`;
        }
      }
    }
    if (Object.keys(errors).length > 0) {
      throw new HttpError(422, "Du lieu form khong hop le", "VALIDATION_ERROR", errors);
    }

    // 5. Extract submitterName/Phone tu formData
    let submitterName: string | null = null;
    let submitterPhone: string | null = null;
    for (const field of fields) {
      if (field.type === "text" && !submitterName) {
        const val = formData[field.id];
        if (val) submitterName = String(val);
      }
      if (field.type === "phone" && !submitterPhone) {
        const val = formData[field.id];
        if (val) submitterPhone = String(val);
      }
    }

    // 6. Resolve guestId tu guestToken
    let guestId: string | null = null;
    if (guestToken) {
      const guest = await prisma.guest.findFirst({
        where: { cardId, guestToken },
        select: { id: true, fullName: true },
      });
      if (guest) {
        guestId = guest.id;
        if (!submitterName) submitterName = guest.fullName;
      }
    }

    // 7. Luu CustomFormSubmission
    const submission = await prisma.customFormSubmission.create({
      data: {
        accountId: card.accountId,
        cardId,
        elementId,
        guestId,
        submitterName,
        submitterPhone,
        formData: formData as object,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      },
    });

    return { success: true, submissionId: submission.id };
  }

  static async getSubmissions(
    accountId: string,
    cardId: string,
    elementId: string,
    page = 1,
    limit = 50
  ) {
    // Multi-tenant check
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true },
    });
    if (!card) throw new HttpError(404, "Khong tim thay thiep", "CARD_NOT_FOUND");

    const skip = (page - 1) * limit;
    const [total, submissions] = await Promise.all([
      prisma.customFormSubmission.count({ where: { accountId, cardId, elementId } }),
      prisma.customFormSubmission.findMany({
        where: { accountId, cardId, elementId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: submissions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async deleteSubmission(accountId: string, cardId: string, submissionId: string) {
    const submission = await prisma.customFormSubmission.findFirst({
      where: { id: submissionId, cardId, accountId },
    });
    if (!submission) throw new HttpError(404, "Khong tim thay ban ghi", "NOT_FOUND");

    await prisma.customFormSubmission.delete({ where: { id: submissionId } });
    return { success: true };
  }
}
