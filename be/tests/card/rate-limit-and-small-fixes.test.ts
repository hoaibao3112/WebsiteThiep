import { describe, expect, it, vi } from "vitest";
import multer from "multer";
import { extractUserIdFromReq } from "../../src/server";
import { AuthService } from "../../src/services/auth.service";
import { errorHandler } from "../../src/middlewares/error.middleware";
import { CardController } from "../../src/controllers/card.controller";
import { CardElementController } from "../../src/controllers/card-element.controller";
import { StoredImageUrlSchema } from "../../src/lib/validators/card";
import { HttpError } from "../../src/lib/http-error";
import type { Request, Response } from "express";

describe("Mục 6 — Rate Limiter & Token Extraction", () => {
  it("extractUserIdFromReq extracts userId from valid Bearer token", () => {
    vi.spyOn(AuthService, "verifyToken").mockReturnValue({
      userId: "user-test-123",
      accountId: "acc-test-123",
      email: "test@example.com",
      role: "USER",
    });

    const mockReq = {
      headers: { authorization: "Bearer valid-jwt-token" },
      cookies: {},
    } as unknown as Request;

    const userId = extractUserIdFromReq(mockReq);
    expect(userId).toBe("user-test-123");
  });

  it("extractUserIdFromReq extracts userId from valid cookie auth_token", () => {
    vi.spyOn(AuthService, "verifyToken").mockReturnValue({
      userId: "user-cookie-456",
      accountId: "acc-cookie-456",
      email: "cookie@example.com",
      role: "USER",
    });

    const mockReq = {
      headers: {},
      cookies: { auth_token: "cookie-jwt-token" },
    } as unknown as Request;

    const userId = extractUserIdFromReq(mockReq);
    expect(userId).toBe("user-cookie-456");
  });

  it("extractUserIdFromReq returns null when no token or token is invalid", () => {
    vi.spyOn(AuthService, "verifyToken").mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const mockReq = {
      headers: { authorization: "Bearer bad-token" },
      cookies: {},
    } as unknown as Request;

    const userId = extractUserIdFromReq(mockReq);
    expect(userId).toBeNull();
  });
});

describe("Mục 7 — Small Fixes (Multer, getAuth, StoredImageUrlSchema)", () => {
  it("errorHandler catches MulterError LIMIT_FILE_SIZE and returns status 413", () => {
    const multerError = new multer.MulterError("LIMIT_FILE_SIZE", "file");
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const mockRes = { status: statusMock } as unknown as Response;
    const mockNext = vi.fn();

    errorHandler(multerError, {} as Request, mockRes, mockNext);

    expect(statusMock).toHaveBeenCalledWith(413);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      code: "LIMIT_FILE_SIZE",
      error: "Kích thước tập tin vượt quá giới hạn cho phép",
    }));
  });

  it("errorHandler catches other MulterError and returns status 400", () => {
    const multerError = new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file");
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const mockRes = { status: statusMock } as unknown as Response;
    const mockNext = vi.fn();

    errorHandler(multerError, {} as Request, mockRes, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      code: "LIMIT_UNEXPECTED_FILE",
    }));
  });

  it("CardController.getAuth throws HttpError(401) when user/accountId is missing", async () => {
    const mockReq = { user: undefined } as any;
    const mockRes = {} as any;
    const mockNext = vi.fn();

    await CardController.create(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
    const err = mockNext.mock.calls[0][0] as HttpError;
    expect(err.status).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("CardElementController.getAuth throws HttpError(401) when user/accountId is missing", async () => {
    const mockReq = { user: undefined, params: { cardId: "c1", elementId: "e1" }, body: {} } as any;
    const mockRes = {} as any;
    const mockNext = vi.fn();

    await CardElementController.patchElement(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
    const err = mockNext.mock.calls[0][0] as HttpError;
    expect(err.status).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("StoredImageUrlSchema rejects data:image/ base64 strings", () => {
    const base64DataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA";
    const result = StoredImageUrlSchema.safeParse(base64DataUri);
    expect(result.success).toBe(false);
  });

  it("StoredImageUrlSchema accepts uploaded URLs and relative paths", () => {
    expect(StoredImageUrlSchema.safeParse("https://storage.googleapis.com/bucket/image.jpg").success).toBe(true);
    expect(StoredImageUrlSchema.safeParse("/uploads/photos/my-photo.png").success).toBe(true);
    expect(StoredImageUrlSchema.safeParse("/images/background.webp").success).toBe(true);
  });
});
