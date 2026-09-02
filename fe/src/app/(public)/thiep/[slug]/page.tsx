import React from "react";
import { Metadata } from "next";
import { WeddingView } from "@/components/wedding/WeddingView";
import { BirthdayView } from "@/components/birthday/BirthdayView";
import { NewbornView } from "@/components/newborn/NewbornView";
import { CardDetail } from "@/types/card.types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ g?: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const DEMO_WEDDING_CARD: CardDetail = {
  id: "demo-wedding-card",
  slug: "demo-wedding",
  cardCategory: "WEDDING",
  status: "ACTIVE",
  openingEffect: "WAX_SEAL",
  fallingEffect: "PETAL",
  musicUrl: "/music/le-duong.mp3",
  isAutoPlay: true,
  primaryColor: "#BE944E",
  fontFamily: "playfair",
  greetingMessage:
    "“Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.” Chúng mình rất vinh hạnh được đón tiếp bạn đến chung vui trong ngày trọng đại này!",
  categoryData: {
    cardCategory: "WEDDING",
    groom: {
      fullName: "Nguyễn Minh Khôi",
      shortName: "Minh Khôi",
      birthOrder: "Trưởng nam",
      avatarUrl: "/images/demo/groom-avatar.png",
      parents: {
        fatherName: "Nguyễn Văn Hùng",
        motherName: "Trần Thị Mai",
      },
      story: "Chàng trai đam mê nhiếp ảnh và luôn dành trọn tình cảm cho người bạn đời.",
    },
    bride: {
      fullName: "Lê Ngọc Hân",
      shortName: "Ngọc Hân",
      birthOrder: "Út nữ",
      avatarUrl: "/images/demo/bride-avatar.png",
      parents: {
        fatherName: "Lê Quốc Bảo",
        motherName: "Phạm Thu Cúc",
      },
      story: "Cô gái nhẹ nhàng yêu hoa cỏ, thích đọc sách và luôn mang đến nụ cười rạng rỡ.",
    },
    greeting:
      "Tình yêu là khi hai trái tim hòa cùng một nhịp đập. Chúng mình rất mong có sự hiện diện của bạn trong khoảnh khắc thiêng liêng này.",
    loveStory: [
      {
        title: "Lần Đầu Gặp Gỡ",
        date: "14/02/2020",
        description: "Chúng mình gặp nhau tại một quán cà phê nhỏ vào chiều mưa Hà Nội.",
        imageUrl: "/images/demo/couple-cover.png",
      },
      {
        title: "Lời Cầu Hôn Ngọt Ngào",
        date: "25/12/2023",
        description: "Dưới ánh hoàng hôn bên bờ biển Đà Nẵng, em đã nói 'Em đồng ý!'.",
        imageUrl: "/images/demo/couple-studio.png",
      },
    ],
    events: [
      {
        id: "ev-1",
        eventName: "Lễ Vu Quy (Nhà Gái)",
        eventDate: new Date("2026-11-20T09:00:00Z"),
        venueName: "Tư Gia Nhà Gái",
        address: "123 Đường Hoa Hồng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        mapUrl: "https://maps.google.com",
      },
      {
        id: "ev-2",
        eventName: "Tiệc Cưới Chính Thức",
        eventDate: new Date("2026-11-20T18:00:00Z"),
        venueName: "Trung Tâm Hội Nghị White Palace",
        address: "194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh",
        mapUrl: "https://maps.google.com",
      },
    ],
  },
  events: [
    {
      id: "ev-1",
      eventName: "Lễ Vu Quy (Nhà Gái)",
      eventDate: new Date("2026-11-20T09:00:00Z"),
      venueName: "Tư Gia Nhà Gái",
      address: "123 Đường Hoa Hồng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      mapUrl: "https://maps.google.com",
    },
    {
      id: "ev-2",
      eventName: "Tiệc Cưới Chính Thức",
      eventDate: new Date("2026-11-20T18:00:00Z"),
      venueName: "Trung Tâm Hội Nghị White Palace",
      address: "194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh",
      mapUrl: "https://maps.google.com",
    },
  ],
  photos: [
    {
      id: "p-1",
      url: "/images/demo/couple-cover.png",
      caption: "Khoảnh khắc hạnh phúc trọn vẹn",
      isCover: true,
    },
    {
      id: "p-2",
      url: "/images/demo/couple-studio.png",
      caption: "Nguyện cùng nhau đi hết thanh xuân",
    },
    {
      id: "p-3",
      url: "/images/demo/couple-aodai.png",
      caption: "Lễ Gia Tiên & Vu Quy truyền thống",
    },
  ],
  bankingPrimary: {
    bankCode: "MB",
    accountNumber: "9999999999",
    accountName: "NGUYEN MINH KHOI",
  },
  bankingSecondary: {
    bankCode: "VCB",
    accountNumber: "8888888888",
    accountName: "LE NGOC HAN",
  },
};

