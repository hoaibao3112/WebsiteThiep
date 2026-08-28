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

export const getLocalizedPlans = (t: (key: any) => string): PlanConfig[] => [
  {
    code: "FREE",
    name: t("planConfigTrialName") || "Gói Dùng Thử",
    price: 0,
    durationLabel: t("planConfigTrialDuration") || "7 ngày",
    features: [
      t("planConfigTrialFeat1") || "Mẫu thiệp cơ bản",
      t("planConfigTrialFeat2") || "Hiệu ứng mở phong bì tiêu chuẩn",
      t("planConfigTrialFeat3") || "Tối đa 5 ảnh album",
      t("planConfigTrialFeat4") || "Lưu trữ trong 7 ngày",
      t("planConfigTrialFeat5") || "Có logo hệ thống",
    ],
  },
  {
    code: "BASIC",
    name: t("planConfigStandardName") || "Gói Tiêu Chuẩn",
    price: 199000,
    durationLabel: t("planConfigStandardDuration") || "6 tháng",
    popular: true,
    badge: t("planConfigStandardBadge") || "Phổ biến nhất",
    features: [
      t("planConfigStandardFeat1") || "Xóa hoàn toàn logo hệ thống",
      t("planConfigStandardFeat2") || "Lưu trữ 6 tháng",
      t("planConfigStandardFeat3") || "Tối đa 20 ảnh album chất lượng cao",
      t("planConfigStandardFeat4") || "Tự chọn & tải nhạc nền tùy thích",
      t("planConfigStandardFeat5") || "Quản lý khách mời & RSVP Dashboard",
      t("planConfigStandardFeat6") || "Hộp mừng cưới mã QR VietQR",
    ],
  },
  {
    code: "VIP",
    name: t("planConfigVipName") || "Gói Cao Cấp (VIP)",
    price: 399000,
    durationLabel: t("planConfigVipDuration") || "Vĩnh viễn",
    badge: t("planConfigVipBadge") || "Trọn đời",
    features: [
      t("planConfigVipFeat1") || "Lưu trữ vĩnh viễn (Kỷ niệm trọn đời)",
      t("planConfigVipFeat2") || "Không giới hạn ảnh album",
      t("planConfigVipFeat3") || "Tùy chỉnh đường dẫn URL đẹp",
      t("planConfigVipFeat4") || "Thông báo RSVP tức thì qua Telegram Bot",
      t("planConfigVipFeat5") || "Xuất file Excel danh sách khách mời",
      t("planConfigVipFeat6") || "Hiệu ứng phong bì & cánh hoa độc quyền",
      t("planConfigVipFeat7") || "Hỗ trợ kỹ thuật ưu tiên 24/7",
    ],
  },
];
