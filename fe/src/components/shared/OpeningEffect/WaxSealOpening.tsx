"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MailOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { EnvelopeConfig } from "@/types/card.types";

interface WaxSealOpeningProps {
  primaryColor?: string;
  title: string;
  subtitle?: string;
  guestName?: string;
  guest?: { salutation?: string; fullName: string };
  monogram?: string;
  isVipExperience?: boolean;
  envelopeConfig?: EnvelopeConfig;
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
  envelopeConfig,
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

          {/* NỘI DUNG HIỂN THỊ PHONG BÌ HOÀNG GIA HOẶC THẺ BÀI */}
          {envelopeConfig ? (
            /* ============================================================== */
            /* A. GIAO DIỆN PHONG BÌ THỰC TẾ (THEO CẤU HÌNH TỪ BACKEND)      */
            /* ============================================================== */
            (() => {
              const styleId = envelopeConfig.styleId || "vintage-cream";
              const isCream = styleId === "vintage-cream";
              const isBeige = styleId === "beige";
              const isRed = styleId === "red";
              const isEmerald = styleId === "emerald";
              const isRose = styleId === "rose-gold";
              const isPeony = styleId === "peony-crimson";

              const envColor = isCream
                ? "#7B96A8"
                : isBeige
                ? "#F5EBE1"
                : isRed
                ? "#73161C"
                : isPeony
                ? "#8B1E2D"
                : isEmerald
                ? "#1B4332"
                : isRose
                ? "#D8A49B"
                : primaryColor;

              const flapColor = isCream
                ? "#6B8596"
                : isBeige
                ? "#E8DCCF"
                : isRed
                ? "#611015"
                : isPeony
                ? "#73161C"
                : isEmerald
                ? "#143326"
                : isRose
                ? "#C89288"
                : "#611015";

              const sealColor = isCream
                ? "#C0C5C7"
                : isBeige
                ? "#1E1E1E"
                : isRed
                ? "#C89B3C"
                : isPeony
                ? "#D4AF37"
                : isEmerald
                ? "#D4AF37"
                : isRose
                ? "#8C4A4A"
                : "#C89B3C";

              const monogramColor = isCream
                ? "#4A5D6B"
                : isBeige
                ? "#D4AF37"
                : isRed
                ? "#611015"
                : isPeony
                ? "#F4E8D0"
                : isEmerald
                ? "#1B4332"
                : isRose
                ? "#FFFFFF"
                : "#FFFFFF";

              const coupleDisplay =
                envelopeConfig.groomName && envelopeConfig.brideName
                  ? `${envelopeConfig.groomName} & ${envelopeConfig.brideName}`
                  : title;

              const activeMonogram = envelopeConfig.monogram || monogram || "ML";

              return (
                <div className="flex flex-col items-center">
                  {/* TIÊU ĐỀ PHONG BÌ */}
                  <div className="mb-4 text-center">
                    <p className="text-xs sm:text-sm font-serif text-[#7A6C5E] tracking-wide mb-1">
                      {envelopeConfig.title || subtitle || "We're getting married!"}
                    </p>
                    <h1
                      className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2A1D13]"
                      style={{ fontFamily: envelopeConfig.fontFamily || "serif" }}
                    >
                      {coupleDisplay}
                    </h1>
                  </div>

                  {/* KHÁCH MỜI DANH DỰ (NẾU CÓ) */}
                  {displayGuest && (
                    <div className="mb-4 px-4 py-1.5 rounded-full bg-[#FFFBF2] border border-[#E8D9C0] text-[11px] font-medium text-[#A17A4D]">
                      Trân trọng kính mời: <strong className="text-stone-900">{displayGuest}</strong>
                    </div>
                  )}

                  {/* PHONG BÌ 3D KÈM HOA TRANG TRÍ VÀ CON DẤU */}
                  <div className="relative w-full max-w-[280px] aspect-4/3 my-2 flex items-center justify-center">
                    {/* HOA TRANG TRÍ 2 BÊN MÈP PHONG BÌ */}
                    {isCream && (
                      <>
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md">
                          <svg width="50" height="75" viewBox="0 0 60 90" fill="none">
                            <circle cx="25" cy="45" r="14" fill="#9FBAD3" opacity="0.9" />
                            <circle cx="35" cy="35" r="12" fill="#B8D0E5" opacity="0.95" />
                            <circle cx="20" cy="30" r="10" fill="#E6EEF4" />
                            <circle cx="38" cy="55" r="11" fill="#789CBF" />
                            <circle cx="25" cy="45" r="2.5" fill="#FFFFFF" />
                            <path d="M12 25 C5 20, 2 35, 10 40 Z" fill="#6B8E63" opacity="0.8" />
                          </svg>
                        </div>
                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md scale-x-[-1]">
                          <svg width="50" height="75" viewBox="0 0 60 90" fill="none">
                            <circle cx="25" cy="45" r="14" fill="#9FBAD3" opacity="0.9" />
                            <circle cx="35" cy="35" r="12" fill="#B8D0E5" opacity="0.95" />
                            <circle cx="20" cy="30" r="10" fill="#E6EEF4" />
                            <circle cx="38" cy="55" r="11" fill="#789CBF" />
                            <circle cx="25" cy="45" r="2.5" fill="#FFFFFF" />
                            <path d="M12 25 C5 20, 2 35, 10 40 Z" fill="#6B8E63" opacity="0.8" />
                          </svg>
                        </div>
                      </>
                    )}

                    {isBeige && (
                      <>
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md">
                          <svg width="50" height="75" viewBox="0 0 60 90" fill="none">
                            <circle cx="28" cy="40" r="14" fill="#FAF6EE" />
                            <circle cx="28" cy="40" r="4" fill="#C5A059" />
                            <circle cx="32" cy="58" r="12" fill="#FFFFFF" />
                            <path d="M15 20 C5 15, 0 30, 12 35 Z" fill="#5A7D52" />
                          </svg>
                        </div>
                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md scale-x-[-1]">
                          <svg width="50" height="75" viewBox="0 0 60 90" fill="none">
                            <circle cx="28" cy="40" r="14" fill="#FAF6EE" />
                            <circle cx="28" cy="40" r="4" fill="#C5A059" />
                            <circle cx="32" cy="58" r="12" fill="#FFFFFF" />
                            <path d="M15 20 C5 15, 0 30, 12 35 Z" fill="#5A7D52" />
                          </svg>
                        </div>
                      </>
                    )}

                    {(isRed || isPeony) && (
                      <>
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md">
                          <svg width="50" height="75" viewBox="0 0 60 90" fill="none">
                            <circle cx="28" cy="42" r="15" fill="#6A1016" />
                            <circle cx="24" cy="38" r="10" fill="#8B1E24" />
                            <path d="M18 20 C22 15, 26 22, 20 25 Z" fill="#C5A059" />
                          </svg>
                        </div>
                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md scale-x-[-1]">
                          <svg width="50" height="75" viewBox="0 0 60 90" fill="none">
                            <circle cx="28" cy="42" r="15" fill="#6A1016" />
                            <circle cx="24" cy="38" r="10" fill="#8B1E24" />
                            <path d="M18 20 C22 15, 26 22, 20 25 Z" fill="#C5A059" />
                          </svg>
                        </div>
                      </>
                    )}

                    {/* THÂN PHONG BÌ 3D */}
                    <div
                      onClick={handleOpen}
                      className="w-full h-full rounded-xl relative shadow-2xl overflow-hidden flex items-center justify-center border border-black/10 cursor-pointer group"
                      style={{ backgroundColor: envColor }}
                    >
                      {/* Ánh sáng mỹ thuật */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15 pointer-events-none" />

                      {/* NẮP PHONG BÌ TAM GIÁC (TRIANGLE FLAP) */}
                      <div
                        className="absolute top-0 inset-x-0 h-0 border-l-[140px] border-l-transparent border-r-[140px] border-r-transparent border-t-[90px] z-10 drop-shadow-md"
                        style={{ borderTopColor: flapColor }}
                      />

                      {/* CON DẤU SÁP HOÀNG GIA CHẠM ĐỂ MỞ */}
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute z-20 top-[55px] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-white/40 cursor-pointer"
                        style={{ backgroundColor: sealColor }}
                      >
                        <div
                          className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: sealColor }}
                        >
                          <span
                            className="text-base font-serif font-bold italic tracking-tighter"
                            style={{ color: monogramColor }}
                          >
                            {activeMonogram}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* NÚT CHẠM ĐỂ MỞ THIỆP */}
                  <button
                    type="button"
                    onClick={handleOpen}
                    className="mt-4 px-6 py-2 rounded-full border border-stone-300/80 hover:bg-stone-100/60 text-[#7A6C5E] text-xs font-bold tracking-[0.2em] uppercase transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{envelopeConfig.buttonText || "CHẠM ĐỂ MỞ"}</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  </button>
                </div>
              );
            })()
          ) : (
            /* ============================================================== */
            /* B. GIAO DIỆN THẺ BÀI SANG TRỌNG NGUYÊN BẢN (FALLBACK)          */
            /* ============================================================== */
            <>
              {/* DÒNG TIÊU ĐỀ THƯ MỜI */}
              <div className="flex items-center justify-center gap-2 text-[#A6825E]">
                <span className="text-xs">✦</span>
                <span className="text-[11px] uppercase tracking-[0.25em] font-serif font-bold">
                  {subtitle || "Thư Mời Thành Hôn"}
                </span>
                <span className="text-xs">✦</span>
              </div>

              {/* DÒNG KÍNH MỜI ĐÍCH DANH KHÁCH MỜI */}
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

                <p className="text-xs text-[#8C7A6B] mt-3 font-medium flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Chạm để mở thiệp cưới</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
