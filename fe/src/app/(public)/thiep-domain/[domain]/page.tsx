import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import CardDetailPage from "../../thiep/[slug]/page";

interface PageProps {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{
    g?: string;
    invite?: string;
    share?: string;
    mode?: string;
    preview?: string;
  }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getCardSlugByDomain(domain: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/domains/lookup/${encodeURIComponent(domain)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && json.data?.slug ? json.data.slug : null;
  } catch (err) {
    console.error("[thiep-domain] Failed to lookup domain:", domain, err);
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { domain } = await params;
  const slug = await getCardSlugByDomain(domain);
  if (!slug) {
    return {
      title: "Thiệp Cưới Online",
      description: "Trang thiệp cưới trực tuyến",
      robots: { index: false, follow: false },
    };
  }
  // Generate metadata from the resolved slug page
  const { generateMetadata: originalMetadata } = await import("../../thiep/[slug]/page");
  return originalMetadata({
    params: Promise.resolve({ slug }),
    searchParams,
  });
}

export default async function CustomDomainCardPage({ params, searchParams }: PageProps) {
  const { domain } = await params;
  const slug = await getCardSlugByDomain(domain);

  if (!slug) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 shadow-sm border border-[#EADDCB]/60 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 text-2xl font-serif">
            ♡
          </div>
          <h1 className="text-xl font-bold font-serif text-[#2B2118]">
            Tên miền chưa được kết nối
          </h1>
          <p className="text-sm text-[#7A6B5D] leading-relaxed">
            Tên miền <strong className="text-[#2B2118] font-mono">{domain}</strong> đang chờ cấu hình DNS hoặc chưa được gán cho thiệp cưới nào.
          </p>
          <p className="text-xs text-[#9E8E80]">
            Nếu bạn là chủ sở hữu, vui lòng kiểm tra lại cấu hình DNS trong Bảng điều khiển.
          </p>
        </div>
      </div>
    );
  }

  // Render the card component for this slug
  return <CardDetailPage params={Promise.resolve({ slug })} searchParams={searchParams} />;
}
