"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export default function PricingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-6 md:px-12 lg:px-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-[#181716]">
            CARDVITE
          </Link>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link href="/collections" className="hover:text-[#181716] transition">{t("homeNavCollections")}</Link>
            <Link href="/journal" className="hover:text-[#181716] transition">{t("homeNavJournal")}</Link>
            <Link href="/pricing" className="text-[#BE944E] border-b-2 border-[#BE944E] pb-0.5">{t("homeNavPricing")}</Link>
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
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-12 text-center">
        <div className="inline-block px-3.5 py-1 rounded-full bg-[#E8ECE5] text-[#556353] text-[10px] font-bold uppercase tracking-widest mb-3">
          {t("pricingBadge")}
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#181716] tracking-tight">
          {t("pricingTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-[#181716]/65 mt-3 max-w-xl mx-auto leading-relaxed">
          {t("pricingDesc")}
        </p>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. 3-TIER PRICING CARDS */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* TIER 1: DÙNG THỬ */}
          <div className="bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#181716] uppercase tracking-wide">
                {t("planFreeTitle")}
              </h3>
              <div className="my-4">
                <span className="text-4xl font-serif font-bold text-[#181716]">{t("planFreePrice")}</span>
              </div>
              <p className="text-xs text-[#181716]/65 leading-relaxed mb-6">
                {t("planFreeDesc")}
              </p>

              <div className="space-y-3 text-xs text-[#181716]/80 pt-4 border-t border-stone-100">
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span>{t("planFreeFeat1")}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span>{t("planFreeFeat2")}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span>{t("planFreeFeat3")}</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/dashboard/cards/new"
                className="w-full py-3 rounded-full border border-stone-800 text-stone-800 hover:bg-stone-50 text-[11px] font-bold uppercase tracking-widest text-center block transition"
              >
                {t("btnStartFree")}
              </Link>
            </div>
          </div>

          {/* TIER 2: TIÊU CHUẨN */}
          <div className="bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#181716] uppercase tracking-wide">
                {t("planBasicTitle")}
              </h3>
              <div className="my-4">
                <span className="text-4xl font-serif font-bold text-[#181716]">{t("planBasicPrice")}</span>
              </div>
              <p className="text-xs text-[#181716]/65 leading-relaxed mb-6">
                {t("planBasicDesc")}
              </p>

              <div className="space-y-3 text-xs text-[#181716]/80 pt-4 border-t border-stone-100">
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span>{t("planBasicFeat1")}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span>{t("planBasicFeat2")}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span>{t("planBasicFeat3")}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span>{t("planBasicFeat4")}</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/dashboard/billing"
                className="w-full py-3 rounded-full border border-stone-800 text-stone-800 hover:bg-stone-50 text-[11px] font-bold uppercase tracking-widest text-center block transition"
              >
                {t("btnSelectBasic")}
              </Link>
            </div>
          </div>

          {/* TIER 3: VIP HOÀNG GIA - HIGHLIGHTED */}
          <div className="bg-white rounded-3xl p-8 border-2 border-[#BE944E] shadow-xl relative flex flex-col justify-between overflow-hidden">
            {/* BADGE PHỔ BIẾN NHẤT */}
            <div className="absolute top-0 right-0 left-0 bg-[#BE944E]/10 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-[#8C6424] border-b border-[#BE944E]/20">
              {t("planVipPopular")}
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-serif font-bold text-[#BE944E] uppercase tracking-wide">
                {t("planVipTitle")}
              </h3>
              <div className="my-4">
                <span className="text-4xl font-serif font-bold text-[#181716]">{t("planVipPrice")}</span>
              </div>
              <p className="text-xs text-[#181716]/65 leading-relaxed mb-6">
                {t("planVipDesc")}
              </p>

              <div className="space-y-3 text-xs text-[#181716]/80 pt-4 border-t border-stone-100">
                <div className="flex items-start gap-2.5">
                  <span className="text-sm">🗂️</span>
                  <span>{t("planVipFeat1")}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-sm">⭐</span>
                  <span>{t("planVipFeat2")}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-sm">🚫</span>
                  <span>{t("planVipFeat3")}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-sm">📥</span>
                  <span>{t("planVipFeat4")}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-sm">🎧</span>
                  <span>{t("planVipFeat5")}</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/dashboard/billing"
                className="w-full py-3 rounded-full bg-[#BE944E] hover:bg-[#a67e3a] text-white text-[11px] font-bold uppercase tracking-widest text-center block transition shadow-md"
              >
                {t("btnUpgradeVip")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. FOOTER */}
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
    </div>
  );
}
