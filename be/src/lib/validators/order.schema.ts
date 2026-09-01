import { z } from "zod";

export const CreateOrderSchema = z.object({
  cardId: z.string().min(1, "Mã thiệp không hợp lệ"),
  planId: z.string().min(1, "Mã gói dịch vụ không hợp lệ"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const SepayWebhookPayloadSchema = z.object({
  id: z.number().or(z.string()),
  gateway: z.string(),
  transactionDate: z.string().refine(
    (value) => !Number.isNaN(Date.parse(value.replace(" ", "T"))),
    "Thời gian giao dịch không hợp lệ",
  ),
  accountNumber: z.string(),
  code: z.string().nullable().optional(),
  content: z.string(),
  transferType: z.literal("in"),
  transferAmount: z.number().positive(),
  accumulated: z.number().optional(),
  subAccount: z.string().nullable().optional(),
  referenceCode: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type SepayWebhookPayload = z.infer<typeof SepayWebhookPayloadSchema>;
