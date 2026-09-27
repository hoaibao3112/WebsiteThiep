import { describe, expect, it } from "vitest";
import {
  formatExactDateTime,
  formatRelativeTime,
} from "@/lib/guests/format-relative-time";

describe("formatRelativeTime & formatExactDateTime", () => {
  it("trả về chuỗi rỗng khi đầu vào rỗng hoặc không hợp lệ", () => {
    expect(formatRelativeTime(null)).toBe("");
    expect(formatRelativeTime(undefined)).toBe("");
    expect(formatRelativeTime("invalid-date-string")).toBe("");
    expect(formatExactDateTime(null)).toBe("");
    expect(formatExactDateTime(undefined)).toBe("");
  });

  it("hiển thị 'Vừa xem xong' khi thời gian dưới 1 phút", () => {
    const justNow = new Date(Date.now() - 30 * 1000); // 30s trước
    expect(formatRelativeTime(justNow)).toBe("Vừa xem xong");
  });

  it("hiển thị 'X phút trước' khi thời gian dưới 60 phút", () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    expect(formatRelativeTime(tenMinutesAgo)).toBe("10 phút trước");
  });

  it("hiển thị 'X giờ trước' khi thời gian dưới 24 giờ", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe("3 giờ trước");
  });

  it("định dạng formatExactDateTime chứa giờ phút giây ngày tháng", () => {
    const specificDate = new Date(2026, 8, 27, 19, 30, 45); // Tháng 9 (0-indexed: 8)
    const exactStr = formatExactDateTime(specificDate);
    expect(exactStr).toContain("19:30:45");
    expect(exactStr).toContain("27/09/2026");
  });
});
