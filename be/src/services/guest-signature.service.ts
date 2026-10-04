import { prisma } from "../lib/prisma";
import { checkRateLimit } from "../lib/rate-limiter";
import { HttpError } from "../lib/http-error";
import { MediaService } from "./media.service";

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
    // 1. Rate limit: 2 chu ky / IP, 1 chu ky / guestToken
    const rateLimitKey = guestToken
      ? `ratelimit:signature:token:${guestToken}:${cardId}:${elementId}`
      : `ratelimit:signature:ip:${meta?.ipAddress}:${cardId}:${elementId}`;
    const maxAttempts = guestToken ? 1 : 2;
    if (meta?.ipAddress || guestToken) {
      await checkRateLimit(rateLimitKey, maxAttempts, 86400, "Ban da ky ten roi. Moi tai khoan chi duoc ky 1 lan!");
    }

    // 2. Validate card ACTIVE
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, status: true, expiredAt: true, accountId: true },
    });
    if (!card) throw new HttpError(404, "Thiep khong ton tai", "CARD_NOT_FOUND");
    if (card.status !== "ACTIVE" || (card.expiredAt && card.expiredAt <= new Date())) {
      throw new HttpError(400, "Thiep da het han", "CARD_INACTIVE");
    }

    // 3. Validate signatureDataUrl
    if (!signatureDataUrl.startsWith("data:image/png;base64,") &&
        !signatureDataUrl.startsWith("data:image/jpeg;base64,")) {
      throw new HttpError(400, "Chu ky phai la anh PNG/JPEG (data URL)", "INVALID_SIGNATURE");
    }
    if (signatureDataUrl.length > 2_000_000) {
      throw new HttpError(400, "Anh chu ky qua lon (toi da 1.5MB)", "FILE_TOO_LARGE");
    }

    // 4. Upload len Cloudinary
    const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const uploaded = await MediaService.uploadBuffer(
      buffer,
      `signature-${cardId}-${Date.now()}.png`,
      "image/png"
    );

    // 5. Resolve guestId tu guestToken
    let guestId: string | null = null;
    if (guestToken) {
      const guest = await prisma.guest.findFirst({
        where: { cardId, guestToken },
        select: { id: true },
      });
      if (guest) guestId = guest.id;
    }

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
