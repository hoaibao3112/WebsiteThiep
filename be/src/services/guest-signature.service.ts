import { prisma } from "../lib/prisma";
import { checkRateLimit } from "../lib/rate-limiter";
import { HttpError } from "../lib/http-error";
import { MediaService, validateMagicBytes } from "./media.service";

const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/]+={0,2})$/;
const MAX_DATA_URL_LENGTH = 2_000_000;

export class GuestSignatureService {
  static async submit(
    cardId: string,
    elementId: string,
    signerName: string,
    signatureDataUrl: string,
    message?: string,
    guestToken?: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    const ip = meta?.ipAddress || "unknown";

    // 1. Chống flood theo IP (rộng tay vì nhiều khách có thể dùng chung wifi tại tiệc)
    await checkRateLimit(
      `ratelimit:signature:flood:${ip}`,
      30,
      3600,
      "Ban thao tac qua nhanh. Vui long thu lai sau it phut!"
    );

    // 2. Validate data URL + magic bytes TRƯỚC khi đụng DB / Cloudinary
    if (signatureDataUrl.length > MAX_DATA_URL_LENGTH) {
      throw new HttpError(400, "Anh chu ky qua lon (toi da 1.5MB)", "FILE_TOO_LARGE");
    }
    const match = DATA_URL_PATTERN.exec(signatureDataUrl);
    if (!match) {
      throw new HttpError(400, "Chu ky phai la anh PNG/JPEG (data URL)", "INVALID_SIGNATURE");
    }
    const mimetype = match[1];
    const buffer = Buffer.from(match[2], "base64");
    if (!validateMagicBytes(buffer, mimetype)) {
      throw new HttpError(400, "Noi dung chu ky khong phai anh hop le", "INVALID_SIGNATURE");
    }

    // 3. Validate card ACTIVE + widget thuộc thiệp này
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, status: true, expiredAt: true, accountId: true, categoryData: true },
    });
    if (!card) throw new HttpError(404, "Thiep khong ton tai", "CARD_NOT_FOUND");
    if (card.status !== "ACTIVE" || (card.expiredAt && card.expiredAt <= new Date())) {
      throw new HttpError(400, "Thiep da het han", "CARD_INACTIVE");
    }
    const categoryData = (card.categoryData ?? {}) as Record<string, unknown>;
    const canvasDoc = categoryData.canvasDocument as Record<string, unknown> | undefined;
    const elements = Array.isArray(canvasDoc?.elements) ? (canvasDoc.elements as Array<Record<string, unknown>>) : [];
    if (!elements.some((el) => el.id === elementId)) {
      throw new HttpError(404, "Widget khong ton tai", "WIDGET_NOT_FOUND");
    }

    // 4. Resolve guest từ guestToken TRƯỚC khi chọn khóa rate limit.
    //    Token do client gửi → chỉ tin khi nó khớp 1 khách thật của thiệp này;
    //    nếu không, coi như khách ẩn danh (giới hạn theo IP) — không thể xoay token giả để né limit.
    let guestId: string | null = null;
    if (guestToken) {
      const guest = await prisma.guest.findFirst({
        where: { cardId, guestToken },
        select: { id: true },
      });
      if (guest) guestId = guest.id;
    }

    if (guestId) {
      await checkRateLimit(
        `ratelimit:signature:guest:${guestId}:${elementId}`,
        1,
        86400,
        "Ban da ky ten roi. Moi tai khoan chi duoc ky 1 lan!"
      );
    } else {
      await checkRateLimit(
        `ratelimit:signature:ip:${ip}:${cardId}:${elementId}`,
        2,
        86400,
        "Ban da ky ten roi. Moi tai khoan chi duoc ky 1 lan!"
      );
    }

    // 5. Upload len Cloudinary
    const extension = mimetype === "image/jpeg" ? "jpg" : "png";
    const uploaded = await MediaService.uploadBuffer(
      buffer,
      `signature-${cardId}-${Date.now()}.${extension}`,
      mimetype
    );

    // 6. Luu GuestSignature
    const signature = await prisma.guestSignature.create({
      data: {
        accountId: card.accountId,
        cardId,
        elementId,
        guestId,
        signerName: signerName.trim().slice(0, 100),
        message: message?.trim().slice(0, 200) || null,
        signatureUrl: uploaded.url,
        thumbUrl: uploaded.thumbUrl || null,
        ipAddress: meta?.ipAddress,
      },
    });

    return {
      success: true,
      signature: {
        id: signature.id,
        signerName: signature.signerName,
        message: signature.message,
        signatureUrl: signature.signatureUrl,
        createdAt: signature.createdAt,
      },
    };
  }

  static async getGallery(cardId: string, elementId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, signatures] = await Promise.all([
      prisma.guestSignature.count({ where: { cardId, elementId, isApproved: true } }),
      prisma.guestSignature.findMany({
        where: { cardId, elementId, isApproved: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          signerName: true,
          message: true,
          signatureUrl: true,
          thumbUrl: true,
          createdAt: true,
        },
      }),
    ]);
    return { data: signatures, meta: { total, page, limit } };
  }

  static async getList(accountId: string, cardId: string, elementId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true },
    });
    if (!card) throw new HttpError(404, "Khong tim thay thiep", "CARD_NOT_FOUND");

    return prisma.guestSignature.findMany({
      where: { accountId, cardId, elementId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async toggleApprove(accountId: string, cardId: string, signatureId: string) {
    const signature = await prisma.guestSignature.findFirst({
      where: { id: signatureId, cardId, accountId },
    });
    if (!signature) throw new HttpError(404, "Chu ky khong ton tai", "NOT_FOUND");

    const updated = await prisma.guestSignature.update({
      where: { id: signatureId },
      data: { isApproved: !signature.isApproved },
    });
    return { success: true, isApproved: updated.isApproved };
  }

  static async deleteSignature(accountId: string, cardId: string, signatureId: string) {
    const signature = await prisma.guestSignature.findFirst({
      where: { id: signatureId, cardId, accountId },
    });
    if (!signature) throw new HttpError(404, "Chu ky khong ton tai", "NOT_FOUND");

    // Xoa anh tren Cloudinary neu co
    if (signature.signatureUrl) {
      try {
        await MediaService.deleteByUrl(signature.signatureUrl);
      } catch {
        // Silent fail - van xoa record
      }
    }

    await prisma.guestSignature.delete({ where: { id: signatureId } });
    return { success: true };
  }
}
