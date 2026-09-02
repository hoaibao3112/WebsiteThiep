import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo mầm dữ liệu (Database Seeding)...");

  // 1. Tạo Gói Dịch Vụ (Plans)
  const freePlan = await prisma.plan.upsert({
    where: { code: "FREE" },
    update: {},
    create: {
      code: "FREE",
      name: "Gói Dùng Thử",
      price: 0,
      durationDays: 7,
      maxPhotos: 5,
      hasWatermark: true,
      allowCustomDomain: false,
      allowMusicUpload: false,
      allowTelegramNoti: false,
      sortOrder: 1,
      features: [
        "Sử dụng đầy đủ mẫu thiệp cơ bản",
        "Hiệu ứng mở phong bì tiêu chuẩn",
        "Tối đa 5 ảnh album",
        "Lưu trữ trong 7 ngày",
        "Có logo hệ thống",
      ],
    },
  });

  const basicPlan = await prisma.plan.upsert({
    where: { code: "BASIC" },
    update: {},
    create: {
      code: "BASIC",
      name: "Gói Tiêu Chuẩn",
      price: 199000,
      durationDays: 180,
      maxPhotos: 20,
      hasWatermark: false,
      allowCustomDomain: false,
      allowMusicUpload: true,
      allowTelegramNoti: false,
      sortOrder: 2,
      features: [
        "Xóa hoàn toàn logo hệ thống",
        "Lưu trữ 6 tháng",
        "Tối đa 20 ảnh album chất lượng cao",
        "Tự chọn & tải nhạc nền tùy thích",
        "Quản lý khách mời & RSVP Dashboard",
        "Hộp mừng cưới mã QR VietQR",
      ],
    },
  });

  const vipPlan = await prisma.plan.upsert({
    where: { code: "VIP" },
    update: {},
    create: {
      code: "VIP",
      name: "Gói Cao Cấp (VIP)",
      price: 399000,
      durationDays: null, // Vĩnh viễn
      maxPhotos: 50,
      hasWatermark: false,
      allowCustomDomain: true,
      allowMusicUpload: true,
      allowTelegramNoti: true,
      sortOrder: 3,
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
  });

  console.log("✅ Đã tạo xong các gói dịch vụ (FREE, BASIC, VIP)");

  // 2. Tạo Mẫu Thiệp Mẫu (Templates)
  const templates = [
    {
      slug: "wedding-hong-xanh-luxury",
      name: "Hồng Xanh Luxury",
      category: "WEDDING" as const,
      thumbnailUrl: "/images/demo/couple-cover.png",
      isPremium: true,
      configJson: {
        themeColor: "#8B9D83",
        fontFamily: "Playfair Display",
        style: "Classic Elegant",
      },
    },
    {
      slug: "wedding-minimalist-gold",
      name: "Hoàng Gia Minimalist",
      category: "WEDDING" as const,
      thumbnailUrl: "/images/demo/couple-studio.png",
      isPremium: false,
      configJson: {
        themeColor: "#D4AF37",
        fontFamily: "Inter",
        style: "Modern Minimalist",
      },
    },
    {
      slug: "birthday-glow-party",
      name: "Neon Glow Birthday Party",
      category: "BIRTHDAY" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&auto=format&fit=crop",
      isPremium: false,
      configJson: {
        themeColor: "#FF007F",
        fontFamily: "Outfit",
        style: "Vibrant Party",
      },
    },
    {
      slug: "newborn-little-prince",
      name: "Hoàng Tử Nhỏ (Đầy Tháng / Thôi Nôi)",
      category: "NEWBORN" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop",
      isPremium: false,
      configJson: {
        themeColor: "#70A1FF",
        fontFamily: "Quicksand",
        style: "Cute & Soft",
      },
    },
    {
      slug: "newborn-sweet-angel",
      name: "Thiên Thần Nhỏ (Báo Hỷ / Đầy Tháng)",
      category: "NEWBORN" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&auto=format&fit=crop",
      isPremium: false,
      configJson: {
        themeColor: "#FFB8B8",
        fontFamily: "Quicksand",
        style: "Sweet Pastel",
      },
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }
  console.log("✅ Đã tạo xong danh sách mẫu thiệp (Wedding, Birthday, Newborn)");

  // 3. Tạo User Demo
  await prisma.user.upsert({
    where: { email: "admin@cardplatform.com" },
    update: {},
    create: {
      email: "admin@cardplatform.com",
      name: "Administrator",
      role: "ADMIN",
    },
  });

  console.log("🎉 Seeding Database hoàn tất!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding thất bại:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
