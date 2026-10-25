import { describe, it, expect } from "vitest";
import {
  CreateCustomDomainSchema,
  CardSlugSchema,
  detectDomainType,
  RESERVED_SLUGS,
} from "../../src/lib/validators/domain.validator";

describe("Domain Validator & Edge Cases Suite", () => {
  describe("CreateCustomDomainSchema Validation & Normalization", () => {
    it("cleans up protocol, port, trailing slashes, and uppercase letters", () => {
      const input = {
        domain: "  HTTPS://My-Wedding.COM:8080/thiep/  ",
        cardId: "card-12345",
      };

      const parsed = CreateCustomDomainSchema.parse(input);
      expect(parsed.domain).toBe("my-wedding.com");
      expect(parsed.cardId).toBe("card-12345");
    });

    it("accepts valid Vietnamese and international TLDs", () => {
      const validDomains = [
        "damcuoiviet.vn",
        "long-ngoc.com.vn",
        "wedding.love",
        "our-forever.wedding",
        "sub.deptrai.damcuoi.vn",
      ];

      for (const d of validDomains) {
        const res = CreateCustomDomainSchema.safeParse({ domain: d, cardId: "card-1" });
        expect(res.success).toBe(true);
      }
    });

    it("rejects invalid domain formats", () => {
      const invalidDomains = [
        "invalid_domain.com", // gạch dưới trong domain
        "-startdash.com", // bắt đầu bằng dấu gạch ngang
        "enddash-.com", // kết thúc bằng dấu gạch ngang
        "has space.com", // chứa khoảng trắng giữa
        "tiếng-việt-có-dấu.vn", // ký tự có dấu chưa punycode
        "no-tld", // thiếu TLD
        "domain..double-dot.com", // 2 dấu chấm liên tiếp
      ];

      for (const d of invalidDomains) {
        const res = CreateCustomDomainSchema.safeParse({ domain: d, cardId: "card-1" });
        expect(res.success).toBe(false);
      }
    });

    it("rejects domain exceeding max RFC length (253 chars)", () => {
      const longDomain = `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(63)}.com`;
      expect(longDomain.length).toBeGreaterThan(253);

      const res = CreateCustomDomainSchema.safeParse({ domain: longDomain, cardId: "card-1" });
      expect(res.success).toBe(false);
    });
  });

  describe("CardSlugSchema & RESERVED_SLUGS Guard", () => {
    it("blocks reserved platform route slugs", () => {
      const dangerousSlugs = [
        "api",
        "dashboard",
        "admin",
        "auth",
        "login",
        "register",
        "billing",
        "thiep",
        "settings",
        "pricing",
      ];

      for (const slug of dangerousSlugs) {
        expect(RESERVED_SLUGS.has(slug)).toBe(true);
        const res = CardSlugSchema.safeParse({ slug });
        expect(res.success).toBe(false);
      }
    });

    it("accepts normal creative wedding slugs", () => {
      const goodSlugs = [
        "hoang-long-bao-ngoc-2026",
        "dam-cuoi-vang",
        "forever-together-1212",
        "ngoc-long-wedding",
      ];

      for (const slug of goodSlugs) {
        const res = CardSlugSchema.safeParse({ slug });
        expect(res.success).toBe(true);
      }
    });

    it("rejects slugs with uppercase or special symbols", () => {
      const badSlugs = ["DamCuoi2026", "long_ngoc", "long@ngoc", "dam-cuoi!"];
      for (const slug of badSlugs) {
        const res = CardSlugSchema.safeParse({ slug });
        expect(res.success).toBe(false);
      }
    });
  });

  describe("detectDomainType Complex Topologies", () => {
    it("handles double-suffix ccTLDs accurately (.net.vn, .edu.vn, .org.vn)", () => {
      const netVn = detectDomainType("wedding.net.vn");
      expect(netVn.isApex).toBe(true);
      expect(netVn.hostName).toBe("@");
      expect(netVn.apexDomain).toBe("wedding.net.vn");

      const subNetVn = detectDomainType("vip.wedding.net.vn");
      expect(subNetVn.isApex).toBe(false);
      expect(subNetVn.hostName).toBe("vip");
      expect(subNetVn.apexDomain).toBe("wedding.net.vn");
    });

    it("handles multi-level subdomains", () => {
      const deepSub = detectDomainType("a.b.c.longngoc.com");
      expect(deepSub.isApex).toBe(false);
      expect(deepSub.hostName).toBe("a.b.c");
      expect(deepSub.apexDomain).toBe("longngoc.com");
    });
  });
});
