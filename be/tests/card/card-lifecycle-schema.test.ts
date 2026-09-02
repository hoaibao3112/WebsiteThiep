import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
const cardModel = schema.match(/model Card \{([\s\S]*?)\n\}/)?.[1] ?? "";

describe("Card lifecycle persistence", () => {
  it("stores first-publish time and create idempotency per account", () => {
    expect(cardModel).toContain("publishedAt");
    expect(cardModel).toContain("createIdempotencyKey");
    expect(cardModel).toContain("@@unique([accountId, createIdempotencyKey])");
  });
});
