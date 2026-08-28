"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  X,
  CalendarCheck2,
  Gift,
  Gamepad2,
  Image as ImageIcon,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit3,
  Send,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const CAROUSEL_CARDS = [
  {
    id: 1,
    title: "Vườn Ngọc",
    couple: "Minh Khôi & Ngọc Hân",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&auto=format&fit=crop",
    color: "#E8ECE5",
  },
  {
    id: 2,
    title: "Hoa Lụa Nâu",
    couple: "Văn Long & Thu Hà",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop",
    color: "#F0EAE1",
  },
  {
    id: 3,
    title: "Hoa Mộc Hồng",
    couple: "Tuấn Anh & Mai Phương",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=500&auto=format&fit=crop",
    color: "#FAF2E4",
    isCenter: true,
  },
  {
    id: 4,
    title: "Hồng Xanh",
    couple: "Minh Đức & Thu Hà",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500&auto=format&fit=crop",
    color: "#E8ECE5",
  },
  {
    id: 5,
    title: "Minimalism Nâu",
    couple: "Hoàng Nam & Thảo Vy",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500&auto=format&fit=crop",
    color: "#F0EAE1",
  },
];

export default function CardViteHomePage() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bộ điều khiển Simulator
  const [names, setNames] = useState("Sarah & James");
  const [selectedEffect, setSelectedEffect] = useState("Wax Seal");

  // State cho 3D Carousel
  const [carouselIndex, setCarouselIndex] = useState(2); // Center is index 2

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % CAROUSEL_CARDS.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + CAROUSEL_CARDS.length) % CAROUSEL_CARDS.length);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden selection:bg-[#BE944E]/20">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER & NAVBAR */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-6 md:px-12 lg:px-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="group flex items-center">
            <span className="text-3xl font-serif font-bold tracking-tight text-[#181716] group-hover:text-[#BE944E] transition">
              CardVite
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link
              href="/collections"
              className="hover:text-[#BE944E] transition"
            >
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

          {/* RIGHT ACTION */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#C19A5B] hover:bg-[#b0894a] text-white text-[11px] font-bold tracking-widest uppercase shadow-2xs hover:scale-105 transition-all cursor-pointer"
            >
              {t("homeCreateBtn")}
            </Link>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#181716]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2]/98 backdrop-blur-xl flex flex-col justify-center px-8 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-[#181716]"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="space-y-6 text-center">
            <Link
              href="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl font-serif font-bold text-[#181716]"
            >
              {t("homeNavCollections")}
            </Link>
            <Link
              href="/journal"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl font-serif font-bold text-[#181716]"
            >
              {t("homeNavJournal")}
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl font-serif font-bold text-[#181716]"
            >
              {t("homeNavPricing")}
            </Link>
            <Link
              href="/concierge"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl font-serif font-bold text-[#181716]"
            >
              {t("homeNavConcierge")}
            </Link>
            <div className="pt-6 flex flex-col items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/dashboard/cards/new"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full max-w-xs py-3.5 rounded-full bg-[#C19A5B] text-white text-xs font-bold uppercase tracking-widest shadow-md"
              >
                {t("homeCreateBtn")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 pt-4 pb-16 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* CỘT TRÁI: TIÊU ĐỀ & FORM */}
          <div className="lg:col-span-7 space-y-6">
            {/* 2 TAGS: WEDDING & GALA */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8ECE5] text-[#556353]">
                {t("homeTagWedding")}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCECE7] text-[#A66353]">
                {t("homeTagGala")}
              </span>
            </div>

            {/* HEADLINE */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#181716] leading-[1.12]">
              {t("homeHeroTitle1")} <br />
              {t("homeHeroTitle2") && <>{t("homeHeroTitle2")} <br /></>}
              <span className="italic font-normal text-[#BE944E]">
                {t("homeHeroTitleEm1")}
              </span> <br />
              {t("homeHeroTitle3")}{" "}
              <span className="italic font-normal text-[#BE944E]">
                {t("homeHeroTitleEm2")}
              </span>
            </h1>

            {/* FORM SIMULATOR */}
            <div className="p-6 bg-white/70 backdrop-blur-xs rounded-3xl border border-[#EFE9E1] shadow-2xs space-y-4 max-w-md">
              <div>
                <label className="block text-[11px] font-semibold text-[#181716]/60 mb-1.5">
                  {t("homeFieldCoupleName")}
                </label>
                <input
                  type="text"
                  value={names}
                  onChange={(e) => setNames(e.target.value)}
                  placeholder="Sarah & James"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F0EAE1]/70 border border-[#E2DBD0] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-[#181716] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#181716]/60 mb-1.5">
                  {t("homeFieldEffect")}
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "Wax Seal", label: t("homeEffectWaxSeal") },
                    { id: "Flower Gate", label: t("homeEffectFlowerGate") },
                    { id: "Gift Box", label: t("homeEffectGiftBox") },
                  ].map((eff) => (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => setSelectedEffect(eff.id)}
                      className={`py-2 px-2 rounded-xl border text-center transition cursor-pointer text-[11px] font-medium ${
                        selectedEffect === eff.id
                          ? "bg-[#FAF2E4] border-[#BE944E] text-[#8C6424] font-bold shadow-2xs"
                          : "bg-white border-[#E8E2D8] text-[#181716]/70 hover:bg-[#FAF7F2]"
                      }`}
                    >
                      {eff.label}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/dashboard/cards/new"
                className="w-full py-3 rounded-xl bg-[#181716] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest shadow-xs transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{t("homeBtnPreview")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* CỘT PHẢI: SLEEK STANDING PHONE MOCKUP */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 sm:w-72 aspect-[9/18.5] rounded-[42px] bg-gradient-to-b from-stone-100 to-stone-200 p-3 shadow-2xl border border-stone-200/80">
              {/* MÀN HÌNH BÊN TRONG */}
              <div className="w-full h-full bg-[#FAF7F2] rounded-[34px] overflow-hidden flex flex-col justify-between p-6 text-center relative border border-stone-200 shadow-inner">
                {/* Dynamic Island */}
                <div className="w-20 h-4 bg-[#181716] rounded-full mx-auto mb-6" />

                {/* THIỆP MỜI SARAH & JAMES */}
                <div className="my-auto space-y-3">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#181716]/60 font-medium block">
                    {t("homePhoneInvited")}
                  </span>

                  <h3 className="text-2xl font-serif font-bold text-[#181716] tracking-tight">
                    {names || "Sarah & James"}
                  </h3>

                  <div className="w-8 h-px bg-[#BE944E] mx-auto my-2" />

                  <p className="text-[10px] text-[#181716]/70 leading-relaxed">
                    {t("homePhoneDate")} <br />
                    {t("homePhoneVenue")}
                  </p>

                  <div className="pt-4">
                    <span className="inline-block px-6 py-1.5 rounded-full border border-[#181716]/40 text-[10px] font-bold uppercase tracking-widest text-[#181716]">
                      {t("homePhoneRsvp")}
                    </span>
                  </div>
                </div>

                <div className="text-[8px] uppercase tracking-widest text-[#181716]/40 pb-2">
                  CardVite Digital Studio
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. SECTION MỚI 1: 3D COVERFLOW CAROUSEL */}
      {/* "Mẫu thiệp cưới online đẹp nhất" */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center overflow-hidden">
        <div className="max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
            {t("homeCarouselTitle1")}{" "}
            <span className="italic font-normal text-[#BE944E]">
              {t("homeCarouselTitleEm")}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#181716]/65 mt-2">
            {t("homeCarouselSub")}
          </p>
        </div>

        {/* 3D COVERFLOW CONTAINER */}
        <div className="relative py-6 max-w-5xl mx-auto flex items-center justify-center min-h-[380px]">
          {/* NÚT PREV */}
          <button
            onClick={prevSlide}
            aria-label="Previous Template"
            className="absolute left-2 sm:left-6 z-30 w-10 h-10 rounded-full bg-white/90 border border-stone-200 shadow-md flex items-center justify-center text-stone-600 hover:text-[#BE944E] hover:scale-105 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* 5 CARDS IN 3D PERSPECTIVE */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 w-full">
            {CAROUSEL_CARDS.map((card, idx) => {
              const offset = (idx - carouselIndex + CAROUSEL_CARDS.length) % CAROUSEL_CARDS.length;
              const isCenter = offset === 0;
              const isLeft1 = offset === CAROUSEL_CARDS.length - 1;
              const isRight1 = offset === 1;
              const isHidden = !isCenter && !isLeft1 && !isRight1;

              return (
                <div
                  key={card.id}
                  onClick={() => setCarouselIndex(idx)}
                  className={`transition-all duration-500 transform cursor-pointer rounded-3xl overflow-hidden border shadow-md flex flex-col justify-between ${
                    isHidden
                      ? "hidden md:block opacity-30 scale-75 blur-[1px] pointer-events-none"
                      : isCenter
                      ? "z-20 scale-105 sm:scale-110 shadow-2xl border-[#BE944E] w-56 sm:w-64 aspect-[9/16] bg-white ring-4 ring-[#BE944E]/20"
                      : isLeft1
                      ? "z-10 opacity-70 scale-90 -rotate-y-6 w-44 sm:w-52 aspect-[9/16] bg-white/80 border-stone-200"
                      : "z-10 opacity-70 scale-90 rotate-y-6 w-44 sm:w-52 aspect-[9/16] bg-white/80 border-stone-200"
                  }`}
                >
                  {/* Mockup bên trong */}
                  <div className="relative w-full h-full p-4 flex flex-col justify-between text-center overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                    <div className="relative z-10 text-[9px] uppercase tracking-widest text-white/90 font-medium">
                      THE WEDDING OF
                    </div>

                    <div className="relative z-10 space-y-1 text-white">
                      <h4 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                        {card.title}
                      </h4>
                      <p className="text-[10px] text-white/80">{card.couple}</p>
                      {isCenter && (
                        <div className="pt-2">
                          <span className="inline-block px-3 py-1 rounded-full bg-[#BE944E] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                            XÁC NHẬN THAM DỰ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NÚT NEXT */}
          <button
            onClick={nextSlide}
            aria-label="Next Template"
            className="absolute right-2 sm:right-6 z-30 w-10 h-10 rounded-full bg-white/90 border border-stone-200 shadow-md flex items-center justify-center text-stone-600 hover:text-[#BE944E] hover:scale-105 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* DOTS PAGINATION */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {CAROUSEL_CARDS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCarouselIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                carouselIndex === idx ? "w-6 bg-[#BE944E]" : "w-2 bg-stone-300"
              }`}
            />
          ))}
        </div>

        {/* NÚT XEM TẤT CẢ MẪU THIỆP */}
        <div className="mt-8">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition"
          >
            <span>{t("homeViewAllTemplates")}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. SECTION MỚI 2: 3 BƯỚC TẠO THIỆP */}
      {/* "Tạo thiệp cưới online trong 10 phút" */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* CỘT TRÁI: 3 BƯỚC HƯỚNG DẪN */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#181716] tracking-tight leading-tight">
              {t("homeStepsTitle1")} <br />
              <span className="italic font-normal text-[#BE944E]">
                {t("homeStepsTitleEm")}
              </span>
            </h2>

            {/* 3 STEPS */}
            <div className="space-y-6 max-w-lg">
              {/* STEP 1 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FAF2E4] text-[#8C6424] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E8DBD0]">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-[#181716] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span>{t("homeStep1Title")}</span>
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {t("homeStep1Desc")}
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FAF2E4] text-[#8C6424] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E8DBD0]">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-[#181716] flex items-center gap-2">
                    <Edit3 className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span>{t("homeStep2Title")}</span>
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {t("homeStep2Desc")}
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FAF2E4] text-[#8C6424] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E8DBD0]">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-[#181716] flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span>{t("homeStep3Title")}</span>
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {t("homeStep3Desc")}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/dashboard/cards/new"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#7D6331] hover:bg-[#685226] text-white text-xs font-bold uppercase tracking-widest shadow-md transition"
              >
                <span>{t("homeStepsBtn")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* CỘT PHẢI: PHONE MOCKUP MẪU THIỆP XANH RÊU */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 sm:w-72 aspect-[9/18.5] rounded-[42px] bg-[#1E2E20] p-3 shadow-2xl border-4 border-[#2D4530]">
              <div className="w-full h-full bg-[#243627] rounded-[34px] overflow-hidden flex flex-col justify-between p-6 text-center text-white relative shadow-inner">
                {/* Top dynamic bar */}
                <div className="w-16 h-3.5 bg-[#142016] rounded-full mx-auto mb-4" />

                <div className="my-auto space-y-4">
                  <div className="w-6 h-6 rounded-full border border-white/40 mx-auto flex items-center justify-center text-[10px]">
                    ♥
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm font-serif tracking-widest text-emerald-200 block">
                      THU HÀ
                    </span>
                    <span className="text-[10px] text-white/60 block">&</span>
                    <span className="text-sm font-serif tracking-widest text-emerald-200 block">
                      MINH QUÂN
                    </span>
                  </div>

                  <div className="text-[10px] text-white/70 pt-2 tracking-wider">
                    20 . 10 . 2026
                  </div>

                  <div className="pt-2">
                    <span className="inline-block px-6 py-1.5 rounded-full bg-[#4E7252] text-white text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      MỞ THIỆP
                    </span>
                  </div>
                </div>

                <div className="text-[8px] uppercase tracking-widest text-white/40 pb-1">
                  CardVite Floral Luxury
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. SECTION: TRẢI NGHIỆM THƯỢNG LƯU SỐ (BENTO GRID) */}
      {/* ------------------------------------------------------------- */}
      <section id="custom" className="max-w-6xl mx-auto px-6 py-16 md:px-12 lg:px-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
            {t("homeSectionExperienceTitle")}{" "}
            <span className="italic font-normal text-[#BE944E]">
              {t("homeSectionExperienceEm")}
            </span>{" "}
            {t("homeSectionExperienceSuffix")}
          </h2>
          <p className="text-xs text-[#181716]/65 mt-2">
            {t("homeSectionExperienceSub")}
          </p>
        </div>

        {/* BENTO GRID EXACT 3 TIERS */}
        <div className="space-y-5">
          {/* HÀNG 1: THIỆP GỬI ĐÍCH DANH (LEFT 60%) + 2 THẺ CỘT PHẢI STACK (RIGHT 40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* THẺ LỚN TRÁI: THIỆP GỬI ĐÍCH DANH */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-2xs relative overflow-hidden flex flex-col justify-end min-h-[340px] group hover:shadow-md transition">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

              <div className="relative z-10 text-white">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {t("homeCard1Title")}
                </h3>
                <p className="text-xs text-white/80 mt-1.5 max-w-md leading-relaxed">
                  {t("homeCard1Desc")}
                </p>
              </div>
            </div>

            {/* CỘT PHẢI: 2 THẺ STACK NHỎ */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* THẺ 1: QUẢN LÝ RSVP */}
              <div className="flex-1 bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-2xs flex flex-col justify-center group hover:shadow-md transition">
                <div className="w-9 h-9 rounded-xl bg-[#5C7658]/10 text-[#5C7658] flex items-center justify-center mb-3">
                  <CalendarCheck2 className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#181716]">
                  {t("homeCard2Title")}
                </h3>
                <p className="text-xs text-[#181716]/65 mt-1 leading-relaxed">
                  {t("homeCard2Desc")}
                </p>
              </div>

              {/* THẺ 2: HỘP MỪNG CƯỚI VIETQR */}
              <div className="flex-1 bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-2xs flex flex-col justify-center group hover:shadow-md transition">
                <div className="w-9 h-9 rounded-xl bg-[#BE944E]/15 text-[#BE944E] flex items-center justify-center mb-3">
                  <Gift className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#181716]">
                  {t("homeCard3Title")}
                </h3>
                <p className="text-xs text-[#181716]/65 mt-1 leading-relaxed">
                  {t("homeCard3Desc")}
                </p>
              </div>
            </div>
          </div>

          {/* HÀNG 2: 2 THẺ BẰNG NHAU (50% - 50%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* THẺ 3: MINI-GAME TƯƠNG TÁC */}
            <div className="bg-white rounded-3xl p-7 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition">
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#E08269]/15 text-[#E08269] flex items-center justify-center mb-3">
                  <Gamepad2 className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#181716]">
                  {t("homeCard4Title")}
                </h3>
                <p className="text-xs text-[#181716]/65 mt-1 leading-relaxed">
                  {t("homeCard4Desc")}
                </p>
              </div>
            </div>

            {/* THẺ 4: ALBUM ẢNH 3D & NHẠC */}
            <div className="bg-white rounded-3xl p-7 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition">
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#BE944E]/15 text-[#BE944E] flex items-center justify-center mb-3">
                  <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#181716]">
                  {t("homeCard5Title")}
                </h3>
                <p className="text-xs text-[#181716]/65 mt-1 leading-relaxed">
                  {t("homeCard5Desc")}
                </p>
              </div>
            </div>
          </div>

          {/* HÀNG 3: THẺ ĐA NGÔN NGỮ TOÀN CẦU TRÀN HÀNG + VÒNG CUNG QUỸ ĐẠO THIÊN HÀ */}
          <div className="bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="max-w-lg z-10">
              <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
                <Globe2 className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#181716]">
                {t("homeCard6Title")}
              </h3>
              <p className="text-xs text-[#181716]/65 mt-1.5 leading-relaxed">
                {t("homeCard6Desc")}
              </p>
            </div>

            {/* SƠ ĐỒ VÒNG CUNG QUỸ ĐẠO THIÊN HÀ */}
            <div className="relative w-44 h-28 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 160 100" className="w-full h-full">
                <path
                  d="M 10 90 A 70 70 0 0 1 150 90"
                  fill="none"
                  stroke="#BE944E"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <circle cx="105" cy="22" r="4.5" fill="#BE944E" />
                <circle cx="145" cy="62" r="3.5" fill="#8C6424" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-[#EFE9E1] bg-white py-10 px-6 md:px-12 lg:px-20 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#181716]/65">
          <div className="flex items-center">
            <span className="text-2xl font-serif font-bold text-[#181716]">
              CardVite
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="#" className="hover:text-[#181716]">{t("footerPrivacy")}</Link>
            <Link href="#" className="hover:text-[#181716]">{t("footerTerms")}</Link>
            <Link href="#" className="hover:text-[#181716]">{t("footerSustainability")}</Link>
            <Link href="#" className="hover:text-[#181716]">{t("footerAccessibility")}</Link>
          </div>

          <div>
            <span>{t("footerCopyright")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
