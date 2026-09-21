import { afterEach, describe, expect, it, vi } from "vitest";
import { MediaService } from "../../src/services/media.service";

describe("MediaService durable upload", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("fails closed when Cloudinary is not configured", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
    vi.stubEnv("CLOUDINARY_API_KEY", "");
    vi.stubEnv("CLOUDINARY_API_SECRET", "");

    await expect(MediaService.handleFileUpload({
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00]),
      mimetype: "image/jpeg",
      originalname: "photo.jpg",
    } as Express.Multer.File, "account-1")).rejects.toThrow("Cloudinary");
  });

  it("uploads into an account-scoped Cloudinary folder", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo-cloud");
    vi.stubEnv("CLOUDINARY_API_KEY", "api-key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "api-secret");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ secure_url: "https://cdn.test/photo.jpg" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const url = await MediaService.handleFileUpload({
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00]),
      mimetype: "image/jpeg",
      originalname: "photo.jpg",
    } as Express.Multer.File, "account-1");

    expect(url).toBe("https://cdn.test/photo.jpg");
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get("folder")).toBe("cardvite/account-1");
  });
});
