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
    count: vi.fn(),
  },
}));

const redisMock = vi.hoisted(() => ({
  publish: vi.fn(),
  duplicate: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
}));

const mediaServiceMock = vi.hoisted(() => ({
  uploadMemoryPhoto: vi.fn(),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/redis", () => ({ redis: redisMock }));
vi.mock("../../src/services/media.service", () => ({
  MediaService: mediaServiceMock,
}));

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
      });

      expect(parsed.senderName).toBe("Nguyễn Văn A");
      expect(parsed.frameType).toBe("polaroid");
      expect(parsed.message).toBe("Chúc mừng hai bạn trăm năm hạnh phúc!");
    });

    it("accepts valid custom frameType", () => {
      const parsed = CreateWeddingMemorySchema.parse({
        senderName: "Bảo Bảo",
        frameType: "golden-monogram",
      });

      expect(parsed.frameType).toBe("golden-monogram");
    });

    it("rejects empty senderName", () => {
      expect(() =>
        CreateWeddingMemorySchema.parse({
          senderName: "   ",
        })
      ).toThrow("Vui lòng nhập tên của bạn");
    });

    it("rejects senderName longer than 80 chars", () => {
      expect(() =>
        CreateWeddingMemorySchema.parse({
          senderName: "A".repeat(81),
        })
      ).toThrow("Tên không được quá 80 ký tự");
    });

    it("rejects message longer than 500 chars", () => {
      expect(() =>
        CreateWeddingMemorySchema.parse({
          senderName: "Bảo",
          message: "A".repeat(501),
        })
      ).toThrow("Lời chúc không được quá 500 ký tự");
    });

    it("validates ToggleMemorySchema optional fields", () => {
      const parsed = ToggleMemorySchema.parse({ isApproved: false, isPinned: true });
      expect(parsed.isApproved).toBe(false);
      expect(parsed.isPinned).toBe(true);
    });
  });

  describe("createMemory", () => {
    const mockFile = {
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      mimetype: "image/jpeg",
      originalname: "test.jpg",
    } as Express.Multer.File;

    it("creates memory with safe DTO and publishes realtime SSE event via Redis", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-123",
        accountId: "tenant-999",
        status: "ACTIVE",
        expiredAt: null,
      });

      prismaMock.weddingMemory.count.mockResolvedValueOnce(10);
      redisMock.incr.mockResolvedValueOnce(1); // Rate limiter: 1st request

      mediaServiceMock.uploadMemoryPhoto.mockResolvedValueOnce({
        photoUrl: "https://res.cloudinary.com/demo/image/upload/v1/cardvite/tenant-999/memories/img.jpg",
        thumbUrl: "https://res.cloudinary.com/demo/image/upload/c_thumb,w_400,h_400/v1/cardvite/tenant-999/memories/img.jpg",
      });

      const mockCreatedMemory = {
        id: "mem-1",
        senderName: "Chú Bác",
        relationship: "Bà con",
        message: "Hạnh phúc viên mãn",
        photoUrl: "https://res.cloudinary.com/demo/image/upload/v1/cardvite/tenant-999/memories/img.jpg",
        thumbUrl: "https://res.cloudinary.com/demo/image/upload/c_thumb,w_400,h_400/v1/cardvite/tenant-999/memories/img.jpg",
        frameType: "polaroid",
        isPinned: false,
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
          frameType: "polaroid",
        },
        mockFile,
        "127.0.0.1"
      );

      expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
        where: { slug: "dam-cuoi-minh-lan" },
        select: expect.objectContaining({ id: true, accountId: true, status: true }),
      });

      expect(mediaServiceMock.uploadMemoryPhoto).toHaveBeenCalledWith(mockFile, "tenant-999");

      expect(prismaMock.weddingMemory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          accountId: "tenant-999",
          cardId: "card-123",
          senderName: "Chú Bác",
          relationship: "Bà con",
          photoUrl: expect.stringContaining("cloudinary.com"),
          isApproved: true,
          ipAddress: "127.0.0.1",
        }),
        select: expect.any(Object),
      });

      // Output safe DTO must NOT contain ipAddress, accountId, guestId
      expect(result).not.toHaveProperty("ipAddress");
      expect(result).not.toHaveProperty("accountId");
      expect(result).not.toHaveProperty("guestId");
      expect(result.id).toBe("mem-1");
    });

    it("throws 404 if card is not found by slug", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce(null);

      await expect(
        WeddingMemoryService.createMemory(
          "invalid-slug",
          {
            senderName: "Khách",
            frameType: "polaroid",
          },
          mockFile,
          "127.0.0.1"
        )
      ).rejects.toThrow("Không tìm thấy thiệp cưới");

      expect(prismaMock.weddingMemory.create).not.toHaveBeenCalled();
      expect(redisMock.publish).not.toHaveBeenCalled();
    });

    it("throws 400 if card is not ACTIVE", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-123",
        accountId: "tenant-999",
        status: "DRAFT",
        expiredAt: null,
      });

      await expect(
        WeddingMemoryService.createMemory(
          "draft-card",
          { senderName: "Khách", frameType: "polaroid" },
          mockFile,
          "127.0.0.1"
        )
      ).rejects.toThrow("Thiệp đã hết hạn hoặc tạm dừng");
    });

    it("throws 400 when memory cap (300) is reached", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-123",
        accountId: "tenant-999",
        status: "ACTIVE",
        expiredAt: null,
      });

      redisMock.incr.mockResolvedValueOnce(1);
      prismaMock.weddingMemory.count.mockResolvedValueOnce(300);

      await expect(
        WeddingMemoryService.createMemory(
          "slug-cap",
          { senderName: "Khách", frameType: "polaroid" },
          mockFile,
          "127.0.0.1"
        )
      ).rejects.toThrow("giới hạn tối đa 300 ảnh");
    });

    it("throws 429 when rate limit is exceeded (> 5 photos in 5 mins)", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-123",
        accountId: "tenant-999",
        status: "ACTIVE",
        expiredAt: null,
      });

      redisMock.incr.mockResolvedValueOnce(6); // 6th request

      await expect(
        WeddingMemoryService.createMemory(
          "slug-ratelimit",
          { senderName: "Khách", frameType: "polaroid" },
          mockFile,
          "127.0.0.1"
        )
      ).rejects.toThrow("quá nhiều ảnh");
    });
  });

  describe("getPublicMemories", () => {
    it("returns approved memories clamped to limit and without sensitive fields", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        id: "card-123",
      });

      const mockMemories = [
        { id: "mem-pinned", senderName: "A", isPinned: true, photoUrl: "url1", thumbUrl: "url1", frameType: "polaroid", createdAt: new Date() },
        { id: "mem-recent", senderName: "B", isPinned: false, photoUrl: "url2", thumbUrl: "url2", frameType: "polaroid", createdAt: new Date() },
      ];
      prismaMock.weddingMemory.findMany.mockResolvedValueOnce(mockMemories);

      const res = await WeddingMemoryService.getPublicMemories("slug-123", 20);

      expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
        where: { slug: "slug-123" },
        select: { id: true },
      });

      expect(prismaMock.weddingMemory.findMany).toHaveBeenCalledWith({
        where: { cardId: "card-123", isApproved: true },
        select: expect.any(Object),
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
        { id: "mem-1", senderName: "A", isApproved: true },
        { id: "mem-2", senderName: "B", isApproved: false },
      ];
      prismaMock.weddingMemory.findMany.mockResolvedValueOnce(adminMemories);

      const res = await WeddingMemoryService.getAdminMemories("tenant-1", "card-1");

      expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
        where: { id: "card-1", accountId: "tenant-1" },
        select: { id: true },
      });

      expect(prismaMock.weddingMemory.findMany).toHaveBeenCalledWith({
        where: { accountId: "tenant-1", cardId: "card-1" },
        select: expect.any(Object),
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      });

      expect(res).toEqual(adminMemories);
    });
  });

  describe("toggleMemory", () => {
    it("toggles approval or pinned state and notifies LED via Redis", async () => {
      prismaMock.weddingMemory.findFirst.mockResolvedValueOnce({
        id: "mem-1",
      });

      prismaMock.weddingMemory.update.mockResolvedValueOnce({
        id: "mem-1",
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
        select: { id: true },
      });

      expect(prismaMock.weddingMemory.update).toHaveBeenCalledWith({
        where: { id: "mem-1" },
        data: { isApproved: true, isPinned: true },
        select: expect.any(Object),
      });

      expect(redisMock.publish).toHaveBeenCalledWith(
        "wedding:memories:card-1",
        expect.stringContaining('"event":"UPDATE_MEMORY"')
      );

      expect(updated.isApproved).toBe(true);
    });
  });

  describe("deleteMemory", () => {
    it("deletes memory and publishes DELETE_MEMORY event to Redis", async () => {
      prismaMock.weddingMemory.findFirst.mockResolvedValueOnce({
        id: "mem-1",
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
  });

  describe("subscribeCardMemories (Shared Redis Subscriber)", () => {
    it("reuses single subscriber and subscribes to channel", () => {
      const mockSubClient = {
        subscribe: vi.fn().mockResolvedValue(1),
        on: vi.fn(),
        unsubscribe: vi.fn().mockResolvedValue(1),
      };
      redisMock.duplicate.mockReturnValue(mockSubClient);

      const callback = vi.fn();
      const unsubscribe = WeddingMemoryService.subscribeCardMemories("card-100", callback);

      expect(redisMock.duplicate).toHaveBeenCalledTimes(1);
      expect(mockSubClient.subscribe).toHaveBeenCalledWith("wedding:memories:card-100");

      unsubscribe();
      expect(mockSubClient.unsubscribe).toHaveBeenCalledWith("wedding:memories:card-100");
    });
  });
});
