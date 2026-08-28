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

async function getCardData(slug: string, guestCode?: string) {
  try {
    const url = `${API_BASE_URL}/cards/by-slug/${slug}${guestCode ? `?g=${guestCode}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Fetch card error:", error);
    return null;
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
