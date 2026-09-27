import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateWeddingMemorySchema, ToggleMemorySchema } from "../../src/schemas/wedding-memory.schema";

const prismaMock = vi.hoisted(() => ({
  card: { findFirst: vi.fn() },
  weddingMemory: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const redisMock = vi.hoisted(() => ({
  publish: vi.fn(),
  duplicate: vi.fn(),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/redis", () => ({ redis: redisMock }));

import { WeddingMemoryService } from "../../src/services/wedding-memory.service";

describe("WeddingMemoryService & WeddingMemorySchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Zod Validation Schemas", () => {
    it("validates valid memory input with default frameType", () => {
      const parsed = CreateWeddingMemorySchema.parse({
        senderName: "  Nguyễn Văn A  ",
        relationship: "Bạn cấp 3",
        message: "Chúc mừng hai bạn trăm năm hạnh phúc!",
        photoUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      });

      expect(parsed.senderName).toBe("Nguyễn Văn A");
      expect(parsed.frameType).toBe("polaroid");
      expect(parsed.message).toBe("Chúc mừng hai bạn trăm năm hạnh phúc!");
    });

    it("accepts valid custom frameType", () => {
      const parsed = CreateWeddingMemorySchema.parse({
        senderName: "Bảo Bảo",
        photoUrl: "https://example.com/photo.jpg",
        frameType: "golden-monogram",
      });

      expect(parsed.frameType).toBe("golden-monogram");
    });

    it("rejects empty senderName", () => {
      expect(() =>
        CreateWeddingMemorySchema.parse({
          senderName: "   ",
          photoUrl: "https://example.com/photo.jpg",
        })
      ).toThrow("Vui lòng nhập tên của bạn");
    });

    it("rejects senderName longer than 80 chars", () => {
      expect(() =>
        CreateWeddingMemorySchema.parse({
          senderName: "A".repeat(81),
          photoUrl: "https://example.com/photo.jpg",
        })
      ).toThrow("Tên không được quá 80 ký tự");
    });

    it("rejects message longer than 500 chars", () => {
      expect(() =>
        CreateWeddingMemorySchema.parse({
          senderName: "Bảo",
          photoUrl: "https://example.com/photo.jpg",
          message: "A".repeat(501),
        })
      ).toThrow("Lời chúc không được quá 500 ký tự");
    });

    it("rejects invalid frameType", () => {
      expect(() =>
        CreateWeddingMemorySchema.parse({
          senderName: "Bảo",
          photoUrl: "https://example.com/photo.jpg",
          frameType: "neon-glow" as unknown as "polaroid",
        })
      ).toThrow();
    });

    it("validates ToggleMemorySchema optional fields", () => {
      const parsed = ToggleMemorySchema.parse({ isApproved: false, isPinned: true });
      expect(parsed.isApproved).toBe(false);
      expect(parsed.isPinned).toBe(true);
    });
  });

  describe("createMemory", () => {
    it("creates memory and publishes realtime SSE event via Redis", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-123",
        accountId: "tenant-999",
        status: "ACTIVE",
      });

      const mockCreatedMemory = {
        id: "mem-1",
        accountId: "tenant-999",
        cardId: "card-123",
        senderName: "Chú Bác",
        relationship: "Bà con",
        message: "Hạnh phúc viên mãn",
        photoUrl: "https://example.com/img.jpg",
        thumbUrl: "https://example.com/img.jpg",
        frameType: "polaroid",
        isApproved: true,
        isPinned: false,
        ipAddress: "127.0.0.1",
        createdAt: new Date(),
      };

      prismaMock.weddingMemory.create.mockResolvedValueOnce(mockCreatedMemory);
      redisMock.publish.mockResolvedValueOnce(1);

      const result = await WeddingMemoryService.createMemory(
        "dam-cuoi-minh-lan",
        {
          senderName: "Chú Bác",
          relationship: "Bà con",
          message: "Hạnh phúc viên mãn",
          photoUrl: "https://example.com/img.jpg",
          frameType: "polaroid",
        },
        "127.0.0.1"
      );

      expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
        where: { slug: "dam-cuoi-minh-lan" },
        select: { id: true, accountId: true, status: true },
      });

      expect(prismaMock.weddingMemory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          accountId: "tenant-999",
          cardId: "card-123",
          senderName: "Chú Bác",
          relationship: "Bà con",
          photoUrl: "https://example.com/img.jpg",
          isApproved: true,
          ipAddress: "127.0.0.1",
        }),
      });

      expect(redisMock.publish).toHaveBeenCalledWith(
        "wedding:memories:card-123",
        expect.stringContaining('"event":"NEW_MEMORY"')
      );

      expect(result).toEqual(mockCreatedMemory);
    });

    it("throws 404 if card is not found by slug", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce(null);

      await expect(
        WeddingMemoryService.createMemory("invalid-slug", {
          senderName: "Khách",
          photoUrl: "https://example.com/img.jpg",
          frameType: "polaroid",
        })
      ).rejects.toThrow("Không tìm thấy thiệp cưới");

      expect(prismaMock.weddingMemory.create).not.toHaveBeenCalled();
      expect(redisMock.publish).not.toHaveBeenCalled();
    });

    it("does not throw if redis publish fails", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-123",
        accountId: "tenant-999",
      });

      prismaMock.weddingMemory.create.mockResolvedValueOnce({
        id: "mem-1",
        cardId: "card-123",
      });

      redisMock.publish.mockRejectedValueOnce(new Error("Redis offline"));

      const result = await WeddingMemoryService.createMemory("slug-ok", {
        senderName: "Khách",
        photoUrl: "https://example.com/img.jpg",
        frameType: "polaroid",
      });

      expect(result).toBeDefined();
    });
  });

  describe("getPublicMemories", () => {
    it("returns approved memories ordered by isPinned and createdAt", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-123",
        accountId: "tenant-1",
      });

      const mockMemories = [
        { id: "mem-pinned", isPinned: true, isApproved: true },
        { id: "mem-recent", isPinned: false, isApproved: true },
      ];
      prismaMock.weddingMemory.findMany.mockResolvedValueOnce(mockMemories);

      const res = await WeddingMemoryService.getPublicMemories("slug-123", 20);

      expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
        where: { slug: "slug-123" },
        select: { id: true, accountId: true },
      });

      expect(prismaMock.weddingMemory.findMany).toHaveBeenCalledWith({
        where: { cardId: "card-123", isApproved: true },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 20,
      });

      expect(res).toEqual(mockMemories);
    });

    it("throws 404 if card slug is invalid", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce(null);

      await expect(WeddingMemoryService.getPublicMemories("not-exist")).rejects.toThrow(
        "Không tìm thấy thiệp cưới"
      );
    });
  });

  describe("getAdminMemories (Multi-tenant Isolation)", () => {
    it("returns all memories for host matching accountId and cardId", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({ id: "card-1" });
      const adminMemories = [
        { id: "mem-1", isApproved: true, accountId: "tenant-1" },
        { id: "mem-2", isApproved: false, accountId: "tenant-1" },
      ];
      prismaMock.weddingMemory.findMany.mockResolvedValueOnce(adminMemories);

      const res = await WeddingMemoryService.getAdminMemories("tenant-1", "card-1");

      expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
        where: { id: "card-1", accountId: "tenant-1" },
        select: { id: true },
      });

      expect(prismaMock.weddingMemory.findMany).toHaveBeenCalledWith({
        where: { accountId: "tenant-1", cardId: "card-1" },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      });

      expect(res).toEqual(adminMemories);
    });

    it("throws 404 when card belongs to another tenant", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce(null);

      await expect(
        WeddingMemoryService.getAdminMemories("other-tenant", "card-1")
      ).rejects.toThrow("Không tìm thấy thiệp hoặc không có quyền truy cập");

      expect(prismaMock.weddingMemory.findMany).not.toHaveBeenCalled();
    });
  });

  describe("toggleMemory", () => {
    it("toggles approval or pinned state and notifies LED via Redis", async () => {
      prismaMock.weddingMemory.findFirst.mockResolvedValueOnce({
        id: "mem-1",
        accountId: "tenant-1",
        cardId: "card-1",
        isApproved: false,
      });

      prismaMock.weddingMemory.update.mockResolvedValueOnce({
        id: "mem-1",
        accountId: "tenant-1",
        cardId: "card-1",
        isApproved: true,
        isPinned: true,
      });

      redisMock.publish.mockResolvedValueOnce(1);

      const updated = await WeddingMemoryService.toggleMemory("tenant-1", "card-1", "mem-1", {
        isApproved: true,
        isPinned: true,
      });

      expect(prismaMock.weddingMemory.findFirst).toHaveBeenCalledWith({
        where: { id: "mem-1", accountId: "tenant-1", cardId: "card-1" },
      });

      expect(prismaMock.weddingMemory.update).toHaveBeenCalledWith({
        where: { id: "mem-1" },
        data: { isApproved: true, isPinned: true },
      });

      expect(redisMock.publish).toHaveBeenCalledWith(
        "wedding:memories:card-1",
        expect.stringContaining('"event":"UPDATE_MEMORY"')
      );

      expect(updated.isApproved).toBe(true);
    });

    it("throws 404 if memory is not found or belongs to another tenant", async () => {
      prismaMock.weddingMemory.findFirst.mockResolvedValueOnce(null);

      await expect(
        WeddingMemoryService.toggleMemory("tenant-2", "card-1", "mem-1", { isApproved: true })
      ).rejects.toThrow("Không tìm thấy ảnh kỷ niệm");
    });
  });

  describe("deleteMemory", () => {
    it("deletes memory and publishes DELETE_MEMORY event to Redis", async () => {
      prismaMock.weddingMemory.findFirst.mockResolvedValueOnce({
        id: "mem-1",
        accountId: "tenant-1",
        cardId: "card-1",
      });
      prismaMock.weddingMemory.delete.mockResolvedValueOnce({ id: "mem-1" });
      redisMock.publish.mockResolvedValueOnce(1);

      const res = await WeddingMemoryService.deleteMemory("tenant-1", "card-1", "mem-1");

      expect(prismaMock.weddingMemory.delete).toHaveBeenCalledWith({
        where: { id: "mem-1" },
      });

      expect(redisMock.publish).toHaveBeenCalledWith(
        "wedding:memories:card-1",
        expect.stringContaining('"event":"DELETE_MEMORY"')
      );

      expect(res).toEqual({ success: true });
    });

    it("throws 404 if memory doesn't exist", async () => {
      prismaMock.weddingMemory.findFirst.mockResolvedValueOnce(null);

      await expect(
        WeddingMemoryService.deleteMemory("tenant-1", "card-1", "mem-not-found")
      ).rejects.toThrow("Không tìm thấy ảnh kỷ niệm");

      expect(prismaMock.weddingMemory.delete).not.toHaveBeenCalled();
    });
  });

  describe("subscribeCardMemories (Pub/Sub SSE stream)", () => {
    it("creates duplicate redis client and sets up channel subscription", () => {
      const mockSubClient = {
        subscribe: vi.fn(),
        on: vi.fn(),
        unsubscribe: vi.fn().mockResolvedValue(1),
        quit: vi.fn().mockResolvedValue("OK"),
      };
      redisMock.duplicate.mockReturnValueOnce(mockSubClient);

      const callback = vi.fn();
      const unsubscribe = WeddingMemoryService.subscribeCardMemories("card-100", callback);

      expect(redisMock.duplicate).toHaveBeenCalled();
      expect(mockSubClient.subscribe).toHaveBeenCalledWith(
        "wedding:memories:card-100",
        expect.any(Function)
      );
      expect(mockSubClient.on).toHaveBeenCalledWith("message", expect.any(Function));

      // Test cleanup
      unsubscribe();
      expect(mockSubClient.unsubscribe).toHaveBeenCalledWith("wedding:memories:card-100");
      expect(mockSubClient.quit).toHaveBeenCalled();
    });
  });
});
