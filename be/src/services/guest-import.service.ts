import { prisma } from "../lib/prisma";

export interface GuestInputItem {
  fullName: string;
  salutation?: string; // "Anh", "Chị", "Bạn", "Gia đình"
  group?: string; // "Bạn cấp 3", "Đồng nghiệp"
  phone?: string;
}

export class GuestImportService {
  /**
   * Sinh mã ngẫu nhiên 5-6 ký tự cho từng khách
   */
  private static generateGuestCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "G-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Thêm danh sách khách mời hàng loạt (Bulk Insert tối ưu)
   */
  static async importGuests(
    userId: string,
    cardId: string,
    guests: GuestInputItem[]
  ) {
    if (!guests || guests.length === 0) {
      return [];
    }

    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
      select: { id: true, slug: true, accountId: true },
    });

    if (!card) throw new Error("Thiệp không tồn tại hoặc bạn không có quyền");

    const appUrl = (process.env.APP_URL || "https://cardvite.vn").replace(/\/$/, "");

    // 1. Lấy danh sách guestCode hiện có của thiệp để chống trùng lặp
    const existingGuests = await prisma.guest.findMany({
      where: { cardId },
      select: { guestCode: true },
    });
    const usedCodes = new Set(existingGuests.map((g) => g.guestCode));

    // 2. Sinh mã code độc bản cho từng khách
    const guestRecords = guests.map((g) => {
      let guestCode = this.generateGuestCode();
      while (usedCodes.has(guestCode)) {
        guestCode = this.generateGuestCode();
      }
      usedCodes.add(guestCode);

      const customUrl = `${appUrl}/thiep/${card.slug}?g=${guestCode}`;

      return {
        accountId: card.accountId,
        cardId,
        guestCode,
        fullName: g.fullName.trim(),
        salutation: g.salutation?.trim() || "Bạn",
        group: g.group?.trim() || null,
        phone: g.phone?.trim() || null,
        customUrl,
      };
    });

    // 3. Thực hiện Bulk Insert trong 1 query duy nhất
    await prisma.guest.createMany({
      data: guestRecords,
    });

    // 4. Trả về danh sách khách mời vừa tạo
    return prisma.guest.findMany({
      where: {
        cardId,
        guestCode: { in: guestRecords.map((r) => r.guestCode) },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Lấy danh sách khách mời của thiệp
   */
  static async listGuests(userId: string, cardId: string) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
    });
    if (!card) throw new Error("Không có quyền truy cập thiệp này");

    return prisma.guest.findMany({
      where: { cardId },
      include: {
        rsvpResponses: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
