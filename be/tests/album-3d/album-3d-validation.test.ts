import { describe, it, expect } from "vitest";
import {
  AlbumImageUrlSchema,
  HexColorOptionalSchema,
  Album3DPageSchema,
  AlbumFrontCoverConfigSchema,
  AlbumBackCoverConfigSchema,
  Album3DConfigSchema,
} from "../../src/schemas/album-3d.schema";

describe("Album 3D Validation Schemas", () => {
  describe("AlbumImageUrlSchema", () => {
    it("chấp nhận URL tuyệt đối http và https", () => {
      expect(AlbumImageUrlSchema.safeParse("https://example.com/photo.jpg").success).toBe(true);
      expect(AlbumImageUrlSchema.safeParse("http://sub.domain.vn/image.png?v=1").success).toBe(true);
    });

    it("chấp nhận đường dẫn tương đối nội bộ uploads và images", () => {
      expect(AlbumImageUrlSchema.safeParse("/uploads/cards/demo.jpg").success).toBe(true);
      expect(AlbumImageUrlSchema.safeParse("/images/demo/wedding-album-1.jpg").success).toBe(true);
      expect(AlbumImageUrlSchema.safeParse("/api/media/image.webp").success).toBe(true);
    });

    it("chấp nhận chuỗi rỗng cho ảnh tùy chọn", () => {
      expect(AlbumImageUrlSchema.safeParse("").success).toBe(true);
    });

    it("từ chối chuỗi base64 để bảo vệ database khỏi payload quá lớn", () => {
      const base64Png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const result = AlbumImageUrlSchema.safeParse(base64Png);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Đường dẫn ảnh không hợp lệ");
      }
    });

    it("từ chối chuỗi URI scheme độc hại như javascript:", () => {
      expect(AlbumImageUrlSchema.safeParse("javascript:alert(1)").success).toBe(false);
      expect(AlbumImageUrlSchema.safeParse("file:///C:/secret.txt").success).toBe(false);
    });
  });

  describe("HexColorOptionalSchema", () => {
    it("chấp nhận mã màu Hex 3, 6 và 8 ký tự", () => {
      expect(HexColorOptionalSchema.safeParse("#FFF").success).toBe(true);
      expect(HexColorOptionalSchema.safeParse("#BE944E").success).toBe(true);
      expect(HexColorOptionalSchema.safeParse("#be944e").success).toBe(true);
      expect(HexColorOptionalSchema.safeParse("#BE944EFF").success).toBe(true);
    });

    it("chấp nhận null, undefined, hoặc chuỗi rỗng khi người dùng xóa chọn màu", () => {
      expect(HexColorOptionalSchema.safeParse(null).success).toBe(true);
      expect(HexColorOptionalSchema.safeParse(undefined).success).toBe(true);
      expect(HexColorOptionalSchema.safeParse("").success).toBe(true);
    });

    it("từ chối các chuỗi mã màu sai cú pháp", () => {
      expect(HexColorOptionalSchema.safeParse("rgb(255, 0, 0)").success).toBe(false);
      expect(HexColorOptionalSchema.safeParse("red").success).toBe(false);
      expect(HexColorOptionalSchema.safeParse("#GGGGGG").success).toBe(false);
      expect(HexColorOptionalSchema.safeParse("#12").success).toBe(false);
    });
  });

  describe("Album3DPageSchema", () => {
    it("parse trang album hợp lệ", () => {
      const pageData = {
        id: "page-1",
        url: "/uploads/album-page-1.jpg",
        caption: "Kỷ niệm ngày cưới Đà Lạt",
        aspectRatio: "portrait" as const,
        sortOrder: 1,
      };
      const result = Album3DPageSchema.safeParse(pageData);
      expect(result.success).toBe(true);
    });

    it("chặn chú thích vượt quá 200 ký tự", () => {
      const pageData = {
        id: "page-2",
        url: "/uploads/album-page-2.jpg",
        caption: "a".repeat(201),
      };
      const result = Album3DPageSchema.safeParse(pageData);
      expect(result.success).toBe(false);
    });
  });

  describe("AlbumFrontCoverConfigSchema & AlbumBackCoverConfigSchema", () => {
    it("cho phép bìa trước với ảnh relative và mã màu custom hợp lệ hoặc rỗng", () => {
      const frontCover = {
        enabled: true,
        designPreset: "photo-arch-gold" as const,
        photoUrl: "/images/demo/front-cover.png",
        title: "Hoàng Long & Bảo Ngọc",
        subtitle: "WEDDING PHOTOBOOK",
        customBgColor: "#1A1A1A",
        customTextColor: "",
      };
      const result = AlbumFrontCoverConfigSchema.safeParse(frontCover);
      expect(result.success).toBe(true);
    });

    it("cho phép bìa sau không có ảnh và mã màu null", () => {
      const backCover = {
        enabled: true,
        designPreset: "velvet-stitched" as const,
        photoUrl: "",
        title: "THANK YOU",
        customBgColor: null,
        customTextColor: undefined,
      };
      const result = AlbumBackCoverConfigSchema.safeParse(backCover);
      expect(result.success).toBe(true);
    });

    it("parse toàn bộ Album3DConfigSchema với đầy đủ bìa trước, bìa sau và danh sách trang", () => {
      const fullConfig = {
        enabled: true,
        albumTheme: "leather-burgundy" as const,
        pages: [
          {
            id: "p1",
            url: "/uploads/p1.jpg",
            caption: "Trang 1",
            aspectRatio: "portrait" as const,
            sortOrder: 0,
          },
          {
            id: "p2",
            url: "https://cdn.example.com/p2.jpg",
            caption: "Trang 2",
            aspectRatio: "landscape" as const,
            sortOrder: 1,
          },
        ],
        frontCover: {
          enabled: true,
          photoUrl: "/uploads/cover.jpg",
          customBgColor: "",
          customTextColor: "#FFFFFF",
        },
        backCover: {
          enabled: true,
          photoUrl: "",
          customBgColor: "#000000",
          customTextColor: null,
        },
      };

      const result = Album3DConfigSchema.safeParse(fullConfig);
      expect(result.success).toBe(true);
    });
  });
});
