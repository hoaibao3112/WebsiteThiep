import { logger } from "../lib/logger";

export interface ParsedDrivePhoto {
  fileId: string;
  directUrl: string;
  name?: string;
}

export class GoogleDriveService {
  /**
   * Trích xuất File ID từ link Google Drive
   */
  static extractFileId(input: string): string | null {
    if (!input || typeof input !== "string") return null;
    const trimmed = input.trim();

    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
    if (fileDMatch) return fileDMatch[1];

    const idQueryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
    if (idQueryMatch) return idQueryMatch[1];

    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
    if (dMatch) return dMatch[1];

    if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
      return trimmed;
    }

    return null;
  }

  /**
   * Trích xuất Folder ID từ link Google Drive
   */
  static extractFolderId(input: string): string | null {
    if (!input || typeof input !== "string") return null;
    const trimmed = input.trim();

    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{25,})/);
    if (folderMatch) return folderMatch[1];

    return null;
  }

  /**
   * Chuyển đổi File ID sang Google CDN Direct URL
   */
  static buildDirectUrl(fileId: string): string {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  /**
   * Phân tích danh sách link Google Drive
   */
  static parseLinks(rawText: string): ParsedDrivePhoto[] {
    if (!rawText) return [];

    const tokens = rawText.split(/[\r\n,\s]+/);
    const results: ParsedDrivePhoto[] = [];
    const seenIds = new Set<string>();

    for (const token of tokens) {
      const fileId = this.extractFileId(token);
      if (fileId && !seenIds.has(fileId)) {
        seenIds.add(fileId);
        results.push({
          fileId,
          directUrl: this.buildDirectUrl(fileId),
        });
      }
    }

    return results;
  }

  /**
   * Thử quét nội dung folder Google Drive công khai
   */
  static async scanPublicFolder(folderId: string): Promise<ParsedDrivePhoto[]> {
    try {
      // Gọi fetch vào trang folder công khai của Google Drive để quét các ID ảnh
      const folderUrl = `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`;
      const res = await fetch(folderUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        logger.warn({ status: res.status, folderId }, "Không thể đọc trang Google Drive folder");
        return [];
      }

      const html = await res.text();
      // Google Drive HTML nhúng data file IDs trong các chuỗi JSON và data attributes
      const idMatches = html.match(/[a-zA-Z0-9_-]{28,45}/g) || [];
      const seen = new Set<string>();
      const photos: ParsedDrivePhoto[] = [];

      for (const candidateId of idMatches) {
        // Lọc bỏ folderId chính nó và các ID hệ thống ngắn
        if (candidateId === folderId || candidateId.length < 28) continue;
        if (!seen.has(candidateId)) {
          seen.add(candidateId);
          // Giới hạn an toàn tối đa 100 ảnh mỗi folder
          if (photos.length >= 100) break;
          photos.push({
            fileId: candidateId,
            directUrl: this.buildDirectUrl(candidateId),
          });
        }
      }

      return photos;
    } catch (err) {
      logger.warn({ err, folderId }, "Lỗi khi quét Google Drive folder");
      return [];
    }
  }
}
