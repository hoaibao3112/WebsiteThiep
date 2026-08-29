/**
 * Tests for card.types.ts type guards & shape validation
 * Tests for common utility functions used across the card builder
 *
 * Scope: PhotoItem manipulation logic, slug normalization,
 *        WeddingDataPayload shape, EventItem date handling
 */

import { describe, it, expect } from "vitest";
import type {
  PhotoItem,
  EventItem,
  CardDetail,
  WeddingDataPayload,
  BirthdayDataPayload,
  NewbornDataPayload,
} from "@/types/card.types";

// ─── Helpers extracted from edit/page.tsx (pure functions under test) ───

/** Simulate handleSetCover logic from edit page */
function setCoverPhoto(photos: PhotoItem[], targetId: string): PhotoItem[] {
  return photos.map((p) => ({ ...p, isCover: p.id === targetId }));
}

/** Simulate handleDeletePhoto logic from edit page */
function deletePhoto(photos: PhotoItem[], targetId: string): PhotoItem[] {
  const filtered = photos.filter((p) => p.id !== targetId);
  if (filtered.length > 0 && !filtered.some((p) => p.isCover)) {
    filtered[0] = { ...filtered[0], isCover: true };
  }
  return filtered;
}

/** Simulate caption update logic from edit page */
function updateCaption(photos: PhotoItem[], targetId: string, caption: string): PhotoItem[] {
  return photos.map((p) => (p.id === targetId ? { ...p, caption } : p));
}

