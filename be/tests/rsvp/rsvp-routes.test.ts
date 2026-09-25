import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  card: { findUnique: vi.fn(), findFirst: vi.fn() },
  guest: { findFirst: vi.fn() },
  rsvpResponse: { create: vi.fn(), upsert: vi.fn() },
}));

const queueMock = vi.hoisted(() => ({
  add: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/rate-limiter", () => ({ checkRateLimit: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../../src/queues/rsvp-notification.queue", () => ({ rsvpNotificationQueue: queueMock }));
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

describe("RSVP HTTP routes contract & guest association", () => {
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

  const activeCard = {
    id: "card-123",
    slug: "an-va-binh",
    status: "ACTIVE",
    expiredAt: null,
    telegramChatId: null,
    accountId: "account-tenant-a",
  };

  it("links guest when valid guestToken is provided and preserves it through router", async () => {
    prismaMock.card.findUnique.mockResolvedValueOnce(activeCard);
    prismaMock.guest.findFirst.mockResolvedValueOnce({
      id: "guest-abc",
      accountId: "account-tenant-a",
      cardId: "card-123",
      fullName: "Tran Van Khach",
      phone: "0912345678",
      guestToken: "token-64-character-string-1234567890abcdef",
    });
    prismaMock.rsvpResponse.upsert.mockResolvedValueOnce({
      id: "rsvp-1",
      accountId: "account-tenant-a",
      cardId: "card-123",
      guestId: "guest-abc",
      fullName: "Tran Van Khach",
      status: "ATTENDING",
      guestCount: 2,
    });

    const res = await fetch(`${server.baseUrl}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: "card-123",
        guestToken: "token-64-character-string-1234567890abcdef",
        fullName: "Khach",
        status: "ATTENDING",
        guestCount: 2,
        side: "MUTUAL",
      }),
    });

    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);

    // Verify guest lookup was performed with tenant accountId and cardId
    expect(prismaMock.guest.findFirst).toHaveBeenCalledWith({
      where: {
        accountId: "account-tenant-a",
        cardId: "card-123",
        OR: [{ guestToken: "token-64-character-string-1234567890abcdef" }],
      },
    });

    // Verify upsert was called with composite key cardId_guestId
    expect(prismaMock.rsvpResponse.upsert).toHaveBeenCalledWith({
      where: {
        cardId_guestId: {
          cardId: "card-123",
          guestId: "guest-abc",
        },
      },
      create: expect.objectContaining({
        accountId: "account-tenant-a",
        cardId: "card-123",
        guestId: "guest-abc",
        status: "ATTENDING",
      }),
      update: expect.objectContaining({
        status: "ATTENDING",
      }),
    });
  });

  it("updates the same response record on repeated submission for the same guest", async () => {
    prismaMock.card.findUnique.mockResolvedValueOnce(activeCard);
    prismaMock.guest.findFirst.mockResolvedValueOnce({
      id: "guest-abc",
      accountId: "account-tenant-a",
      cardId: "card-123",
      fullName: "Tran Van Khach",
      phone: "0912345678",
      guestToken: "token-64-character-string-1234567890abcdef",
    });
    prismaMock.rsvpResponse.upsert.mockResolvedValueOnce({
      id: "rsvp-1",
      accountId: "account-tenant-a",
      cardId: "card-123",
      guestId: "guest-abc",
      fullName: "Tran Van Khach",
      status: "DECLINED",
      guestCount: 0,
    });

    // Second submission: changes to DECLINED with 0 guestCount
    const res = await fetch(`${server.baseUrl}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: "card-123",
        guestToken: "token-64-character-string-1234567890abcdef",
        fullName: "Khach",
        status: "DECLINED",
        guestCount: 0,
        side: "MUTUAL",
      }),
    });

    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);

    // Verified upsert was used with same cardId_guestId
    expect(prismaMock.rsvpResponse.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          cardId_guestId: {
            cardId: "card-123",
            guestId: "guest-abc",
          },
        },
        update: expect.objectContaining({
          status: "DECLINED",
          guestCount: 0,
        }),
      }),
    );
  });

  it("submits independently via create when no guest token/code is present (general link)", async () => {
    prismaMock.card.findUnique.mockResolvedValueOnce(activeCard);
    prismaMock.rsvpResponse.create.mockResolvedValueOnce({
      id: "rsvp-public-1",
      accountId: "account-tenant-a",
      cardId: "card-123",
      fullName: "Ban Be Vang Lai",
      status: "ATTENDING",
      guestCount: 1,
    });

    const res = await fetch(`${server.baseUrl}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: "card-123",
        fullName: "Ban Be Vang Lai",
        status: "ATTENDING",
        guestCount: 1,
        side: "GROOM_SIDE",
      }),
    });

    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(prismaMock.guest.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.rsvpResponse.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        accountId: "account-tenant-a",
        cardId: "card-123",
        fullName: "Ban Be Vang Lai",
        status: "ATTENDING",
      }),
    });
  });

  it("does NOT link to guest if guest token belongs to another tenant/card", async () => {
    prismaMock.card.findUnique.mockResolvedValueOnce(activeCard);
    // Guest query returns null because accountId or cardId don't match
    prismaMock.guest.findFirst.mockResolvedValueOnce(null);
    prismaMock.rsvpResponse.create.mockResolvedValueOnce({
      id: "rsvp-unlinked",
      accountId: "account-tenant-a",
      cardId: "card-123",
      fullName: "Attacker or Wrong Card Link",
      status: "ATTENDING",
      guestCount: 1,
    });

    const res = await fetch(`${server.baseUrl}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: "card-123",
        guestToken: "foreign-tenant-guest-token",
        fullName: "Attacker or Wrong Card Link",
        status: "ATTENDING",
        guestCount: 1,
      }),
    });

    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);

    // Guest query was scoped to card's accountId and cardId
    expect(prismaMock.guest.findFirst).toHaveBeenCalledWith({
      where: {
        accountId: "account-tenant-a",
        cardId: "card-123",
        OR: [{ guestToken: "foreign-tenant-guest-token" }],
      },
    });

    // Because guest was not found in this tenant's card, it fell back to create without guestId
    expect(prismaMock.rsvpResponse.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        accountId: "account-tenant-a",
        cardId: "card-123",
      }),
    });
    expect(prismaMock.rsvpResponse.upsert).not.toHaveBeenCalled();
  });

  it("rejects invalid submission with 400 when fullName is too short", async () => {
    const res = await fetch(`${server.baseUrl}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: "card-123",
        fullName: "A",
        status: "ATTENDING",
      }),
    });

    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(prismaMock.card.findUnique).not.toHaveBeenCalled();
  });
});
