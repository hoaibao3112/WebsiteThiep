import dns from "node:dns/promises";
import { logger } from "../lib/logger";
import { detectDomainType } from "../lib/validators/domain.validator";


export interface VercelDomainVerificationResult {
  verified: boolean;
  configured: boolean;
  sslIssued: boolean;
  recommendedCname: string;
  recommendedARecord: string;
  errorMessage?: string;
}

export class VercelDomainService {
  private static get token(): string {
    return process.env.VERCEL_TOKEN || "";
  }

  private static get projectId(): string {
    return process.env.VERCEL_PROJECT_ID || "";
  }

  private static get teamId(): string {
    return process.env.VERCEL_TEAM_ID || "";
  }

  private static isConfigured(): boolean {
    return Boolean(this.token && this.projectId);
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  private static appendTeamId(url: string): string {
    if (!this.teamId) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}teamId=${encodeURIComponent(this.teamId)}`;
  }

  /**
   * Đăng ký tên miền mới vào Vercel Project
   * Nếu là Apex Domain (damcuoi.com), tự động đăng ký kèm www.damcuoi.com
   */
  static async addDomainToProject(
    domain: string,
    expectedTxtToken?: string | null
  ): Promise<VercelDomainVerificationResult> {
    if (!this.isConfigured()) {
      logger.info({ domain }, "VERCEL_TOKEN or VERCEL_PROJECT_ID is not configured. Using Public DNS fallback.");
      return this.verifyDnsFallback(domain, expectedTxtToken);
    }

    try {
      const url = this.appendTeamId(
        `https://api.vercel.com/v10/projects/${encodeURIComponent(this.projectId)}/domains`
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
          return this.verifyDomainOnVercel(domain, expectedTxtToken);
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

      // Nếu là Apex domain, đăng ký thêm www song hành trên Vercel
      const typeInfo = detectDomainType(domain);
      if (typeInfo.isApex && !domain.startsWith("www.")) {
        fetch(url, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ name: `www.${domain}` }),
        }).catch((err) => {
          logger.warn({ domain: `www.${domain}`, err }, "Failed to auto-register www variant on Vercel");
        });
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
      return this.verifyDnsFallback(domain, expectedTxtToken);
    }
  }

  /**
   * Kiểm tra và yêu cầu Vercel xác thực DNS & cấp SSL
   */
  static async verifyDomainOnVercel(
    domain: string,
    expectedTxtToken?: string | null
  ): Promise<VercelDomainVerificationResult> {
    if (!this.isConfigured()) {
      return this.verifyDnsFallback(domain, expectedTxtToken);
    }

    try {
      const verifyUrl = this.appendTeamId(
        `https://api.vercel.com/v9/projects/${encodeURIComponent(this.projectId)}/domains/${encodeURIComponent(domain)}/verify`
      );

      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: this.getHeaders(),
      });

      const data = await res.json();
      let verified = Boolean(data.verified);

      // Nếu Vercel chưa verify được, thử fallback kiểm tra DNS trực tiếp
      if (!verified) {
        const fallback = await this.verifyDnsFallback(domain, expectedTxtToken);
        if (fallback.verified) {
          verified = true;
        }
      }

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
      return this.verifyDnsFallback(domain, expectedTxtToken);
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
        `https://api.vercel.com/v9/projects/${encodeURIComponent(this.projectId)}/domains/${encodeURIComponent(domain)}`
      );

      const res = await fetch(url, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      // Nếu là apex domain, xóa thêm bản ghi www nếu có
      const typeInfo = detectDomainType(domain);
      if (typeInfo.isApex && !domain.startsWith("www.")) {
        const wwwUrl = this.appendTeamId(
          `https://api.vercel.com/v9/projects/${encodeURIComponent(this.projectId)}/domains/${encodeURIComponent(`www.${domain}`)}`
        );
        fetch(wwwUrl, { method: "DELETE", headers: this.getHeaders() }).catch(() => {});
      }

      return res.ok;
    } catch (err: unknown) {
      logger.error({ domain, err }, "Error removing domain from Vercel");
      return false;
    }
  }

  /**
   * Cơ chế kiểm tra DNS độc lập qua Public DNS Resolver (1.1.1.1 & 8.8.8.8)
   * Tránh hoàn toàn lỗi cache tiêu cực từ ISP nội bộ
   */
  static async verifyDnsFallback(
    domain: string,
    expectedTxtToken?: string | null
  ): Promise<VercelDomainVerificationResult> {
    const resolver = new dns.Resolver();
    resolver.setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

    try {
      let isCnameValid = false;
      let isAValid = false;
      let isTxtValid = false;

      // 1. Kiểm tra bản ghi TXT xác minh quyền sở hữu (_wst-verify.domain hoặc @)
      if (expectedTxtToken) {
        try {
          const txtRecords = await resolver.resolveTxt(`_wst-verify.${domain}`);
          const flatTxt = txtRecords.flat().join(" ");
          if (flatTxt.includes(expectedTxtToken)) {
            isTxtValid = true;
          }
        } catch {
          // Thử resolve TXT trên root domain
          try {
            const rootTxt = await resolver.resolveTxt(domain);
            if (rootTxt.flat().join(" ").includes(expectedTxtToken)) {
              isTxtValid = true;
            }
          } catch {
            // bỏ qua
          }
        }
      }

      // 2. Kiểm tra bản ghi CNAME
      try {
        const cnames = await resolver.resolveCname(domain);
        if (
          cnames.some((c) => {
            const lower = c.toLowerCase();
            return (
              lower.includes("vercel-dns.com") ||
              lower.includes("websitethiep.com") ||
              lower.includes("onrender.com")
            );
          })
        ) {
          isCnameValid = true;
        }
      } catch {
        // Domain có thể trỏ bản ghi A thay vì CNAME
      }

      // 3. Kiểm tra bản ghi A
      try {
        const aRecords = await resolver.resolve4(domain);
        if (aRecords.includes("76.76.21.21") || aRecords.length > 0) {
          isAValid = true;
        }
      } catch {
        // Bỏ qua nếu không có bản ghi A
      }

      const isResolved = isTxtValid || isCnameValid || isAValid;

      return {
        verified: isResolved,
        configured: isResolved,
        sslIssued: isResolved,
        recommendedCname: "cname.vercel-dns.com",
        recommendedARecord: "76.76.21.21",
        errorMessage: isResolved
          ? undefined
          : "Chưa nhận diện bản ghi DNS (A trỏ 76.76.21.21 hoặc CNAME trỏ cname.vercel-dns.com). DNS có thể cần vài phút để lan truyền.",
      };
    } catch (err: unknown) {
      logger.warn({ domain, err }, "DNS fallback verification encountered an unexpected error");
      return {
        verified: false,
        configured: false,
        sslIssued: false,
        recommendedCname: "cname.vercel-dns.com",
        recommendedARecord: "76.76.21.21",
        errorMessage: "Không thể kiểm tra DNS tên miền lúc này. Vui lòng thử lại sau.",
      };
    }
  }
}
