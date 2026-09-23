import { z } from "zod";

// ────────────────────────────────────────────────────────────
// OWNER: Create account-level Order
// ────────────────────────────────────────────────────────────

export const CreateOrderSchema = z.object({
  planCode: z.enum(["BASIC", "VIP"], {
    errorMap: () => ({ message: "Gói dịch vụ phải là BASIC hoặc VIP" }),
  }),
}).strict();

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ────────────────────────────────────────────────────────────
// OWNER: Submit transfer confirmation
// ────────────────────────────────────────────────────────────

export const SubmitTransferParamsSchema = z.object({
  orderId: z.string().min(1, "orderId không hợp lệ"),
});

export type SubmitTransferParams = z.infer<typeof SubmitTransferParamsSchema>;

// ────────────────────────────────────────────────────────────
// ADMIN: Approve order
// ────────────────────────────────────────────────────────────

export const ApproveOrderSchema = z.object({
  receivedAmount: z.number().int().positive("Số tiền phải là số nguyên dương"),
  bankReference: z.string().trim().max(100).optional(),
  note: z.string().trim().max(500).optional(),
}).strict();

export type ApproveOrderInput = z.infer<typeof ApproveOrderSchema>;

// ────────────────────────────────────────────────────────────
// ADMIN: Reject order
// ────────────────────────────────────────────────────────────

export const RejectOrderSchema = z.object({
  reason: z.string().min(5, "Lý do từ chối phải ít nhất 5 ký tự").max(500),
}).strict();

export type RejectOrderInput = z.infer<typeof RejectOrderSchema>;

// ────────────────────────────────────────────────────────────
// ADMIN: List query params
// ────────────────────────────────────────────────────────────

export const AdminListQuerySchema = z.object({
  status: z.enum(["AWAITING_REVIEW", "PAID", "REJECTED", "PENDING", "EXPIRED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type AdminListQuery = z.infer<typeof AdminListQuerySchema>;

// ────────────────────────────────────────────────────────────
// Legacy: SePay webhook (kept for backward compatibility during transition)
// ────────────────────────────────────────────────────────────

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
