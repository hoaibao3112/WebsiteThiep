import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const domainServiceMock = vi.hoisted(() => ({
  listDomains: vi.fn(),
  createCustomDomain: vi.fn(),
  verifyDomain: vi.fn(),
  deleteCustomDomain: vi.fn(),
  updateCardSlug: vi.fn(),
  lookupCardByDomain: vi.fn(),
}));

const authServiceMock = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  accountMember: {
    findUnique: vi.fn(),
  },
}));

vi.mock("../../src/services/domain.service", () => ({
  DomainService: domainServiceMock,
}));

vi.mock("../../src/services/auth.service", () => ({
  AuthService: authServiceMock,
}));

vi.mock("../../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../../src/lib/redis", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
  },
}));

import { createTestHttpServer, TestHttpServer } from "../helpers/http-server";

describe("Domain HTTP Routes Contract Suite", () => {
  let server: TestHttpServer;
  const validToken = "valid-test-token";
  const authHeaders = {
    Authorization: `Bearer ${validToken}`,
    "Content-Type": "application/json",
  };

  beforeAll(async () => {
    server = await createTestHttpServer();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    authServiceMock.verifyToken.mockReturnValue({
      userId: "user-123",
      accountId: "acc-123",
      role: "OWNER",
    });
    prismaMock.accountMember.findUnique.mockResolvedValue({
      id: "mem-1",
      role: "OWNER",
    });
  });

  describe("GET /api/domains", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await fetch(`${server.baseUrl}/domains`);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
    });

    it("returns 200 and domain list with quota when authenticated", async () => {
      domainServiceMock.listDomains.mockResolvedValueOnce({
        domains: [
          {
            id: "dom-1",
            domain: "damcuoihoanglong.com",
            status: "ACTIVE",
          },
        ],
        quota: { used: 1, limit: 2, canAdd: true },
      });

      const res = await fetch(`${server.baseUrl}/domains`, {
        headers: authHeaders,
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.quota.limit).toBe(2);
      expect(body.data.domains).toHaveLength(1);
    });
  });

  describe("POST /api/domains", () => {
    it("rejects request with 400 when domain format is invalid", async () => {
      const res = await fetch(`${server.baseUrl}/domains`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          domain: "invalid_domain_name!",
          cardId: "card-123",
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
    });

    it("accepts valid domain and returns 201 Created", async () => {
      domainServiceMock.createCustomDomain.mockResolvedValueOnce({
        id: "dom-2",
        domain: "damcuoilongngoc.vn",
        status: "PENDING_DNS",
        dnsGuide: {
          apexDomain: "damcuoilongngoc.vn",
          isApex: true,
          records: [{ type: "A", name: "@", value: "76.76.21.21" }],
        },
      });

      const res = await fetch(`${server.baseUrl}/domains`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          domain: "damcuoilongngoc.vn",
          cardId: "card-123",
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.domain).toBe("damcuoilongngoc.vn");
    });
  });

  describe("POST /api/domains/:id/verify", () => {
    it("triggers domain verification and returns 200", async () => {
      domainServiceMock.verifyDomain.mockResolvedValueOnce({
        id: "dom-1",
        domain: "damcuoilongngoc.vn",
        status: "ACTIVE",
        sslStatus: "ISSUED",
      });

      const res = await fetch(`${server.baseUrl}/domains/dom-1/verify`, {
        method: "POST",
        headers: authHeaders,
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe("ACTIVE");
    });
  });

  describe("DELETE /api/domains/:id", () => {
    it("deletes custom domain successfully and returns 200", async () => {
      domainServiceMock.deleteCustomDomain.mockResolvedValueOnce({
        success: true,
      });

      const res = await fetch(`${server.baseUrl}/domains/dom-1`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toContain("Đã gỡ tên miền thành công");
    });
  });

  describe("GET /api/domains/lookup/:domain", () => {
    it("allows public access without authentication token", async () => {
      domainServiceMock.lookupCardByDomain.mockResolvedValueOnce({
        cardId: "card-pub-1",
        slug: "long-ngoc-wedding",
      });

      const res = await fetch(`${server.baseUrl}/domains/lookup/damcuoilongngoc.com`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual({
        cardId: "card-pub-1",
        slug: "long-ngoc-wedding",
      });
    });

    it("returns null data for unmapped or non-existent domains", async () => {
      domainServiceMock.lookupCardByDomain.mockResolvedValueOnce(null);

      const res = await fetch(`${server.baseUrl}/domains/lookup/unknown-domain.com`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeNull();
    });
  });
});
