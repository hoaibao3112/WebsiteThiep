import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  account: {
    findUniqueOrThrow: vi.fn(),
  },
  customDomain: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  card: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  ...db,
  $transaction: vi.fn(async (callback: (tx: typeof db) => Promise<unknown>) => callback(db)),
}));

const redisMock = vi.hoisted(() => ({
  get: vi.fn().mockResolvedValue(null),
  setex: vi.fn().mockResolvedValue("OK"),
  del: vi.fn().mockResolvedValue(1),
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/lib/redis", () => ({ redis: redisMock }));
vi.mock("../../src/services/account-entitlement.service", () => ({
  AccountEntitlementService: {
    getEffectivePlan: vi.fn(),
  },
}));
vi.mock("../../src/services/vercel-domain.service", () => ({
  VercelDomainService: {
    addDomainToProject: vi.fn(),
    verifyDomainOnVercel: vi.fn(),
    removeDomainFromProject: vi.fn(),
  },
}));
vi.mock("../../src/services/card.service", () => ({
  CardService: {
    isSlugAvailable: vi.fn(),
  },
}));

import { DomainService } from "../../src/services/domain.service";
import { AccountEntitlementService } from "../../src/services/account-entitlement.service";
import { VercelDomainService } from "../../src/services/vercel-domain.service";
import { CardService } from "../../src/services/card.service";
import { detectDomainType, RESERVED_SLUGS } from "../../src/lib/validators/domain.validator";

describe("DomainService & DNS Architecture Suite", () => {
  const accountId = "acc-test-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("detectDomainType", () => {
    it("correctly identifies Apex domain with 2 parts", () => {
      const res = detectDomainType("damcuoilongngoc.com");
      expect(res.isApex).toBe(true);
      expect(res.hostName).toBe("@");
      expect(res.apexDomain).toBe("damcuoilongngoc.com");
    });

    it("correctly identifies Apex domain with .com.vn / .net.vn", () => {
      const res = detectDomainType("hoanglongbaongoc.com.vn");
      expect(res.isApex).toBe(true);
      expect(res.hostName).toBe("@");
      expect(res.apexDomain).toBe("hoanglongbaongoc.com.vn");
    });

    it("correctly identifies Subdomain with 3 parts", () => {
      const res = detectDomainType("wedding.longngoc.com");
      expect(res.isApex).toBe(false);
      expect(res.hostName).toBe("wedding");
      expect(res.apexDomain).toBe("longngoc.com");
    });

    it("correctly identifies Subdomain with .com.vn", () => {
      const res = detectDomainType("thiep.damcuoi.com.vn");
      expect(res.isApex).toBe(false);
      expect(res.hostName).toBe("thiep");
      expect(res.apexDomain).toBe("damcuoi.com.vn");
    });
  });

  describe("RESERVED_SLUGS", () => {
    it("contains core critical system routes", () => {
      expect(RESERVED_SLUGS.has("api")).toBe(true);
      expect(RESERVED_SLUGS.has("admin")).toBe(true);
      expect(RESERVED_SLUGS.has("dashboard")).toBe(true);
      expect(RESERVED_SLUGS.has("login")).toBe(true);
      expect(RESERVED_SLUGS.has("pricing")).toBe(true);
      expect(RESERVED_SLUGS.has("thiep")).toBe(true);
    });
  });

  describe("listDomains", () => {
    it("returns domain list and accurate quota usage", async () => {
      db.customDomain.findMany.mockResolvedValueOnce([
        { id: "dom-1", domain: "damcuoi.com" },
      ]);
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        capabilities: { allowCustomDomain: true },
        planCode: "VIP",
        planName: "Gói VIP",
      } as any);
      db.account.findUniqueOrThrow.mockResolvedValueOnce({ extraDomains: 2 });

      const res = await DomainService.listDomains(accountId);

      expect(res.domains).toHaveLength(1);
      expect(res.capabilities.allowCustomDomain).toBe(true);
      expect(res.quota).toEqual({
        used: 1,
        max: 3, // 1 VIP base + 2 extraDomains
        extraDomains: 2,
      });
    });
  });

  describe("createCustomDomain & Quota Enforcement", () => {
    it("rejects non-VIP plan without allowCustomDomain capability", async () => {
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        capabilities: { allowCustomDomain: false },
        planCode: "FREE",
        planName: "Gói Miễn Phí",
      } as any);
      db.account.findUniqueOrThrow.mockResolvedValueOnce({ extraDomains: 0 });
      db.customDomain.count.mockResolvedValueOnce(0);

      await expect(
        DomainService.createCustomDomain(accountId, {
          cardId: "card-1",
          domain: "damcuoi.com",
        })
      ).rejects.toThrow(/không hỗ trợ tên miền riêng/i);
    });

    it("enforces quota limit when user exceeds allowed domain slots", async () => {
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        capabilities: { allowCustomDomain: true },
        planCode: "VIP",
        planName: "Gói VIP",
      } as any);
      db.account.findUniqueOrThrow.mockResolvedValueOnce({ extraDomains: 0 });
      // User already has 1 domain connected (max is 1 base + 0 extra = 1)
      db.customDomain.count.mockResolvedValueOnce(1);

      await expect(
        DomainService.createCustomDomain(accountId, {
          cardId: "card-2",
          domain: "damcuoi2.com",
        })
      ).rejects.toThrow(/Bạn đã sử dụng hết số lượng tên miền riêng cho phép \(1\/1\)/i);
    });

    it("generates RFC-compliant A record for Apex domains and registers on Vercel", async () => {
      vi.mocked(AccountEntitlementService.getEffectivePlan).mockResolvedValueOnce({
        capabilities: { allowCustomDomain: true },
        planCode: "VIP",
        planName: "Gói VIP",
      } as any);
      db.account.findUniqueOrThrow.mockResolvedValueOnce({ extraDomains: 1 });
      db.customDomain.count.mockResolvedValueOnce(0);
      db.card.findFirst.mockResolvedValueOnce({ id: "card-1", slug: "long-ngoc" });
      db.customDomain.findUnique
        .mockResolvedValueOnce(null) // cardDomain
        .mockResolvedValueOnce(null); // domainInUse

      vi.mocked(VercelDomainService.addDomainToProject).mockResolvedValueOnce({
        verified: true,
        configured: true,
        sslIssued: true,
        recommendedCname: "cname.vercel-dns.com",
        recommendedARecord: "76.76.21.21",
      });

      db.customDomain.create.mockResolvedValueOnce({
        id: "dom-new",
        domain: "damcuoilongngoc.com",
        status: "ACTIVE",
        targetType: "A",
        targetValue: "76.76.21.21",
      });

      const res = await DomainService.createCustomDomain(accountId, {
        cardId: "card-1",
        domain: "damcuoilongngoc.com",
      });

      // Verify Apex domain instructions have A record for @
      expect(res.dnsRecords).toContainEqual(
        expect.objectContaining({
          type: "A",
          name: "@",
          value: "76.76.21.21",
        })
      );
      // And CNAME for www
      expect(res.dnsRecords).toContainEqual(
        expect.objectContaining({
          type: "CNAME",
          name: "www",
          value: "cname.vercel-dns.com",
        })
      );
    });

    it("generates CNAME record for Subdomain", async () => {
      const guidance = DomainService.generateDnsRecords("wedding.longngoc.vn", "token-123");
      expect(guidance.targetType).toBe("CNAME");
      expect(guidance.dnsRecords).toContainEqual(
        expect.objectContaining({
          type: "CNAME",
          name: "wedding",
          value: "cname.vercel-dns.com",
        })
      );
    });
  });

  describe("lookupCardByDomain with Redis Cache & www Fallback", () => {
    it("returns cached result directly when Redis cache hits", async () => {
      redisMock.get.mockResolvedValueOnce(
        JSON.stringify({ cardId: "card-cached", slug: "slug-cached" })
      );

      const res = await DomainService.lookupCardByDomain("damcuoi.com");

      expect(res).toEqual({ cardId: "card-cached", slug: "slug-cached" });
      expect(db.customDomain.findFirst).not.toHaveBeenCalled();
    });

    it("queries DB on cache miss, supports www fallback and caches in Redis for 5 minutes", async () => {
      redisMock.get.mockResolvedValueOnce(null);
      db.customDomain.findFirst.mockResolvedValueOnce({
        id: "dom-1",
        domain: "damcuoi.com",
        status: "ACTIVE",
        card: {
          id: "card-db",
          slug: "dam-cuoi-db",
          status: "ACTIVE",
          expiredAt: null,
        },
      });

      // Guest visits with www prefix: www.damcuoi.com
      const res = await DomainService.lookupCardByDomain("www.damcuoi.com");

      expect(res).toEqual({ cardId: "card-db", slug: "dam-cuoi-db" });
      // Verify findFirst was called with both www.damcuoi.com and damcuoi.com
      expect(db.customDomain.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            domain: { in: ["www.damcuoi.com", "damcuoi.com"] },
            status: "ACTIVE",
          }),
        })
      );
      // Verify cached in Redis with TTL 300s
      expect(redisMock.setex).toHaveBeenCalledWith(
        "domain:lookup:www.damcuoi.com",
        300,
        JSON.stringify({ cardId: "card-db", slug: "dam-cuoi-db" })
      );
    });

    it("invalidates Redis cache when domain is deleted", async () => {
      db.customDomain.findFirst.mockResolvedValueOnce({
        id: "dom-1",
        domain: "damcuoi.com",
        accountId,
      });
      db.customDomain.delete.mockResolvedValueOnce({});
      vi.mocked(VercelDomainService.removeDomainFromProject).mockResolvedValueOnce(true);

      await DomainService.deleteCustomDomain(accountId, "dom-1");

      // Verify cache for both clean domain and www alternative are deleted
      expect(redisMock.del).toHaveBeenCalledWith(
        "domain:lookup:damcuoi.com",
        "domain:lookup:www.damcuoi.com"
      );
    });
  });

  describe("updateCardSlug", () => {
    it("rejects slug if already taken by another card", async () => {
      db.card.findFirst.mockResolvedValueOnce({ id: "card-1", slug: "old-slug", status: "ACTIVE" });
      vi.mocked(CardService.isSlugAvailable).mockResolvedValueOnce(false);

      await expect(
        DomainService.updateCardSlug(accountId, "card-1", "taken-slug")
      ).rejects.toThrow(/đã có người sử dụng/i);
    });

    it("updates slug and evicts cache for linked domain", async () => {
      db.card.findFirst.mockResolvedValueOnce({ id: "card-1", slug: "old-slug", status: "ACTIVE" });
      vi.mocked(CardService.isSlugAvailable).mockResolvedValueOnce(true);
      db.customDomain.findUnique.mockResolvedValueOnce({ domain: "damcuoi.com" });
      db.card.update.mockResolvedValueOnce({ id: "card-1", slug: "new-slug" });

      const res = await DomainService.updateCardSlug(accountId, "card-1", "new-slug");

      expect(res.slug).toBe("new-slug");
      expect(redisMock.del).toHaveBeenCalledWith(
        "domain:lookup:damcuoi.com",
        "domain:lookup:www.damcuoi.com"
      );
    });
  });
});
