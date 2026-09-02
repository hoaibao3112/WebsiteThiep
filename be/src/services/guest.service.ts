import { randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma";
import type { CreateGuestInput, GuestDeliveryStatusInput, ListGuestsQuery, UpdateGuestInput } from "../lib/validators/guest";
import { HttpError } from "../lib/http-error";

const normalize = (value: string) => value.normalize("NFKC").trim().replace(/\s+/g, " ");
const normalizePhone = (value?: string) => value ? value.replace(/[\s.-]/g, "").replace(/^\+84/, "0") : null;

export class GuestService {
  private static async requireVipCard(accountId: string, cardId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true, slug: true, accountId: true, plan: { select: { code: true } } },
    });
    if (!card) throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền truy cập");
    if (card.plan.code !== "VIP") throw new HttpError(403, "Tính năng khách mời cá nhân hóa chỉ dành cho gói VIP", "FEATURE_NOT_AVAILABLE");
    return card;
  }

  static generateToken() { return randomBytes(24).toString("base64url"); }

  static async create(accountId: string, cardId: string, input: CreateGuestInput) {
    const card = await this.requireVipCard(accountId, cardId);
    const guestToken = this.generateToken();
    const fullName = normalize(input.fullName);
    const created = await prisma.guest.create({ data: {
      accountId, cardId, guestToken, guestCode: `G-${guestToken.slice(0, 8)}`,
      fullName, normalizedName: fullName.toLocaleLowerCase("vi"),
      normalizedPhone: normalizePhone(input.phone), phone: normalizePhone(input.phone),
      salutation: input.salutation ? normalize(input.salutation) : "Bạn",
      group: input.group ? normalize(input.group) : null, notes: input.notes?.trim() || null,
    }});
    return { ...created, customUrl: `/thiep/${card.slug}?g=${guestToken}` };
  }

  static async list(accountId: string, cardId: string, query: ListGuestsQuery) {
    const card = await this.requireVipCard(accountId, cardId);
    const where = { accountId, cardId, ...(query.deliveryStatus ? { deliveryStatus: query.deliveryStatus } : {}),
      ...(query.group ? { group: query.group } : {}),
      ...(query.search ? { OR: [{ fullName: { contains: query.search, mode: "insensitive" as const } }, { phone: { contains: query.search } }] } : {}) };
    const [items, total, confirmedSent, responded, attending] = await Promise.all([
      prisma.guest.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: { createdAt: "desc" }, include: { rsvpResponses: { take: 1, orderBy: { createdAt: "desc" } } } }),
      prisma.guest.count({ where }), prisma.guest.count({ where: { accountId, cardId, deliveryStatus: "CONFIRMED_SENT" } }),
      prisma.rsvpResponse.count({ where: { accountId, cardId, guestId: { not: null } } }),
      prisma.rsvpResponse.aggregate({ where: { accountId, cardId, guestId: { not: null }, status: "ATTENDING" }, _sum: { guestCount: true } }),
    ]);
    return { items: items.map((item) => ({ ...item, customUrl: `/thiep/${card.slug}?g=${item.guestToken}` })), pagination: { page: query.page, pageSize: query.pageSize, total }, metrics: { total, confirmedSent, responded, attendingPeople: attending._sum.guestCount || 0 } };
  }

  static async update(accountId: string, cardId: string, guestId: string, input: UpdateGuestInput) {
    await this.requireVipCard(accountId, cardId);
    const data = { ...input, ...(input.fullName ? { fullName: normalize(input.fullName), normalizedName: normalize(input.fullName).toLocaleLowerCase("vi") } : {}),
      ...(input.phone !== undefined ? { phone: normalizePhone(input.phone), normalizedPhone: normalizePhone(input.phone) } : {}) };
    const result = await prisma.guest.updateMany({ where: { id: guestId, accountId, cardId }, data });
    if (!result.count) throw new Error("Không tìm thấy khách mời");
    return result;
  }

  static async remove(accountId: string, cardId: string, guestId?: string) {
    await this.requireVipCard(accountId, cardId);
    return guestId ? prisma.guest.deleteMany({ where: { id: guestId, accountId, cardId } }) : prisma.guest.deleteMany({ where: { accountId, cardId } });
  }

  static async setDeliveryStatus(accountId: string, cardId: string, guestId: string, status: GuestDeliveryStatusInput) {
    await this.requireVipCard(accountId, cardId);
    const now = new Date();
    const result = await prisma.guest.updateMany({ where: { id: guestId, accountId, cardId }, data: {
      deliveryStatus: status, shareOpenedAt: status === "OPENED_ZALO" ? now : undefined,
      sentAt: status === "CONFIRMED_SENT" ? now : null,
    }});
    if (!result.count) throw new Error("Không tìm thấy khách mời");
    return result;
  }

  static async regenerateToken(accountId: string, cardId: string, guestId: string) {
    await this.requireVipCard(accountId, cardId);
    const guestToken = this.generateToken();
    const result = await prisma.guest.updateMany({ where: { id: guestId, accountId, cardId }, data: { guestToken } });
    if (!result.count) throw new HttpError(404, "Không tìm thấy khách mời");
    return { guestToken };
  }
}
