"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { EnvelopeConfig, WeddingDataPayload } from "@/types/card.types";
import { EnvelopeOrnament } from "./EnvelopeOrnament";
import { resolveCoverTheme } from "./cover-themes";
import { playEnvelopeOpeningSound } from "./audio/opening-sound";

interface WeddingCoverOpeningProps {
  templateSlug?: string;
  envelopeConfig?: EnvelopeConfig;
  weddingData?: Partial<WeddingDataPayload>;
  guestName?: string;
  onOpenStart?: () => void;
  onOpened: () => void;
}

export const WeddingCoverOpening: React.FC<WeddingCoverOpeningProps> = ({
  templateSlug,
  envelopeConfig,
  weddingData,
  guestName,
  onOpenStart,
  onOpened,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Phân giải cấu hình bìa thiệp (Ưu tiên cấu hình từ backend do người dùng tùy biến)
  const theme = resolveCoverTheme(
    templateSlug,
    envelopeConfig,
    weddingData,
    guestName
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleOpenInvitation = () => {
    if (isOpen) return;
    setIsOpen(true);

    // 1. Kích hoạt phát nhạc nền thiệp cưới (vượt rào cản Autoplay Policy)
    onOpenStart?.();

    // 2. Phát âm thanh mở thiệp (nếu được bật trong cấu hình)
    if (theme.soundEnabled) {
      playEnvelopeOpeningSound(theme.soundUrl);
    }

    // 3. Sau khi hoạt ảnh bung mở hoàn tất (800ms) -> hiển thị toàn bộ thiệp cưới
    timerRef.current = window.setTimeout(() => {
      onOpened();
    }, 850);
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="wedding-cover-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none cursor-default"
          style={{ background: theme.bgGradient }}
        >
          {/* ───────────────────────────────────────────────────────────── */}
          {/* 1. HIỆU ỨNG HẠT BỤI SAO & ÁNH SÁNG LƠ LỬNG HUYỀN ẢO             */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(14)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute rounded-full bg-amber-200/40"
                style={{
                  width: (i % 3) + 2 + "px",
                  height: (i % 3) + 2 + "px",
                  top: `${(i * 19) % 95}%`,
                  left: `${(i * 29) % 95}%`,
                  boxShadow: "0 0 8px rgba(254, 240, 138, 0.6)",
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + (i % 4),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (i * 0.3) % 2,
                }}
              />
            ))}
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 2. THẺ BÌA THIỆP CƯỚI TRUNG TÂM (ELEGANT INVITATION ENVELOPE)  */}
          {/* ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ scale: 0.92, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.08, y: -25, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[440px] rounded-3xl p-7 sm:p-10 text-center overflow-hidden border backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.65)]"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: `${theme.borderColor}55`,
            }}
          >
            {/* Lớp vân gấm nhẹ tinh tế */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 3. HOA VĂN GÓC THIỆP CAO CẤP (TOP-LEFT & BOTTOM-RIGHT)         */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="absolute top-0 left-0 w-32 sm:w-40 h-32 sm:h-40 pointer-events-none">
              <EnvelopeOrnament type={theme.ornamentType} position="top-left" />
            </div>
            <div className="absolute bottom-0 right-0 w-32 sm:w-40 h-32 sm:h-40 pointer-events-none">
              <EnvelopeOrnament type={theme.ornamentType} position="bottom-right" />
            </div>

            {/* Khung viền góc mạ vàng mờ */}
            <div
              className="absolute inset-2.5 rounded-[22px] border pointer-events-none"
              style={{ borderColor: `${theme.borderColor}25` }}
            />

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 4. CON DẤU SÁP HOÀNG GIA / TRÁI TIM / SONG HỶ                  */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="relative z-10 flex justify-center mb-4 sm:mb-5">
              <motion.div
                whileHover={{ scale: 1.08 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg border-2 cursor-pointer transition-transform"
                style={{
                  backgroundColor: theme.sealColor,
                  borderColor: theme.sealBorderColor,
                  boxShadow: `0 4px 20px ${theme.sealColor}66`,
                }}
                onClick={handleOpenInvitation}
              >
                {theme.sealIcon === "song-hy" ? (
                  <span className="text-xl sm:text-2xl font-bold text-white select-none leading-none">
                    囍
                  </span>
                ) : theme.sealIcon === "flower" ? (
                  <Sparkles className="w-6 h-6 text-white" />
                ) : (
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white drop-shadow-sm" />
                )}
              </motion.div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 5. TÊN CẶP ĐÔI & THÔNG ĐIỆP BÁO HỶ                             */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="relative z-10 space-y-2 mb-6">
              {/* Tiêu đề thiệp */}
              <p
                className="text-xs sm:text-sm tracking-[0.2em] uppercase font-medium opacity-85"
                style={{ color: theme.accentText }}
              >
                {theme.title}
              </p>

              {/* Tên Cô dâu & Chú rể */}
              <h1
                className="text-3xl sm:text-4xl font-normal leading-tight tracking-wide drop-shadow-md py-1"
                style={{
                  color: theme.primaryText,
                  fontFamily: theme.fontFamily,
                }}
              >
                {theme.coupleNames}
              </h1>

              {/* Họa tiết gạch nối nhỏ */}
              <div className="flex items-center justify-center gap-2 py-1 opacity-70">
                <span className="w-6 h-[1px]" style={{ backgroundColor: theme.borderColor }} />
                <span className="text-xs" style={{ color: theme.borderColor }}>❦</span>
                <span className="w-6 h-[1px]" style={{ backgroundColor: theme.borderColor }} />
              </div>

              {/* Ngày thành hôn */}
              <p
                className="text-sm sm:text-base font-light tracking-wider"
                style={{ color: theme.accentText }}
              >
                {theme.dateText}
              </p>

              {/* Lời trân trọng kính mời / Khách mời danh dự */}
              <p
                className="text-xs sm:text-sm italic font-light pt-1 opacity-90"
                style={{ color: theme.accentText }}
              >
                {theme.salutation}
              </p>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 6. NÚT HÀNH ĐỘNG "MỞ THIỆP" NỔI BẬT ÁNH KIM                   */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="relative z-10 pt-1">
              <motion.button
                type="button"
                onClick={handleOpenInvitation}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative px-8 sm:px-10 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold tracking-wider transition-all duration-300 shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.65)] focus:outline-none focus:ring-2 focus:ring-amber-300"
                style={{
                  background: theme.buttonBg,
                  color: theme.buttonTextColor,
                }}
              >
                {/* Hiệu ứng tia sáng lướt qua nút */}
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                  initial={false}
                >
                  <motion.div
                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                    animate={{ x: ["-150%", "250%"] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 1,
                    }}
                  />
                </motion.div>

                <span className="relative z-10 drop-shadow-sm">
                  {theme.buttonText}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
