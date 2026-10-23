import React, { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeddingView } from "@/components/wedding/WeddingView";
import { BirthdayView } from "@/components/birthday/BirthdayView";
import { NewbornView } from "@/components/newborn/NewbornView";
import { CanvasCardView } from "@/components/card/CanvasCardView";
import { CardDetail } from "@/types/card.types";
import { DEMO_TEMPLATES_MAP } from "./demo-templates-data";
import { DemoActionBarWrapper } from "./DemoActionBarWrapper";
import { MASTER_TEMPLATES } from "@/lib/templates-data";
import { DesktopMobileQrWidget } from "@/components/shared/DesktopMobileQrWidget";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    g?: string;
    invite?: string;
    share?: string;
    mode?: string;
    preview?: string;
  }>;
}

function getApiBaseUrl(): string {
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (process.env.BACKEND_INTERNAL_URL) return `${process.env.BACKEND_INTERNAL_URL}/api`;
  if (process.env.BACKEND_ORIGIN) return `${process.env.BACKEND_ORIGIN}/api`;
  const nextApi = process.env.NEXT_PUBLIC_API_URL;
  if (nextApi && nextApi.startsWith("http")) return nextApi;
  return "https://websitethiep.onrender.com/api";
}

function getAppUrl(): string {
  let url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    url = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }
  if (!url) {
    url = "https://website-thiep.vercel.app";
  }
  return url.replace(/^["']|["']$/g, "").replace(/\/$/, "");
}

const API_BASE_URL = getApiBaseUrl();

const DEMO_WEDDING_CARD: CardDetail = DEMO_TEMPLATES_MAP["wedding-heritage-crimson-gold"];

/**
 * Deduplicate fetch giữa generateMetadata và Page component trong cùng render pass
 */
const getCardData = cache(async (slug: string, guestCode?: string) => {
  const isExplicitDemo = Boolean(
    DEMO_TEMPLATES_MAP[slug] || slug === "demo-wedding" || slug.startsWith("demo-")
  );

  // 1. Chỉ fallback demo khi slug thuộc DEMO_TEMPLATES_MAP hoặc bắt đầu bằng "demo-"
  if (isExplicitDemo) {
    if (DEMO_TEMPLATES_MAP[slug]) {
      return { card: DEMO_TEMPLATES_MAP[slug], guestInfo: null, isDatabaseCard: false };
    }
    return { card: DEMO_WEDDING_CARD, guestInfo: null, isDatabaseCard: false };
  }

  // 2. Fetch dữ liệu thật từ Backend Database API với timeout 8s
  const url = `${API_BASE_URL}/cards/by-slug/${encodeURIComponent(slug)}${
    guestCode ? `?g=${encodeURIComponent(guestCode)}` : ""
  }`;

  const fetchOptions: RequestInit = {
    signal: AbortSignal.timeout(8000),
    ...(guestCode ? { cache: "no-store" } : { next: { revalidate: 30 } }),
  };

  let res: Response;
  try {
    res = await fetch(url, fetchOptions);
  } catch (error) {
    console.error("[getCardData] Fetch error:", error);
    // Timeout hoặc 5xx: throw error để Next.js error.tsx bắt và hiện nút Thử lại (không hiện demo card người khác)
    throw new Error(`Không thể kết nối đến máy chủ để tải thiệp cưới (${slug}). Vui lòng thử lại!`);
  }

  // Backend trả 404 -> notFound()
  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(`Máy chủ phản hồi lỗi (${res.status}) khi tải dữ liệu thiệp cưới.`);
  }

  const json = await res.json();
  if (json.success && json.data?.card) {
    return { ...json.data, isDatabaseCard: true };
  }

  notFound();
});

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const guestCode = resolvedSearchParams?.g;
  const isLiveDisplay = resolvedSearchParams?.mode === "live-display";
  const hasGuest = Boolean(guestCode);

  const data = await getCardData(slug, guestCode);
  const appUrl = getAppUrl();

  if (!data || !data.card) {
    return {
      metadataBase: new URL(appUrl),
      title: "Thiệp Điện Tử Online | CardVite",
      description: "Nền tảng thiệp cưới, sinh nhật, thôi nôi điện tử cao cấp.",
      robots: { index: false, follow: false },
    };
  }

  const card = data.card as CardDetail;
  const categoryData = card.categoryData as unknown as Record<string, any>;

  // Tạo title theo loại thiệp
  let title = "";
  let description = card.greetingMessage || "Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng mình!";
  let groomName = "";
  let brideName = "";
  let eventDateStr = "";
  let venueName = "";

  if (card.cardCategory === "WEDDING") {
    groomName = (categoryData.groom as Record<string, string>)?.fullName || "";
    brideName = (categoryData.bride as Record<string, string>)?.fullName || "";
    const mainEvent = card.events?.[0];
    venueName = mainEvent?.venueName || "";
    eventDateStr = mainEvent?.eventDate
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

  // Cá nhân hóa Title & Description khi có thông tin khách mời
  let guestDisplayName = "";
  const guestInfo = data.guestInfo as { salutation?: string; fullName?: string } | undefined;
  if (guestInfo?.fullName) {
    const salutation = guestInfo.salutation ? `${guestInfo.salutation} ` : "";
    guestDisplayName = `${salutation}${guestInfo.fullName}`.trim();
    if (card.cardCategory === "WEDDING") {
      title = `💌 Kính mời ${guestDisplayName} — Lễ Thành Hôn ${groomName} & ${brideName}`;
      description = `${guestDisplayName} ơi, sự hiện diện của bạn là niềm vinh hạnh to lớn của chúng mình. Bấm để xem thiệp cưới và xác nhận tham dự nhé! 🌸`;
    } else {
      title = `💌 Trân trọng kính mời ${guestDisplayName} tham dự buổi tiệc`;
    }
  }

  // OG image: Luôn dùng absolute URL bắt đầu bằng https:// để Zalo/Facebook/Telegram crawler load chính xác 100%
  let fullOgImageUrl = `${appUrl}/images/wedding_card_sample.jpg`;
  if (card.cardCategory === "WEDDING") {
    const coupleNames = groomName && brideName ? `${groomName.toUpperCase()} & ${brideName.toUpperCase()}` : "";
    const ogParams = new URLSearchParams();
    ogParams.set("slug", slug);
    if (guestCode) ogParams.set("g", guestCode);
    if (guestDisplayName) ogParams.set("guest", guestDisplayName);
    if (coupleNames) ogParams.set("couple", coupleNames);
    if (eventDateStr) ogParams.set("date", eventDateStr);
    if (venueName) ogParams.set("venue", venueName);
    if (card.photos?.[0]?.url) ogParams.set("bg", card.photos[0].url);

    fullOgImageUrl = `${appUrl}/api/og/card?${ogParams.toString()}`;
  } else if (card.photos?.[0]?.url) {
    fullOgImageUrl = card.photos[0].url.startsWith("http")
      ? card.photos[0].url
      : `${appUrl}${card.photos[0].url.startsWith("/") ? "" : "/"}${card.photos[0].url}`;
  }

  // robots: noindex chỉ ảnh hưởng Google Search Index, KHÔNG ảnh hưởng Zalo/FB OG crawler
  const shouldNoIndex = hasGuest || isLiveDisplay;
  const canonicalUrl = guestCode ? `${appUrl}/thiep/${slug}?g=${guestCode}` : `${appUrl}/thiep/${slug}`;

  return {
    referrer: "no-referrer",
    metadataBase: new URL(appUrl),
    title,
    description,
    robots: shouldNoIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "CardVite",
      locale: "vi_VN",
      type: "website",
      images: [
        {
          url: fullOgImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullOgImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CardPublicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const guestCode = searchParamsResolved.g;
  const isInviteMode = Boolean(
    guestCode ||
    searchParamsResolved.invite === "1" ||
    searchParamsResolved.invite === "true" ||
    searchParamsResolved.share === "1" ||
    searchParamsResolved.share === "true" ||
    searchParamsResolved.mode === "invite"
  );

  const result = await getCardData(slug, guestCode);

  if (!result || !result.card) {
    notFound();
  }

  const card: CardDetail = result.card;
  const guestName = result.guestInfo ? `${result.guestInfo.salutation || ""} ${result.guestInfo.fullName}`.trim() : undefined;
  const guestPhone = result.guestInfo?.phone;

  // Truyền templateSlug ưu tiên từ card.template?.slug hoặc chính slug URL
  const effectiveTemplateSlug = card.template?.slug || slug;

  // Xác định có phải thiệp mẫu demo hay không (để hiện Floating CTA và ẩn các tính năng nội bộ như Photobooth)
  const isDemo = !result.isDatabaseCard || Boolean(DEMO_TEMPLATES_MAP[slug]) || Boolean(card.id?.startsWith("demo-"));
  const shouldShowDemoBar = isDemo && !isInviteMode;
  const demoTemplateName = shouldShowDemoBar
    ? MASTER_TEMPLATES.find((t) => t.slug === slug)?.name
    : undefined;

  // XỬ LÝ GIAO DIỆN CANVA FREE-FORM BUILDER (NẾU CÓ DỮ LIỆU CANVAS)
  const hasCanvasData =
    card.categoryData &&
    typeof card.categoryData === "object" &&
    "elements" in (card.categoryData as unknown as Record<string, unknown>);

  // RENDER VIEW THEO CARD CATEGORY
  let content: React.ReactNode = <div>Danh mục thiệp không xác định</div>;

  if (hasCanvasData) {
    content = (
      <CanvasCardView
        card={card}
        guestName={guestName}
        guestPhone={guestPhone}
        guestCode={guestCode}
      />
    );
  } else if (card.cardCategory === "WEDDING") {
    content = (
      <>
        <WeddingView
          card={card}
          templateSlug={effectiveTemplateSlug}
          guestName={guestName}
          guestPhone={guestPhone}
          guestCode={guestCode}
          isVipExperience={result.features?.vipOpeningExperience}
          isDemo={isDemo}
        />
        {shouldShowDemoBar && (
          <DemoActionBarWrapper
            templateSlug={effectiveTemplateSlug}
            templateName={demoTemplateName}
            category={card.cardCategory}
          />
        )}
      </>
    );
  } else if (card.cardCategory === "BIRTHDAY") {
    content = (
      <>
        <BirthdayView
          card={card}
          templateSlug={card.template?.slug}
          guestName={guestName}
          guestPhone={guestPhone}
          guestCode={guestCode}
          isVipExperience={result.features?.vipOpeningExperience}
        />
        {shouldShowDemoBar && (
          <DemoActionBarWrapper
            templateSlug={effectiveTemplateSlug}
            templateName={demoTemplateName}
            category={card.cardCategory}
          />
        )}
      </>
    );
  } else if (card.cardCategory === "NEWBORN") {
    content = (
      <>
        <NewbornView
          card={card}
          templateSlug={card.template?.slug}
          guestName={guestName}
          guestPhone={guestPhone}
          guestCode={guestCode}
          isVipExperience={result.features?.vipOpeningExperience}
        />
        {shouldShowDemoBar && (
          <DemoActionBarWrapper
            templateSlug={effectiveTemplateSlug}
            templateName={demoTemplateName}
            category={card.cardCategory}
          />
        )}
      </>
    );
  }

  const isLiveDisplay = searchParamsResolved?.mode === "live-display";

  return (
    <>
      {content}
      {!isLiveDisplay && <DesktopMobileQrWidget />}
    </>
  );
}
