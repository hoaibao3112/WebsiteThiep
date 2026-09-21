import { describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({ accountMember: { findUnique: vi.fn() } }));
vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/services/auth.service", () => ({
  AuthService: { verifyToken: () => ({ userId: "user-1", accountId: "account-1", role: "USER" }) },
}));
import { authGuard } from "../../src/middlewares/auth.middleware";

describe("authGuard tenant membership", () => {
  it("rejects a token whose account membership was revoked", async () => {
    prismaMock.accountMember.findUnique.mockResolvedValue(null);
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const next = vi.fn();

    await authGuard({ headers: { authorization: "Bearer token" }, cookies: {} } as never, { status, json } as never, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
