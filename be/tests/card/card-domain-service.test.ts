import { describe, it, expect } from "vitest";
import { generateVietQrUrl } from "../../src/lib/vietqr";
import { CanvasElementSchema, StoredImageUrlSchema } from "../../src/lib/validators/card/canvas-element.schema";
import { ensureWeddingSceneData } from "../../src/services/wedding-scene.service";

describe("Card Domain Business Logic & Utilities", () => {
  describe("generateVietQrUrl (VietQR Napas 247 Quicklink)", () => {
    it("tạo link VietQR chuẩn xác với thông tin ngân hàng và số tài khoản", () => {
      const url = generateVietQrUrl({
        bankCode: "MB",
        accountNumber: "0987654321",
        accountName: "Nguyen Van A",
        template: "compact2",
      });

      expect(url).toContain("https://img.vietqr.io/image/MB-0987654321-compact2.png");
      expect(url).toContain("accountName=NGUYEN+VAN+A");
    });

    it("tự động append amount và nội dung chuyển khoản addInfo", () => {
      const url = generateVietQrUrl({
        bankCode: "VCB",
        accountNumber: "123456789",
        amount: 500000,
        description: "Mung cuoi Long va Ngoc",
      });

      expect(url).toContain("amount=500000");
      expect(url).toContain("addInfo=Mung+cuoi+Long+va+Ngoc");
    });

    it("bỏ qua amount nếu số tiền <= 0", () => {
      const url = generateVietQrUrl({
        bankCode: "TCB",
        accountNumber: "111222333",
        amount: 0,
      });

      expect(url).not.toContain("amount=");
    });
  });

  describe("CanvasElementSchema & StoredImageUrlSchema", () => {
    it("chấp nhận đường dẫn ảnh /uploads/, /images/ và https://", () => {
      expect(StoredImageUrlSchema.safeParse("/uploads/photos/cover.jpg").success).toBe(true);
      expect(StoredImageUrlSchema.safeParse("/images/demo/avatar.png").success).toBe(true);
      expect(StoredImageUrlSchema.safeParse("https://cdn.websitethiep.com/banner.webp").success).toBe(true);
    });

    it("chặn base64 data:image/ để tránh phình to payload database", () => {
      const result = StoredImageUrlSchema.safeParse("data:image/jpeg;base64,abc123xyz");
      expect(result.success).toBe(false);
    });

    it("validate phần tử chữ (text element) hợp lệ", () => {
      const textElement = {
        id: "el-text-1",
        type: "text" as const,
        content: "Trân trọng kính mời",
        x: 100,
        y: 200,
        width: 300,
        height: 50,
        fontSize: 24,
        fontFamily: "Playfair Display",
        color: "#BE944E",
        textAlign: "center" as const,
        isBold: true,
      };

      const result = CanvasElementSchema.safeParse(textElement);
      expect(result.success).toBe(true);
    });

    it("chặn phần tử có tọa độ x, y hoặc kích thước ngoài biên an toàn", () => {
      const invalidElement = {
        id: "el-invalid-1",
        type: "shape" as const,
        content: "",
        x: -5000, // vượt giới hạn min -2000
        y: 100,
        width: 100,
        height: 100,
      };

      const result = CanvasElementSchema.safeParse(invalidElement);
      expect(result.success).toBe(false);
    });
  });

  describe("ensureWeddingSceneData", () => {
    it("bảo toàn dữ liệu categoryData khi không phải null", () => {
      const existingData = {
        cardCategory: "WEDDING",
        groom: { fullName: "Nguyễn Văn Long", shortName: "Long" },
        bride: { fullName: "Lê Thị Ngọc", shortName: "Ngọc" },
      };

      const result = ensureWeddingSceneData("wedding-minimalist-gold", existingData);
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("tạo cấu trúc canvasDocument cho template thiệp cưới hợp lệ", () => {
      const existingData = {
        cardCategory: "WEDDING",
        groom: { fullName: "Hoàng Long", shortName: "Long" },
        bride: { fullName: "Bảo Ngọc", shortName: "Ngọc" },
      };
      const result = ensureWeddingSceneData("wedding-heritage-crimson-gold", existingData) as any;
      expect(result).toBeDefined();
      expect(result.canvasDocument).toBeDefined();
      expect(result.canvasDocument.schemaVersion).toBe(1);
      expect(Array.isArray(result.canvasDocument.elements)).toBe(true);
    });
  });
});
