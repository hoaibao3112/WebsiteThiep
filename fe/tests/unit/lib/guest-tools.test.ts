import { describe, expect, it } from "vitest";
import { parseGuestText } from "@/lib/guests/parse-guest-text";
import { buildGuestInvitation } from "@/lib/guests/zalo-share";

describe("guest tools", () => {
  it("parses plain, comma and tab-separated guest lines", () => {
    expect(parseGuestText("Anh Nam\nChị, Lan, Công ty, 0901234567\nBác\tHùng\tHọ hàng").items).toHaveLength(3);
    expect(parseGuestText("Chị, Lan, Công ty, 0901234567").items[0]).toMatchObject({ salutation: "Chị", fullName: "Lan", group: "Công ty" });
  });
  it("reports empty lines without sending invalid guests", () => {
    expect(parseGuestText("A").errors).toHaveLength(1);
  });
  it("replaces only supported invitation variables", () => {
    expect(buildGuestInvitation("Mời {danh_xung} {ten_khach}: {link_thiep} {unknown}", { salutation: "Anh", fullName: "Nam", url: "https://a.vn" })).toBe("Mời Anh Nam: https://a.vn {unknown}");
  });
});
