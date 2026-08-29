"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { Footer } from "@/components/shared/Footer";

interface Article {
  id: string;
  tag: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  imageUrl: string;
}

const ARTICLES: Article[] = [
  {
    id: "1",
    tag: "Xu Hướng",
    date: "15 THG 10, 2024",
    readTime: "4 PHÚT ĐỌC",
    title: "Top 5 Màu Sắc Chủ Đạo Cho Mùa Cưới 2026",
    excerpt:
      "Từ sắc Nude ấm áp đến Xanh Sage tinh tế, sự chuyển dịch của bảng màu phản ánh xu hướng tìm về tự nhiên và sự thanh lịch tối giản.",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop",
  },
  {
    id: "2",
    tag: "So Sánh",
    date: "12 THG 10, 2024",
    readTime: "6 PHÚT ĐỌC",
    title: "Thiệp Kỹ Thuật Số và Thiệp Giấy Truyền Thống",
    excerpt:
      "Phân tích chuyên sâu về ưu nhược điểm, tính tiện dụng và cách kết hợp cả hai hình thức để tạo nên trải nghiệm trọn vẹn nhất cho quan khách.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
  },
  {
    id: "3",
    tag: "Lời Mời",
    date: "08 THG 10, 2024",
    readTime: "5 PHÚT ĐỌC",
    title: "Nghệ Thuật Viết Lời Mời: Từ Trưởng Bối Đến Bạn Bè",
    excerpt:
      "Làm sao để thể hiện sự kính trọng đúng mực với người lớn tuổi trong khi vẫn giữ được sự gần gũi, chân thành khi mời bạn bè trang lứa.",
    imageUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&auto=format&fit=crop",
  },
];

export default function JournalPage() {
  const { t } = useLanguage();
  const [selectedTag, setSelectedTag] = useState("ALL");

  const tags = [
    { id: "ALL", label: t("tagAll") },
    { id: "WEDDING", label: t("tagWeddingTrend") },
    { id: "NEWBORN", label: t("tagNewbornCeremony") },
    { id: "INVITE", label: t("tagInviteEtiquette") },
    { id: "COMPARE", label: t("tagCompare") },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-6 md:px-12 lg:px-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center group" title="Trang Chủ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Logo" className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link href="/collections" className="hover:text-[#181716] transition">{t("homeNavCollections")}</Link>
            <Link href="/journal" className="text-[#BE944E] border-b-2 border-[#BE944E] pb-0.5">{t("homeNavJournal")}</Link>
            <Link href="/pricing" className="hover:text-[#181716] transition">{t("homeNavPricing")}</Link>
            <Link href="/concierge" className="hover:text-[#181716] transition">{t("homeNavConcierge")}</Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#7D6331] hover:bg-[#685226] text-white text-[11px] font-bold tracking-widest uppercase shadow-2xs transition cursor-pointer"
            >
              {t("homeCreateBtn")}
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO HEADER */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-8 text-center">
        <div className="inline-block px-3.5 py-1 rounded-full bg-[#E8ECE5] text-[#556353] text-[10px] font-bold uppercase tracking-widest mb-3">
          {t("journalBadge")}
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#181716] tracking-tight">
          {t("journalTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-[#181716]/65 mt-3 max-w-xl mx-auto leading-relaxed">
          {t("journalDesc")}
        </p>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. FILTER PILLS */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 mb-10">
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto pb-4 no-scrollbar">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedTag === tag.id
                  ? "bg-[#7D6331] text-white border-[#7D6331] shadow-xs"
                  : "bg-white text-[#181716]/70 border-[#E8E2D8] hover:bg-white"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. ARTICLES 3-COLUMN GRID */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ARTICLES.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#EFE9E1] shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
            >
              {/* IMAGE */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[9px] font-bold uppercase tracking-wider text-stone-700 shadow-2xs">
                  {art.tag}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 font-semibold tracking-wider uppercase mb-2">
                    <span>{art.date}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#181716] leading-snug group-hover:text-[#BE944E] transition">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. FEATURED HORIZONTAL ARTICLE CARD (LỄ THÔI NÔI) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-white rounded-[36px] overflow-hidden border border-[#EFE9E1] shadow-2xs hover:shadow-md transition grid grid-cols-1 lg:grid-cols-12 items-center group">
          {/* PHOTO LEFT */}
          <div className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop"
              alt="Lễ thôi nôi"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-stone-700 shadow-2xs">
              Nghi Thức
            </span>
          </div>

          {/* CONTENT RIGHT */}
          <div className="lg:col-span-6 p-8 sm:p-12 space-y-4">
            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-semibold tracking-wider uppercase">
              <span>01 THG 10, 2024</span>
              <span>•</span>
              <span>5 PHÚT ĐỌC</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#181716] leading-tight group-hover:text-[#BE944E] transition">
              Ý Nghĩa Sâu Sắc Của 12 Vật Phẩm Trong Lễ Thôi Nôi
            </h3>

            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Khám phá nguồn gốc văn hóa và ý nghĩa tâm linh đằng sau mâm cúng Mụ truyền thống, giúp bạn chuẩn bị lễ thôi nôi cho bé một cách chu đáo và trang trọng nhất.
            </p>

            <div className="pt-2">
              <Link
                href="#"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7D6331] hover:text-[#BE944E] transition group/link"
              >
                <span>{t("readArticleBtn")}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <Footer />
    </div>
  );
}
