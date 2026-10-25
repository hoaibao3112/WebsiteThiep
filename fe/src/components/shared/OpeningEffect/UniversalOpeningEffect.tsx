"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Crown, Bell } from "lucide-react";
import confetti from "canvas-confetti";
import { EnvelopeConfig, OpeningEffectType, WeddingDataPayload } from "@/types/card.types";
import { WeddingCoverOpening } from "@/components/wedding/opening/WeddingCoverOpening";
import { playEnvelopeOpeningSound } from "@/components/wedding/opening/audio/opening-sound";

export interface UniversalOpeningEffectProps {
  effect?: OpeningEffectType | string;
  templateSlug?: string;
  envelopeConfig?: EnvelopeConfig;
  weddingData?: Partial<WeddingDataPayload>;
  guestName?: string;
  title?: string;
  subtitle?: string;
  onOpenStart?: () => void;
  onOpened: () => void;
}

export const UniversalOpeningEffect: React.FC<UniversalOpeningEffectProps> = ({
  effect = "WAX_SEAL",
  templateSlug,
  envelopeConfig,
  weddingData,
  guestName,
  title,
  subtitle,
  onOpenStart,
  onOpened,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLidOff, setIsLidOff] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // 1. Nếu là WAX_SEAL (hoặc không truyền hiệu ứng) -> Sử dụng bộ Phong Bì Sáp Hoàng Gia hoàn chỉnh
  if (!effect || effect === "WAX_SEAL") {
    return (
      <WeddingCoverOpening
        templateSlug={templateSlug}
        envelopeConfig={envelopeConfig}
        weddingData={weddingData}
        guestName={guestName}
        onOpenStart={onOpenStart}
        onOpened={onOpened}
      />
    );
  }

  // 2. Nếu là NONE -> Bỏ qua
  if (effect === "NONE") {
    return null;
  }

  // Helper kích hoạt mở hiệu ứng
  const handleTriggerOpen = (customConfettiColors?: string[]) => {
    if (isOpen) return;
    setIsOpen(true);
    onOpenStart?.();
    playEnvelopeOpeningSound();

    try {
      confetti({
        particleCount: 65,
        spread: 90,
        origin: { y: 0.55 },
        colors: customConfettiColors || ["#D4AF37", "#FFD700", "#FFF8DC", "#E11D48", "#C5A059"],
        disableForReducedMotion: true,
      });
    } catch {
      // safe fallback
    }

    if (effect === "GIFT_BOX") {
      setIsLidOff(true);
      timerRef.current = window.setTimeout(() => {
        onOpened();
      }, 950);
    } else {
      timerRef.current = window.setTimeout(() => {
        onOpened();
      }, 900);
    }
  };

  const groomName = weddingData?.groom?.shortName || weddingData?.groom?.fullName || "Chú Rể";
  const brideName = weddingData?.bride?.shortName || weddingData?.bride?.fullName || "Cô Dâu";
  const displayTitle = title || `${groomName} & ${brideName}`;

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="universal-opening-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-stone-950/90 via-stone-900/95 to-black/95 backdrop-blur-md select-none pointer-events-auto"
        >
          {/* Lớp hạt sáng lấp lánh nền */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12)_0%,transparent_70%)]" />

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 1. HIỆU ỨNG: CỔNG HOA MỞ 2 CÁNH (GATE_OPEN)                    */}
          {/* ───────────────────────────────────────────────────────────── */}
          {effect === "GATE_OPEN" && (
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-amber-300/30 flex flex-col justify-end p-6 [perspective:1400px]">
              {/* Background sau cổng */}
              <div className="absolute inset-0 bg-[#0F0A06] bg-[radial-gradient(ellipse_at_center,rgba(247,208,112,0.25)_0%,transparent_80%)]" />

              {/* 2 CÁNH CỔNG HOA */}
              <div className="absolute inset-0 flex [transform-style:preserve-3d]">
                {/* Cánh cổng trái */}
                <motion.div
                  className="w-1/2 h-full shadow-2xl relative border-r border-amber-400/40"
                  style={{
                    backgroundImage: "url('/images/effects/royal-gate.jpg')",
                    backgroundSize: "200% 100%",
                    backgroundPosition: "left center",
                    transformOrigin: "left center",
                  }}
                  animate={isOpen ? { rotateY: -88, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none" />
                </motion.div>

                {/* Cánh cổng phải */}
                <motion.div
                  className="w-1/2 h-full shadow-2xl relative border-l border-amber-400/40"
                  style={{
                    backgroundImage: "url('/images/effects/royal-gate.jpg')",
                    backgroundSize: "200% 100%",
                    backgroundPosition: "right center",
                    transformOrigin: "right center",
                  }}
                  animate={isOpen ? { rotateY: 88, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-black/20 pointer-events-none" />
                </motion.div>
              </div>

              {/* NÚT TRUNG TÂM: CHẠM ĐỂ MỞ CỔNG */}
              <div className="relative z-20 flex flex-col items-center text-center space-y-3">
                {guestName && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-amber-200 border border-amber-300/40 backdrop-blur-xs">
                    Kính mời: {guestName}
                  </span>
                )}

                <motion.button
                  type="button"
                  onClick={() => handleTriggerOpen(["#D4AF37", "#FFFFFF", "#F5D061", "#E5A93C"])}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-900 font-bold text-xs sm:text-sm shadow-[0_4px_25px_rgba(245,208,97,0.65)] border border-amber-100 flex items-center gap-2 cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-amber-900 fill-amber-900" />
                  <span>Bấm Để Mở Cổng Thiệp</span>
                </motion.button>

                <p className="text-[11px] font-serif text-amber-100/90 tracking-wider uppercase drop-shadow-sm">
                  {displayTitle}
                </p>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 2. HIỆU ỨNG: HỘP QUÀ TÌNH YÊU 3D (GIFT_BOX)                    */}
          {/* ───────────────────────────────────────────────────────────── */}
          {effect === "GIFT_BOX" && (
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] flex flex-col items-center text-center space-y-4">
              {guestName && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-900/80 text-amber-200 border border-amber-400/30 backdrop-blur-xs shadow-md">
                  Gửi tặng: {guestName}
                </span>
              )}

              {/* HỘP QUÀ 3D */}
              <div
                onClick={() => handleTriggerOpen(["#E11D48", "#FFD700", "#FF4D6D", "#FFF"])}
                className="relative w-64 h-64 sm:w-72 sm:h-72 cursor-pointer group flex items-center justify-center"
              >
                {/* Hào quang vàng phía sau */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-amber-500/25 blur-2xl"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* ẢNH HỘP QUÀ ĐÃ MỞ (NẰM DƯỚI) */}
                <div
                  className={`absolute inset-0 bg-contain bg-no-repeat bg-center transition-opacity duration-300 ${
                    isLidOff ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundImage: "url('/images/effects/gift-box-open.jpg')" }}
                >
                  {/* Luồng sáng vàng bắn lên từ lòng hộp */}
                  <div className="absolute inset-x-8 top-0 h-40 bg-gradient-to-t from-amber-300 via-amber-100/80 to-transparent blur-md animate-pulse" />
                </div>

                {/* ẢNH HỘP QUÀ ĐÓNG KÈM NƠ (NẰM TRÊN) */}
                <motion.div
                  className="absolute inset-0 bg-contain bg-no-repeat bg-center"
                  style={{ backgroundImage: "url('/images/effects/gift-box-closed.jpg')" }}
                  animate={
                    isLidOff
                      ? { y: -160, rotate: -18, scale: 1.15, opacity: 0 }
                      : { y: [0, -6, 0] }
                  }
                  transition={
                    isLidOff
                      ? { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
                      : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }
                />
              </div>

              {/* NÚT BẤM MỞ HỘP QUÀ */}
              <motion.button
                type="button"
                onClick={() => handleTriggerOpen(["#E11D48", "#FFD700", "#FF4D6D", "#FFF"])}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-[0_4px_25px_rgba(225,29,72,0.55)] border border-rose-300/40 flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Chạm Để Mở Hộp Quà Chúc Phúc</span>
              </motion.button>

              <p className="text-xs text-stone-300 font-serif tracking-wider uppercase">
                {displayTitle}
              </p>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 3. HIỆU ỨNG: MÀN NHUNG SÂN KHẤU HOÀNG GIA (ROYAL_CURTAIN)       */}
          {/* ───────────────────────────────────────────────────────────── */}
          {effect === "ROYAL_CURTAIN" && (
            <div className="relative w-full h-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-amber-300/30 flex flex-col justify-end p-6">
              {/* VẠT RÈM TRÁI */}
              <motion.div
                className="absolute top-0 bottom-0 left-0 w-1/2 z-10"
                style={{
                  backgroundImage: "url('/images/effects/royal-curtain.jpg')",
                  backgroundSize: "200% 100%",
                  backgroundPosition: "left center",
                }}
                animate={isOpen ? { x: "-105%" } : { x: "0%" }}
                transition={{ duration: 0.95, ease: [0.25, 1, 0.5, 1] }}
              >
                <div className="w-full h-full bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none" />
              </motion.div>

              {/* VẠT RÈM PHẢI */}
              <motion.div
                className="absolute top-0 bottom-0 right-0 w-1/2 z-10"
                style={{
                  backgroundImage: "url('/images/effects/royal-curtain.jpg')",
                  backgroundSize: "200% 100%",
                  backgroundPosition: "right center",
                }}
                animate={isOpen ? { x: "105%" } : { x: "0%" }}
                transition={{ duration: 0.95, ease: [0.25, 1, 0.5, 1] }}
              >
                <div className="w-full h-full bg-gradient-to-l from-black/40 via-transparent to-black/20 pointer-events-none" />
              </motion.div>

              {/* NÚT KÉO RÈM Ở GIỮA */}
              <div className="relative z-20 flex flex-col items-center text-center space-y-3 pb-6">
                {guestName && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/70 text-amber-200 border border-amber-300/40 backdrop-blur-xs">
                    Kính mời: {guestName}
                  </span>
                )}

                <motion.button
                  type="button"
                  onClick={() => handleTriggerOpen(["#D4AF37", "#800020", "#FFD700", "#FFF"])}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-900 font-bold text-xs sm:text-sm shadow-[0_4px_25px_rgba(245,208,97,0.7)] border border-amber-100 flex items-center gap-2 cursor-pointer animate-pulse"
                >
                  <Crown className="w-4 h-4 text-amber-900 fill-amber-900" />
                  <span>Kéo Màn Hoàng Gia Khai Tiệc</span>
                </motion.button>

                <p className="text-xs font-serif text-amber-100 tracking-wider uppercase drop-shadow">
                  {displayTitle}
                </p>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 4. HIỆU ỨNG: CỬA CUNG ĐÌNH Á ĐÔNG SONG HỶ (ORIENTAL_DOOR)       */}
          {/* ───────────────────────────────────────────────────────────── */}
          {effect === "ORIENTAL_DOOR" && (
            <div className="relative w-full max-w-[360px] sm:max-w-[400px] aspect-[4/5] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/50 flex flex-col justify-end p-6 [perspective:1400px]">
              {/* Background sau cửa */}
              <div className="absolute inset-0 bg-[#240608] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.2)_0%,transparent_80%)]" />

              {/* 2 CÁNH CỬA CUNG ĐÌNH */}
              <div className="absolute inset-0 flex [transform-style:preserve-3d]">
                {/* Cánh cửa trái */}
                <motion.div
                  className="w-1/2 h-full shadow-2xl relative border-r border-amber-400/30"
                  style={{
                    backgroundImage: "url('/images/effects/oriental-door.jpg')",
                    backgroundSize: "200% 100%",
                    backgroundPosition: "left center",
                    transformOrigin: "left center",
                  }}
                  animate={isOpen ? { rotateY: -85, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20 pointer-events-none" />
                </motion.div>

                {/* Cánh cửa phải */}
                <motion.div
                  className="w-1/2 h-full shadow-2xl relative border-l border-amber-400/30"
                  style={{
                    backgroundImage: "url('/images/effects/oriental-door.jpg')",
                    backgroundSize: "200% 100%",
                    backgroundPosition: "right center",
                    transformOrigin: "right center",
                  }}
                  animate={isOpen ? { rotateY: 85, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-transparent to-black/20 pointer-events-none" />
                </motion.div>
              </div>

              {/* NÚT GÕ CỬA TRUNG TÂM */}
              <div className="relative z-20 flex flex-col items-center text-center space-y-3">
                {guestName && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-amber-200 border border-amber-400/40 backdrop-blur-xs">
                    Kính mời: {guestName}
                  </span>
                )}

                <motion.button
                  type="button"
                  onClick={() => handleTriggerOpen(["#D4AF37", "#DC2626", "#F59E0B", "#FFF"])}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-700 text-white font-bold text-xs sm:text-sm shadow-[0_4px_25px_rgba(220,38,38,0.7)] border border-amber-300 flex items-center gap-2 cursor-pointer animate-pulse"
                >
                  <span className="text-base">囍</span>
                  <span>Gõ Cửa Mở Tiệc Mừng Hỷ</span>
                </motion.button>

                <p className="text-xs font-serif text-amber-200 tracking-wider uppercase drop-shadow">
                  {displayTitle}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
