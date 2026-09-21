import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("SePay concurrency contract", () => {
  it("uses a conditional pending-order transition as the activation gate", () => {
    const source = readFileSync(resolve(process.cwd(), "src/services/order.service.ts"), "utf8");
    expect(source).toContain("tx.order.updateMany");
    expect(source).toContain('status: "PENDING"');
    expect(source).toContain("transition.count !== 1");
  });
});
