import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { EnvelopeConfig, EnvelopeStyle } from "../schemas/envelope.schema";
import { HttpError } from "../lib/http-error";

// Danh mục mẫu phong bì được cấu hình từ Backend (không hardcode FE)
const ENVELOPE_STYLES: EnvelopeStyle[] = [
  {
    id: "vintage-cream",
    name: "Kem cổ điển",
    envelopeColor: "#7B96A8", // Xanh xám tro / dusty slate blue
    flapColor: "#6B8596",
    innerColor: "#EAE4DC",
    sealColor: "#C0C5C7", // Sáp bạc hoàng gia
    sealBorderColor: "#9FA7A9",
    monogramColor: "#4A5D6B",
    bgTexture: "vintage-linen",
    bgColor: "#EFEBE4",
    sealIcon: "monogram",
    decorStyle: "blue-hydrangea", // Hoa tú cầu xanh & hoa baby trắng
    defaultTitle: "We're getting married!",
    defaultFont: "Aquarelle",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: false,
  },
  {
    id: "beige",
    name: "Beige",
    envelopeColor: "#F5EBE1", // Be ngà ấm áp
    flapColor: "#E8DCCF",
    innerColor: "#FAF6F0",
    sealColor: "#1E1E1E", // Sáp đen sang trọng
    sealBorderColor: "#111111",
    monogramColor: "#D4AF37", // Monogram khắc vàng gold
    bgTexture: "ivory-paper",
    bgColor: "#FAF8F5",
    sealIcon: "monogram",
    decorStyle: "white-green", // Hoa cúc trắng & cành lá xanh thanh lịch
    defaultTitle: "We're getting married!",
    defaultFont: "Playfair Display",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: false,
  },
  {
    id: "red",
    name: "Đỏ",
    envelopeColor: "#73161C", // Đỏ burgundy / ruby quý phái
    flapColor: "#611015",
    innerColor: "#420A0E",
    sealColor: "#C89B3C", // Sáp vàng đồng dập nổi
    sealBorderColor: "#A67B27",
    monogramColor: "#611015",
    bgTexture: "linen-light",
    bgColor: "#FAF6F5",
    sealIcon: "song-hy",
    decorStyle: "burgundy-butterfly", // Hoa hồng nhung đỏ & bướm bay
    defaultTitle: "We're getting married!",
    defaultFont: "Great Vibes",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: false,
  },
  {
    id: "emerald",
    name: "Xanh Emerald",
    envelopeColor: "#1B4332", // Xanh ngọc lục bảo
    flapColor: "#143326",
    innerColor: "#EDF4F0",
    sealColor: "#D4AF37", // Sáp vàng kim
    sealBorderColor: "#AA8C2C",
    monogramColor: "#1B4332",
    bgTexture: "emerald-linen",
    bgColor: "#F4F7F5",
    sealIcon: "ring",
    decorStyle: "gold-eucalyptus", // Lá khuynh diệp nhũ vàng
    defaultTitle: "We're getting married!",
    defaultFont: "Cinzel",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: true,
  },
  {
    id: "rose-gold",
    name: "Hồng Rose",
    envelopeColor: "#D8A49B", // Hồng nude / dusty rose
    flapColor: "#C89288",
    innerColor: "#FFF3F0",
    sealColor: "#8C4A4A", // Sáp hồng đất
    sealBorderColor: "#703838",
    monogramColor: "#FFFFFF",
    bgTexture: "soft-linen",
    bgColor: "#FCF8F7",
    sealIcon: "heart",
    decorStyle: "pink-peony", // Hoa mẫu đơn phấn hồng
    defaultTitle: "We're getting married!",
    defaultFont: "Alex Brush",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: true,
  },
  {
    id: "peony-purple",
    name: "Mẫu đơn tím hoàng kim",
    envelopeColor: "#32123B", // Tím sẫm quý phái như mẫu chungdoi
    flapColor: "#250B2D",
    innerColor: "#1A0620",
    sealColor: "#D4AF37", // Con dấu vàng kim
    sealBorderColor: "#F5D77F",
    monogramColor: "#FFFFFF",
    bgTexture: "starry-night",
    bgColor: "#190A1D",
    bgGradient: "radial-gradient(ellipse at center, #2C1035 0%, #17071D 100%)",
    cardBg: "#1F0B24",
    borderColor: "#D4AF37",
    ornamentType: "peony-purple",
    sealIcon: "heart",
    decorStyle: "purple-peony-gold",
    defaultTitle: "THIỆP MỜI CƯỚI",
    defaultFont: "Great Vibes",
    defaultButtonText: "Mở thiệp",
    isVip: true,
  },
  {
    id: "peony-crimson",
    name: "Mẫu đơn nhung đỏ",
    envelopeColor: "#8B1E2D",
    flapColor: "#73161C",
    innerColor: "#420A0E",
    sealColor: "#D4AF37",
    sealBorderColor: "#AA8C2C",
    monogramColor: "#F4E8D0",
    bgTexture: "vintage-linen",
    bgColor: "#FAF6F5",
    bgGradient: "radial-gradient(ellipse at center, #3F0E14 0%, #1A0306 100%)",
    cardBg: "#52121B",
    borderColor: "#D4AF37",
    ornamentType: "heritage-crimson",
    sealIcon: "song-hy",
    decorStyle: "crimson-peony",
    defaultTitle: "THIỆP MỜI CƯỚI",
    defaultFont: "Playfair Display",
    defaultButtonText: "Mở thiệp",
    isVip: true,
  },
];

