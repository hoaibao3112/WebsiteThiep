import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { generateEmbedding } from './gemini.service';

export const KNOWLEDGE_ARTICLES = [
  {
    category: 'pricing',
    title: 'Bảng giá và quyền lợi các gói dịch vụ WebsiteThiep',
    tags: ['bảng giá', 'chi phí', 'giá thiệp', 'gói free', 'gói basic', 'gói vip', 'tiêu chuẩn', 'nâng cấp'],
    content: `
WebsiteThiep cung cấp 3 gói dịch vụ thiệp điện tử minh bạch, cam kết không phát sinh chi phí:
1. Gói Dùng Thử (FREE - 0đ):
   - Trải nghiệm tạo thiệp cưới miễn phí trong 2 phút.
   - Sử dụng các mẫu thiệp cơ bản, hiệu ứng mở phong bì tiêu chuẩn, tối đa 5 ảnh trong album, lưu trữ 7 ngày.
2. Gói Tiêu Chuẩn (BASIC - 199.000đ):
   - Sử dụng trong 180 ngày (6 tháng) thoải mái chuẩn bị đám cưới.
   - Xóa hoàn toàn logo hệ thống (Watermark).
   - Tự do tải lên bài hát nhạc nền MP3 yêu thích.
   - Album ảnh mở rộng tới 20 ảnh chất lượng cao.
   - Truy cập kho mẫu thiệp cao cấp.
3. Gói VIP Trọn Gói (VIP - 399.000đ):
   - Sử dụng trọn đời (Vĩnh viễn lưu giữ kỷ niệm ngày cưới).
   - Hộp mừng cưới thông minh: Quét mã VietQR động tích hợp tài khoản ngân hàng cô dâu chú rể, tiền chuyển thẳng vào tài khoản 100% không qua trung gian.
   - Sổ lưu bút ảnh trực tiếp (Live Photobooth): Khách mời chụp ảnh kỷ niệm và gửi lời chúc kèm khung ảnh Polaroid / Floral tại tiệc cưới.
   - Nhận thông báo xác nhận tham dự (RSVP) bắn thẳng về bot Telegram của cô dâu chú rể tức thì (realtime).
   - Không giới hạn số lượng ảnh tải lên trong album.
   - Hỗ trợ gắn tên miền riêng cho thiệp cưới.
   `.trim(),
    metadata: {
      action: 'view_pricing',
      ctaUrl: '/dashboard/billing',
    },
  },
  {
    category: 'features',
    title: 'Các tính năng nổi bật của thiệp cưới điện tử WebsiteThiep',
    tags: ['tính năng', 'hiệu ứng', 'sáp niêm phong', 'wax seal', 'nhạc nền', 'đếm ngược', 'bản đồ', 'google maps'],
    content: `
Thiệp cưới điện tử WebsiteThiep được thiết kế với công nghệ hiện đại mang lại trải nghiệm đỉnh cao:
- Hiệu ứng mở nắp sáp Wax Seal: Khách mời chạm vào con dấu sáp vàng hoàng gia để mở cánh thiệp như thiệp cưới cao cấp ngoài đời thực.
- Nhạc nền du dương (Background Music): Tự động phát nhạc nền khi khách mở thiệp, có thanh điều khiển âm lượng và tạm dừng tinh tế.
- Đồng hồ đếm ngược (Countdown Timer): Hiển thị đếm ngược đến ngày giờ thành hôn chính xác đến từng giây.
- Bản đồ chỉ đường Google Maps & Apple Maps: Khách mời bấm 1 nút là mở bản đồ dẫn đường chính xác đến tư gia hoặc trung tâm tiệc cưới.
- Hiệu ứng rơi lãng mạn (Falling Effect): Hiệu ứng cánh hoa hồng, tuyết rơi hoặc tim rơi bay bổng nhẹ nhàng.
- Thân thiện di động 100%: Tương thích hoàn hảo trên iPhone, Android và máy tính.
    `.trim(),
    metadata: {
      action: 'view_features',
    },
  },
  {
    category: 'features',
    title: 'Tính năng Hộp mừng cưới quét mã VietQR tự động',
    tags: ['hộp mừng cưới', 'vietqr', 'chuyển khoản', 'tiền mừng', 'ngân hàng', 'mã qr'],
    content: `
Tính năng Hộp mừng cưới thông minh trên WebsiteThiep giúp khách mời ở xa gửi quà mừng cưới tiện lợi:
- Hiển thị thông tin tài khoản ngân hàng của Nhà Trai hoặc Nhà Gái riêng biệt.
- Mã VietQR động: Tự động điền số tài khoản, tên chủ tài khoản và cú pháp chuyển khoản chúc mừng.
- Khách mời chỉ cần mở app ngân hàng bất kỳ (Vietcombank, MB, Techcombank, VPBank, MoMo...) quét mã là xong trong 5 giây.
- Tiền vào trực tiếp tài khoản ngân hàng của cô dâu chú rể, hệ thống KHÔNG thu bất kỳ phí giao dịch nào.
    `.trim(),
    metadata: {
      action: 'view_gift_qr',
    },
  },
  {
    category: 'features',
    title: 'Tính năng Xác nhận tham dự (RSVP) & Thông báo Telegram',
    tags: ['rsvp', 'xác nhận tham dự', 'điểm danh khách', 'telegram', 'thông báo', 'tiệc cưới'],
    content: `
Giải pháp quản lý số lượng khách mời thông minh RSVP:
- Khách mời nhận link thiệp có thể bấm xác nhận: "Sẽ tham dự", "Rất tiếc không thể đến", hoặc "Chưa chắc chắn".
- Khách có thể chọn số người đi kèm và yêu cầu chế độ ăn uống (ăn chay / ăn mặn) cùng lời chúc.
- Hệ thống tự động bắn tin nhắn thông báo về Telegram của dâu rể ngay khi khách vừa bấm xác nhận.
- Dâu rể dễ dàng xuất file Excel danh sách khách mời để chốt cỗ tiệc cưới chính xác, tránh lãng phí.
    `.trim(),
    metadata: {
      action: 'view_rsvp',
    },
  },
  {
    category: 'templates',
    title: 'Danh mục các mẫu thiệp cưới đang có trên website',
    tags: ['mẫu thiệp', 'giao diện thiệp', 'royal gold', 'minimalist', 'floral', 'vintage', 'monogram'],
    content: `
WebsiteThiep hiện có sẵn 5 bộ sưu tập mẫu thiệp cưới dẫn đầu xu hướng:
1. Mẫu Royal Gold: Phong cách hoàng gia quý tộc, viền kim loại ánh vàng sang trọng, font chữ cổ điển châu Âu.
2. Mẫu Minimalist Modern: Phong cách hiện đại tối giản, phối màu trắng đen thanh lịch cùng font chữ Google Instrument Serif thời thượng.
3. Mẫu Floral Romantic: Phong cách hoa tươi vườn thơ, tone hồng pastel dịu dàng kết hợp hiệu ứng cánh hoa bay.
4. Mẫu Vintage Classic: Phong cách cổ điển hoài niệm, chất liệu giấy kraft ấm áp cho đám cưới ấm cúng.
5. Mẫu Luxury Monogram: Phong cách khắc chữ cái đầu lồng ghép nghệ thuật của cô dâu và chú rể.
Tất cả mẫu đều cho phép tùy chỉnh ảnh, nội dung, ngày giờ tiệc cưới và xem trước trên điện thoại theo thời gian thực (Live Preview).
    `.trim(),
    metadata: {
      action: 'view_templates',
      ctaUrl: '/#templates',
    },
  },
  {
    category: 'payment',
    title: 'Quy trình thanh toán và kích hoạt gói dịch vụ tự động SePay VietQR',
    tags: ['thanh toán', 'sepay', 'kích hoạt', 'nâng cấp gói', 'vietqr', 'hóa đơn'],
    content: `
Hệ thống thanh toán của WebsiteThiep hoạt động hoàn toàn tự động 24/7 qua cổng SePay VietQR:
1. Bạn chọn gói dịch vụ (BASIC hoặc VIP) tại trang Thanh toán (/dashboard/billing).
2. Hệ thống hiển thị mã VietQR động có sẵn số tiền và mã đơn hàng (Order Code) duy nhất.
3. Bạn dùng ứng dụng ngân hàng quét mã và xác nhận chuyển khoản.
4. Ngay khi tiền vào tài khoản (chỉ từ 3 đến 5 giây), hệ thống SePay Webhook tự động kích hoạt gói dịch vụ tức thì, bạn không cần phải chờ đợi nhân viên duyệt thủ công.
5. Nếu cần hóa đơn hoặc hỗ trợ thanh toán, liên hệ ngay Hotline/Zalo hỗ trợ của shop.
    `.trim(),
    metadata: {
      action: 'payment_help',
      ctaUrl: '/dashboard/billing',
    },
  },
  {
    category: 'faq',
    title: 'Thiết kế mẫu thiệp riêng theo yêu cầu (Custom Design)',
    tags: ['thiết kế riêng', 'custom', 'yêu cầu riêng', 'tư vấn', 'liên hệ', 'zalo', 'sdt'],
    content: `
Nếu bạn muốn có một mẫu thiệp cưới thiết kế độc bản theo bộ nhận diện tiệc cưới hoặc theo phong cách riêng của hai bạn:
- Đội ngũ thiết kế của WebsiteThiep hỗ trợ thiết kế mẫu thiệp riêng 1-1 theo ý tưởng của dâu rể.
- Bạn chỉ cần để lại Số điện thoại hoặc Zalo ngay trong ô chat này.
- Chuyên viên tư vấn sẽ liên hệ lại qua Zalo trong vòng 10-15 phút để trao đổi ý tưởng và gửi bản demo mẫu thiết kế cho bạn duyệt!
    `.trim(),
    metadata: {
      action: 'custom_inquiry',
    },
  },
];

export async function seedAiKnowledge() {
  logger.info('📚 Bắt đầu nạp kho tri thức AI RAG (Seeding AI Knowledge Base)...');

  for (const item of KNOWLEDGE_ARTICLES) {
    let embedding: number[] = [];
    try {
      embedding = await generateEmbedding(`${item.title}\n\n${item.content}`);
    } catch {
      logger.warn({ title: item.title }, 'Không thể sinh embedding, dùng vector mặc định');
      embedding = new Array(768).fill(0);
    }

    const existing = await prisma.aiKnowledgeArticle.findFirst({
      where: { title: item.title },
    });

    if (existing) {
      await prisma.aiKnowledgeArticle.update({
        where: { id: existing.id },
        data: {
          category: item.category,
          content: item.content,
          tags: item.tags,
          embedding,
          metadata: item.metadata,
          isActive: true,
        },
      });
    } else {
      await prisma.aiKnowledgeArticle.create({
        data: {
          category: item.category,
          title: item.title,
          content: item.content,
          tags: item.tags,
          embedding,
          metadata: item.metadata,
          isActive: true,
        },
      });
    }
  }

  logger.info('🎉 Hoàn tất nạp kho tri thức AI RAG!');
}
