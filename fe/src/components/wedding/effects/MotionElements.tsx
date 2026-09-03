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
