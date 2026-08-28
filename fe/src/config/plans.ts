export interface PlanConfig {
  code: "FREE" | "BASIC" | "VIP";
  name: string;
  price: number;
  durationLabel: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export const PLANS: PlanConfig[] = [
  {
    code: "FREE",
    name: "Gói Dùng Thử",
    price: 0,
    durationLabel: "7 ngày",
    features: [
      "Mẫu thiệp cơ bản",
      "Hiệu ứng mở phong bì tiêu chuẩn",
      "Tối đa 5 ảnh album",
      "Lưu trữ trong 7 ngày",
      "Có logo hệ thống",
    ],
  },
  {
    code: "BASIC",
    name: "Gói Tiêu Chuẩn",
    price: 199000,
    durationLabel: "6 tháng",
    popular: true,
    badge: "Phổ biến nhất",
    features: [
      "Xóa hoàn toàn logo hệ thống",
      "Lưu trữ 6 tháng",
      "Tối đa 20 ảnh album chất lượng cao",
      "Tự chọn & tải nhạc nền tùy thích",
      "Quản lý khách mời & RSVP Dashboard",
      "Hộp mừng cưới mã QR VietQR",
    ],
  },
  {
    code: "VIP",
    name: "Gói Cao Cấp (VIP)",
    price: 399000,
    durationLabel: "Vĩnh viễn",
    badge: "Trọn đời",
    features: [
      "Lưu trữ vĩnh viễn (Kỷ niệm trọn đời)",
      "Không giới hạn ảnh album",
      "Tùy chỉnh đường dẫn URL đẹp",
      "Thông báo RSVP tức thì qua Telegram Bot",
      "Xuất file Excel danh sách khách mời",
      "Hiệu ứng phong bì & cánh hoa độc quyền",
      "Hỗ trợ kỹ thuật ưu tiên 24/7",
    ],
  },
];
