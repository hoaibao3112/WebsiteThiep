import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const otpMock = vi.hoisted(() => ({
  sendRegisterOtp: vi.fn(),
}));

const authMock = vi.hoisted(() => ({
  register: vi.fn(),
}));

vi.mock("../../src/services/otp.service", () => ({
  OtpService: otpMock,
}));

vi.mock("../../src/services/auth.service", () => ({
  AuthService: authMock,
}));

vi.mock("../../src/lib/redis", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    ttl: vi.fn().mockResolvedValue(-2),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue("OK"),
    on: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createTestHttpServer, TestHttpServer } from "../helpers/http-server";

describe("Auth HTTP routes contract", () => {
  let server: TestHttpServer;

  beforeAll(async () => {
    server = await createTestHttpServer();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/send-otp", () => {
    it("accepts valid request with explicit type REGISTER and passes data to service", async () => {
      otpMock.sendRegisterOtp.mockResolvedValueOnce({ cooldown: 60 });

      const res = await fetch(`${server.baseUrl}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com", type: "REGISTER" }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body).toEqual({
        success: true,
        message: expect.any(String),
        data: { cooldown: 60 },
      });
      expect(otpMock.sendRegisterOtp).toHaveBeenCalledWith("user@example.com", expect.any(String));
    });

    it("defaults type to REGISTER when omitted by client and succeeds", async () => {
      otpMock.sendRegisterOtp.mockResolvedValueOnce({ cooldown: 60 });

      const res = await fetch(`${server.baseUrl}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user-notype@example.com" }),
      });

      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(otpMock.sendRegisterOtp).toHaveBeenCalledWith(
        "user-notype@example.com",
        expect.any(String),
      );
    });

    it("rejects unsupported OTP type with 400", async () => {
      const res = await fetch(`${server.baseUrl}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com", type: "FORGOT_PASSWORD" }),
      });

      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(otpMock.sendRegisterOtp).not.toHaveBeenCalled();
    });

    it("rejects invalid email with 400", async () => {
      const res = await fetch(`${server.baseUrl}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email" }),
      });

      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(otpMock.sendRegisterOtp).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/register", () => {
    it("preserves name, phone, email, and password through router to service", async () => {
      authMock.register.mockResolvedValueOnce({
        user: {
          id: "u-1",
          email: "newuser@example.com",
          name: "Nguyen Van A",
          role: "USER",
          emailVerified: false,
          hasPassword: true,
        },
        token: "fake-jwt-token",
      });

      const res = await fetch(`${server.baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          password: "securepassword",
          name: "Nguyen Van A",
          phone: "0901234567",
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.user.name).toBe("Nguyen Van A");

      // Verify cookies set
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain("auth_token=");
      expect(setCookie).toContain("csrf_token=");

      // Verify service was called with full payload
      expect(authMock.register).toHaveBeenCalledWith(
        {
          email: "newuser@example.com",
          password: "securepassword",
          name: "Nguyen Van A",
          phone: "0901234567",
        },
        expect.any(String),
      );
    });

    it("rejects registration when name is missing with 400", async () => {
      const res = await fetch(`${server.baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "missingname@example.com",
          password: "securepassword",
        }),
      });

      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(authMock.register).not.toHaveBeenCalled();
    });

    it("strips client-injected tenant or role properties", async () => {
      authMock.register.mockResolvedValueOnce({
        user: {
          id: "u-2",
          email: "spoof@example.com",
          name: "Hacker",
          role: "USER",
          emailVerified: false,
          hasPassword: true,
        },
        token: "fake-jwt-token",
      });

      const res = await fetch(`${server.baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "spoof@example.com",
          password: "securepassword",
          name: "Hacker",
          role: "ADMIN",
          accountId: "victim-account-id",
        }),
      });

      expect(res.status).toBe(201);
      expect(authMock.register).toHaveBeenCalledWith(
        {
          email: "spoof@example.com",
          password: "securepassword",
          name: "Hacker",
        },
        expect.any(String),
      );
      // Ensure role / accountId were stripped and not passed to service
      const passedInput = authMock.register.mock.calls[0][0];
      expect(passedInput.role).toBeUndefined();
      expect(passedInput.accountId).toBeUndefined();
    });
  });
});
