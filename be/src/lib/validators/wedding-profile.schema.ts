import { z } from "zod";

/**
 * Schema validate dữ liệu hồ sơ cưới mặc định (Wedding Profile)
 * Lưu dạng JSON trong User.weddingProfile
 * .strict() chặn field lạ không cho client inject dữ liệu tùy ý
 */
export const WeddingProfileSchema = z.object({
  groomName: z.string().max(100).optional(),
  brideName: z.string().max(100).optional(),
  groomParents: z.string().max(200).optional(),
  brideParents: z.string().max(200).optional(),
  weddingDate: z.string().max(50).optional(),
  lunarDate: z.string().max(100).optional(),
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(300).optional(),
  groomAvatar: z.string().url().max(500).optional(),
  brideAvatar: z.string().url().max(500).optional(),
  groomPhone: z.string().max(20).optional(),
  bridePhone: z.string().max(20).optional(),
  groomBankInfo: z.object({
    bankCode: z.string().max(20).optional(),
    accountNumber: z.string().max(30).optional(),
    accountName: z.string().max(100).optional(),
  }).optional(),
  brideBankInfo: z.object({
    bankCode: z.string().max(20).optional(),
    accountNumber: z.string().max(30).optional(),
    accountName: z.string().max(100).optional(),
  }).optional(),
  greeting: z.string().max(1000).optional(),
}).strict();

export type WeddingProfileInput = z.infer<typeof WeddingProfileSchema>;
