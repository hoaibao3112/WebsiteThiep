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

const MAX_TEXT_LENGTH = 2000;
const MAX_CHECKBOX_SELECTIONS = 50;
const PHONE_REGEX = /^(0|\+84)[3|5|7|8|9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SanitizeResult = { ok: true; value: unknown } | { ok: false; error: string };

/**
 * Chuẩn hóa 1 giá trị khách gửi theo đúng type của field.
 * - Trả `{ ok: true, value: undefined }` khi giá trị rỗng (để bước required quyết định).
 * - Mọi key không thuộc cấu hình form đều bị loại bỏ ở caller (không lưu dữ liệu tùy ý).
 */
export function sanitizeFieldValue(field: CustomFormField, raw: unknown): SanitizeResult {
  if (raw === undefined || raw === null || raw === "") return { ok: true, value: undefined };

  const options = Array.isArray(field.options) ? field.options.filter((o) => typeof o === "string") : [];
  const textLimit = Math.min(field.maxLength && field.maxLength > 0 ? field.maxLength : MAX_TEXT_LENGTH, MAX_TEXT_LENGTH);

  switch (field.type) {
    case "text":
    case "textarea":
    case "phone":
    case "email": {
      if (typeof raw !== "string") return { ok: false, error: "Giá trị không hợp lệ" };
      const value = raw.trim();
      if (value === "") return { ok: true, value: undefined };
      if (value.length > textLimit) return { ok: false, error: `Tối đa ${textLimit} ký tự` };
      if (field.type === "phone" && !PHONE_REGEX.test(value.replace(/\s/g, ""))) {
        return { ok: false, error: "Số điện thoại không hợp lệ" };
      }
      if (field.type === "email" && !EMAIL_REGEX.test(value)) {
        return { ok: false, error: "Email không hợp lệ" };
      }
      return { ok: true, value };
    }
    case "number": {
      const num = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
      if (!Number.isFinite(num)) return { ok: false, error: "Giá trị phải là số" };
      return { ok: true, value: num };
    }
    case "rating": {
      const num = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
      if (!Number.isFinite(num) || num < 0 || num > 10) return { ok: false, error: "Điểm đánh giá không hợp lệ" };
      return { ok: true, value: num };
    }
    case "select":
    case "radio": {
      if (typeof raw !== "string") return { ok: false, error: "Lựa chọn không hợp lệ" };
      if (options.length > 0 && !options.includes(raw)) return { ok: false, error: "Lựa chọn không hợp lệ" };
      if (raw.length > textLimit) return { ok: false, error: `Tối đa ${textLimit} ký tự` };
      return { ok: true, value: raw };
    }
    case "checkbox": {
      if (!Array.isArray(raw)) return { ok: false, error: "Lựa chọn không hợp lệ" };
      if (raw.length === 0) return { ok: true, value: undefined };
      if (raw.length > MAX_CHECKBOX_SELECTIONS) return { ok: false, error: "Chọn quá nhiều mục" };
      const values: string[] = [];
      for (const item of raw) {
        if (typeof item !== "string" || item.length > textLimit) return { ok: false, error: "Lựa chọn không hợp lệ" };
        if (options.length > 0 && !options.includes(item)) return { ok: false, error: "Lựa chọn không hợp lệ" };
        values.push(item);
      }
      return { ok: true, value: values };
    }
    default:
      return { ok: false, error: "Loại trường không được hỗ trợ" };
  }
}

export class CustomFormService {
  static async submit(
    cardId: string,
    elementId: string,
    formData: Record<string, unknown>,
    guestToken?: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    // 0. formData phải là object thuần (không nhận mảng)
    if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
      throw new HttpError(400, "formData khong hop le", "INVALID_FORM_DATA");
    }

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
    const categoryData = (card.categoryData ?? {}) as Record<string, unknown>;
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

    if (fields.length === 0) {
      throw new HttpError(422, "Bieu mau chua duoc cau hinh", "FORM_NOT_CONFIGURED");
    }

    // 4. Chuẩn hóa + validate formData theo fields config.
    //    CHỈ giữ các key thuộc cấu hình form — mọi key khác bị bỏ để không lưu dữ liệu tùy ý.
    const errors: Record<string, string> = {};
    const sanitized: Record<string, unknown> = {};
    for (const field of fields) {
      const result = sanitizeFieldValue(field, formData[field.id]);
      if (!result.ok) {
        errors[field.id] = result.error;
        continue;
      }
      if (result.value === undefined) {
        if (field.required) errors[field.id] = `"${field.label}" la bat buoc`;
        continue;
      }
      sanitized[field.id] = result.value;
    }
    if (Object.keys(errors).length > 0) {
      throw new HttpError(422, "Du lieu form khong hop le", "VALIDATION_ERROR", errors);
    }

    // 5. Extract submitterName/Phone tu du lieu da chuan hoa
    let submitterName: string | null = null;
    let submitterPhone: string | null = null;
    for (const field of fields) {
      if (field.type === "text" && !submitterName) {
        const val = sanitized[field.id];
        if (typeof val === "string") submitterName = val.slice(0, 100);
      }
      if (field.type === "phone" && !submitterPhone) {
        const val = sanitized[field.id];
        if (typeof val === "string") submitterPhone = val.slice(0, 20);
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
        formData: sanitized as object,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent?.slice(0, 500),
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
