import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(
  resolve(process.cwd(), "prisma", "schema.prisma"),
  "utf8",
);

describe("tenant schema", () => {
  it("defines accounts and memberships", () => {
    expect(schema).toContain("model Account {");
    expect(schema).toContain("model AccountMember {");
    expect(schema).toContain("@@unique([accountId, userId])");
  });

  it.each([
    "Card",
    "CardEvent",
    "CardPhoto",
    "Guest",
    "RsvpResponse",
    "Wish",
    "Order",
    "PaymentTransaction",
  ])("requires accountId on tenant-owned model %s", (modelName) => {
    const model = schema.match(
      new RegExp(`model ${modelName} \\{([\\s\\S]*?)\\n\\}`),
    )?.[1];

    expect(model, `${modelName} model must exist`).toBeDefined();
    expect(model).toMatch(/accountId\s+String\b/);
  });

  it("uniquely scopes order idempotency to an account", () => {
    const orderModel = schema.match(/model Order \{([\s\S]*?)\n\}/)?.[1];

    expect(orderModel).toContain("idempotencyKey");
    expect(orderModel).toContain("pollingTokenHash");
    expect(orderModel).toContain("@@unique([accountId, idempotencyKey])");
  });
});
