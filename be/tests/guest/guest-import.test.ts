import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  account: { findUniqueOrThrow: vi.fn() },
  card: { findFirst: vi.fn() },
  guest: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
  $executeRaw: vi.fn().mockResolvedValue(1),
  $transaction: vi.fn(),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import { GuestService } from "../../src/services/guest.service";
import { ImportGuestsSchema } from "../../src/lib/validators/guest";

describe("GuestService.importGuests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    db.$transaction.mockImplementation(async (callback: (tx: typeof db) => Promise<any>) => {
      return callback(db);
    });

    db.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-1",
      currentPlanId: "vip-plan-id",
      planStartedAt: new Date(),
      planExpiresAt: null,
      currentPlan: {
        id: "vip-plan-id",
        code: "VIP",
        name: "VIP",
        maxPhotos: 50,
        hasWatermark: false,
        allowCustomDomain: true,
        allowMusicUpload: true,
        allowTelegramNoti: true,
        allowPremiumTemplates: true,
      },
    });

    db.card.findFirst.mockResolvedValue({
      id: "card-1",
      accountId: "account-1",
      slug: "wedding-card-1",
      plan: { code: "VIP" },
    });
  });

  it("imports new guests and generates unique tokens", async () => {
    db.guest.findMany.mockResolvedValueOnce([]);
    db.guest.create.mockImplementation(async ({ data }: any) => ({
      id: "guest-created-1",
      ...data,
    }));

    const result = await GuestService.importGuests("account-1", "card-1", {
      mode: "SKIP_DUPLICATES",
      guests: [
        { fullName: "Nguyễn Văn A", phone: "0901234567", group: "Bạn Cấp 3", salutation: "Bạn" },
      ],
    });

    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([]);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].fullName).toBe("Nguyễn Văn A");
    expect(result.items[0].guestToken).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(result.items[0].customUrl).toBe(`/thiep/wedding-card-1?g=${result.items[0].guestToken}`);
  });

  it("skips duplicates in SKIP_DUPLICATES mode matching normalized phone", async () => {
    const existingGuest = {
      id: "existing-1",
      accountId: "account-1",
      cardId: "card-1",
      fullName: "Nguyễn Văn A",
      normalizedName: "nguyễn văn a",
      phone: "0901234567",
      normalizedPhone: "0901234567",
      guestToken: "existing-token-12345678901234567890",
      guestCode: "G-existing",
      salutation: "Bạn",
      group: "Bạn Học",
      notes: null,
    };

    db.guest.findMany.mockResolvedValueOnce([existingGuest]);

    // +84 format should match 0901234567
    const result = await GuestService.importGuests("account-1", "card-1", {
      mode: "SKIP_DUPLICATES",
      guests: [
        { fullName: "Nguyễn Văn A Mới", phone: "+84901234567", group: "Bạn Cũ" },
        { fullName: "Trần Thị B", phone: "0911222333", group: "Đồng Nghiệp" },
      ],
    });

    expect(result.skipped).toBe(1);
    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
    expect(db.guest.create).toHaveBeenCalledTimes(1);
    expect(db.guest.update).not.toHaveBeenCalled();
  });

  it("updates existing guest in UPDATE_EXISTING mode preserving id and tokens", async () => {
    const existingGuest = {
      id: "existing-uuid-1",
      accountId: "account-1",
      cardId: "card-1",
      fullName: "Lê Văn C",
      normalizedName: "lê văn c",
      phone: "0988777666",
      normalizedPhone: "0988777666",
      guestToken: "preserved-token-12345678901234567",
      guestCode: "G-preserved",
      salutation: "Bạn",
      group: "Đồng Nghiệp",
      notes: "Ghi chú cũ",
    };

    db.guest.findMany.mockResolvedValueOnce([existingGuest]);
    db.guest.update.mockImplementation(async ({ data }: any) => ({
      ...existingGuest,
      ...data,
    }));

    const result = await GuestService.importGuests("account-1", "card-1", {
      mode: "UPDATE_EXISTING",
      guests: [
        {
          fullName: "Lê Văn C (Trưởng Phòng)",
          phone: "0988777666",
          salutation: "Anh",
          group: "Ban Giám Đốc",
          notes: "Ghi chú mới",
        },
      ],
    });

    expect(result.created).toBe(0);
    expect(result.updated).toBe(1);
    expect(result.skipped).toBe(0);
    expect(db.guest.update).toHaveBeenCalledWith({
      where: { id: "existing-uuid-1" },
      data: {
        fullName: "Lê Văn C (Trưởng Phòng)",
        normalizedName: "lê văn c (trưởng phòng)",
        phone: "0988777666",
        normalizedPhone: "0988777666",
        salutation: "Anh",
        group: "Ban Giám Đốc",
        notes: "Ghi chú mới",
      },
    });
    // Token and ID are strictly preserved
    expect(result.items[0].id).toBe("existing-uuid-1");
    expect(result.items[0].guestToken).toBe("preserved-token-12345678901234567");
    expect(result.items[0].customUrl).toBe(`/thiep/wedding-card-1?g=preserved-token-12345678901234567`);
  });

  it("treats same fullName with different group as separate guests when neither has phone", async () => {
    const existingGuest = {
      id: "guest-family",
      accountId: "account-1",
      cardId: "card-1",
      fullName: "Nguyễn Thị Mai",
      normalizedName: "nguyễn thị mai",
      phone: null,
      normalizedPhone: null,
      group: "Họ Nhà Trai",
      guestToken: "token-family",
    };

    db.guest.findMany.mockResolvedValueOnce([existingGuest]);
    db.guest.create.mockImplementation(async ({ data }: any) => ({
      id: "guest-friend",
      ...data,
    }));

    const result = await GuestService.importGuests("account-1", "card-1", {
      mode: "SKIP_DUPLICATES",
      guests: [
        // Same name but group is Họ Nhà Gái -> should NOT match Họ Nhà Trai
        { fullName: "Nguyễn Thị Mai", group: "Họ Nhà Gái" },
      ],
    });

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(0);
    expect(db.guest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fullName: "Nguyễn Thị Mai",
          group: "Họ Nhà Gái",
        }),
      })
    );
  });

  it("catches in-batch duplicate rows and updates map progressively", async () => {
    db.guest.findMany.mockResolvedValueOnce([]);
    let createdCount = 0;
    db.guest.create.mockImplementation(async ({ data }: any) => {
      createdCount++;
      return { id: `new-guest-${createdCount}`, ...data };
    });

    const result = await GuestService.importGuests("account-1", "card-1", {
      mode: "SKIP_DUPLICATES",
      guests: [
        { fullName: "Phạm Văn D", phone: "0933444555", group: "Bạn Bè" },
        // Duplicate within the same payload
        { fullName: "Phạm Văn D (Lặp)", phone: "0933444555", group: "Bạn Bè" },
      ],
    });

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(1);
    expect(db.guest.create).toHaveBeenCalledTimes(1);
  });

  it("records error and does not overwrite when multiple existing rows match ambiguous criteria", async () => {
    // Database has 2 records with the same normalized phone
    const dupe1 = {
      id: "d-1",
      accountId: "account-1",
      cardId: "card-1",
      fullName: "Trần A",
      normalizedPhone: "0999888777",
      phone: "0999888777",
      group: "Group 1",
    };
    const dupe2 = {
      id: "d-2",
      accountId: "account-1",
      cardId: "card-1",
      fullName: "Trần B",
      normalizedPhone: "0999888777",
      phone: "0999888777",
      group: "Group 2",
    };

    db.guest.findMany.mockResolvedValueOnce([dupe1, dupe2]);

    const result = await GuestService.importGuests("account-1", "card-1", {
      mode: "UPDATE_EXISTING",
      guests: [{ fullName: "Trần C", phone: "0999888777" }],
    });

    expect(result.created).toBe(0);
    expect(result.updated).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].row).toBe(1);
    expect(result.errors[0].error).toContain("mơ hồ");
    expect(db.guest.update).not.toHaveBeenCalled();
    expect(db.guest.create).not.toHaveBeenCalled();
  });

  it("enforces tenant and card isolation in findMany query", async () => {
    db.guest.findMany.mockResolvedValueOnce([]);
    db.guest.create.mockResolvedValueOnce({
      id: "isolated-guest",
      fullName: "Khách Cô Lập",
      guestToken: "isolated-tok",
    });

    await GuestService.importGuests("account-target", "card-target", {
      mode: "SKIP_DUPLICATES",
      guests: [{ fullName: "Khách Cô Lập" }],
    });

    expect(db.guest.findMany).toHaveBeenCalledWith({
      where: { accountId: "account-target", cardId: "card-target" },
    });
  });

  it("rolls back batch when transaction fails", async () => {
    db.guest.findMany.mockResolvedValueOnce([]);
    db.guest.create.mockRejectedValueOnce(new Error("Disk full or connection broken"));

    await expect(
      GuestService.importGuests("account-1", "card-1", {
        mode: "SKIP_DUPLICATES",
        guests: [{ fullName: "Khách Gây Lỗi" }],
      })
    ).rejects.toThrow("Disk full or connection broken");
  });

  describe("ImportGuestsSchema limits", () => {
    it("allows up to 500 guests in a single import", () => {
      const guests = Array.from({ length: 500 }, (_, i) => ({
        fullName: `Khách ${i}`,
        phone: `0900000${String(i).padStart(3, "0")}`,
      }));

      const parsed = ImportGuestsSchema.parse({
        mode: "SKIP_DUPLICATES",
        guests,
      });

      expect(parsed.guests).toHaveLength(500);
    });

    it("rejects 501 guests with validation error", () => {
      const guests = Array.from({ length: 501 }, (_, i) => ({
        fullName: `Khách ${i}`,
      }));

      expect(() =>
        ImportGuestsSchema.parse({
          mode: "SKIP_DUPLICATES",
          guests,
        })
      ).toThrow();
    });
  });
});
