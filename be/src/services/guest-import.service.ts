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
   * Thêm danh sách khách mời hàng loạt (Bulk Insert)
   */
  static async importGuests(
    userId: string,
    cardId: string,
    guests: GuestInputItem[]
  ) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
      select: { id: true, slug: true },
    });

    if (!card) throw new Error("Thiệp không tồn tại hoặc bạn không có quyền");

    const createdGuests = [];
    for (const g of guests) {
      const guestCode = this.generateGuestCode();
      const customUrl = `/thiep/${card.slug}?g=${guestCode}`;

      const created = await prisma.guest.create({
        data: {
          cardId,
          guestCode,
          fullName: g.fullName.trim(),
          salutation: g.salutation?.trim() || "Bạn",
          group: g.group?.trim(),
          phone: g.phone?.trim(),
          customUrl,
        },
      });
      createdGuests.push(created);
    }

    return createdGuests;
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
