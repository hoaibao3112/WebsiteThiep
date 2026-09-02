import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routes = readFileSync(resolve(process.cwd(), "src/routes/api.router.ts"), "utf8");

describe("card routes", () => {
  it("exposes owner read, slug availability, publish and permanent delete", () => {
    expect(routes).toContain('get("/cards/slug-availability"');
    expect(routes).toContain('get("/cards/:id"');
    expect(routes).toContain('delete("/cards/:id"');
    expect(routes.indexOf('get("/cards/slug-availability"')).toBeLessThan(
      routes.indexOf('get("/cards/:id"')
    );
  });
});

describe("guest routes", () => {
  it("exposes CRUD, import and idempotent delivery endpoints", () => {
    expect(routes).toContain('post("/cards/:cardId/guests"');
    expect(routes).toContain('put("/cards/:cardId/guests/:guestId"');
    expect(routes).toContain('patch("/cards/:cardId/guests/:guestId/delivery"');
    expect(routes).toContain('delete("/cards/:cardId/guests/:guestId"');
  });
});
