import { describe, expect, it } from "vitest";
import {
  extractGoogleDriveFileId,
  extractGoogleDriveFolderId,
  buildGoogleDriveDirectUrl,
  parseMultipleGoogleDriveLinks,
  DEFAULT_ALBUM_3D_CONFIG,
} from "../../src/types/album-3d.types";

describe("Album 3D & Google Drive Utilities (Frontend)", () => {
  describe("extractGoogleDriveFileId", () => {
    it("extracts fileId from standard sharing link", () => {
      const link = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing";
      expect(extractGoogleDriveFileId(link)).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs");
    });

    it("extracts fileId from ?id= parameter", () => {
      const link = "https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs";
      expect(extractGoogleDriveFileId(link)).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs");
    });

    it("accepts bare fileId", () => {
      const id = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs";
      expect(extractGoogleDriveFileId(id)).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs");
    });

    it("returns null for invalid strings", () => {
      expect(extractGoogleDriveFileId("")).toBeNull();
      expect(extractGoogleDriveFileId("not-a-drive-link")).toBeNull();
    });
  });

  describe("extractGoogleDriveFolderId", () => {
    it("extracts folderId from folder link", () => {
      const link = "https://drive.google.com/drive/folders/1R175CquKkvE8af3MsLDpHorUNyhUmC_k?usp=sharing";
      expect(extractGoogleDriveFolderId(link)).toBe("1R175CquKkvE8af3MsLDpHorUNyhUmC_k");
    });

    it("extracts folderId from /u/0/ folder link", () => {
      const link = "https://drive.google.com/drive/u/0/folders/1R175CquKkvE8af3MsLDpHorUNyhUmC_k";
      expect(extractGoogleDriveFolderId(link)).toBe("1R175CquKkvE8af3MsLDpHorUNyhUmC_k");
    });
  });

  describe("buildGoogleDriveDirectUrl", () => {
    it("formats high-speed Google User Content CDN link", () => {
      const fileId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs";
      expect(buildGoogleDriveDirectUrl(fileId)).toBe(
        "https://lh3.googleusercontent.com/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
      );
    });
  });

  describe("parseMultipleGoogleDriveLinks", () => {
    it("extracts all unique direct urls from multiline text input", () => {
      const input = `
        https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view
        https://drive.google.com/open?id=1R175CquKkvE8af3MsLDpHorUNyhUmC_k
        https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view
      `;
      const results = parseMultipleGoogleDriveLinks(input);
      expect(results.length).toBe(2);
      expect(results[0].fileId).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs");
      expect(results[0].directUrl).toBe("https://lh3.googleusercontent.com/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs");
      expect(results[1].fileId).toBe("1R175CquKkvE8af3MsLDpHorUNyhUmC_k");
    });
  });

  describe("DEFAULT_ALBUM_3D_CONFIG", () => {
    it("has soundEnabled true and valid theme", () => {
      expect(DEFAULT_ALBUM_3D_CONFIG.enabled).toBe(true);
      expect(DEFAULT_ALBUM_3D_CONFIG.soundEnabled).toBe(true);
      expect(DEFAULT_ALBUM_3D_CONFIG.coverTheme).toBe("leather-burgundy");
    });
  });
});
