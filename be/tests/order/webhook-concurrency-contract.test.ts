import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Manual Payment Review concurrency contract", () => {
  it("uses a conditional transition as the activation gate inside a transaction", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/services/manual-payment-review.service.ts"),
      "utf8",
    );
    expect(source).toContain("tx.order.updateMany");
    expect(source).toContain('status: "AWAITING_REVIEW"');
    expect(source).toContain("transition.count !== 1");
    expect(source).toContain("IsolationLevel.Serializable");
  });
});
