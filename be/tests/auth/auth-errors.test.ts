import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  accountMember: {
    findFirst: vi.fn(),
  },
  plan: {
    findFirst: vi.fn(),
  },
  account: {
    create: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../../src/lib/redis", () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  },
}));

import bcrypt from "bcryptjs";
import { AuthService } from "../../src/services/auth.service";
import { HttpError } from "../../src/lib/http-error";

describe("AuthService error handling and edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login credentials security", () => {
    it("throws 401 with uniform message when email does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        AuthService.login({ email: "nonexistent@example.com", password: "some-password" })
      ).rejects.toSatisfy((err: unknown) => {
        expect(err).toBeInstanceOf(HttpError);
        const httpErr = err as HttpError;
        expect(httpErr.statusCode).toBe(401);
        expect(httpErr.message).toBe("Email hoặc mật khẩu không chính xác");
        expect(httpErr.code).toBe("INVALID_CREDENTIALS");
        return true;
      });
    });

    it("throws 401 with uniform message when user has no password set (e.g. OAuth only)", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: "u-oauth",
        email: "oauthonly@example.com",
        password: null,
      });

      await expect(
        AuthService.login({ email: "oauthonly@example.com", password: "any-password" })
      ).rejects.toSatisfy((err: unknown) => {
        expect(err).toBeInstanceOf(HttpError);
        const httpErr = err as HttpError;
        expect(httpErr.statusCode).toBe(401);
        expect(httpErr.message).toBe("Email hoặc mật khẩu không chính xác");
        expect(httpErr.code).toBe("INVALID_CREDENTIALS");
        return true;
      });
    });

    it("throws 401 with identical uniform message when password is wrong", async () => {
      const hashedPassword = await bcrypt.hash("correct-password", 10);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: "u-1",
        email: "user@example.com",
        password: hashedPassword,
        name: "Test User",
        role: "USER",
      });

      await expect(
        AuthService.login({ email: "user@example.com", password: "wrong-password" })
      ).rejects.toSatisfy((err: unknown) => {
        expect(err).toBeInstanceOf(HttpError);
        const httpErr = err as HttpError;
        expect(httpErr.statusCode).toBe(401);
        expect(httpErr.message).toBe("Email hoặc mật khẩu không chính xác");
        expect(httpErr.code).toBe("INVALID_CREDENTIALS");
        return true;
      });
    });

    it("allows email/password login even when GOOGLE_CLIENT_ID is not configured", async () => {
      const originalGoogleId = process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_ID;

      try {
        const hashedPassword = await bcrypt.hash("my-secret-pass", 10);
        prismaMock.user.findUnique.mockResolvedValueOnce({
          id: "u-standard",
          email: "standard@example.com",
          password: hashedPassword,
          name: "Standard User",
          role: "USER",
          emailVerified: true,
        });
        prismaMock.accountMember.findFirst.mockResolvedValueOnce({
          accountId: "acc-standard-1",
        });

        const result = await AuthService.login({
          email: "standard@example.com",
          password: "my-secret-pass",
        });

        expect(result.user.id).toBe("u-standard");
        expect(result.token).toBeDefined();
      } finally {
        process.env.GOOGLE_CLIENT_ID = originalGoogleId;
      }
    });
  });

  describe("registration conflicts", () => {
    it("throws 409 EMAIL_ALREADY_EXISTS when email is already registered", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: "u-existing",
        email: "existing@example.com",
      });

      await expect(
        AuthService.register({
          email: "existing@example.com",
          password: "password123",
          name: "Duplicate User",
        })
      ).rejects.toSatisfy((err: unknown) => {
        expect(err).toBeInstanceOf(HttpError);
        const httpErr = err as HttpError;
        expect(httpErr.statusCode).toBe(409);
        expect(httpErr.code).toBe("EMAIL_ALREADY_EXISTS");
        return true;
      });
    });

    it("propagates unexpected database failure as an error", async () => {
      prismaMock.user.findUnique.mockRejectedValueOnce(new Error("Database connection lost"));

      await expect(
        AuthService.register({
          email: "error@example.com",
          password: "password123",
          name: "Db Error User",
        })
      ).rejects.toThrow("Database connection lost");
    });
  });
});
