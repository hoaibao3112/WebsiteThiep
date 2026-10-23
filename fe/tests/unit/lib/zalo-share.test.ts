import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DEFAULT_INVITATION,
  SHORT_INVITATION,
  buildGuestInvitation,
  copyInvitation,
  openZaloShare,
} from "@/lib/guests/zalo-share";

describe("zalo-share utilities", () => {
  it("DEFAULT_INVITATION có đầy đủ biến placeholder", () => {
    expect(DEFAULT_INVITATION).toContain("{danh_xung}");
    expect(DEFAULT_INVITATION).toContain("{ten_khach}");
    expect(DEFAULT_INVITATION).toContain("{link_thiep}");
    expect(DEFAULT_INVITATION).toContain("💌");
  });

  it("SHORT_INVITATION có đầy đủ biến placeholder", () => {
    expect(SHORT_INVITATION).toContain("{danh_xung}");
    expect(SHORT_INVITATION).toContain("{ten_khach}");
    expect(SHORT_INVITATION).toContain("{link_thiep}");
  });

  it("buildGuestInvitation thay thế chính xác các placeholder", () => {
    const result = buildGuestInvitation(DEFAULT_INVITATION, {
      salutation: "Chị",
      fullName: "Lan Anh",
      url: "https://website-thiep.vercel.app/thiep/long-ngoc?g=TOKEN123",
    });

    expect(result).toContain("Chị Lan Anh");
    expect(result).toContain("https://website-thiep.vercel.app/thiep/long-ngoc?g=TOKEN123");
    expect(result).not.toContain("{danh_xung}");
    expect(result).not.toContain("{ten_khach}");
    expect(result).not.toContain("{link_thiep}");
  });

  it("copyInvitation gọi navigator.clipboard.writeText", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    await copyInvitation("Nội dung lời mời");
    expect(writeTextMock).toHaveBeenCalledWith("Nội dung lời mời");
  });

  it("openZaloShare mở chat cá nhân khi có số điện thoại hợp lệ", () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    // SĐT dạng thông thường
    openZaloShare("https://website-thiep.vercel.app/thiep/abc", "0901234567");
    expect(windowOpenSpy).toHaveBeenCalledWith(
      "https://zalo.me/0901234567",
      "_blank",
      "noopener,noreferrer"
    );

    // SĐT có khoảng cách / dấu chấm
    openZaloShare("https://website-thiep.vercel.app/thiep/abc", "090.123.4567");
    expect(windowOpenSpy).toHaveBeenCalledWith(
      "https://zalo.me/0901234567",
      "_blank",
      "noopener,noreferrer"
    );

    windowOpenSpy.mockRestore();
  });

  it("openZaloShare fallback về zalo.me chung khi không có số điện thoại", () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    openZaloShare("https://website-thiep.vercel.app/thiep/abc", null);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      "https://zalo.me/",
      "_blank",
      "noopener,noreferrer"
    );

    openZaloShare("https://website-thiep.vercel.app/thiep/abc", "");
    expect(windowOpenSpy).toHaveBeenCalledWith(
      "https://zalo.me/",
      "_blank",
      "noopener,noreferrer"
    );

    windowOpenSpy.mockRestore();
  });
});
