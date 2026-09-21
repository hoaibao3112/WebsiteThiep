import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("worker process separation", () => {
  it("does not start BullMQ workers from the HTTP server", () => {
    const server = readFileSync(resolve(process.cwd(), "src/server.ts"), "utf8");
    expect(server).not.toContain('import "./queues/workers/mail.worker"');
  });

  it("provides a dedicated worker entrypoint", () => {
    const worker = readFileSync(resolve(process.cwd(), "src/worker.ts"), "utf8");
    expect(worker).toContain("mail.worker");
    expect(worker).toContain("rsvp-notification.worker");
  });
});

describe("proxy-aware client identity", () => {
  it("uses Express req.ip instead of trusting raw forwarded headers", () => {
    const server = readFileSync(resolve(process.cwd(), "src/server.ts"), "utf8");
    const auth = readFileSync(resolve(process.cwd(), "src/controllers/auth.controller.ts"), "utf8");
    const rsvp = readFileSync(resolve(process.cwd(), "src/controllers/rsvp.controller.ts"), "utf8");
    const wish = readFileSync(resolve(process.cwd(), "src/controllers/wish.controller.ts"), "utf8");
    expect(server).toContain('app.set("trust proxy", 1)');
    expect(auth + rsvp + wish).not.toContain('headers["x-forwarded-for"]');
  });
});
