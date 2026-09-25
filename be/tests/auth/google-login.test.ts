import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const googleClientMock = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken = googleClientMock.verifyIdToken;
  },
}));

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  accountMember: {
    findFirst: vi.fn(),
    create: vi.fn(),
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

import { AuthService } from "../../src/services/auth.service";
import { HttpError } from "../../src/lib/http-error";

describe("AuthService.googleLogin", () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = "mock-google-client-id.apps.googleusercontent.com";
  });

  afterEach(() => {
    process.env.GOOGLE_CLIENT_ID = originalClientId;
  });

  it("throws 503 GOOGLE_AUTH_NOT_CONFIGURED when GOOGLE_CLIENT_ID is not configured", async () => {
    delete process.env.GOOGLE_CLIENT_ID;

    await expect(AuthService.googleLogin("mock-id-token")).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.statusCode).toBe(503);
      expect(httpErr.code).toBe("GOOGLE_AUTH_NOT_CONFIGURED");
      return true;
    });
  });

  it("throws 401 INVALID_GOOGLE_TOKEN when verifyIdToken fails", async () => {
    googleClientMock.verifyIdToken.mockRejectedValueOnce(new Error("Token expired"));

    await expect(AuthService.googleLogin("invalid-token")).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.statusCode).toBe(401);
      expect(httpErr.code).toBe("INVALID_GOOGLE_TOKEN");
      return true;
    });
  });

  it("throws 401 GOOGLE_EMAIL_MISSING when payload has no email", async () => {
    googleClientMock.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({ email: null }),
    });

    await expect(AuthService.googleLogin("no-email-token")).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.statusCode).toBe(401);
      expect(httpErr.code).toBe("GOOGLE_EMAIL_MISSING");
      return true;
    });
  });

  it("throws 401 GOOGLE_EMAIL_NOT_VERIFIED when email_verified is not true", async () => {
    googleClientMock.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        email: "unverified@example.com",
        email_verified: false,
      }),
    });

    await expect(AuthService.googleLogin("unverified-email-token")).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.statusCode).toBe(401);
      expect(httpErr.code).toBe("GOOGLE_EMAIL_NOT_VERIFIED");
      return true;
    });
  });

  it("creates new user and returns JWT token when user does not exist", async () => {
    googleClientMock.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        sub: "google-sub-123",
        email: "newuser@example.com",
        email_verified: true,
        name: "Google New User",
        picture: "https://example.com/avatar.jpg",
      }),
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      id: "u-google-1",
      email: "newuser@example.com",
      name: "Google New User",
      avatar: "https://example.com/avatar.jpg",
      googleId: "google-sub-123",
      emailVerified: true,
      role: "USER",
      password: null,
      phone: null,
    });
    prismaMock.accountMember.findFirst.mockResolvedValueOnce({
      accountId: "acc-google-1",
    });

    const result = await AuthService.googleLogin("valid-token");

    expect(result.user).toEqual({
      id: "u-google-1",
      email: "newuser@example.com",
      name: "Google New User",
      avatar: "https://example.com/avatar.jpg",
      phone: null,
      role: "USER",
      emailVerified: true,
      hasPassword: false,
    });
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "newuser@example.com",
        name: "Google New User",
        avatar: "https://example.com/avatar.jpg",
        googleId: "google-sub-123",
        emailVerified: true,
        role: "USER",
        password: null,
      },
    });
  });

  it("links Google ID and updates existing user when email already exists", async () => {
    googleClientMock.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        sub: "google-sub-456",
        email: "existing@example.com",
        email_verified: true,
        name: "Existing User",
        picture: "https://example.com/new-avatar.jpg",
      }),
    });

    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "u-existing-1",
      email: "existing@example.com",
      name: "Existing User",
      avatar: null,
      googleId: null,
      emailVerified: false,
      role: "USER",
      password: "hashed-password",
      phone: "0987654321",
    });

    prismaMock.user.update.mockResolvedValueOnce({
      id: "u-existing-1",
      email: "existing@example.com",
      name: "Existing User",
      avatar: "https://example.com/new-avatar.jpg",
      googleId: "google-sub-456",
      emailVerified: true,
      role: "USER",
      password: "hashed-password",
      phone: "0987654321",
    });

    prismaMock.accountMember.findFirst.mockResolvedValueOnce({
      accountId: "acc-existing-1",
    });

    const result = await AuthService.googleLogin("valid-token-existing");

    expect(result.user.emailVerified).toBe(true);
    expect(result.user.hasPassword).toBe(true);
    expect(result.user.avatar).toBe("https://example.com/new-avatar.jpg");
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u-existing-1" },
      data: {
        googleId: "google-sub-456",
        emailVerified: true,
        avatar: "https://example.com/new-avatar.jpg",
        name: "Existing User",
      },
    });
  });
});
