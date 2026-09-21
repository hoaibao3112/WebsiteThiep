import { describe, expect, it } from "vitest";
import { validateRuntimeEnv } from "../../src/config/env";

describe("production environment validation", () => {
  it("fails startup when security-critical configuration is missing", () => {
    expect(() => validateRuntimeEnv({ NODE_ENV: "production" })).toThrow("JWT_SECRET");
  });
});
