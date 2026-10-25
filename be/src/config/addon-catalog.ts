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
  // 1. Gia hạn thời gian (Dành cho gói BASIC)
  {
    code: "ADDON_EXTEND_6M",
    name: "Gia hạn 6 tháng",
    category: "time",
    price: 59000,
    description: "Gia hạn tài khoản Gói Tiêu Chuẩn (BASIC) thêm 6 tháng",
    badge: "+6 tháng",
    icon: "clock",
    isFeatured: true,
    quotaType: "DAYS",
    quotaValue: 180,
    requiredPlanCode: "BASIC",
  },

  // 2. Thêm thiệp cưới
  {
    code: "ADDON_CARDS_1",
    name: "Thêm 1 thiệp",
    category: "card",
    price: 49000,
    description: "Tăng giới hạn thêm 1 thiệp cưới vào tài khoản",
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
    description: "Tăng giới hạn tạo thêm 2 thiệp cưới",
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
    description: "Tăng giới hạn tạo thêm 5 thiệp cưới",
    badge: "+5 thiệp",
    icon: "card",
    quotaType: "EXTRA_CARDS",
    quotaValue: 5,
  },
  {
    code: "ADDON_CARDS_10",
    name: "Thêm 10 thiệp",
    category: "card",
    price: 239000,
    description: "Tăng giới hạn tạo thêm 10 thiệp cưới (Ưu đãi đặc biệt)",
    badge: "+10 thiệp",
    icon: "card",
    isFeatured: true,
    quotaType: "EXTRA_CARDS",
    quotaValue: 10,
  },

  // 3. Tăng kho ảnh album
  {
    code: "ADDON_PHOTOS_10",
    name: "Thêm 10 hình ảnh",
    category: "photo",
    price: 59000,
    description: "Tăng giới hạn upload thêm 10 hình ảnh album",
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
    description: "Tăng giới hạn upload thêm 20 hình ảnh album",
    badge: "+20 ảnh",
    icon: "image",
    quotaType: "EXTRA_PHOTOS",
    quotaValue: 20,
  },

  // 4. Tên miền riêng (Hỗ trợ tài khoản có nhu cầu dùng domain riêng)
  {
    code: "ADDON_DOMAIN_1",
    name: "+1 tên miền riêng",
    category: "custom_domain",
    price: 50000,
    description: "Thêm 1 slot kết nối tên miền riêng cho link thiệp cưới",
    badge: "+1 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 1,
  },
  {
    code: "ADDON_DOMAIN_3",
    name: "+3 tên miền riêng",
    category: "custom_domain",
    price: 150000,
    description: "Thêm 3 slot kết nối tên miền riêng cho các thiệp cưới",
    badge: "+3 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 3,
  },
  {
    code: "ADDON_DOMAIN_5",
    name: "+5 tên miền riêng",
    category: "custom_domain",
    price: 250000,
    description: "Thêm 5 slot kết nối tên miền riêng cho các thiệp cưới",
    badge: "+5 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 5,
  },
  {
    code: "ADDON_DOMAIN_10",
    name: "+10 tên miền riêng",
    category: "custom_domain",
    price: 500000,
    description: "Thêm 10 slot kết nối tên miền riêng cho các thiệp cưới",
    badge: "+10 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 10,
  },
  {
    code: "ADDON_DOMAIN_20",
    name: "+20 tên miền riêng",
    category: "custom_domain",
    price: 1000000,
    description: "Thêm 20 slot kết nối tên miền riêng cho các thiệp cưới",
    badge: "+20 tên miền",
    icon: "globe",
    quotaType: "EXTRA_DOMAINS",
    quotaValue: 20,
  },
];

export function getAddonByCode(code: string): AddonItem | undefined {
  return ADDON_CATALOG.find((item) => item.code === code);
}
