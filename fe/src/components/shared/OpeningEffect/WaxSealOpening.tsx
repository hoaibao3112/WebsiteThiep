"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MailOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

interface WaxSealOpeningProps {
  primaryColor?: string;
  title: string;
  subtitle?: string;
  guestName?: string;
  guest?: { salutation?: string; fullName: string };
  monogram?: string;
  isVipExperience?: boolean;
  onOpenStart?: () => void;
  onOpened: () => void;
}

export const WaxSealOpening: React.FC<WaxSealOpeningProps> = ({
  primaryColor = "#8B1E2D",
  title,
  subtitle,
  guestName,
  guest,
  monogram,
  isVipExperience = false,
  onOpenStart,
  onOpened,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    onOpenStart?.();

    // Âm thanh mở màn / mở phong bì trang trọng
    try {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"
      );
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch (e) {}

    // Sau khi màn kéo mở hoàn tất (1.2s) thì hoàn thành transition
    timerRef.current = window.setTimeout(
      () => {
        onOpened();
      },
      reducedMotion ? 200 : 1200
    );
  };

  const displayGuest = guest
    ? `${guest.salutation ? `${guest.salutation} ` : ""}${guest.fullName}`.trim()
    : guestName?.trim();
  const displayMonogram = monogram || "♥";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. HAI CÁNH MÀN KÉO (CURTAINS SLIDING APART)                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* CÁNH MÀN BÊN TRÁI (KÉO SANG TRÁI) */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-1/2 z-10 overflow-hidden shadow-2xl flex justify-end"
        style={{
          background:
            "linear-gradient(135deg, #1f140d 0%, #2f1e14 40%, #24160e 70%, #170d08 100%)",
        }}
        initial={{ x: 0 }}
        animate={isOpen ? { x: "-100%" } : { x: 0 }}
        transition={{
          duration: reducedMotion ? 0.3 : 1.1,
          ease: [0.25, 1, 0.5, 1],
        }}
      >
        {/* Nếp gấp lụa và ánh kim trang trí mép màn */}
        <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.03)_20px,rgba(255,255,255,0.03)_40px)]" />
        <div className="w-1.5 h-full bg-gradient-to-b from-[#E6CA65] via-[#C5A059] to-[#8C6B2D] shadow-md shrink-0" />
      </motion.div>

      {/* CÁNH MÀN BÊN PHẢI (KÉO SANG PHẢI) */}
      <motion.div
        className="absolute top-0 bottom-0 right-0 w-1/2 z-10 overflow-hidden shadow-2xl flex justify-start"
        style={{
          background:
            "linear-gradient(225deg, #1f140d 0%, #2f1e14 40%, #24160e 70%, #170d08 100%)",
        }}
        initial={{ x: 0 }}
        animate={isOpen ? { x: "100%" } : { x: 0 }}
        transition={{
          duration: reducedMotion ? 0.3 : 1.1,
          ease: [0.25, 1, 0.5, 1],
        }}
      >
        <div className="w-1.5 h-full bg-gradient-to-b from-[#E6CA65] via-[#C5A059] to-[#8C6B2D] shadow-md shrink-0" />
        <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.03)_20px,rgba(255,255,255,0.03)_40px)]" />
      </motion.div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. NÚT ĐỔI NGÔN NGỮ FLOATING TRÊN CÙNG                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-5 right-5 z-30">
        <LanguageSwitcher />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. THẺ BÀI / PHONG BÌ TRÂN TRỌNG MỜI Ở GIỮA                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        <motion.div
          className="relative w-full max-w-sm rounded-3xl bg-[#FAF6EE] border-2 border-[#E5D7BE] p-6 sm:p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={
            isOpen
              ? { scale: 0.8, y: -40, opacity: 0 }
              : { scale: 1, y: 0, opacity: 1 }
          }
          transition={{
            duration: reducedMotion ? 0.2 : 0.6,
            ease: [0.25, 1, 0.5, 1],
          }}
        >
          {/* Họa tiết góc thiệp viền vàng */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#C5A059]/40 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#C5A059]/40 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#C5A059]/40 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#C5A059]/40 rounded-br-lg pointer-events-none" />

          {/* DÒNG TIÊU ĐỀ THƯ MỜI */}
          <div className="flex items-center justify-center gap-2 text-[#A6825E]">
            <span className="text-xs">✦</span>
            <span className="text-[11px] uppercase tracking-[0.25em] font-serif font-bold">
              {subtitle || "Thư Mời Thành Hôn"}
            </span>
            <span className="text-xs">✦</span>
          </div>

          {/* DÒNG KÍNH MỜI ĐÍCH DANH KHÁCH MỜI (RẤT NỔI BẬT) */}
          <div className="my-4 px-4 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFFBF2] via-[#FFF5E6] to-[#FFFBF2] border border-[#E8D9C0] shadow-2xs">
            <span className="block text-[11px] sm:text-xs uppercase tracking-wider text-[#A17A4D] font-medium">
              Trân trọng kính mời
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2A1D13] mt-0.5 tracking-tight truncate">
              {displayGuest || "Quý Khách Quý"}
            </h2>
          </div>

          {/* TIÊU ĐỀ CÔ DÂU & CHÚ RỂ */}
          <div className="my-3">
            <p className="text-xs text-[#7A6C5E] font-serif italic mb-1">
              Đến chung vui cùng ngày đại hỷ của
            </p>
            <h1
              className="text-2xl sm:text-3xl font-serif font-bold tracking-tight leading-snug"
              style={{ color: primaryColor }}
            >
              {title}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2.5 text-[#C5A059]/60">
              <div className="h-px w-8 bg-[#C5A059]/40" />
              <Heart className="w-3.5 h-3.5 fill-[#C5A059]/40 text-[#C5A059]/60" />
              <div className="h-px w-8 bg-[#C5A059]/40" />
            </div>
          </div>

          {/* NÚT CON DẤU SÁP / CHẠM ĐỂ KÉO MÀN */}
          <div className="mt-6 flex flex-col items-center">
            <motion.button
              type="button"
              onClick={handleOpen}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="relative group cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C5A059]/50 rounded-full"
              aria-label="Mở thiệp cưới"
            >
              {/* Hiệu ứng hào quang tỏa sáng (Pulsing halo) */}
              <motion.div
                aria-hidden="true"
                className="absolute -inset-3 rounded-full opacity-60 blur-md"
                style={{ backgroundColor: primaryColor }}
                animate={
                  reducedMotion
                    ? undefined
                    : {
                        scale: [1, 1.25, 1],
                        opacity: [0.35, 0.8, 0.35],
                      }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Con dấu sáp ánh kim sang trọng */}
              <div
                className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center text-white shadow-2xl border-2 border-white/50"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow:
                    "inset 0 2px 4px rgba(255,255,255,0.4), 0 10px 25px rgba(0,0,0,0.35)",
                }}
              >
                {isVipExperience ? (
                  <span className="text-xl sm:text-2xl font-serif tracking-widest">
                    {displayMonogram}
                  </span>
                ) : (
                  <MailOpen className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5 text-[#FFF5E6]" />
                )}
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#FFF5E6]">
                  MỞ THIỆP
                </span>
              </div>
            </motion.button>

            {/* Dòng hướng dẫn người xem chạm để mở */}
            <p className="text-xs text-[#8C7A6B] mt-3 font-medium flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Chạm để mở thiệp cưới</span>
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