async function getCardData(slug: string, guestCode?: string) {
  if (slug === "demo-wedding" || slug.startsWith("demo-")) {
    return { card: DEMO_WEDDING_CARD, guestInfo: null };
  }
  try {
    const url = `${API_BASE_URL}/cards/by-slug/${slug}${guestCode ? `?g=${guestCode}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return { card: DEMO_WEDDING_CARD, guestInfo: null };
    const json = await res.json();
    return json.data || { card: DEMO_WEDDING_CARD, guestInfo: null };
  } catch (error) {
    console.error("Fetch card error:", error);
    return { card: DEMO_WEDDING_CARD, guestInfo: null };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCardData(slug);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cardvite.vn";

  if (!data || !data.card) {
    return {
      metadataBase: new URL(appUrl),
      title: "Thiệp Điện Tử Online | CardVite",
      description: "Nền tảng thiệp cưới, sinh nhật, thôi nôi điện tử cao cấp.",
    };
  }

  const card = data.card as CardDetail;
  const categoryData = card.categoryData as unknown as Record<string, any>;

  // Tạo title theo loại thiệp
  let title = "";
  let description = card.greetingMessage || "Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng mình!";

  if (card.cardCategory === "WEDDING") {
    const groomName = (categoryData.groom as Record<string, string>)?.fullName || "";
    const brideName = (categoryData.bride as Record<string, string>)?.fullName || "";
    // Lấy ngày sự kiện chính đầu tiên
    const mainEvent = card.events?.[0];
    const eventDateStr = mainEvent?.eventDate
      ? new Date(mainEvent.eventDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "";
    title = `Thiệp Cưới ${groomName} & ${brideName}${eventDateStr ? ` — ${eventDateStr}` : ""}`;
    description = `Kính mời bạn đến chung vui lễ thành hôn của ${groomName} và ${brideName}${eventDateStr ? ` vào ngày ${eventDateStr}` : ""}. ${description}`;
  } else if (card.cardCategory === "BIRTHDAY") {
    const celebrantName = (categoryData.celebrantName as string) || "";
    title = `Thiệp Mừng Sinh Nhật ${celebrantName}`;
    description = `Bạn được mời đến buổi tiệc sinh nhật của ${celebrantName}. ${description}`;
  } else {
    const babyName = (categoryData.babyName as string) || "";
    title = `Thiệp Mừng Thôi Nôi Bé ${babyName}`;
    description = `Bạn được mời đến buổi tiệc thôi nôi của bé ${babyName}. ${description}`;
  }

  const ogImage = card.photos?.[0]?.url;

  return {
    referrer: "no-referrer",
    metadataBase: new URL(appUrl),
    title: `${title} | CardVite`,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/thiep/${slug}`,
      siteName: "CardVite",
      locale: "vi_VN",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: {
      canonical: `${appUrl}/thiep/${slug}`,
    },
  };
}


export default async function CardPublicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { g: guestCode } = await searchParams;

  const result = await getCardData(slug, guestCode);

  if (!result || !result.card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 p-6 text-center">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">
          Không tìm thấy thiệp mời
        </h1>
        <p className="text-sm text-stone-500 max-w-sm">
          Đường dẫn thiệp không tồn tại hoặc đã hết hạn sử dụng. Vui lòng kiểm tra lại đường dẫn!
        </p>
      </div>
    );
  }

  const card: CardDetail = result.card;
  const guestName = result.guestInfo ? `${result.guestInfo.salutation || ""} ${result.guestInfo.fullName}`.trim() : undefined;
  const guestPhone = result.guestInfo?.phone;

  // RENDER VIEW THEO CARD CATEGORY
  if (card.cardCategory === "WEDDING") {
    return <WeddingView card={card} templateSlug={card.template?.slug} guestName={guestName} guestPhone={guestPhone} guestCode={guestCode} isVipExperience={result.features?.vipOpeningExperience} />;
  }

  if (card.cardCategory === "BIRTHDAY") {
    return <BirthdayView card={card} templateSlug={card.template?.slug} guestName={guestName} guestPhone={guestPhone} guestCode={guestCode} isVipExperience={result.features?.vipOpeningExperience} />;
  }

  if (card.cardCategory === "NEWBORN") {
    return <NewbornView card={card} templateSlug={card.template?.slug} guestName={guestName} guestPhone={guestPhone} guestCode={guestCode} isVipExperience={result.features?.vipOpeningExperience} />;
  }

  return <div>Danh mục thiệp không xác định</div>;
}