export class EnvelopeService {
  /**
   * Lấy danh sách toàn bộ kiểu phong bì từ Backend
   */
  static async getStyles(): Promise<EnvelopeStyle[]> {
    return ENVELOPE_STYLES;
  }

  /**
   * Lấy kiểu phong bì theo styleId
   */
  static getStyleById(styleId: string): EnvelopeStyle | undefined {
    return ENVELOPE_STYLES.find((s) => s.id === styleId);
  }

  /**
   * Lấy cấu hình phong bì của thiệp cụ thể
   */
  static async getCardEnvelopeConfig(accountId: string, cardId: string): Promise<EnvelopeConfig | null> {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { categoryData: true, openingEffect: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp cưới", "CARD_NOT_FOUND");
    }

    const catData = (card.categoryData as Record<string, unknown>) || {};
    const config = (catData.envelopeConfig as EnvelopeConfig) || null;
    return config;
  }

  /**
   * Cập nhật cấu hình phong bì mở đầu của thiệp vào PostgreSQL (Đảm bảo multi-tenant)
   */
  static async updateCardEnvelopeConfig(
    accountId: string,
    cardId: string,
    config: EnvelopeConfig
  ) {
    const card = await prisma.card.findFirst({
      where: { id: cardId, accountId },
      select: { id: true, categoryData: true, openingEffect: true },
    });

    if (!card) {
      throw new HttpError(404, "Không tìm thấy thiệp hoặc bạn không có quyền sửa", "CARD_NOT_FOUND");
    }

    const currentCatData = (card.categoryData as Record<string, unknown>) || {};
    const updatedCatData = {
      ...currentCatData,
      envelopeConfig: {
        ...config,
        updatedAt: new Date().toISOString(),
      },
    };

    const updatedCard = await prisma.card.update({
      where: { id: cardId, accountId },
      data: {
        openingEffect: "WAX_SEAL", // Đảm bảo hiệu ứng mở màn là WAX_SEAL khi đã cấu hình phong bì
        categoryData: updatedCatData as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        slug: true,
        openingEffect: true,
        categoryData: true,
        updatedAt: true,
      },
    });

    return {
      cardId: updatedCard.id,
      slug: updatedCard.slug,
      openingEffect: updatedCard.openingEffect,
      envelopeConfig: (updatedCard.categoryData as Record<string, unknown>).envelopeConfig,
    };
  }
}
