import { beforeEach, describe, expect, it, vi } from "vitest";

const redisMock = vi.hoisted(() => ({
  status: "ready",
  incr: vi.fn(),
  expire: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  ttl: vi.fn(),
}));

vi.mock("../../src/lib/redis", () => ({ redis: redisMock }));
vi.mock("../../src/lib/rate-limiter", () => ({ checkRateLimit: vi.fn() }));
vi.mock("../../src/services/mail.service", () => ({
  MailService: { sendOtpEmail: vi.fn() },
}));

// Set dummy JWT_SECRET for test
process.env.JWT_SECRET = "test-secret-key-for-otp-service-unit-test";

import { OtpService, hashOtp } from "../../src/services/otp.service";

describe("OtpService - Fix #9 (Atomic attempts & brute-force protection)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisMock.status = "ready";
  });

  it("cho phép verify thành công với mã đúng và xóa sạch OTP + attempts keys", async () => {
    const email = "user@test.com";
    const otp = "123456";
    const hashed = hashOtp(email, otp);

    redisMock.incr.mockResolvedValueOnce(1);
    redisMock.get.mockResolvedValueOnce(hashed);
    redisMock.del.mockResolvedValue(1);

    const result = await OtpService.verifyRegisterOtp(email, otp);
    expect(result).toBe(true);

    // Verify del được gọi cho cả 2 keys
    expect(redisMock.del).toHaveBeenCalledWith(`otp:register:${email}`);
    expect(redisMock.del).toHaveBeenCalledWith(`otp:attempts:${email}`);
  });

  it("Fix #9: INCR attempts trước và khóa ngay (400) khi attempts > 5 mà không cần so khớp hash", async () => {
    const email = "user@test.com";
    const otp = "123456";

    // Lần thử thứ 6
    redisMock.incr.mockResolvedValueOnce(6);

    await expect(OtpService.verifyRegisterOtp(email, otp)).rejects.toMatchObject({
      statusCode: 400,
      code: "OTP_MAX_ATTEMPTS_EXCEEDED",
    });

    // redis.get không cần gọi nữa vì đã bị lock out từ trước
    expect(redisMock.get).not.toHaveBeenCalled();
    // del được gọi để hủy mã
    expect(redisMock.del).toHaveBeenCalledWith(`otp:register:${email}`);
  });

  it("báo lỗi OTP_INVALID và số lần thử còn lại khi nhập sai mã", async () => {
    const email = "user@test.com";
    const correctOtp = "123456";
    const wrongOtp = "999999";
    const hashed = hashOtp(email, correctOtp);

    // Lần thử thứ 2
    redisMock.incr.mockResolvedValueOnce(2);
    redisMock.get.mockResolvedValueOnce(hashed);

    await expect(OtpService.verifyRegisterOtp(email, wrongOtp)).rejects.toMatchObject({
      statusCode: 400,
      code: "OTP_INVALID",
      message: expect.stringContaining("Bạn còn 3 lần thử"),
    });
  });
});
