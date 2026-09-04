"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

/**
 * 1. KINETIC TEXT (Chữ hiện dần từng từ mượt mà kèm hiệu ứng nổi)
 */
interface KineticTextProps {
  text: string;
  className?: string;
  delay?: number;
  highlightWords?: string[];
  highlightClass?: string;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  className = "",
  delay = 0,
  highlightWords = [],
  highlightClass = "text-amber-300 font-bold",
}) => {
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className={`inline-block ${className}`}
    >
      {words.map((word, i) => {
        const isHighlight = highlightWords.some(
          (hw) => hw.toLowerCase() === word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase()
        );
        return (
          <motion.span
            key={i}
            variants={wordVariants}
            className={`inline-block mr-1.5 ${isHighlight ? highlightClass : ""}`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
};

/**
 * 2. LIVING PHOTO (Ảnh cưới sống động: Ken Burns zoom chậm, vệt sáng phản chiếu, hover 3D & chạm xem lớn)
 */
interface LivingPhotoProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  onClick?: () => void;
  enableGleam?: boolean;
  enableFloat?: boolean;
  badgeText?: string;
}

export const LivingPhoto: React.FC<LivingPhotoProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-[3/4]",
  onClick,
  enableGleam = true,
  enableFloat = false,
  badgeText,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group shadow-md hover:shadow-xl bg-stone-100 ${enableFloat ? "animate-photo-float" : ""} ${className}`}
    >
      <div className={`relative w-full h-full overflow-hidden ${aspectRatio} ${enableGleam ? "gleam-overlay" : ""}`}>
        <motion.img
          src={src}
          alt={alt}
          animate={{
            scale: [1, 1.07, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-full h-full object-cover select-none"
        />

        {/* Lớp gradient nhẹ bảo vệ thị giác */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Huy hiệu nhỏ ở góc ảnh */}
        {badgeText && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider shadow pointer-events-none">
            {badgeText}
          </div>
        )}

        {/* Chạm xem ảnh toàn màn hình icon */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white/90 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center gap-1 shadow">
          <span>🔍</span>
          <span>Xem ảnh</span>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 3. MARQUEE RIBBON (Dải chữ chạy ngang kinetic cuộn vô tận phong cách Tạp chí Thời trang)
 */
interface MarqueeRibbonProps {
  text: string;
  className?: string;
  bgClass?: string;
  textClass?: string;
}

export const MarqueeRibbon: React.FC<MarqueeRibbonProps> = ({
  text,
  bgClass = "bg-[#8B1E2D] text-amber-200",
  textClass = "text-[11px] font-mono tracking-[0.25em] uppercase font-bold py-1.5",
}) => {
  const repeated = `${text} • ${text} • ${text} • ${text} • `;

  return (
    <div className={`w-full overflow-hidden select-none border-y border-white/10 ${bgClass}`}>
      <div className="animate-marquee whitespace-nowrap">
        <span className={`inline-block px-4 ${textClass}`}>{repeated}</span>
        <span className={`inline-block px-4 ${textClass}`}>{repeated}</span>
      </div>
    </div>
  );
};

/**
 * 4. FLOATING QUOTE (Khối danh ngôn tình yêu với nhịp nổi nhẹ và dấu ngoặc kép lãng mạn)
 */
interface FloatingQuoteProps {
  quote: string;
  author?: string;
  className?: string;
  theme?: "gold" | "rose" | "forest" | "dark";
}

export const FloatingQuote: React.FC<FloatingQuoteProps> = ({
  quote,
  author,
  className = "",
  theme = "gold",
}) => {
  const themeStyles = {
    gold: "border-[#D4AF37]/30 bg-amber-50/60 text-[#543A2C]",
    rose: "border-rose-200 bg-rose-50/60 text-stone-800",
    forest: "border-emerald-200 bg-emerald-50/50 text-[#1E3E40]",
    dark: "border-amber-300/30 bg-[#2B090B] text-amber-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.7 }}
      whileHover={{ y: -3 }}
      className={`relative p-5 rounded-2xl border shadow-xs text-center space-y-2 overflow-hidden ${themeStyles[theme]} ${className}`}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-4xl font-serif select-none absolute top-1 left-3 leading-none opacity-30 pointer-events-none"
      >
        “
      </motion.span>
      <p className="text-xs font-serif italic leading-relaxed relative z-10 px-3">
        {quote}
      </p>
      {author && (
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-70 relative z-10">
          — {author} —
        </p>
      )}
    </motion.div>
  );
};

/**
 * 5. SCROLL UNFURL (Khung Cuộn Thư Truyền Thống Á Đông với 2 đầu trục dát vàng & hiệu ứng mở ra)
 */
interface ScrollUnfurlProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}

export const ScrollUnfurl: React.FC<ScrollUnfurlProps> = ({
  children,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.92 }}
      whileInView={{ opacity: 1, scaleY: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`relative py-3 my-4 ${className}`}
    >
      {/* Trục cuốn trên */}
      <div className="relative z-20 flex items-center justify-between h-4 bg-gradient-to-r from-[#8a6828] via-[#e5c158] to-[#8a6828] rounded-full shadow-md border-y border-[#fff3b3]/50">
        <div className="w-5 h-5 -ml-1 rounded-full bg-gradient-to-b from-[#b8860b] via-[#ffd700] to-[#8b6508] border border-amber-900 shadow-sm" />
        <div className="flex-1 border-t border-amber-900/20 mx-2" />
        <div className="w-5 h-5 -mr-1 rounded-full bg-gradient-to-b from-[#b8860b] via-[#ffd700] to-[#8b6508] border border-amber-900 shadow-sm" />
      </div>

      {/* Thân cuộn thư */}
      <div className="relative z-10 bg-[#FFF9EE] border-x-8 border-[#8B1E2D] shadow-inner px-4 py-6 -my-1">
        {/* Hoa văn chìm */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#8B1E2D_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>

      {/* Trục cuốn dưới */}
      <div className="relative z-20 flex items-center justify-between h-4 bg-gradient-to-r from-[#8a6828] via-[#e5c158] to-[#8a6828] rounded-full shadow-md border-y border-[#fff3b3]/50">
        <div className="w-5 h-5 -ml-1 rounded-full bg-gradient-to-b from-[#b8860b] via-[#ffd700] to-[#8b6508] border border-amber-900 shadow-sm" />
        <div className="flex-1 border-t border-amber-900/20 mx-2" />
        <div className="w-5 h-5 -mr-1 rounded-full bg-gradient-to-b from-[#b8860b] via-[#ffd700] to-[#8b6508] border border-amber-900 shadow-sm" />
      </div>
    </motion.div>
  );
};

/**
 * 6. AUSPICIOUS MEDALLIONS (Bộ 3 Huy Hiệu Sơn Mài Đếm Ngược / Âm Dương Cát Tường)
 */
interface AuspiciousMedallionsProps {
  solarDateStr?: string;
  lunarDateStr?: string;
  auspiciousTime?: string;
}

export const AuspiciousMedallions: React.FC<AuspiciousMedallionsProps> = ({
  solarDateStr = "25.12",
  lunarDateStr = "17.11",
  auspiciousTime = "11:00",
}) => {
  const items = [
    { label: "Giờ Hoàng Đạo", value: auspiciousTime, sub: "Giờ Cát" },
    { label: "Lịch Âm", value: lunarDateStr, sub: "Bình Ngô" },
    { label: "Lịch Dương", value: solarDateStr, sub: "Năm 2026" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 py-3">
      {items.map((it, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.15 }}
          whileHover={{ scale: 1.06, y: -2 }}
          className="relative group cursor-default"
        >
          {/* Viền hào quang vàng */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#99732B] via-[#F3DE97] to-[#7A5818] shadow-lg flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#751624] border border-[#E5C158] flex flex-col items-center justify-center text-center p-1 relative overflow-hidden shadow-inner">
              <span className="text-[9px] uppercase tracking-wider text-[#F7E7C4] font-serif block">
                {it.label}
              </span>
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                className="text-base sm:text-lg font-bold font-mono text-[#FFF5DA] tracking-tight my-0.5 drop-shadow"
              >
                {it.value}
              </motion.span>
              <span className="text-[8px] sm:text-[9px] text-amber-200/80 font-serif italic block">
                {it.sub}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

