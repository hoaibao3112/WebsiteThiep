import dns from "node:dns/promises";
import { logger } from "../lib/logger";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || "";
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || "";
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || "";

export interface VercelDomainVerificationResult {
  verified: boolean;
  configured: boolean;
  sslIssued: boolean;
  recommendedCname: string;
  recommendedARecord: string;
  errorMessage?: string;
}

export class VercelDomainService {
  private static isConfigured(): boolean {
    return Boolean(VERCEL_TOKEN && VERCEL_PROJECT_ID);
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    };
  }

  private static appendTeamId(url: string): string {
    if (!VERCEL_TEAM_ID) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}teamId=${encodeURIComponent(VERCEL_TEAM_ID)}`;
  }

  /**
   * Đăng ký tên miền mới vào Vercel Project
   */
  static async addDomainToProject(domain: string): Promise<VercelDomainVerificationResult> {
    if (!this.isConfigured()) {
      logger.info({ domain }, "VERCEL_TOKEN or VERCEL_PROJECT_ID is not configured. Using local DNS fallback.");
      return this.verifyDnsFallback(domain);
    }

    try {
      const url = this.appendTeamId(
        `https://api.vercel.com/v10/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}/domains`
      );

      const res = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ name: domain }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Nếu domain đã tồn tại trong project rồi thì tiếp tục kiểm tra verification
        if (data.error?.code === "domain_already_in_use" || data.error?.code === "domain_already_exists") {
          return this.verifyDomainOnVercel(domain);
        }
        logger.warn({ domain, error: data.error }, "Vercel add domain returned non-ok status");
        return {
          verified: false,
          configured: false,
          sslIssued: false,
          recommendedCname: "cname.vercel-dns.com",
          recommendedARecord: "76.76.21.21",
          errorMessage: data.error?.message || "Không thể đăng ký tên miền với Vercel",
        };
      }

      return {
        verified: Boolean(data.verified),
        configured: Boolean(data.apexName || data.name),
        sslIssued: false,
        recommendedCname: "cname.vercel-dns.com",
        recommendedARecord: "76.76.21.21",
      };
    } catch (err: unknown) {
      logger.error({ domain, err }, "Error connecting to Vercel Domains API");
      return this.verifyDnsFallback(domain);
    }
  }

  /**
   * Kiểm tra và yêu cầu Vercel xác thực DNS & cấp SSL
   */
  static async verifyDomainOnVercel(domain: string): Promise<VercelDomainVerificationResult> {
    if (!this.isConfigured()) {
      return this.verifyDnsFallback(domain);
    }

    try {
      const verifyUrl = this.appendTeamId(
        `https://api.vercel.com/v9/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}/domains/${encodeURIComponent(domain)}/verify`
      );

      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: this.getHeaders(),
      });

      const data = await res.json();
      const verified = Boolean(data.verified);

      // Kiểm tra trạng thái SSL cert
      let sslIssued = false;
      try {
        const configUrl = this.appendTeamId(
          `https://api.vercel.com/v6/domains/${encodeURIComponent(domain)}/config`
        );
        const configRes = await fetch(configUrl, { headers: this.getHeaders() });
        if (configRes.ok) {
          const configData = await configRes.json();
          sslIssued = !configData.misconfigured && Boolean(configData.configuredBy);
        }
      } catch {
        // non-blocking
      }

      return {
        verified,
        configured: verified,
        sslIssued: sslIssued || verified,
        recommendedCname: "cname.vercel-dns.com",
        recommendedARecord: "76.76.21.21",
        errorMessage: !verified && data.error ? data.error.message : undefined,
      };
    } catch (err: unknown) {
      logger.error({ domain, err }, "Error verifying domain on Vercel");
      return this.verifyDnsFallback(domain);
    }
  }

  /**
   * Xóa tên miền khỏi Vercel Project
   */
  static async removeDomainFromProject(domain: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return true;
    }

    try {
      const url = this.appendTeamId(
        `https://api.vercel.com/v9/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}/domains/${encodeURIComponent(domain)}`
      );

      const res = await fetch(url, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      return res.ok;
    } catch (err: unknown) {
      logger.error({ domain, err }, "Error removing domain from Vercel");
      return false;
    }
  }

  /**
   * Cơ chế kiểm tra DNS độc lập qua Node.js (Fallback khi chưa có API Vercel)
   */
  static async verifyDnsFallback(domain: string): Promise<VercelDomainVerificationResult> {
    try {
      let isCnameValid = false;
      let isAValid = false;

      // 1. Kiểm tra bản ghi CNAME
      try {
        const cnames = await dns.resolveCname(domain);
        if (cnames.some((c) => c.toLowerCase().includes("vercel-dns.com") || c.toLowerCase().includes("websitethiep.com"))) {
          isCnameValid = true;
        }
      } catch {
        // Domain có thể trỏ bản ghi A thay vì CNAME
      }

      // 2. Kiểm tra bản ghi A
      try {
        const aRecords = await dns.resolve4(domain);
        if (aRecords.includes("76.76.21.21")) {
          isAValid = true;
        }
      } catch {
        // Bỏ qua nếu không có bản ghi A
      }

      const isResolved = isCnameValid || isAValid;

      return {
        verified: isResolved,
        configured: isResolved,
        sslIssued: isResolved,
        recommendedCname: "cname.vercel-dns.com",
        recommendedARecord: "76.76.21.21",
        errorMessage: isResolved ? undefined : "Chưa tìm thấy bản ghi DNS CNAME hoặc A trỏ về hệ thống",
      };
    } catch (err: unknown) {
      return {
        verified: false,
        configured: false,
        sslIssued: false,
        recommendedCname: "cname.vercel-dns.com",
        recommendedARecord: "76.76.21.21",
        errorMessage: "Không thể kiểm tra DNS tên miền lúc này",
      };
    }
  }
}
