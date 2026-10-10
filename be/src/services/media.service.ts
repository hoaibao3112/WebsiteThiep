import crypto from "node:crypto";
import { HttpError } from "../lib/http-error";

const ALLOWED_MIME_MAP: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "audio/mpeg": [".mp3"],
  "audio/mp3": [".mp3"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
};

function validateMagicBytes(buffer: Buffer, mimetype: string): boolean {
  if (buffer.length < 4) return false;
  if (mimetype === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === "image/png") return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  if (mimetype === "image/webp") return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  if (mimetype === "audio/mpeg" || mimetype === "audio/mp3") {
    return buffer.toString("ascii", 0, 3) === "ID3" || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
  }
  if (mimetype === "video/mp4") {
    return buffer.length >= 8 && buffer.toString("ascii", 4, 8) === "ftyp";
  }
  if (mimetype === "video/webm") {
    return buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;
  }
  return false;
}

export { validateMagicBytes, ALLOWED_MIME_MAP };

export class MediaService {
  static async handleFileUpload(file: Express.Multer.File, accountId: string): Promise<string> {
    if (!file?.buffer) throw new HttpError(400, "Không có file nào được tải lên hoặc file rỗng", "INVALID_FILE");
    const mimetype = file.mimetype.toLowerCase();
    const extensions = ALLOWED_MIME_MAP[mimetype];
    if (!extensions) throw new HttpError(400, "Định dạng file không hợp lệ", "INVALID_FILE");
    const extension = file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase();
    if (!extensions.includes(extension) || !validateMagicBytes(file.buffer, mimetype)) {
      throw new HttpError(400, "Nội dung file không khớp định dạng khai báo", "INVALID_FILE");
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new HttpError(503, "Cloudinary chưa được cấu hình. Vui lòng thiết lập biến môi trường Cloudinary.", "STORAGE_UNAVAILABLE");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `cardvite/${accountId}`;
    const signature = crypto
      .createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");
    const form = new FormData();
    form.append("file", new Blob([file.buffer], { type: mimetype }), file.originalname);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("folder", folder);
    form.append("signature", signature);

    const timeoutMs = mimetype.startsWith("video/") ? 60_000 : 15_000;
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const result = (await response.json()) as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) {
      throw new HttpError(502, `Cloudinary upload thất bại: ${result.error?.message || response.statusText}`, "STORAGE_UPLOAD_FAILED");
    }
    return result.secure_url;
  }

  static async uploadMemoryPhoto(
    file: Express.Multer.File,
    accountId: string
  ): Promise<{ photoUrl: string; thumbUrl: string }> {
    if (!file?.buffer) throw new HttpError(400, "Không có file ảnh nào được tải lên hoặc file rỗng", "INVALID_FILE");
    const mimetype = file.mimetype.toLowerCase();
    const extensions = ALLOWED_MIME_MAP[mimetype];
    if (!extensions || !mimetype.startsWith("image/")) {
      throw new HttpError(400, "Định dạng ảnh không hợp lệ (chỉ hỗ trợ JPG, PNG, WEBP)", "INVALID_FILE");
    }
    const extension = file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase();
    if (!extensions.includes(extension) || !validateMagicBytes(file.buffer, mimetype)) {
      throw new HttpError(400, "Nội dung file không khớp định dạng ảnh khai báo", "INVALID_FILE");
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new HttpError(503, "Cloudinary chưa được cấu hình. Vui lòng thiết lập biến môi trường Cloudinary.", "STORAGE_UNAVAILABLE");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `cardvite/${accountId}/memories`;
    const signature = crypto
      .createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");
    const form = new FormData();
    form.append("file", new Blob([file.buffer], { type: mimetype }), file.originalname);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("folder", folder);
    form.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
    const result = (await response.json()) as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) {
      throw new HttpError(502, `Cloudinary upload thất bại: ${result.error?.message || response.statusText}`, "STORAGE_UPLOAD_FAILED");
    }
    const photoUrl = result.secure_url;
    const thumbUrl = photoUrl.replace("/upload/", "/upload/c_thumb,w_400,h_400,g_auto,q_auto,f_auto/");
    return { photoUrl, thumbUrl };
  }

  /**
   * Upload Buffer truc tiep len Cloudinary (dung cho signature data URL)
   */
  static async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    folder = "cardvite/signatures"
  ): Promise<{ url: string; thumbUrl?: string }> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new HttpError(503, "Cloudinary chua duoc cau hinh", "STORAGE_UNAVAILABLE");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const form = new FormData();
    form.append("file", new Blob([buffer], { type: mimetype }), filename);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("folder", folder);
    form.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
    const result = (await response.json()) as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) {
      throw new HttpError(502, `Cloudinary upload that bai: ${result.error?.message || response.statusText}`, "STORAGE_UPLOAD_FAILED");
    }

    const url = result.secure_url;
    const thumbUrl = url.replace("/upload/", "/upload/c_thumb,w_200,h_200,g_auto,q_auto,f_auto/");
    return { url, thumbUrl };
  }

  /**
   * Xoa anh tren Cloudinary theo URL (trich public_id tu URL)
   */
  static async deleteByUrl(url: string): Promise<void> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) return;

    // Extract public_id from Cloudinary URL
    const match = url.match(/\/v\d+\/(.+?)(?:\.\w+)?$/);
    if (!match?.[1]) return;
    const publicId = match[1];

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(10_000),
    }).catch(() => {/* silent */});
  }
}

