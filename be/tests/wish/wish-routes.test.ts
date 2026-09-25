import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const wishMock = vi.hoisted(() => ({
  submitWish: vi.fn(),
  listWishes: vi.fn(),
}));

vi.mock("../../src/services/wish.service", () => ({
  WishService: wishMock,
}));

vi.mock("../../src/lib/redis", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    ttl: vi.fn().mockResolvedValue(-2),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue("OK"),
    on: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createTestHttpServer, TestHttpServer } from "../helpers/http-server";

describe("Wish HTTP routes contract", () => {
  let server: TestHttpServer;

  beforeAll(async () => {
    server = await createTestHttpServer();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/wishes", () => {
    it("accepts valid wish submission and returns public DTO", async () => {
      wishMock.submitWish.mockResolvedValueOnce({
        id: "w-1",
        senderName: "Nguyen Van A",
        relationship: "Bạn chú rể",
        content: "Chúc hai bạn trăm năm hạnh phúc!",
        emoji: "🎉",
        createdAt: "2026-09-25T10:00:00.000Z",
      });

      const res = await fetch(`${server.baseUrl}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: "card-uuid-1",
          senderName: "Nguyen Van A",
          relationship: "Bạn chú rể",
          content: "Chúc hai bạn trăm năm hạnh phúc!",
          emoji: "🎉",
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toEqual({
        id: "w-1",
        senderName: "Nguyen Van A",
        relationship: "Bạn chú rể",
        content: "Chúc hai bạn trăm năm hạnh phúc!",
        emoji: "🎉",
        createdAt: "2026-09-25T10:00:00.000Z",
      });
      // Response must NOT contain accountId or ipAddress
      expect(body.data).not.toHaveProperty("accountId");
      expect(body.data).not.toHaveProperty("ipAddress");

      expect(wishMock.submitWish).toHaveBeenCalledWith(
        {
          cardId: "card-uuid-1",
          senderName: "Nguyen Van A",
          relationship: "Bạn chú rể",
          content: "Chúc hai bạn trăm năm hạnh phúc!",
          emoji: "🎉",
        },
        expect.objectContaining({ ipAddress: expect.any(String) })
      );
    });

    it("rejects wish submission when senderName is empty with 400", async () => {
      const res = await fetch(`${server.baseUrl}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: "card-uuid-1",
          senderName: "A", // min 2 chars
          content: "Chúc mừng!",
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(wishMock.submitWish).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/wishes/:cardId", () => {
    it("returns public wishes list for valid cardId", async () => {
      wishMock.listWishes.mockResolvedValueOnce({
        items: [
          {
            id: "w-2",
            senderName: "Le Thi B",
            relationship: "Đồng nghiệp",
            content: "Mãi hạnh phúc nhé!",
            emoji: "❤️",
            createdAt: "2026-09-25T11:00:00.000Z",
          },
        ],
        nextCursor: undefined,
      });

      const res = await fetch(`${server.baseUrl}/wishes/card-uuid-1?limit=10`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0]).not.toHaveProperty("ipAddress");
      expect(body.data.items[0]).not.toHaveProperty("accountId");
      expect(wishMock.listWishes).toHaveBeenCalledWith("card-uuid-1", 10, undefined);
    });
  });
});
