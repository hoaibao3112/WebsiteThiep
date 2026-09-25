import { randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma";
import type { CreateGuestInput, GuestDeliveryStatusInput, ImportGuestsInput, ListGuestsQuery, UpdateGuestInput } from "../lib/validators/guest";
import { HttpError } from "../lib/http-error";
import { AccountEntitlementService } from "./account-entitlement.service";

const normalize = (value: string) => value.normalize("NFKC").trim().replace(/\s+/g, " ");
const normalizePhone = (value?: string) => value ? value.replace(/[\s.-]/g, "").replace(/^\+84/, "0") : null;

export class GuestService {
  private static async requireVipCard(accountId: string, cardId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true, slug: true, accountId: true },
    });
    if (!card) throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền truy cập");

    const effective = await AccountEntitlementService.getEffectivePlan(accountId);
    if (effective.planCode !== "VIP") {
      throw new HttpError(403, "Tính năng khách mời cá nhân hóa chỉ dành cho gói VIP", "FEATURE_NOT_AVAILABLE");
    }
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

  static async importGuests(accountId: string, cardId: string, input: ImportGuestsInput) {
    const card = await this.requireVipCard(accountId, cardId);

    return await prisma.$transaction(async (tx) => {
      try {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${cardId}))`;
      } catch {
        // Fallback for non-postgres or test mocks without executeRaw support
      }

      const existingGuests = await tx.guest.findMany({
        where: { accountId, cardId },
      });

      const getPhoneKey = (phone?: string | null) => {
        const norm = normalizePhone(phone ?? undefined);
        return norm ? `phone:${norm}` : null;
      };

      const getNameGroupKey = (fullName: string, group?: string | null) => {
        const normName = normalize(fullName).toLocaleLowerCase("vi");
        const normGroup = group ? normalize(group).toLocaleLowerCase("vi") : "";
        return `name_group:${normName}:::${normGroup}`;
      };

      const phoneMap = new Map<string, typeof existingGuests>();
      const nameGroupMap = new Map<string, typeof existingGuests>();

      for (const g of existingGuests) {
        if (g.normalizedPhone) {
          const pKey = `phone:${g.normalizedPhone}`;
          const current = phoneMap.get(pKey) || [];
          current.push(g);
          phoneMap.set(pKey, current);
        }
        const ngKey = getNameGroupKey(g.fullName, g.group);
        const current = nameGroupMap.get(ngKey) || [];
        current.push(g);
        nameGroupMap.set(ngKey, current);
      }

      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: { index: number; row: number; error: string }[] = [];
      const items: any[] = [];

      for (let i = 0; i < input.guests.length; i++) {
        const guestInput = input.guests[i];
        const row = i + 1;
        const phoneKey = getPhoneKey(guestInput.phone);
        const nameGroupKey = getNameGroupKey(guestInput.fullName, guestInput.group);

        let matched: typeof existingGuests | undefined;
        if (phoneKey) {
          matched = phoneMap.get(phoneKey);
        } else {
          matched = nameGroupMap.get(nameGroupKey);
        }

        // Nếu nhiều bản cũ cùng khóa nhận diện: trả row error không tự chọn một bản để ghi đè
        if (matched && matched.length > 1) {
          errors.push({
            index: i,
            row,
            error: "Phát hiện nhiều khách mời trùng khớp thông tin trong hệ thống (dữ liệu mơ hồ)",
          });
          continue;
        }

        if (matched && matched.length === 1) {
          const existing = matched[0];
          if (input.mode === "SKIP_DUPLICATES") {
            skipped++;
            items.push({
              ...existing,
              customUrl: `/thiep/${card.slug}?g=${existing.guestToken}`,
            });
            continue;
          }

          if (input.mode === "UPDATE_EXISTING") {
            const fullName = normalize(guestInput.fullName);
            const normalizedName = fullName.toLocaleLowerCase("vi");
            const phone = normalizePhone(guestInput.phone);
            const salutation = guestInput.salutation ? normalize(guestInput.salutation) : existing.salutation;
            const group = guestInput.group !== undefined ? (guestInput.group ? normalize(guestInput.group) : null) : existing.group;
            const notes = guestInput.notes !== undefined ? (guestInput.notes?.trim() || null) : existing.notes;

            const updatedGuest = await tx.guest.update({
              where: { id: existing.id },
              data: {
                fullName,
                normalizedName,
                phone,
                normalizedPhone: phone,
                salutation,
                group,
                notes,
              },
            });

            // Cập nhật map sau từng dòng để bắt trùng ngay trong payload
            if (existing.normalizedPhone && `phone:${existing.normalizedPhone}` !== phoneKey) {
              phoneMap.delete(`phone:${existing.normalizedPhone}`);
            }
            if (phoneKey) {
              phoneMap.set(phoneKey, [updatedGuest]);
            }
            const oldNgKey = getNameGroupKey(existing.fullName, existing.group);
            if (oldNgKey !== nameGroupKey) {
              nameGroupMap.delete(oldNgKey);
            }
            nameGroupMap.set(nameGroupKey, [updatedGuest]);
            matched[0] = updatedGuest;

            updated++;
            items.push({
              ...updatedGuest,
              customUrl: `/thiep/${card.slug}?g=${updatedGuest.guestToken}`,
            });
            continue;
          }
        }

        // Thêm mới khách mời
        const guestToken = GuestService.generateToken();
        const fullName = normalize(guestInput.fullName);
        const normalizedName = fullName.toLocaleLowerCase("vi");
        const phone = normalizePhone(guestInput.phone);
        const salutation = guestInput.salutation ? normalize(guestInput.salutation) : "Bạn";
        const group = guestInput.group ? normalize(guestInput.group) : null;
        const notes = guestInput.notes?.trim() || null;

        const newGuest = await tx.guest.create({
          data: {
            accountId,
            cardId,
            guestToken,
            guestCode: `G-${guestToken.slice(0, 8)}`,
            fullName,
            normalizedName,
            phone,
            normalizedPhone: phone,
            salutation,
            group,
            notes,
            customUrl: `/thiep/${card.slug}?g=${guestToken}`,
          },
        });

        // Cập nhật map sau từng dòng để bắt trùng ngay trong payload
        if (phoneKey) {
          phoneMap.set(phoneKey, [newGuest]);
        }
        nameGroupMap.set(nameGroupKey, [newGuest]);

        created++;
        items.push({
          ...newGuest,
          customUrl: `/thiep/${card.slug}?g=${guestToken}`,
        });
      }

      return {
        created,
        updated,
        skipped,
        errors,
        items,
      };
    });
  }
}
