import fs from "fs";
import path from "path";

export class MediaService {
  /**
   * Upload file và trả về URL
   * Trong production có thể tích hợp Cloudinary hoặc S3
   */
  static async handleFileUpload(file: Express.Multer.File): Promise<string> {
    if (!file) throw new Error("Không có file nào được tải lên");

    // Tạo thư mục uploads nếu chưa có
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/${fileName}`;
  }
}
