import React from "react";
import { Metadata } from "next";
import { WeddingView } from "@/components/wedding/WeddingView";
import { BirthdayView } from "@/components/birthday/BirthdayView";
import { NewbornView } from "@/components/newborn/NewbornView";
import { CanvasCardView } from "@/components/card/CanvasCardView";
import { CardDetail } from "@/types/card.types";
import { DEMO_TEMPLATES_MAP } from "./demo-templates-data";
import { DemoActionBarWrapper } from "./DemoActionBarWrapper";
import { MASTER_TEMPLATES } from "@/lib/templates-data";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ g?: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const DEMO_WEDDING_CARD: CardDetail = DEMO_TEMPLATES_MAP["wedding-heritage-crimson-gold"];

async function getCardData(slug: string, guestCode?: string) {
  // 1. Luôn ưu tiên fetch trực tiếp từ Backend Database API
  try {
    const url = `${API_BASE_URL}/cards/by-slug/${slug}${guestCode ? `?g=${guestCode}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.card) {
        return json.data;
      }
    }
  } catch (error) {
    console.warn("[getCardData] Backend API fetch error, falling back:", error);
  }

  // 2. Dự phòng dữ liệu mẫu nếu Backend chưa phản hồi
  if (DEMO_TEMPLATES_MAP[slug]) {
    return { card: DEMO_TEMPLATES_MAP[slug], guestInfo: null };
  }

  if (slug === "demo-wedding" || slug.startsWith("demo-")) {
    return { card: DEMO_WEDDING_CARD, guestInfo: null };
  }

  return { card: DEMO_WEDDING_CARD, guestInfo: null };
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
    title,
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

  // Truyền templateSlug ưu tiên từ card.template?.slug hoặc chính slug URL
  const effectiveTemplateSlug = card.template?.slug || slug;

  // Xác định có phải thiệp mẫu demo hay không (để hiện Floating CTA)
  const isDemoTemplate = Boolean(DEMO_TEMPLATES_MAP[slug]);
  const demoTemplateName = isDemoTemplate
    ? MASTER_TEMPLATES.find((t) => t.slug === slug)?.name
    : undefined;

  const categoryData = card.categoryData as unknown as Record<string, unknown>;
  const legacyCanvas = categoryData.canvas && typeof categoryData.canvas === "object" && !Array.isArray(categoryData.canvas)
    ? categoryData.canvas as Record<string, unknown>
    : null;
  const hasCanvasElements = (Array.isArray(categoryData.canvasElements) && categoryData.canvasElements.length > 0) ||
    (Array.isArray(legacyCanvas?.elements) && legacyCanvas.elements.length > 0);

  // Wedding cards are rendered through the shared 9-template scene renderer;
  // it also overlays legacy editor elements inside WeddingView. Keep the
  // generic canvas route for non-wedding categories only.
  if (hasCanvasElements && card.cardCategory !== "WEDDING") {
    return (
      <CanvasCardView
        card={card}
        guestName={guestName}
        guestPhone={guestPhone}
        guestCode={guestCode}
      />
    );
  }

  // RENDER VIEW THEO CARD CATEGORY
  if (card.cardCategory === "WEDDING") {
    return (
      <>
        <WeddingView
          card={card}
          templateSlug={effectiveTemplateSlug}
          guestName={guestName}
          guestPhone={guestPhone}
          guestCode={guestCode}
          isVipExperience={result.features?.vipOpeningExperience}
        />
        {isDemoTemplate && (
          <DemoActionBarWrapper
            templateSlug={effectiveTemplateSlug}
            templateName={demoTemplateName}
            category={card.cardCategory}
          />
        )}
      </>
    );
  }

  if (card.cardCategory === "BIRTHDAY") {
    return (
      <>
        <BirthdayView
          card={card}
          templateSlug={card.template?.slug}
          guestName={guestName}
          guestPhone={guestPhone}
          guestCode={guestCode}
          isVipExperience={result.features?.vipOpeningExperience}
        />
        {isDemoTemplate && (
          <DemoActionBarWrapper
            templateSlug={effectiveTemplateSlug}
            templateName={demoTemplateName}
            category={card.cardCategory}
          />
        )}
      </>
    );
  }

  if (card.cardCategory === "NEWBORN") {
    return (
      <>
        <NewbornView
          card={card}
          templateSlug={card.template?.slug}
          guestName={guestName}
          guestPhone={guestPhone}
          guestCode={guestCode}
          isVipExperience={result.features?.vipOpeningExperience}
        />
        {isDemoTemplate && (
          <DemoActionBarWrapper
            templateSlug={effectiveTemplateSlug}
            templateName={demoTemplateName}
            category={card.cardCategory}
          />
        )}
      </>
    );
  }

  return <div>Danh mục thiệp không xác định</div>;
}
