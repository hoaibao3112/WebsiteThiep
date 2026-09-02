import { describe, expect, it } from "vitest";
import { CreateGuestSchema, DeliveryStatusSchema, ImportGuestsSchema, ListGuestsQuerySchema } from "../../src/lib/validators/guest";

describe("guest validators", () => {
  it("trims guest input and rejects oversized imports", () => {
    expect(CreateGuestSchema.parse({ fullName: "  Anh Nam  " }).fullName).toBe("Anh Nam");
    expect(() => ImportGuestsSchema.parse({ guests: Array.from({ length: 501 }, () => ({ fullName: "Anh Nam" })) })).toThrow();
  });

  it("uses bounded pagination and explicit delivery states", () => {
    expect(ListGuestsQuerySchema.parse({ page: "2", pageSize: "50" })).toMatchObject({ page: 2, pageSize: 50 });
    expect(DeliveryStatusSchema.parse({ status: "CONFIRMED_SENT" })).toEqual({ status: "CONFIRMED_SENT" });
    expect(() => DeliveryStatusSchema.parse({ status: "SENT" })).toThrow();
  });
});
