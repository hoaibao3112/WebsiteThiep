"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 đến 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 đến 1
    setMousePos({ x, y });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePos({ x: 0, y: 0 });
  };

  const handleOpenInvitation = () => {
    if (isOpen) return;
    setIsOpen(true);

    // Kích hoạt pháo hoa vàng rực rỡ ăn mừng mở thiệp
    try {
      confetti({
        particleCount: 55,
        spread: 85,
        origin: { y: 0.55 },
        colors: ["#D4AF37", "#F7D070", "#FFF8DC", "#FFD700", "#E6CA65", "#E11D48"],
        disableForReducedMotion: true,
      });
    } catch {
      // safe fallback
    }

    // 1. Kích hoạt phát nhạc nền thiệp cưới (vượt rào cản Autoplay Policy)
    onOpenStart?.();

    // 2. Phát âm thanh mở thiệp (nếu được bật trong cấu hình)
    if (theme.soundEnabled) {
      playEnvelopeOpeningSound(theme.soundUrl);
    }

    // 3. Sau khi hoạt ảnh bung mở hoàn tất (850ms) -> hiển thị toàn bộ thiệp cưới
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
          exit={{ opacity: 0, scale: 1.06, filter: "blur(4px)" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none cursor-default [perspective:1200px]"
          style={{ background: theme.bgGradient }}
        >
          {/* ───────────────────────────────────────────────────────────── */}
          {/* 1. HIỆU ỨNG HẠT BỤI SAO & BOKEH LƠ LỬNG HUYỀN ẢO             */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Hạt bụi vàng sao lung linh lơ lửng */}
            {[...Array(22)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: (i % 3) * 2 + 2 + "px",
                  height: (i % 3) * 2 + 2 + "px",
                  top: `${(i * 17 + 6) % 94}%`,
                  left: `${(i * 23 + 4) % 95}%`,
                  backgroundColor: i % 2 === 0 ? "rgba(254, 240, 138, 0.75)" : "rgba(253, 224, 71, 0.55)",
                  boxShadow: `0 0 ${(i % 3) * 3 + 5}px rgba(254, 240, 138, 0.9)`,
                }}
                animate={{
                  y: [0, -22, 0],
                  x: [0, (i % 2 === 0 ? 8 : -8), 0],
                  opacity: [0.2, 0.85, 0.2],
                  scale: [0.8, 1.25, 0.8],
                }}
                transition={{
                  duration: 3.5 + (i % 4),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (i * 0.28) % 3,
                }}
              />
            ))}

            {/* Quả cầu Bokeh mềm mại tạo chiều sâu quang học sang trọng */}
            <motion.div
              className="absolute top-1/6 left-1/5 w-72 h-72 rounded-full bg-amber-400/5 blur-3xl pointer-events-none"
              animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/5 right-1/6 w-80 h-80 rounded-full bg-rose-500/5 blur-3xl pointer-events-none"
              animate={{ scale: [1.25, 1, 1.25], opacity: [0.3, 0.65, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 2. THẺ BÌA THIỆP CƯỚI TRUNG TÂM (3D PERSPECTIVE TILT)          */}
          {/* ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ scale: 0.92, y: 22, opacity: 0 }}
            animate={
              isHovering
                ? {
                    scale: 1.018,
                    rotateX: -mousePos.y * 6.5,
                    rotateY: mousePos.x * 6.5,
                    y: -4,
                    opacity: 1,
                  }
                : {
                    scale: 1,
                    rotateX: 0,
                    rotateY: 0,
                    y: [0, -7, 0],
                    opacity: 1,
                  }
            }
            exit={{ scale: 1.08, y: -30, opacity: 0, rotateX: 6 }}
            transition={
              isHovering
                ? { type: "spring", stiffness: 280, damping: 26 }
                : {
                    scale: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                    y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.75 },
                  }
            }
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[440px] rounded-3xl p-7 sm:p-10 text-center overflow-hidden border backdrop-blur-md shadow-[0_25px_65px_rgba(0,0,0,0.68)] [transform-style:preserve-3d] transition-shadow duration-300 hover:shadow-[0_30px_75px_rgba(0,0,0,0.78)]"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: `${theme.borderColor}55`,
            }}
          >
            {/* Lớp vân gấm nhẹ tinh tế */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Lớp phản chiếu ánh sáng bề mặt mạ vàng di động theo chuột */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                opacity: isHovering ? 0.28 : 0.08,
                background: `radial-gradient(circle at ${(mousePos.x + 1) * 50}% ${(mousePos.y + 1) * 50}%, rgba(255,255,255,0.45) 0%, transparent 65%)`,
              }}
            />

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 3. HOA VĂN GÓC THIỆP CHUYỂN ĐỘNG (TOP-LEFT & BOTTOM-RIGHT)    */}
            {/* ───────────────────────────────────────────────────────────── */}
            <motion.div
              className="absolute top-0 left-0 w-32 sm:w-40 h-32 sm:h-40 pointer-events-none overflow-hidden"
              animate={{
                scale: [1, 1.035, 1],
                rotate: [0, 1.2, 0],
                y: [0, -2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <EnvelopeOrnament type={theme.ornamentType} position="top-left" />
              {/* Vệt ánh kim lướt qua cánh hoa góc trên */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-200/30 to-transparent pointer-events-none"
                animate={{ x: ["-100%", "150%"], y: ["-100%", "150%"], opacity: [0, 0.8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              />
            </motion.div>

            <motion.div
              className="absolute bottom-0 right-0 w-32 sm:w-40 h-32 sm:h-40 pointer-events-none overflow-hidden"
              animate={{
                scale: [1, 1.035, 1],
                rotate: [0, -1.2, 0],
                y: [0, 2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            >
              <EnvelopeOrnament type={theme.ornamentType} position="bottom-right" />
              {/* Vệt ánh kim lướt qua cánh hoa góc dưới */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tl from-transparent via-amber-200/30 to-transparent pointer-events-none"
                animate={{ x: ["100%", "-150%"], y: ["100%", "-150%"], opacity: [0, 0.8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2, delay: 1 }}
              />
            </motion.div>

            {/* Khung viền góc mạ vàng tĩnh & dải tia sáng chạy quanh viền */}
            <div
              className="absolute inset-2.5 rounded-[22px] border pointer-events-none transition-colors duration-300"
              style={{ borderColor: `${theme.borderColor}30` }}
            />
            <div className="absolute inset-2.5 rounded-[22px] pointer-events-none overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-28 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300 to-transparent"
                animate={{ x: ["-100%", "450%"] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-28 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300 to-transparent"
                animate={{ x: ["100%", "-450%"] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
              />
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 4. CON DẤU SÁP HOÀNG GIA / TRÁI TIM / SONG HỶ TỎA SÁNG         */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="relative z-10 flex justify-center mb-4 sm:mb-5">
              {/* Vòng sóng hào quang 1 tỏa rộng */}
              <motion.div
                className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full pointer-events-none"
                style={{
                  border: `2px solid ${theme.sealBorderColor}`,
                }}
                animate={{
                  scale: [1, 1.55, 1.95],
                  opacity: [0.75, 0.25, 0],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              {/* Vòng sóng hào quang 2 lệch pha */}
              <motion.div
                className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full pointer-events-none"
                style={{
                  border: `1.5px solid ${theme.sealBorderColor}`,
                }}
                animate={{
                  scale: [1, 1.38, 1.72],
                  opacity: [0.65, 0.2, 0],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.8,
                }}
              />

              {/* Con dấu chính với hiệu ứng đập nhẹ & bóng hào quang */}
              <motion.div
                animate={{
                  scale: [1, 1.04, 1],
                  boxShadow: [
                    `0 4px 20px ${theme.sealColor}66`,
                    `0 8px 32px ${theme.sealColor}b0`,
                    `0 4px 20px ${theme.sealColor}66`,
                  ],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.12, rotate: [0, -3, 3, 0] }}
                whileTap={{ scale: 0.94 }}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg border-2 cursor-pointer transition-transform overflow-hidden"
                style={{
                  backgroundColor: theme.sealColor,
                  borderColor: theme.sealBorderColor,
                }}
                onClick={handleOpenInvitation}
                title="Bấm để mở thiệp"
              >
                {/* Vệt bóng gương lướt qua con dấu */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent skew-x-[-25deg] pointer-events-none"
                  animate={{ x: ["-150%", "250%"] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.8 }}
                />

                {theme.sealIcon === "song-hy" ? (
                  <span className="relative z-10 text-xl sm:text-2xl font-bold text-white select-none leading-none drop-shadow">
                    囍
                  </span>
                ) : theme.sealIcon === "flower" ? (
                  <Sparkles className="relative z-10 w-6 h-6 text-white drop-shadow" />
                ) : (
                  <Heart className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 text-white fill-white drop-shadow-sm" />
                )}
              </motion.div>

              {/* Ngôi sao lấp lánh ở mép con dấu */}
              <motion.div
                className="absolute -top-1.5 -right-1 pointer-events-none text-amber-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.85)]"
                animate={{
                  scale: [0, 1.25, 0],
                  rotate: [0, 90, 180],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <Sparkles className="w-4 h-4 fill-amber-300" />
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

              {/* Tên Cô dâu & Chú rể với ánh kim nổi bật */}
              <motion.h1
                animate={{
                  textShadow: [
                    "0 2px 10px rgba(0,0,0,0.3)",
                    "0 2px 18px rgba(255,215,0,0.35)",
                    "0 2px 10px rgba(0,0,0,0.3)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl sm:text-4xl font-normal leading-tight tracking-wide drop-shadow-md py-1"
                style={{
                  color: theme.primaryText,
                  fontFamily: theme.fontFamily,
                }}
              >
                {theme.coupleNames}
              </motion.h1>

              {/* Họa tiết gạch nối hoa văn cổ điển */}
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
            {/* 6. NÚT HÀNH ĐỘNG "MỞ THIỆP" NỔI BẬT ÁNH KIM & HÀO QUANG THỞ  */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="relative z-10 pt-1 flex justify-center">
              <div className="relative">
                {/* Hào quang thở mời gọi tương tác */}
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: theme.buttonBg,
                    filter: "blur(12px)",
                  }}
                  animate={{
                    scale: [0.95, 1.18, 0.95],
                    opacity: [0.35, 0.78, 0.35],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.button
                  type="button"
                  onClick={handleOpenInvitation}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.06, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-8 sm:px-10 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold tracking-wider transition-all duration-300 shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.7)] focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
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
                      className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/45 to-transparent skew-x-[-20deg]"
                      animate={{ x: ["-150%", "250%"] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 1,
                      }}
                    />
                  </motion.div>

                  <span className="relative z-10 drop-shadow-sm flex items-center justify-center gap-1.5">
                    {theme.buttonText}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

