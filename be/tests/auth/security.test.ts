import { describe, expect, it, vi } from "vitest";
import { isOriginAllowed, parseAllowedOrigins } from "../../src/config/security";
import { csrfGuard } from "../../src/middlewares/csrf.middleware";

describe("credentialed CORS", () => {
  it("allows only exact configured origins", () => {
    const origins = parseAllowedOrigins("https://cardvite.vn,https://app.cardvite.vn");

    expect(isOriginAllowed("https://app.cardvite.vn", origins)).toBe(true);
    expect(isOriginAllowed("https://evil.vercel.app", origins)).toBe(false);
    expect(isOriginAllowed("https://app.cardvite.vn.evil.test", origins)).toBe(false);
  });

  it("rejects wildcard origins", () => {
    expect(() => parseAllowedOrigins("*")).toThrow("wildcard");
  });
});

describe("csrfGuard", () => {
  function invoke(overrides: Record<string, unknown>) {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const next = vi.fn();
    const req = {
      method: "POST",
      path: "/cards",
      cookies: { auth_token: "jwt", csrf_token: "csrf-value" },
      headers: {},
      header(name: string) {
        return (this.headers as Record<string, string>)[name.toLowerCase()];
      },
      ...overrides,
    };

    csrfGuard(req as never, { status, json } as never, next);
    return { status, json, next };
  }

  it("rejects cookie-authenticated mutations without a CSRF header", () => {
    const { status, next } = invoke({});

    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts a matching double-submit token", () => {
    const { next } = invoke({ headers: { "x-csrf-token": "csrf-value" } });

    expect(next).toHaveBeenCalledOnce();
  });

  it("allows bearer-only mutations without CSRF", () => {
    const { next } = invoke({
      cookies: {},
      headers: { authorization: "Bearer mobile-token" },
    });

    expect(next).toHaveBeenCalledOnce();
  });
});
