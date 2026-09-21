import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "../../src/middlewares/error.middleware";
import { HttpError } from "../../src/lib/http-error";

function respond(error: unknown) {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn();
  errorHandler(error, {} as never, { status, json } as never, vi.fn());
  return { status, json };
}

describe("errorHandler", () => {
  it("returns a stable public HttpError", () => {
    const { status, json } = respond(new HttpError(404, "Không tìm thấy", "NOT_FOUND"));
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ success: false, error: "Không tìm thấy", code: "NOT_FOUND" });
  });

  it("does not leak an unexpected internal error", () => {
    const { status, json } = respond(new Error("postgresql://secret@db"));
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ success: false, error: "Internal Server Error", code: "INTERNAL_ERROR" });
  });
});
