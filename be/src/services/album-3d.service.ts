import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import { Album3DConfig, Album3DConfigSchema } from "../schemas/album-3d.schema";
import { GoogleDriveService } from "./google-drive.service";

export class Album3DService {
  /**
   * Lấy cấu hình Album 3D của thiệp
   */
  static async getAlbumConfig(accountId: string, cardId: string): Promise<Album3DConfig | null> {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { categoryData: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới", "CARD_NOT_FOUND");
    }

    const catData = (card.categoryData as Record<string, unknown>) || {};
    const albumData = catData.album3d;

    if (!albumData) {
      return null;
    }

    const parsed = Album3DConfigSchema.safeParse(albumData);
    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  }

  /**
   * Cập nhật cấu hình Album 3D cho thiệp
   */
  static async updateAlbumConfig(
    accountId: string,
    cardId: string,
    config: Album3DConfig
  ): Promise<Album3DConfig> {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { categoryData: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới", "CARD_NOT_FOUND");
    }

    const validated = Album3DConfigSchema.parse(config);
    const catData = (card.categoryData as Record<string, unknown>) || {};

    const updatedCatData = {
      ...catData,
      album3d: validated,
    };

    await prisma.card.update({
      where: { id: cardId },
      data: {
        categoryData: updatedCatData as any,
      },
    });

    return validated;
  }

  /**
   * Quét và nhập link ảnh từ Google Drive
   */
  static async importGoogleDrive(input: string) {
    if (!input || typeof input !== "string") {
      throw new HttpError(400, "Vui lòng cung cấp link hoặc ID Google Drive hợp lệ", "INVALID_INPUT");
    }

    const trimmed = input.trim();
    const folderId = GoogleDriveService.extractFolderId(trimmed);

    if (folderId) {
      // Nhập từ Folder
      const photos = await GoogleDriveService.scanPublicFolder(folderId);
      return {
        type: "folder" as const,
        folderId,
        photos,
      };
    }

    // Nhập từ danh sách link / file ID
    const photos = GoogleDriveService.parseLinks(trimmed);
    return {
      type: "links" as const,
      photos,
    };
  }
}
