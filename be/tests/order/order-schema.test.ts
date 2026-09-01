import { describe, expect, it } from "vitest";
import {
  CreateOrderSchema,
  SepayWebhookPayloadSchema,
} from "../../src/lib/validators/order.schema";

const validWebhook = {
  id: 92704,
  gateway: "Vietcombank",
  transactionDate: "2026-08-31 12:00:00",
  accountNumber: "1017588888",
  content: "THIEP123456 chuyen tien",
  transferType: "in",
  transferAmount: 399000,
};

describe("CreateOrderSchema", () => {
  it("accepts only identifiers needed to recalculate price on the server", () => {
    const parsed = CreateOrderSchema.parse({
      cardId: "card-1",
      planId: "plan-1",
      amount: 1,
    });

    expect(parsed).toEqual({ cardId: "card-1", planId: "plan-1" });
  });
});

describe("SepayWebhookPayloadSchema", () => {
  it("accepts an incoming transfer", () => {
    expect(SepayWebhookPayloadSchema.safeParse(validWebhook).success).toBe(true);
  });

  it("rejects an outgoing transfer", () => {
    const result = SepayWebhookPayloadSchema.safeParse({
      ...validWebhook,
      transferType: "out",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a zero or negative transfer amount", () => {
    expect(
      SepayWebhookPayloadSchema.safeParse({
        ...validWebhook,
        transferAmount: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid transaction timestamp", () => {
    expect(
      SepayWebhookPayloadSchema.safeParse({
        ...validWebhook,
        transactionDate: "not-a-date",
      }).success,
    ).toBe(false);
  });
});
