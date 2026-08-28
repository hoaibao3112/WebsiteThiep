export interface CategoryMeta {
  key: "WEDDING" | "BIRTHDAY" | "NEWBORN";
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  color: string;
}

export const CARD_CATEGORIES: CategoryMeta[] = [
  {
    key: "WEDDING",
    title: "Thiệp Cưới Online",
    subtitle: "Trang trọng, lãng mạn, lưu giữ khoảnh khắc trăm năm",
    icon: "HeartHandshake",
    badge: "Hot",
    color: "from-rose-500 to-pink-600",
  },
  {
    key: "BIRTHDAY",
    title: "Thiệp Mời Sinh Nhật",
    subtitle: "Sôi động, hiện đại, đếm ngược bữa tiệc đáng nhớ",
    icon: "Cake",
    badge: "Mới",
    color: "from-amber-500 to-orange-600",
  },
  {
    key: "NEWBORN",
    title: "Thiệp Báo Hỷ & Thôi Nôi",
    subtitle: "Báo tin thiên thần nhỏ, tiệc đầy tháng & sinh nhật 1 tuổi",
    icon: "Baby",
    badge: "Được yêu thích",
    color: "from-sky-400 to-blue-600",
  },
];
