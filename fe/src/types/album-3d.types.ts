export interface Album3DPage {
  id: string;
  url: string;
  caption?: string;
  aspectRatio?: "portrait" | "landscape" | "square";
  sortOrder: number;
}

export type AlbumCoverTheme = "leather-burgundy" | "linen-cream" | "royal-gold" | "minimalist-dark";

export interface Album3DConfig {
  enabled: boolean;
  title: string;              // "Album Kỷ Niệm Ngày Chung Đôi"
  coverTitle?: string;         // Tên in bìa: "HOÀNG NAM & MAI LAN"
  coverSubtitle?: string;      // "Our Wedding Album - 2026"
  coverTheme: AlbumCoverTheme; // Màu bìa sách
  soundEnabled: boolean;       // Bật tiếng lật giấy mỹ thuật
  autoPlayInterval?: number;   // Số giây tự lật (0 = tắt)
  pages: Album3DPage[];
}

export const DEFAULT_ALBUM_3D_CONFIG: Album3DConfig = {
  enabled: true,
  title: "Album Ảnh Cưới Kỷ Niệm",
  coverTitle: "KỶ NIỆM NGÀY CHUNG ĐÔI",
  coverSubtitle: "Our Wedding Photobook",
  coverTheme: "leather-burgundy",
  soundEnabled: true,
  autoPlayInterval: 0,
  pages: [],
};

/**
 * Trích xuất Google Drive File ID từ bất kỳ định dạng link chia sẻ nào
 * Ví dụ:
 * - https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing
 * - https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
 * - https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
 * - 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
 */
export function extractGoogleDriveFileId(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  // Pattern 1: /file/d/{id}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
  if (fileDMatch) return fileDMatch[1];

  // Pattern 2: id={id}
  const idQueryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (idQueryMatch) return idQueryMatch[1];

  // Pattern 3: /d/{id}
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  if (dMatch) return dMatch[1];

  // Pattern 4: Bare ID (chuỗi 25-50 ký tự base64url thông dụng của Google Drive)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Trích xuất Google Drive Folder ID
 * Ví dụ:
 * - https://drive.google.com/drive/folders/1R175CquKkvE8af3MsLDpHorUNyhUmC_k
 * - https://drive.google.com/drive/u/0/folders/1R175CquKkvE8af3MsLDpHorUNyhUmC_k?usp=sharing
 */
export function extractGoogleDriveFolderId(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{25,})/);
  if (folderMatch) return folderMatch[1];

  return null;
}

/**
 * Tạo Direct Image CDN URL tốc độ cao từ Google Drive File ID
 * Sử dụng lh3.googleusercontent.com/d/{id} (được Google tối ưu cho hiển thị ảnh web)
 */
export function buildGoogleDriveDirectUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/**
 * Phân tích chuỗi đầu vào (có thể gồm nhiều link, nhiều dòng text) để lấy tất cả các link ảnh Drive hợp lệ
 */
export function parseMultipleGoogleDriveLinks(rawText: string): Array<{ fileId: string; directUrl: string }> {
  if (!rawText) return [];

  // Tách theo dòng hoặc dấu phẩy hoặc khoảng trắng
  const tokens = rawText.split(/[\r\n,\s]+/);
  const results: Array<{ fileId: string; directUrl: string }> = [];
  const seenIds = new Set<string>();

  for (const token of tokens) {
    const fileId = extractGoogleDriveFileId(token);
    if (fileId && !seenIds.has(fileId)) {
      seenIds.add(fileId);
      results.push({
        fileId,
        directUrl: buildGoogleDriveDirectUrl(fileId),
      });
    }
  }

  return results;
}
