import { z } from "zod";

const BLOCKED_DOMAINS = [
  "localhost",
  "vercel.app",
  "websitethiep.com",
  "websitethiep.vn",
  "zenlove.me",
  "google.com",
  "facebook.com",
];

export const CreateCustomDomainSchema = z.object({
  cardId: z.string().min(1, "Vui lòng chọn thiệp cần kết nối tên miền"),
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Tên miền quá ngắn")
    .max(120, "Tên miền không được vượt quá 120 ký tự")
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
      "Tên miền không hợp lệ. Vui lòng nhập định dạng chuẩn (ví dụ: damcuoilongngoc.com hoặc wedding.longngoc.vn)"
    )
    .refine(
      (d) => !BLOCKED_DOMAINS.some((blocked) => d === blocked || d.endsWith(`.${blocked}`)),
      "Không thể sử dụng tên miền hệ thống hoặc tên miền nội bộ"
    ),
});

export type CreateCustomDomainInput = z.infer<typeof CreateCustomDomainSchema>;

export const UpdateCardSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Đường dẫn (slug) tối thiểu 3 ký tự")
    .max(60, "Đường dẫn (slug) tối đa 60 ký tự")
    .regex(
      /^[a-z0-9-]+$/,
      "Đường dẫn chỉ được chứa chữ cái thường không dấu, số và dấu gạch ngang (VD: hoanglong-baongoc)"
    ),
});

export type UpdateCardSlugInput = z.infer<typeof UpdateCardSlugSchema>;
