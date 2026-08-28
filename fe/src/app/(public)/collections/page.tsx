"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  ChevronUp,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { TemplateDetailModal, TemplateModalData } from "@/components/shared/TemplateDetailModal";

interface TemplateItem extends TemplateModalData {}

export default function CollectionsPage() {
  const { t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [selectedStyle, setSelectedStyle] = useState("ALL");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedModalTemplate, setSelectedModalTemplate] = useState<TemplateModalData | null>(null);

  const pricePrefix = t("priceFromPrefix") || "Từ";

  const TEMPLATES: TemplateItem[] = [
    {
      id: "1",
      name: t("template1Name") || "Minimalism Nâu",
      category: "WEDDING",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 199.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
      isNew: true,
    },
    {
      id: "2",
      name: t("template2Name") || "Hoa Mộc Hồng",
      category: "WEDDING",
      style: "Floral Romance",
      price: `${pricePrefix} 249.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&auto=format&fit=crop",
    },
    {
      id: "3",
      name: t("template3Name") || "Cổ Điển Hoàng Gia",
      category: "WEDDING",
      style: "Cổ Điển Hoàng Gia",
      price: `${pricePrefix} 299.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop",
    },
    {
      id: "4",
      name: t("template4Name") || "Mộc Nhi Nhi",
      category: "NEWBORN",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 199.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop",
    },
    {
      id: "5",
      name: t("template5Name") || "Cyber Neon",
      category: "BIRTHDAY",
      style: "Cyber Neon",
      price: `${pricePrefix} 199.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop",
    },
    {
      id: "6",
      name: t("template6Name") || "Terracotta Arch",
      category: "WEDDING",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 249.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&auto=format&fit=crop",
    },
    {
      id: "7",
      name: t("template7Name") || "Classic Ivory",
      category: "WEDDING",
      style: "Cổ Điển Hoàng Gia",
      price: `${pricePrefix} 299.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop",
    },
    {
      id: "8",
      name: t("template8Name") || "Bold Asymmetry",
      category: "EVENT",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 199.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop",
    },
  ];

  const FAQS = [
    {
      q: t("faq1Q") || "Tôi có thể tùy chỉnh mẫu thiệp đến mức nào?",
      a: t("faq1A") || "Bạn có thể tự do thay đổi toàn bộ họ tên, ảnh bìa, album gallery, danh sách sự kiện, bản đồ Google Maps, lời ngỏ, bài hát MP3 nền và màu sắc chủ đạo theo sở thích.",
    },
    {
      q: t("faq2Q") || "Mẫu thiệp này hiển thị trên điện thoại như thế nào?",
      a: t("faq2A") || "100% mẫu thiệp tại CardVite được tối ưu hoá chuẩn hiển thị cho màn hình di động (iOS & Android) với tỷ lệ 9:16, tải trang siêu tốc và mượt mà.",
    },
    {
      q: t("faq3Q") || "Khách mời ở nước ngoài có thể mở thiệp và nghe nhạc được không?",
      a: t("faq3A") || "Có, hệ thống máy chủ đặt tại CDN toàn cầu giúp khách mời từ bất kỳ quốc gia nào cũng truy cập với tốc độ cực nhanh, hỗ trợ đa ngôn ngữ và nghe nhạc ổn định.",
    },
    {
      q: t("faq4Q") || "Tôi có thể xuất danh sách khách mời xác nhận tham dự (RSVP) không?",
      a: t("faq4A") || "Hoàn toàn được! Bạn có thể xem danh sách trực tiếp trên bảng điều khiển hoặc xuất ra file Excel chuẩn để bàn giao số lượng bàn tiệc cho nhà hàng.",
    },
    {
      q: t("faq5Q") || "Thời gian hoàn thiện và nhận link thiệp là bao lâu?",
      a: t("faq5A") || "Chỉ từ 5 đến 10 phút tự thiết kế trên hệ thống, bạn sẽ có ngay đường link thiệp cưới cá nhân hóa riêng để gửi tới bạn bè và người thân.",
    },
  ];

  const categories = [
    { id: "ALL", label: t("filterAll") },
    { id: "WEDDING", label: t("filterWedding") },
    { id: "NEWBORN", label: t("filterNewborn") },
    { id: "BIRTHDAY", label: t("filterBirthday") },
    { id: "EVENT", label: t("filterEvent") },
  ];

  const styles = [
    { id: "ALL", label: t("styleAll") },
    { id: "Minimalist Luxury", label: t("styleMinimalistLuxury") || "Minimalist Luxury" },
    { id: "Floral Romance", label: t("styleFloralRomance") || "Floral Romance" },
    { id: "Cổ Điển Hoàng Gia", label: t("styleRoyalClassic") || "Cổ Điển Hoàng Gia" },
  ];

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchCat = selectedCat === "ALL" || tpl.category === selectedCat;
    const matchStyle = selectedStyle === "ALL" || tpl.style === selectedStyle;
    return matchCat && matchStyle;
  });

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-6 md:px-12 lg:px-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-[#181716]">
            CardVite
          </Link>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link href="/collections" className="text-[#BE944E] border-b-2 border-[#BE944E] pb-0.5">
              {t("homeNavCollections")}
            </Link>
            <Link href="/journal" className="hover:text-[#181716] transition">
              {t("homeNavJournal")}
            </Link>
            <Link href="/pricing" className="hover:text-[#181716] transition">
              {t("homeNavPricing")}
            </Link>
            <Link href="/concierge" className="hover:text-[#181716] transition">
              {t("homeNavConcierge")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#C19A5B] hover:bg-[#b0894a] text-white text-[11px] font-bold tracking-widest uppercase shadow-2xs transition cursor-pointer"
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
          {t("collectionsBadge")}
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#181716] tracking-tight">
          {t("collectionsTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-[#181716]/65 mt-3 max-w-2xl mx-auto leading-relaxed">
          {t("collectionsDesc")}
        </p>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. FILTER BAR */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-[#EFE9E1]">
          {/* CATEGORY TABS */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  selectedCat === cat.id
                    ? "bg-[#7D6331] text-white border-[#7D6331] shadow-xs"
                    : "bg-white text-[#181716]/70 border-[#E8E2D8] hover:bg-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* STYLE TABS */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
              {t("stylePrefix")}
            </span>
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                  selectedStyle === s.id
                    ? "text-[#BE944E] font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. TEMPLATES 4-COLUMN GRID */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((tItem) => (
            <div
              key={tItem.id}
              onClick={() => setSelectedModalTemplate(tItem)}
              className="bg-white rounded-3xl p-3 border border-[#EFE9E1] shadow-2xs hover:shadow-xl hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              {/* IMAGE MOCKUP */}
              <div className="relative w-full aspect-[9/14] rounded-2xl overflow-hidden bg-stone-100 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tItem.imageUrl}
                  alt={tItem.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                {tItem.isNew && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#E8ECE5] text-[#556353] text-[9px] font-bold uppercase tracking-wider border border-white/60 shadow-xs">
                    {t("badgeNew")}
                  </span>
                )}
                <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2.5 p-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModalTemplate(tItem);
                    }}
                    className="w-full py-2 px-3 rounded-full bg-white/90 hover:bg-white text-stone-900 text-xs font-bold shadow-lg hover:scale-105 transition flex items-center justify-center gap-1.5"
                  >
                    <span>{t("modalBtnLiveDemo")}</span>
                  </button>
                  <Link
                    href={`/dashboard/cards/new?templateId=${tItem.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-2 px-3 rounded-full bg-[#BE944E] hover:bg-[#a67e3a] text-white text-xs font-bold shadow-lg hover:scale-105 transition text-center"
                  >
                    {t("useTemplateBtn")}
                  </Link>
                </div>
              </div>

              {/* CARD METADATA */}
              <div className="px-1 pb-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-[#181716] group-hover:text-[#BE944E] transition truncate">
                    {tItem.name}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="text-stone-300 hover:text-rose-500 transition p-0.5"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-stone-400">{tItem.style}</span>
                  <span className="font-semibold text-[#BE944E]">{tItem.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LOAD MORE BUTTON */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-[11px] font-bold uppercase tracking-widest text-stone-700 shadow-2xs transition">
            <span>{t("viewMoreTemplates")}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. FAQ ACCORDION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-3xl mx-auto px-6 mb-20">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {t("faqSubheading")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#181716] mt-1">
            {t("faqHeading")}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-2xs divide-y divide-stone-100">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-stone-800 hover:text-[#BE944E] transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
                )}
              </button>
              {openFaq === idx && (
                <p className="text-xs text-stone-600 mt-2.5 leading-relaxed pr-4">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. BOTTOM BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="rounded-[36px] bg-[#222120] text-white p-10 sm:p-14 text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              {t("ctaBannerTitle")}
            </h2>
            <div>
              <Link
                href="/dashboard/cards/new"
                className="inline-block px-8 py-3 rounded-full bg-[#BE944E] hover:bg-[#a67e3a] text-white text-xs font-bold uppercase tracking-widest transition shadow-lg"
              >
                {t("ctaBannerBtn")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-[#EFE9E1] bg-white py-10 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#181716]/65">
          <span className="text-2xl font-serif font-bold text-[#181716]">CardVite</span>
          <div className="flex items-center gap-6 font-medium">
            <Link href="#" className="hover:text-[#181716]">{t("footerPrivacy")}</Link>
            <Link href="#" className="hover:text-[#181716]">{t("footerTerms")}</Link>
            <Link href="#" className="hover:text-[#181716]">{t("footerSustainability")}</Link>
            <Link href="#" className="hover:text-[#181716]">{t("footerAccessibility")}</Link>
          </div>
          <span>{t("footerCopyright")}</span>
        </div>
      </footer>

      {/* QUICK VIEW TEMPLATE DETAIL MODAL */}
      <TemplateDetailModal
        isOpen={!!selectedModalTemplate}
        onClose={() => setSelectedModalTemplate(null)}
        template={selectedModalTemplate}
      />
    </div>
  );
}
