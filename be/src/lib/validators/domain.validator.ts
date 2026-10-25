import { z } from "zod";

const BLOCKED_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "vercel.app",
  "websitethiep.com",
  "websitethiep.vn",
  "zenlove.me",
  "google.com",
  "facebook.com",
];

export const RESERVED_SLUGS = new Set([
  "api",
  "app",
  "admin",
  "dashboard",
  "login",
  "register",
  "auth",
  "pricing",
  "collections",
  "concierge",
  "thiep",
  "thiep-domain",
  "s",
  "robots",
  "sitemap",
  "favicon",
  "null",
  "undefined",
  "support",
  "contact",
  "terms",
  "privacy",
  "static",
  "public",
  "domain",
  "domains",
  "card",
  "cards",
  "settings",
  "billing",
]);

export interface DomainTypeInfo {
  isApex: boolean;
  hostName: string;
  apexDomain: string;
}

/**
 * Phân tích cấu trúc tên miền xem là Apex Domain hay Subdomain
 * Hỗ trợ các đuôi phổ biến như .com, .vn, .com.vn, .net.vn
 */
export function detectDomainType(rawDomain: string): DomainTypeInfo {
  const domain = rawDomain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const parts = domain.split(".");

  // Danh sách TLD kép phổ biến tại VN
  const doubleTlds = new Set(["com.vn", "net.vn", "org.vn", "edu.vn", "gov.vn"]);

  let isApex = false;
  let hostName = "@";
  let apexDomain = domain;

  if (parts.length >= 2) {
    const lastTwo = parts.slice(-2).join(".");
    if (doubleTlds.has(lastTwo)) {
      if (parts.length === 3) {
        // VD: example.com.vn
        isApex = true;
        hostName = "@";
        apexDomain = domain;
      } else {
        // VD: wedding.example.com.vn
        isApex = false;
        hostName = parts.slice(0, parts.length - 3).join(".");
        apexDomain = parts.slice(-3).join(".");
      }
    } else {
      if (parts.length === 2) {
        // VD: example.com hoặc example.vn
        isApex = true;
        hostName = "@";
        apexDomain = domain;
      } else {
        // VD: wedding.example.com hoặc www.example.com
        isApex = false;
        hostName = parts.slice(0, parts.length - 2).join(".");
        apexDomain = parts.slice(-2).join(".");
      }
    }
  }

  return { isApex, hostName, apexDomain };
}

export function sanitizeDomainInput(val: unknown): string {
  if (typeof val !== "string") return "";
  return val
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

export const CreateCustomDomainSchema = z.object({
  cardId: z.string().min(1, "Vui lòng chọn thiệp cần kết nối tên miền"),
  domain: z.preprocess(
    sanitizeDomainInput,
    z
      .string()
      .min(3, "Tên miền quá ngắn")
      .max(120, "Tên miền không được vượt quá 120 ký tự")
      .regex(
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
        "Tên miền không hợp lệ. Vui lòng nhập định dạng chuẩn (ví dụ: damcuoilongngoc.com hoặc wedding.longngoc.vn)"
      )
      .refine(
        (d) => !BLOCKED_DOMAINS.some((blocked) => d === blocked || d.endsWith(`.${blocked}`)),
        "Không thể sử dụng tên miền hệ thống hoặc tên miền nội bộ"
      )
  ),
});

export type CreateCustomDomainInput = z.infer<typeof CreateCustomDomainSchema>;

export const CardSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Đường dẫn (slug) tối thiểu 3 ký tự")
    .max(60, "Đường dẫn (slug) tối đa 60 ký tự")
    .regex(
      /^[a-z0-9-]+$/,
      "Đường dẫn chỉ được chứa chữ cái thường không dấu, số và dấu gạch ngang (VD: hoanglong-baongoc)"
    )
    .refine(
      (slug) => !RESERVED_SLUGS.has(slug),
      "Đường dẫn này thuộc danh sách hệ thống được bảo vệ. Vui lòng chọn tên khác."
    ),
});

export type CardSlugInput = z.infer<typeof CardSlugSchema>;
export const UpdateCardSlugSchema = CardSlugSchema;
export type UpdateCardSlugInput = CardSlugInput;
