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
      expect(parsed.backCover).toBeDefined();
      expect(parsed.backCover?.designPreset).toBe("velvet-stitched");
      expect(parsed.backCover?.title).toBe("Forever & Always");
      expect(parsed.backCover?.borderStyle).toBe("stitched-dashed");
      expect(parsed.backCover?.showPetals).toBe(true);
      expect(parsed.backCover?.buttonText).toBe("Quay lại trang bìa");
    });

    it("validates and accepts custom backCover settings", () => {
      const parsed = Album3DConfigSchema.parse({
        title: "Album Cưới",
        coverTheme: "leather-burgundy",
        pages: [],
        backCover: {
          enabled: true,
          designPreset: "vintage-leather-wax",
          title: "Happy Ending",
          subtitle: "Cảm ơn bạn rất nhiều!",
          signatureText: "Hoàng Long & Bảo Ngọc",
          buttonText: "Xem lại từ đầu",
          photoUrl: "https://example.com/polaroid.jpg",
          showPetals: false,
          borderStyle: "gold-double",
          badgeIcon: "wax-seal",
          customBgColor: "#3D2314",
        },
      });

      expect(parsed.backCover.designPreset).toBe("vintage-leather-wax");
      expect(parsed.backCover.title).toBe("Happy Ending");
      expect(parsed.backCover.signatureText).toBe("Hoàng Long & Bảo Ngọc");
      expect(parsed.backCover.badgeIcon).toBe("wax-seal");
      expect(parsed.backCover.customBgColor).toBe("#3D2314");
    });

    it("rejects invalid customBgColor hex format", () => {
      expect(() =>
        Album3DConfigSchema.parse({
          title: "Album Cưới",
          pages: [],
          backCover: {
            customBgColor: "not-a-hex",
          },
        })
      ).toThrow();
    });

    it("rejects invalid coverTheme", () => {
      expect(() =>
        Album3DConfigSchema.parse({
          coverTheme: "neon-pink" as any,
        })
      ).toThrow();
    });

    it("serves presets catalog with all 7 back cover presets", () => {
      const presets = Album3DService.getPresets();
      expect(Object.keys(presets).length).toBe(7);
      expect(presets["velvet-stitched"]).toBeDefined();
      expect(presets["gold-foil-floral"]).toBeDefined();
      expect(presets["vintage-leather-wax"]).toBeDefined();
      expect(presets["botanical-sage-glass"]).toBeDefined();
      expect(presets["minimal-monochrome"]).toBeDefined();
      expect(presets["polaroid-farewell"]).toBeDefined();
      expect(presets["oriental-red-songhy"]).toBeDefined();
    });

    it("serves front cover presets catalog with all 7 front cover presets with photo frame support", () => {
      const frontPresets = Album3DService.getFrontCoverPresets();
      expect(Object.keys(frontPresets).length).toBe(7);
      expect(frontPresets["photo-arch-gold"]).toBeDefined();
      expect(frontPresets["photo-arch-gold"].hasPhotoFrame).toBe(true);
      expect(frontPresets["photo-oval-floral"]).toBeDefined();
      expect(frontPresets["photo-full-bleed"]).toBeDefined();
      expect(frontPresets["photo-polaroid-stitched"]).toBeDefined();
      expect(frontPresets["photo-magazine-editorial"]).toBeDefined();
      expect(frontPresets["classic-leather-monogram"]).toBeDefined();
      expect(frontPresets["oriental-crimson-frame"]).toBeDefined();
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
