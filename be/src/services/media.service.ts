import crypto from "node:crypto";

const ALLOWED_MIME_MAP: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "audio/mpeg": [".mp3"],
  "audio/mp3": [".mp3"],
};

function validateMagicBytes(buffer: Buffer, mimetype: string): boolean {
  if (buffer.length < 4) return false;
  if (mimetype === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === "image/png") return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  if (mimetype === "image/webp") return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  if (mimetype === "audio/mpeg" || mimetype === "audio/mp3") {
    return buffer.toString("ascii", 0, 3) === "ID3" || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
  }
  return false;
}

export class MediaService {
  static async handleFileUpload(file: Express.Multer.File, accountId: string): Promise<string> {
    if (!file?.buffer) throw new Error("Không có file nào được tải lên hoặc file rỗng");
    const mimetype = file.mimetype.toLowerCase();
    const extensions = ALLOWED_MIME_MAP[mimetype];
    if (!extensions) throw new Error("Định dạng file không hợp lệ");
    const extension = file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase();
    if (!extensions.includes(extension) || !validateMagicBytes(file.buffer, mimetype)) {
      throw new Error("Nội dung file không khớp định dạng khai báo");
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary chưa được cấu hình. Vui lòng thiết lập biến môi trường Cloudinary.");
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

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
    const result = (await response.json()) as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) {
      throw new Error(`Cloudinary upload thất bại: ${result.error?.message || response.statusText}`);
    }
    return result.secure_url;
  }
}
