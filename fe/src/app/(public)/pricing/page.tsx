"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Leaf,
  Gem,
  Crown,
  Gift,
  Star,
  Ban,
  FileSpreadsheet,
  Headphones,
  Check,
  ArrowRight,
  Sparkle,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/shared/Footer";

export default function PricingPage() {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const handleAction = (plan: "free" | "basic" | "vip") => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (plan === "free") {
      router.push("/dashboard/cards/new");
    } else {
      router.push("/dashboard/billing");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden relative selection:bg-[#BE944E]/20">
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND FLOATING PETALS & FLORAL DECORATIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft radial glow centers */}
        <div className="absolute top-12 left-1/4 w-[450px] h-[450px] bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-rose-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-amber-100/25 rounded-full blur-3xl" />

        {/* Top-Left Floral Branch SVG */}
        <div className="absolute -top-6 -left-6 opacity-60">
          <svg width="240" height="240" viewBox="0 0 200 200" fill="none">
            <circle cx="50" cy="80" r="40" fill="#FAF3E6" stroke="#E8DCB8" strokeWidth="1.5" />
            <path d="M30 70C40 50 70 50 80 70C70 90 40 90 30 70Z" fill="#F4EADB" />
            <circle cx="50" cy="80" r="16" fill="#EBDDC7" />
            <path d="M15 50C10 20 40 20 45 40C50 60 25 70 15 50Z" fill="#8FA489" fillOpacity="0.4" />
            <path d="M80 30C65 10 95 10 105 30C110 50 85 60 80 30Z" fill="#8FA489" fillOpacity="0.35" />
          </svg>
        </div>

        {/* Floating petals scattered */}
        <div className="absolute top-28 right-16 opacity-40">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 5C25 15 35 20 20 35C10 25 15 15 20 5Z" fill="#EADBC8" fillOpacity="0.7" />
          </svg>
        </div>
        <div className="absolute bottom-40 left-12 opacity-35">
          <svg width="45" height="45" viewBox="0 0 40 40" fill="none">
            <path d="M20 5C25 15 35 20 20 35C10 25 15 15 20 5Z" fill="#EADBC8" fillOpacity="0.7" />
          </svg>
        </div>
        <div className="absolute bottom-24 right-1/4 opacity-40">
          <svg width="35" height="35" viewBox="0 0 40 40" fill="none">
            <path d="M20 5C25 15 35 20 20 35C10 25 15 15 20 5Z" fill="#EADBC8" fillOpacity="0.7" />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAVBAR */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-4 md:px-12 lg:px-20 bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#EFE9E1]/80 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center group" title="Trang Chủ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-12 sm:h-14 md:h-15 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link href="/collections" className="hover:text-[#BE944E] transition">
              {t("homeNavCollections")}
            </Link>
            <Link href="/journal" className="hover:text-[#BE944E] transition">
              {t("homeNavJournal")}
            </Link>
            <Link href="/pricing" className="text-[#BE944E] border-b-2 border-[#BE944E] pb-0.5">
              {t("homeNavPricing")}
            </Link>
            <Link href="/concierge" className="hover:text-[#BE944E] transition">
              {t("homeNavConcierge")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <Link
                href="/dashboard/cards"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-800 text-xs font-semibold hover:border-[#BE944E] transition shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#BE944E] text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="px-4 py-2 rounded-full text-[11px] font-bold text-stone-700 hover:text-stone-900 border border-stone-300 hover:bg-white transition cursor-pointer"
              >
                {t("navLogin") || "Đăng Nhập"}
              </button>
            )}

            <button
              onClick={() => {
                if (user) router.push("/dashboard/cards/new");
                else openAuthModal("login");
              }}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-[11px] font-bold tracking-widest uppercase shadow-sm hover:scale-105 transition cursor-pointer"
            >
              {t("homeCreateBtn")}
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO HEADER */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-10 text-center space-y-4">
        {/* GOLD BADGE */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F5EEDF] border border-[#D9C4A1] text-[#8C6424] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] shadow-2xs"
        >
          <Sparkle className="w-3 h-3 fill-[#8C6424]" />
          <span>{t("pricingBadge") || "BẢNG GIÁ DỊCH VỤ"}</span>
          <Sparkle className="w-3 h-3 fill-[#8C6424]" />
        </motion.div>

        {/* LUXURY TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-[54px] font-serif font-bold text-[#181716] tracking-tight leading-tight"
        >
          Chọn Gói Dịch Vụ{" "}
          <span className="font-serif italic font-normal text-[#C59E58]">
            Phù Hợp
          </span>
        </motion.h1>

        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed"
        >
          {t("pricingDesc") || "Minh bạch, rõ ràng và đẳng cấp. Chọn gói dịch vụ phù hợp nhất để biến sự kiện của bạn thành trải nghiệm số hoàn hảo."}
        </motion.p>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. 3-TIER PRICING CARDS */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* ========================================================= */}
          {/* TIER 1: DÙNG THỬ (0đ) */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-[32px] p-7 sm:p-8 border border-[#EFE9E1] shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Icon Emblem */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#F3F6F1] border border-[#DCE4D8] flex items-center justify-center text-[#58735A] shadow-2xs">
                  <Leaf className="w-5 h-5" strokeWidth={1.75} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-[0.2em] text-center">
                {t("planFreeTitle") || "DÙNG THỬ"}
              </h3>

              {/* Price */}
              <div className="my-3 text-center">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
                  {t("planFreePrice") || "0 đ"}
                </span>
              </div>

              {/* Short Desc */}
              <p className="text-xs text-stone-500 text-center leading-relaxed mb-6 max-w-[240px] mx-auto min-h-[36px]">
                {t("planFreeDesc") || "Trải nghiệm các tính năng cơ bản của thiệp mời số."}
              </p>

              {/* Features List */}
              <div className="space-y-3 text-xs text-stone-700 pt-6 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-stone-600 shrink-0" strokeWidth={2} />
                  <span>{t("planFreeFeat1") || "Mẫu thiệp cơ bản"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-stone-600 shrink-0" strokeWidth={2} />
                  <span>{t("planFreeFeat2") || "Tùy chỉnh thông tin cơ bản"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-stone-600 shrink-0" strokeWidth={2} />
                  <span>{t("planFreeFeat3") || "Thời gian sử dụng giới hạn"}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8 mt-auto">
              <button
                onClick={() => handleAction("free")}
                className="w-full py-3.5 rounded-full border border-stone-300 hover:border-stone-800 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <span>{t("btnStartFree") || "BẮT ĐẦU MIỄN PHÍ"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* TIER 2: TIÊU CHUẨN (199.000đ) */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-[32px] p-7 sm:p-8 border border-[#EFE9E1] shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Icon Emblem */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#8C6424] shadow-2xs">
                  <Gem className="w-5 h-5" strokeWidth={1.75} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-[0.2em] text-center">
                {t("planBasicTitle") || "TIÊU CHUẨN"}
              </h3>

              {/* Price */}
              <div className="my-3 text-center">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
                  {t("planBasicPrice") || "199.000đ"}
                </span>
              </div>

              {/* Short Desc */}
              <p className="text-xs text-stone-500 text-center leading-relaxed mb-6 max-w-[240px] mx-auto min-h-[36px]">
                {t("planBasicDesc") || "Tối ưu cho đám cưới và sự kiện cá nhân với các tiện ích nâng cao."}
              </p>

              {/* Features List */}
              <div className="space-y-3 text-xs text-stone-700 pt-6 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-stone-600 shrink-0" strokeWidth={2} />
                  <span>{t("planBasicFeat1") || "Nhạc nền MP3 tự chọn"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-stone-600 shrink-0" strokeWidth={2} />
                  <span>{t("planBasicFeat2") || "Tích hợp VietQR mừng cưới"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-stone-600 shrink-0" strokeWidth={2} />
                  <span>{t("planBasicFeat3") || "Link riêng cho từng khách (Individual links)"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-stone-600 shrink-0" strokeWidth={2} />
                  <span>{t("planBasicFeat4") || "Lưu trữ vĩnh viễn (Permanent access)"}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8 mt-auto">
              <button
                onClick={() => handleAction("basic")}
                className="w-full py-3.5 rounded-full bg-[#263327] hover:bg-[#1A261B] text-white text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <span>{t("btnSelectBasic") || "CHỌN TIÊU CHUẨN"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* TIER 3: VIP HOÀNG GIA (249.000đ) - HIGHLIGHTED */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-[32px] p-7 sm:p-8 border-2 border-[#E7CE8F] shadow-[0_15px_40px_rgba(218,165,32,0.18)] relative flex flex-col justify-between overflow-hidden"
          >
            {/* TOP GOLDEN METALLIC RIBBON */}
            <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-[#B68837] via-[#DFB967] to-[#A2772A] py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-2xs">
              {t("planVipPopular") || "★ PHỔ BIẾN NHẤT"}
            </div>

            <div className="pt-3">
              {/* Top Crown Emblem with Laurel Glow */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#FFFDF9] to-[#FDF8EE] border border-[#E7CE8F] flex items-center justify-center text-[#B68837] shadow-sm">
                  <Crown className="w-5 h-5 fill-[#B68837]/20" strokeWidth={1.75} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-[#B68837] uppercase tracking-[0.2em] text-center">
                {t("planVipTitle") || "VIP HOÀNG GIA"}
              </h3>

              {/* Price */}
              <div className="my-3 text-center">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-[#B68837]">
                  {t("planVipPrice") || "249.000đ"}
                </span>
              </div>

              {/* Short Desc */}
              <p className="text-xs text-stone-500 text-center leading-relaxed mb-6 max-w-[240px] mx-auto min-h-[36px]">
                {t("planVipDesc") || "Trải nghiệm sang trọng tuyệt đối, thiết kế tinh xảo không tì vết."}
              </p>

              {/* VIP Features List with Custom Icons */}
              <div className="space-y-3.5 text-xs text-stone-700 pt-6 border-t border-amber-100">
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-[#B68837] shrink-0" />
                  <span>{t("planVipFeat1") || "Mọi tính năng của Tiêu Chuẩn"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-[#B68837] shrink-0" />
                  <span>{t("planVipFeat2") || "Hiệu ứng 3D sáp niêm phong (Wax seal)"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Ban className="w-4 h-4 text-[#B68837] shrink-0" />
                  <span>{t("planVipFeat3") || "Không có logo CardVite (White-label)"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-[#B68837] shrink-0" />
                  <span>{t("planVipFeat4") || "Xuất danh sách khách mời ra Excel"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Headphones className="w-4 h-4 text-[#B68837] shrink-0" />
                  <span>{t("planVipFeat5") || "Hỗ trợ ưu tiên 24/7"}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8 mt-auto">
              <button
                onClick={() => handleAction("vip")}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_6px_20px_rgba(190,148,78,0.35)] hover:scale-102"
              >
                <span>{t("btnUpgradeVip") || "NÂNG CẤP VIP"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <Footer />
    </div>
  );
}

