import fs from "fs";
import path from "path";

// Whitelist MIME type & đuôi file hợp lệ
const ALLOWED_MIME_MAP: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "audio/mpeg": [".mp3"],
  "audio/mp3": [".mp3"],
};

/**
 * Kiểm tra magic bytes ở phần đầu buffer của file
 */
function validateMagicBytes(buffer: Buffer, mimetype: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (mimetype === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47 (0x89, 'P', 'N', 'G')
  if (mimetype === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // WEBP: RIFF....WEBP
  if (mimetype === "image/webp") {
    if (buffer.length < 12) return false;
    const riff = buffer.toString("ascii", 0, 4);
    const webp = buffer.toString("ascii", 8, 12);
    return riff === "RIFF" && webp === "WEBP";
  }

  // MP3: ID3 header hoặc MPEG audio frame sync (0xFF 0xFB, 0xFF 0xF3, 0xFF 0xF2, 0xFF 0xE0)
  if (mimetype === "audio/mpeg" || mimetype === "audio/mp3") {
    const isId3 = buffer.toString("ascii", 0, 3) === "ID3";
    const isMpegSync =
      buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;
    return isId3 || isMpegSync;
  }

  return false;
}

export class MediaService {
  /**
   * Upload file an toàn, kiểm tra MIME type & Magic bytes
   */
  static async handleFileUpload(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new Error("Không có file nào được tải lên hoặc file rỗng");
    }

    const mimetype = file.mimetype.toLowerCase();

    // 1. Kiểm tra Whitelist Mime Type
    const allowedExtensions = ALLOWED_MIME_MAP[mimetype];
    if (!allowedExtensions) {
      throw new Error(
        "Định dạng file không hợp lệ! Hệ thống chỉ chấp nhận ảnh (JPG, PNG, WEBP) hoặc âm thanh (MP3)."
      );
    }

    // 2. Chống giả mạo extension: Extension phải thuộc whitelist của Mime Type
    const originalExt = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(originalExt)) {
      throw new Error(
        `Đuôi mở rộng của file (${originalExt}) không khớp với định dạng thực tế (${mimetype}).`
      );
    }

    // 3. Kiểm tra Magic Bytes chống tấn công Polyglot / Stored XSS / SVG spoofing
    const isValidBytes = validateMagicBytes(file.buffer, mimetype);
    if (!isValidBytes) {
      throw new Error(
        "Nội dung file bị lỗi hoặc không khớp với định dạng tiêu chuẩn. Tải lên bị từ chối."
      );
    }

    // 4. Tạo thư mục lưu trữ uploads an toàn nếu chưa có
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 5. Sinh tên file ngẫu nhiên độc bản để chống Path Traversal
    const safeExt = allowedExtensions[0];
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${safeExt}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/${fileName}`;
  }
}
