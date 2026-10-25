import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Hoisted mock cho dns/promises
const { mockResolver, MockResolver } = vi.hoisted(() => {
  const mock = {
    setServers: vi.fn(),
    resolveTxt: vi.fn(),
    resolveCname: vi.fn(),
    resolve4: vi.fn(),
  };

  class ResolverClass {
    setServers = mock.setServers;
    resolveTxt = mock.resolveTxt;
    resolveCname = mock.resolveCname;
    resolve4 = mock.resolve4;
  }

  return { mockResolver: mock, MockResolver: ResolverClass };
});

vi.mock("node:dns/promises", () => ({
  default: {
    Resolver: MockResolver,
  },
  Resolver: MockResolver,
}));

// Hoisted mock fetch
const fetchMock = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({}),
});
global.fetch = fetchMock;

import { VercelDomainService } from "../../src/services/vercel-domain.service";

describe("VercelDomainService Suite", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    process.env = {
      ...originalEnv,
      VERCEL_TOKEN: "test-vercel-token",
      VERCEL_PROJECT_ID: "prj_test123",
      VERCEL_TEAM_ID: "team_test456",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("addDomainToProject", () => {
    it("falls back to DNS verification when VERCEL_TOKEN or VERCEL_PROJECT_ID is missing", async () => {
      delete process.env.VERCEL_TOKEN;
      delete process.env.VERCEL_PROJECT_ID;

      mockResolver.resolve4.mockResolvedValueOnce(["76.76.21.21"]);

      const res = await VercelDomainService.addDomainToProject("damcuoiviet.com");

      expect(fetchMock).not.toHaveBeenCalled();
      expect(mockResolver.setServers).toHaveBeenCalledWith(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);
      expect(res.verified).toBe(true);
      expect(res.recommendedARecord).toBe("76.76.21.21");
    });

    it("registers Apex domain on Vercel and fires auto-registration for www variant", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "damcuoiviet.com",
          apexName: "damcuoiviet.com",
          verified: true,
        }),
      });

      const res = await VercelDomainService.addDomainToProject("damcuoiviet.com");

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("https://api.vercel.com/v10/projects/prj_test123/domains?teamId=team_test456"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-vercel-token",
          }),
          body: JSON.stringify({ name: "damcuoiviet.com" }),
        })
      );

      expect(res.verified).toBe(true);
      expect(res.configured).toBe(true);
    });

    it("handles domain_already_exists error gracefully by calling verifyDomainOnVercel", async () => {
      // First call fails with domain_already_exists
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { code: "domain_already_exists", message: "Domain already exists" },
        }),
      });
      // Second call (verify) succeeds
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "damcuoiviet.com",
          verified: true,
        }),
      });

      const res = await VercelDomainService.addDomainToProject("damcuoiviet.com");

      expect(res.verified).toBe(true);
    });

    it("returns error message when Vercel API rejects domain with 400 or other errors", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { code: "invalid_domain", message: "Tên miền không hợp lệ trên hệ thống Vercel" },
        }),
      });

      const res = await VercelDomainService.addDomainToProject("invalid-domain-syntax");

      expect(res.verified).toBe(false);
      expect(res.errorMessage).toBe("Tên miền không hợp lệ trên hệ thống Vercel");
    });
  });

  describe("verifyDomainOnVercel", () => {
    it("verifies successfully and checks SSL configuration", async () => {
      // 1. Verify endpoint response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "damcuoiviet.com",
          verified: true,
        }),
      });
      // 2. Config endpoint response for SSL
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          misconfigured: false,
          configuredBy: "CNAME",
        }),
      });

      const res = await VercelDomainService.verifyDomainOnVercel("damcuoiviet.com");

      expect(res.verified).toBe(true);
      expect(res.sslIssued).toBe(true);
    });

    it("falls back to DNS resolver if Vercel verification returns false", async () => {
      // Vercel returns not verified yet
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: "damcuoiviet.com",
          verified: false,
        }),
      });
      // DNS Resolver resolves CNAME
      mockResolver.resolveCname.mockResolvedValueOnce(["cname.vercel-dns.com"]);

      const res = await VercelDomainService.verifyDomainOnVercel("damcuoiviet.com");

      expect(res.verified).toBe(true);
    });
  });

  describe("removeDomainFromProject", () => {
    it("deletes main domain and attempts to delete www variant for Apex domain", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const success = await VercelDomainService.removeDomainFromProject("damcuoiviet.com");

      expect(success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/domains/damcuoiviet.com?teamId=team_test456"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("returns true immediately if Vercel is not configured", async () => {
      delete process.env.VERCEL_TOKEN;
      const success = await VercelDomainService.removeDomainFromProject("damcuoiviet.com");
      expect(success).toBe(true);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("verifyDnsFallback", () => {
    it("verifies via TXT token record _wst-verify.<domain>", async () => {
      const secretToken = "wst_tok_random_123456";
      mockResolver.resolveTxt.mockResolvedValueOnce([[secretToken]]);

      const res = await VercelDomainService.verifyDnsFallback("damcuoiviet.com", secretToken);

      expect(mockResolver.resolveTxt).toHaveBeenCalledWith("_wst-verify.damcuoiviet.com");
      expect(res.verified).toBe(true);
    });

    it("verifies via CNAME record when pointing to vercel-dns.com", async () => {
      mockResolver.resolveTxt.mockRejectedValueOnce(new Error("ENOTFOUND"));
      mockResolver.resolveCname.mockResolvedValueOnce(["cname.vercel-dns.com."]);

      const res = await VercelDomainService.verifyDnsFallback("thiep.damcuoi.vn");

      expect(res.verified).toBe(true);
      expect(res.configured).toBe(true);
    });

    it("verifies via A record when pointing to 76.76.21.21", async () => {
      mockResolver.resolveTxt.mockRejectedValueOnce(new Error("ENOTFOUND"));
      mockResolver.resolveCname.mockRejectedValueOnce(new Error("ENOTFOUND"));
      mockResolver.resolve4.mockResolvedValueOnce(["76.76.21.21"]);

      const res = await VercelDomainService.verifyDnsFallback("damcuoiviet.com");

      expect(res.verified).toBe(true);
    });

    it("returns unverified with helpful error message when all DNS checks fail", async () => {
      mockResolver.resolveTxt.mockRejectedValueOnce(new Error("ENOTFOUND"));
      mockResolver.resolveCname.mockRejectedValueOnce(new Error("ENOTFOUND"));
      mockResolver.resolve4.mockRejectedValueOnce(new Error("ENOTFOUND"));

      const res = await VercelDomainService.verifyDnsFallback("chua-cau-hinh-dns.com");

      expect(res.verified).toBe(false);
      expect(res.errorMessage).toContain("Chưa nhận diện bản ghi DNS");
    });
  });
});