/** Simulate slug normalization from edit page */
function normalizeSlug(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

// ─── Factories ───

function makePhoto(overrides: Partial<PhotoItem> = {}): PhotoItem {
  return {
    id: `photo-${Math.random().toString(36).slice(2)}`,
    url: "https://example.com/photo.jpg",
    caption: "Test caption",
    isCover: false,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: "event-1",
    eventName: "Lễ Thành Hôn",
    eventDate: "2026-10-10T10:00",
    venueName: "GEM Center",
    address: "8 Nguyễn Bỉnh Khiêm, TP.HCM",
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// PHOTO MANAGEMENT LOGIC
// ─────────────────────────────────────────────

describe("setCoverPhoto", () => {
  it("đặt ảnh được chọn làm cover và bỏ cover khỏi các ảnh còn lại", () => {
    const photos = [
      makePhoto({ id: "p1", isCover: true }),
      makePhoto({ id: "p2", isCover: false }),
      makePhoto({ id: "p3", isCover: false }),
    ];

    const result = setCoverPhoto(photos, "p2");

    expect(result.find((p) => p.id === "p1")?.isCover).toBe(false);
    expect(result.find((p) => p.id === "p2")?.isCover).toBe(true);
    expect(result.find((p) => p.id === "p3")?.isCover).toBe(false);
  });

  it("kết quả có đúng 1 ảnh cover duy nhất", () => {
    const photos = [makePhoto({ id: "p1" }), makePhoto({ id: "p2" }), makePhoto({ id: "p3" })];
    const result = setCoverPhoto(photos, "p3");
    const coverCount = result.filter((p) => p.isCover).length;
    expect(coverCount).toBe(1);
  });

  it("không thay đổi số lượng ảnh sau khi set cover", () => {
    const photos = [makePhoto({ id: "p1" }), makePhoto({ id: "p2" })];
    const result = setCoverPhoto(photos, "p1");
    expect(result).toHaveLength(photos.length);
  });

  it("không mutate mảng gốc (immutable)", () => {
    const photos = [makePhoto({ id: "p1", isCover: true }), makePhoto({ id: "p2" })];
    const original = JSON.parse(JSON.stringify(photos));
    setCoverPhoto(photos, "p2");
    expect(photos).toEqual(original);
  });
});

describe("deletePhoto", () => {
  it("xóa ảnh theo id và giảm mảng đúng 1 phần tử", () => {
    const photos = [makePhoto({ id: "p1" }), makePhoto({ id: "p2" }), makePhoto({ id: "p3" })];
    const result = deletePhoto(photos, "p2");
    expect(result).toHaveLength(2);
    expect(result.find((p) => p.id === "p2")).toBeUndefined();
  });

  it("khi xóa ảnh cover → ảnh đầu tiên còn lại tự động trở thành cover", () => {
    const photos = [
      makePhoto({ id: "p1", isCover: true }),
      makePhoto({ id: "p2", isCover: false }),
      makePhoto({ id: "p3", isCover: false }),
    ];

    const result = deletePhoto(photos, "p1");

    expect(result[0].isCover).toBe(true);
    expect(result[0].id).toBe("p2");
  });

  it("khi xóa ảnh không phải cover → cover không thay đổi", () => {
    const photos = [
      makePhoto({ id: "p1", isCover: true }),
      makePhoto({ id: "p2", isCover: false }),
    ];

    const result = deletePhoto(photos, "p2");

    expect(result[0].id).toBe("p1");
    expect(result[0].isCover).toBe(true);
  });

  it("khi chỉ có 1 ảnh và xóa nó → trả về mảng rỗng (không crash)", () => {
    const photos = [makePhoto({ id: "p1", isCover: true })];
    const result = deletePhoto(photos, "p1");
    expect(result).toHaveLength(0);
  });

  it("id không tồn tại → không thay đổi mảng", () => {
    const photos = [makePhoto({ id: "p1" }), makePhoto({ id: "p2" })];
    const result = deletePhoto(photos, "not-exist");
    expect(result).toHaveLength(2);
  });
});

describe("updateCaption", () => {
  it("cập nhật caption đúng ảnh theo id", () => {
    const photos = [
      makePhoto({ id: "p1", caption: "Old caption" }),
      makePhoto({ id: "p2", caption: "Keep this" }),
    ];

    const result = updateCaption(photos, "p1", "New caption");

    expect(result.find((p) => p.id === "p1")?.caption).toBe("New caption");
    expect(result.find((p) => p.id === "p2")?.caption).toBe("Keep this");
  });

  it("cho phép caption rỗng", () => {
    const photos = [makePhoto({ id: "p1", caption: "Something" })];
    const result = updateCaption(photos, "p1", "");
    expect(result[0].caption).toBe("");
  });

  it("không mutate mảng gốc", () => {
    const photos = [makePhoto({ id: "p1", caption: "Original" })];
    const original = photos[0].caption;
    updateCaption(photos, "p1", "Changed");
    expect(photos[0].caption).toBe(original);
  });

  it("id không tồn tại → không thay đổi bất kỳ ảnh nào", () => {
    const photos = [makePhoto({ id: "p1", caption: "Unchanged" })];
    const result = updateCaption(photos, "unknown", "New");
    expect(result[0].caption).toBe("Unchanged");
  });
});

// ─────────────────────────────────────────────
// SLUG NORMALIZATION
// ─────────────────────────────────────────────

describe("normalizeSlug", () => {
  it("chuyển về lowercase", () => {
    expect(normalizeSlug("QUAN-VA-HA")).toBe("quan-va-ha");
  });

  it("thay thế khoảng trắng bằng dấu gạch ngang", () => {
    expect(normalizeSlug("quan va ha")).toBe("quan-va-ha");
  });

  it("thay thế ký tự đặc biệt (không phải a-z0-9-) bằng dấu gạch ngang", () => {
    expect(normalizeSlug("quan_va_ha!")).toBe("quan-va-ha-");
  });

  it("giữ nguyên chữ thường, số và dấu gạch ngang", () => {
    expect(normalizeSlug("abc-123-xyz")).toBe("abc-123-xyz");
  });

  it("chuỗi rỗng trả về chuỗi rỗng", () => {
    expect(normalizeSlug("")).toBe("");
  });
});

// ─────────────────────────────────────────────
// EVENT ITEM — Date handling
// ─────────────────────────────────────────────

describe("EventItem date handling", () => {
  it("eventDate dạng ISO string được parse thành Date hợp lệ", () => {
    const ev = makeEvent({ eventDate: "2026-10-10T10:00" });
    const date = new Date(ev.eventDate);
    expect(date).toBeInstanceOf(Date);
    expect(isNaN(date.getTime())).toBe(false);
  });

  it("eventDate dạng Date object vẫn có thể gọi toISOString()", () => {
    const ev = makeEvent({ eventDate: new Date("2026-10-10T10:00:00.000Z") });
    const dateStr = new Date(ev.eventDate).toISOString().slice(0, 16);
    expect(dateStr).toBe("2026-10-10T10:00");
  });
});

// ─────────────────────────────────────────────
// TYPE SHAPE VALIDATION (compile-time + runtime)
// ─────────────────────────────────────────────

describe("WeddingDataPayload shape", () => {
  it("chấp nhận payload cưới hợp lệ đầy đủ", () => {
    const payload: WeddingDataPayload = {
      cardCategory: "WEDDING",
      groom: { fullName: "Trần Minh Quân" },
      bride: { fullName: "Nguyễn Thu Hà" },
      events: [],
    };
    expect(payload.cardCategory).toBe("WEDDING");
    expect(payload.groom.fullName).toBe("Trần Minh Quân");
  });

  it("chấp nhận loveStory với nhiều mốc", () => {
    const payload: WeddingDataPayload = {
      cardCategory: "WEDDING",
      groom: { fullName: "A" },
      bride: { fullName: "B" },
      events: [],
      loveStory: [
        { title: "Gặp Gỡ", date: "14/02/2022", description: "Lần đầu gặp" },
        { title: "Cầu Hôn", date: "24/12/2024" },
      ],
    };
    expect(payload.loveStory).toHaveLength(2);
    expect(payload.loveStory![1].description).toBeUndefined();
  });
});

describe("BirthdayDataPayload shape", () => {
  it("chấp nhận payload sinh nhật hợp lệ", () => {
    const payload: BirthdayDataPayload = {
      cardCategory: "BIRTHDAY",
      celebrantName: "Hoàng Bảo Nam",
      age: 25,
      events: [],
    };
    expect(payload.celebrantName).toBe("Hoàng Bảo Nam");
  });
});

describe("NewbornDataPayload shape", () => {
  it("chấp nhận payload thôi nôi hợp lệ", () => {
    const payload: NewbornDataPayload = {
      cardCategory: "NEWBORN",
      babyName: "Nguyễn Tuệ Nhi",
      gender: "GIRL",
      birthDate: new Date("2026-01-01"),
      ceremonyType: "FULL_MONTH",
    };
    expect(payload.gender).toBe("GIRL");
    expect(payload.ceremonyType).toBe("FULL_MONTH");
  });
});
