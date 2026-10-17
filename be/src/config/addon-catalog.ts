export type AddonCategory =
  | "time"
  | "photo"
  | "card"
  | "view"
  | "custom_domain"
  | "system_domain"
  | "profile";

export type AddonQuotaType =
  | "DAYS"
  | "EXTRA_CARDS"
  | "EXTRA_PHOTOS"
  | "EXTRA_VIEWS"
  | "EXTRA_DOMAINS"
  | "SYSTEM_DOMAIN"
  | "EXTRA_PROFILES";

export interface AddonItem {
  code: string;
  name: string;
  category: AddonCategory;
  price: number; // VND - Server authoritative
  description: string;
  badge: string;
  icon: "clock" | "card" | "image" | "eye" | "globe" | "domain" | "heart";
  isFeatured?: boolean; // Hiển thị trong mục "Đề xuất cho bạn"
  quotaType: AddonQuotaType;
  quotaValue: number;
  requiredPlanCode?: "BASIC" | "VIP"; // Yêu cầu gói tối thiểu
}

export const ADDON_CATALOG: AddonItem[] = [
  // 1. Gia hạn thời gian
  {
    code: "ADDON_EXTEND_6M",
    name: "Gia hạn 6 tháng",
    category: "time",
    price: 59000,
    description: "Gia hạn thiệp thêm 6 tháng",
    badge: "+6 tháng",
    icon: "clock",
    isFeatured: true,
    quotaType: "DAYS",
    quotaValue: 180,
  },

  // 2. Thêm thiệp
  {
    code: "ADDON_CARDS_10",
    name: "Thêm 10 thiệp",
    category: "card",
    price: 239000,
    description: "Tăng giới hạn tạo thêm 10 thiệp",
    badge: "+10 thiệp",
    icon: "card",
    isFeatured: true,
    quotaType: "EXTRA_CARDS",
    quotaValue: 10,
  },
  {
    code: "ADDON_CARDS_1",
    name: "Thêm 1 thiệp",
    category: "card",
    price: 49000,
    description: "Tăng giới hạn thêm 1 thiệp",
    badge: "+1 thiệp",
    icon: "card",
    quotaType: "EXTRA_CARDS",
    quotaValue: 1,
  },
  {
    code: "ADDON_CARDS_2",
    name: "Thêm 2 thiệp",
    category: "card",
    price: 69000,
    description: "Tăng giới hạn tạo thêm 2 thiệp",
    badge: "+2 thiệp",
    icon: "card",
    quotaType: "EXTRA_CARDS",
    quotaValue: 2,
  },
  {
    code: "ADDON_CARDS_5",
    name: "Thêm 5 thiệp",
    category: "card",
    price: 159000,
    description: "Tăng giới hạn tạo thêm 5 thiệp",
    badge: "+5 thiệp",
    icon: "card",
    quotaType: "EXTRA_CARDS",
    quotaValue: 5,
  },

  // 3. Tăng kho ảnh
  {
    code: "ADDON_PHOTOS_10",
    name: "Thêm 10 hình ảnh",
    category: "photo",
    price: 59000,
    description: "Tăng giới hạn upload thêm 10 hình ảnh",
    badge: "+10 ảnh",
    icon: "image",
    isFeatured: true,
    quotaType: "EXTRA_PHOTOS",
    quotaValue: 10,
  },
  {
    code: "ADDON_PHOTOS_20",
    name: "Thêm 20 hình ảnh",
    category: "photo",
    price: 99000,
    description: "Tăng giới hạn upload thêm 20 hình ảnh",
    badge: "+20 ảnh",
    icon: "image",
    quotaType: "EXTRA_PHOTOS",
    quotaValue: 20,
  },

  // 4. Tăng lượt xem
  {
    code: "ADDON_VIEWS_1K",
    name: "Tăng thêm 1,000 lượt xem",
    category: "view",
    price: 49000,
    description: "Tăng giới hạn lượt xem thêm 1,000 lượt",
    badge: "+1.000 lượt xem",
    icon: "eye",
    quotaType: "EXTRA_VIEWS",
    quotaValue: 1000,
  },
  {
    code: "ADDON_VIEWS_2K",
    name: "Tăng thêm 2,000 lượt xem",
    category: "view",
    price: 89000,
    description: "Tăng giới hạn lượt xem thêm 2,000 lượt",
    badge: "+2.000 lượt xem",
    icon: "eye",
    quotaType: "EXTRA_VIEWS",
    quotaValue: 2000,
  },

  // 5. Tên miền riêng (yêu cầu gói BASIC/VIP)
  {
    code: "ADDON_DOMAIN_1",
    name: "+1 tên miền riêng",
    category: "custom_domain",
    price: 50000,
    description: "Thêm 1 tên miền riêng cho link thiệp, dùng 12 tháng kể từ ngày mua. Cần gói có tên miền...",
    badge: "+1 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 1,
    requiredPlanCode: "BASIC",
  },
  {
    code: "ADDON_DOMAIN_3",
    name: "+3 tên miền riêng",
    category: "custom_domain",
    price: 150000,
    description: "Thêm 3 tên miền riêng cho link thiệp, dùng 12 tháng kể từ ngày mua. Cần gói có tên miền...",
    badge: "+3 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 3,
    requiredPlanCode: "BASIC",
  },
  {
    code: "ADDON_DOMAIN_5",
    name: "+5 tên miền riêng",
    category: "custom_domain",
    price: 250000,
    description: "Thêm 5 tên miền riêng cho link thiệp, dùng 12 tháng kể từ ngày mua. Cần gói có tên miền...",
    badge: "+5 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 5,
    requiredPlanCode: "BASIC",
  },
  {
    code: "ADDON_DOMAIN_10",
    name: "+10 tên miền riêng",
    category: "custom_domain",
    price: 500000,
    description: "Thêm 10 tên miền riêng cho link thiệp, dùng 12 tháng kể từ ngày mua. Cần gói có tên miền...",
    badge: "+10 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 10,
    requiredPlanCode: "BASIC",
  },
  {
    code: "ADDON_DOMAIN_20",
    name: "+20 tên miền riêng",
    category: "custom_domain",
    price: 1000000,
    description: "Thêm 20 tên miền riêng cho link thiệp, dùng 12 tháng kể từ ngày mua. Cần gói có tên miền...",
    badge: "+20 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 20,
    requiredPlanCode: "BASIC",
  },

  // 6. Tên miền hệ thống
  {
    code: "ADDON_SYS_INVY",
    name: "Tên miền invy.vn",
    category: "system_domain",
    price: 50000,
    description: "Link thiệp ngắn gọn, dễ nhớ với tên miền invy.vn, dùng cho mọi thiệp của bạn trong 12...",
    badge: "invy.vn",
    icon: "domain",
    quotaType: "SYSTEM_DOMAIN",
    quotaValue: 1,
  },
  {
    code: "ADDON_SYS_MOTDOI",
    name: "Tên miền motdoi.vn",
    category: "system_domain",
    price: 50000,
    description: "Link thiệp mang ý nghĩa \"một đôi\" hoặc \"một đời\" với tên miền motdoi.vn, dùng cho mọi...",
    badge: "motdoi.vn",
    icon: "domain",
    quotaType: "SYSTEM_DOMAIN",
    quotaValue: 1,
  },
  {
    code: "ADDON_SYS_RSVP",
    name: "Tên miền rsvp.vn",
    category: "system_domain",
    price: 50000,
    description: "Link thiệp gợi ngay lời mời xác nhận tham dự với tên miền rsvp.vn, dùng cho mọi thiệp của...",
    badge: "rsvp.vn",
    icon: "domain",
    quotaType: "SYSTEM_DOMAIN",
    quotaValue: 1,
  },

  // 7. Hồ sơ cưới
  {
    code: "ADDON_PROFILE_1",
    name: "+1 hồ sơ cưới",
    category: "profile",
    price: 10000,
    description: "Thêm 1 hồ sơ cưới để lưu sẵn thông tin cặp đôi, ngày cưới và sự kiện, điền nhanh khi là...",
    badge: "+1 hồ sơ",
    icon: "heart",
    quotaType: "EXTRA_PROFILES",
    quotaValue: 1,
  },
];

export function getAddonByCode(code: string): AddonItem | undefined {
  return ADDON_CATALOG.find((item) => item.code === code);
}
