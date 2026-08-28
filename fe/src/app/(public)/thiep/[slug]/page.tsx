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
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop",
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
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop",
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
        imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop",
      },
      {
        title: "Lời Cầu Hôn Ngọt Ngào",
        date: "25/12/2023",
        description: "Dưới ánh hoàng hôn bên bờ biển Đà Nẵng, em đã nói 'Em đồng ý!'.",
        imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop",
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
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
      caption: "Khoảnh khắc hạnh phúc",
      isCover: true,
    },
    {
      id: "p-2",
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop",
      caption: "Cùng nhau đi khắp thế gian",
    },
    {
      id: "p-3",
      url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop",
      caption: "Nụ cười của em",
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
  if (!data || !data.card) {
    return {
      title: "Thiệp Điện Tử Online | Junvite Style",
      description: "Nền tảng thiệp cưới, sinh nhật, thôi nôi điện tử cao cấp.",
    };
  }

  const card = data.card as CardDetail;
  const title =
    card.cardCategory === "WEDDING"
      ? `Thiệp cưới ${(card.categoryData as any).groom?.fullName} & ${(card.categoryData as any).bride?.fullName}`
      : card.cardCategory === "BIRTHDAY"
      ? `Thiệp mời sinh nhật ${(card.categoryData as any).celebrantName}`
      : `Thiệp mừng bé ${(card.categoryData as any).babyName}`;

  return {
    title: `${title} | Thiệp Online`,
    description: card.greetingMessage || "Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng mình!",
    openGraph: {
      title,
      description: card.greetingMessage || "Trân trọng kính mời quý khách tham dự!",
      images: card.photos[0]?.url ? [card.photos[0].url] : [],
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
  const guestName = result.guestInfo?.fullName;

  // RENDER VIEW THEO CARD CATEGORY
  if (card.cardCategory === "WEDDING") {
    return <WeddingView card={card} guestName={guestName} guestCode={guestCode} />;
  }

  if (card.cardCategory === "BIRTHDAY") {
    return <BirthdayView card={card} guestName={guestName} guestCode={guestCode} />;
  }

  if (card.cardCategory === "NEWBORN") {
    return <NewbornView card={card} guestName={guestName} guestCode={guestCode} />;
  }

  return <div>Danh mục thiệp không xác định</div>;
}
