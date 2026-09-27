import { beforeEach, describe, expect, it, vi } from "vitest";
import { Album3DConfigSchema } from "../../src/schemas/album-3d.schema";
import { GoogleDriveService } from "../../src/services/google-drive.service";

const prismaMock = vi.hoisted(() => ({
  card: { findFirst: vi.fn(), update: vi.fn() },
}));

vi.mock("../../src/lib/prisma", () => ({ prisma: prismaMock }));

import { Album3DService } from "../../src/services/album-3d.service";

describe("Album3DService & GoogleDriveService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GoogleDriveService link parsing", () => {
    it("extracts fileId from standard /file/d/ link", () => {
      const url = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing";
      const id = GoogleDriveService.extractFileId(url);
      expect(id).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs");
      expect(GoogleDriveService.buildDirectUrl(id!)).toBe(
        "https://lh3.googleusercontent.com/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
      );
    });

    it("extracts fileId from ?id= query param", () => {
      const url = "https://drive.google.com/open?id=1R175CquKkvE8af3MsLDpHorUNyhUmC_k";
      const id = GoogleDriveService.extractFileId(url);
      expect(id).toBe("1R175CquKkvE8af3MsLDpHorUNyhUmC_k");
    });

    it("extracts folderId from folder link", () => {
      const folderUrl = "https://drive.google.com/drive/folders/1R175CquKkvE8af3MsLDpHorUNyhUmC_k?usp=sharing";
      const folderId = GoogleDriveService.extractFolderId(folderUrl);
      expect(folderId).toBe("1R175CquKkvE8af3MsLDpHorUNyhUmC_k");
    });

    it("parses multiple lines of drive links and eliminates duplicates", () => {
      const multi = `
        https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view
        https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view
        https://drive.google.com/open?id=1R175CquKkvE8af3MsLDpHorUNyhUmC_k
      `;
      const photos = GoogleDriveService.parseLinks(multi);
      expect(photos.length).toBe(2);
      expect(photos[0].fileId).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs");
      expect(photos[1].fileId).toBe("1R175CquKkvE8af3MsLDpHorUNyhUmC_k");
      expect(photos[0].directUrl).toContain("https://lh3.googleusercontent.com/d/");
    });
  });

  describe("Album3DConfigSchema validation", () => {
    it("validates valid Album 3D configuration with defaults", () => {
      const parsed = Album3DConfigSchema.parse({
        title: "Album Cưới Mai Lan & Tuấn Minh",
        coverTheme: "royal-gold",
        pages: [
          {
            id: "p-1",
            url: "https://lh3.googleusercontent.com/d/123456789012345678901234567890",
            caption: "Lễ thành hôn",
            sortOrder: 0,
          },
        ],
      });

      expect(parsed.enabled).toBe(true);
      expect(parsed.coverTheme).toBe("royal-gold");
      expect(parsed.soundEnabled).toBe(true);
      expect(parsed.pages.length).toBe(1);
    });

    it("rejects invalid coverTheme", () => {
      expect(() =>
        Album3DConfigSchema.parse({
          coverTheme: "neon-pink" as any,
        })
      ).toThrow();
    });
  });

  describe("getAlbumConfig", () => {
    it("returns null if album3d config is not present in categoryData", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        categoryData: {},
      });

      const config = await Album3DService.getAlbumConfig("tenant-1", "card-1");
      expect(config).toBeNull();
    });

    it("returns parsed Album3DConfig when present", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        categoryData: {
          album3d: {
            enabled: true,
            title: "Album Hạnh Phúc",
            coverTheme: "linen-cream",
            soundEnabled: true,
            pages: [
              {
                id: "page-1",
                url: "https://example.com/photo.jpg",
                sortOrder: 0,
              },
            ],
          },
        },
      });

      const config = await Album3DService.getAlbumConfig("tenant-1", "card-1");
      expect(config?.title).toBe("Album Hạnh Phúc");
      expect(config?.coverTheme).toBe("linen-cream");
      expect(config?.pages.length).toBe(1);
    });

    it("throws 404 when card is not found or belongs to another tenant", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce(null);

      await expect(Album3DService.getAlbumConfig("wrong-tenant", "card-1")).rejects.toThrow(
        "Không tìm thấy thiệp cưới"
      );
    });
  });

  describe("updateAlbumConfig", () => {
    it("merges album3d config into categoryData with multi-tenant isolation", async () => {
      prismaMock.card.findFirst.mockResolvedValueOnce({
        categoryData: {
          groom: { fullName: "Quân" },
        },
      });
      prismaMock.card.update.mockResolvedValueOnce({});

      const updated = await Album3DService.updateAlbumConfig("tenant-1", "card-1", {
        enabled: true,
        title: "Album Cưới",
        coverTheme: "leather-burgundy",
        soundEnabled: true,
        autoPlayInterval: 0,
        pages: [],
      });

      expect(prismaMock.card.findFirst).toHaveBeenCalledWith({
        where: { id: "card-1", accountId: "tenant-1" },
        select: { categoryData: true },
      });

      expect(prismaMock.card.update).toHaveBeenCalledWith({
        where: { id: "card-1" },
        data: {
          categoryData: expect.objectContaining({
            groom: { fullName: "Quân" },
            album3d: expect.objectContaining({
              title: "Album Cưới",
              coverTheme: "leather-burgundy",
            }),
          }),
        },
      });

      expect(updated.title).toBe("Album Cưới");
    });
  });
});
