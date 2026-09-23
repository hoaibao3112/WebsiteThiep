import { describe, expect, it } from "vitest";
import {
  CreateOrderSchema,
  SubmitTransferParamsSchema,
  ApproveOrderSchema,
  RejectOrderSchema,
} from "../../src/lib/validators/order.schema";

describe("CreateOrderSchema", () => {
  it("accepts valid planCode BASIC or VIP", () => {
    expect(CreateOrderSchema.parse({ planCode: "BASIC" })).toEqual({ planCode: "BASIC" });
    expect(CreateOrderSchema.parse({ planCode: "VIP" })).toEqual({ planCode: "VIP" });
  });

  it("rejects FREE plan purchase", () => {
    const result = CreateOrderSchema.safeParse({ planCode: "FREE" });
    expect(result.success).toBe(false);
  });

  it("rejects client-supplied price or cardId (strict validation)", () => {
    const result = CreateOrderSchema.safeParse({
      planCode: "VIP",
      amount: 1000,
      cardId: "card-123",
    });
    expect(result.success).toBe(false);
  });
});

describe("SubmitTransferParamsSchema", () => {
  it("validates orderId presence", () => {
    expect(SubmitTransferParamsSchema.parse({ orderId: "ord-1" })).toEqual({ orderId: "ord-1" });
    expect(SubmitTransferParamsSchema.safeParse({ orderId: "" }).success).toBe(false);
  });
});

describe("ApproveOrderSchema", () => {
  it("validates positive integer receivedAmount", () => {
    expect(ApproveOrderSchema.parse({ receivedAmount: 199000 })).toEqual({
      receivedAmount: 199000,
    });
    expect(ApproveOrderSchema.safeParse({ receivedAmount: -100 }).success).toBe(false);
    expect(ApproveOrderSchema.safeParse({ receivedAmount: 199000.5 }).success).toBe(false);
  });

  it("normalizes bank reference", () => {
    const parsed = ApproveOrderSchema.parse({
      receivedAmount: 399000,
      bankReference: "  FT24123456  ",
    });
    expect(parsed.bankReference).toBe("FT24123456");
  });
});

describe("RejectOrderSchema", () => {
  it("requires a non-empty reason", () => {
    expect(RejectOrderSchema.parse({ reason: "Sai số tiền" })).toEqual({ reason: "Sai số tiền" });
    expect(RejectOrderSchema.safeParse({ reason: "   " }).success).toBe(false);
    expect(RejectOrderSchema.safeParse({}).success).toBe(false);
  });
});
