import ExcelJS from "exceljs";
import { prisma } from "../lib/prisma";

export class ExportService {
  /**
   * Xuất danh sách khách mời và RSVP ra file Excel
   */
  static async exportRsvpToExcel(userId: string, cardId: string): Promise<Buffer> {
    // Multi-tenant check
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
      include: {
        rsvpResponses: {
          orderBy: { createdAt: "desc" },
        },
        guests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!card) throw new Error("Không tìm thấy thiệp hoặc bạn không có quyền");

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Digital Card Platform";
    workbook.created = new Date();

    // 1. Sheet 1: Danh sách phản hồi RSVP
    const rsvpSheet = workbook.addWorksheet("Phản Hồi RSVP");

    // Header styling
    rsvpSheet.columns = [
      { header: "STT", key: "index", width: 8 },
      { header: "Họ và Tên", key: "fullName", width: 25 },
      { header: "Số Điện Thoại", key: "phone", width: 18 },
      { header: "Trạng Thái", key: "status", width: 22 },
      { header: "Số Khẩu Đi Cùng", key: "guestCount", width: 18 },
      { header: "Bên Tiệc", key: "side", width: 18 },
      { header: "Lời Nhắn / Yêu Cầu", key: "note", width: 35 },
      { header: "Thời Gian Xác Nhận", key: "createdAt", width: 22 },
    ];

    // Style Header Row
    const headerRow = rsvpSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" }, // Indigo
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Fill data
    card.rsvpResponses.forEach((r, idx) => {
      const statusText =
        r.status === "ATTENDING"
          ? "Sẽ tham dự"
          : r.status === "DECLINED"
          ? "Không thể đến"
          : "Chưa chắc chắn";

      const sideText =
        r.side === "GROOM_SIDE"
          ? "Nhà Trai"
          : r.side === "BRIDE_SIDE"
          ? "Nhà Gái"
          : "Chung 2 bên";

      const row = rsvpSheet.addRow({
        index: idx + 1,
        fullName: r.fullName,
        phone: r.phone || "---",
        status: statusText,
        guestCount: r.status === "ATTENDING" ? r.guestCount : 0,
        side: sideText,
        note: r.note || "",
        createdAt: r.createdAt.toLocaleString("vi-VN"),
      });

      // Highlight row if attending
      if (r.status === "ATTENDING") {
        row.getCell("status").font = { color: { argb: "FF16A34A" }, bold: true };
      } else if (r.status === "DECLINED") {
        row.getCell("status").font = { color: { argb: "FFDC2626" } };
      }
    });

    // 2. Sheet 2: Danh sách Khách Mời Cá Nhân Hóa
    const guestSheet = workbook.addWorksheet("Danh Sách Khách & Link");
    guestSheet.columns = [
      { header: "STT", key: "index", width: 8 },
      { header: "Mã Khách", key: "guestCode", width: 14 },
      { header: "Xưng Hô", key: "salutation", width: 14 },
      { header: "Tên Khách Mời", key: "fullName", width: 25 },
      { header: "Nhóm Khách", key: "group", width: 20 },
      { header: "Số Điện Thoại", key: "phone", width: 18 },
      { header: "Link Thiệp Riêng", key: "customUrl", width: 40 },
    ];

    const guestHeaderRow = guestSheet.getRow(1);
    guestHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    guestHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0D9488" }, // Teal
    };
    guestHeaderRow.alignment = { vertical: "middle", horizontal: "center" };

    const appUrl = (process.env.APP_URL || "https://cardvite.vn").replace(/\/$/, "");

    card.guests.forEach((g, idx) => {
      let finalUrl = g.customUrl;
      if (!finalUrl || finalUrl.startsWith("/")) {
        finalUrl = `${appUrl}${finalUrl || `/thiep/${card.slug}?g=${g.guestCode}`}`;
      }

      guestSheet.addRow({
        index: idx + 1,
        guestCode: g.guestCode,
        salutation: g.salutation,
        fullName: g.fullName,
        group: g.group || "Chung",
        phone: g.phone || "---",
        customUrl: finalUrl,
      });
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}
