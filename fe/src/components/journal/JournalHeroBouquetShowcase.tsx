"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flower2 } from "lucide-react";

export interface BouquetItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tag: string;
  themeColor: string;
}

export const BOUQUETS_DATA: BouquetItem[] = [
  {
    id: "bouquet-1",
    title: "Mẫu Đơn & Hồng Phấn Pastel",
    subtitle: "Dịu dàng, ngọt ngào & tinh khôi",
    imageUrl: "/images/journal-hero-bouquet.jpg",
    tag: "Sweet Romance",
    themeColor: "#E5A9B4",
  },
  {
    id: "bouquet-2",
    title: "Đỏ Rượu Marsala & Nhung Đậm",
    subtitle: "Cổ điển, quý phái & nồng nàn",
    imageUrl: "/images/journal-hero-bouquet-2.jpg",
    tag: "Vintage Royal",
    themeColor: "#8B1E2D",
  },
  {
    id: "bouquet-3",
    title: "Cam Đào Peachy & Mẫu Đơn Bồng Bềnh",
    subtitle: "Rạng rỡ, tươi mới & căng tràn sức sống",
    imageUrl: "/images/journal-hero-bouquet-3.jpg",
    tag: "Sunset Peach",
    themeColor: "#E89F71",
  },
  {
    id: "bouquet-4",
    title: "Lan Hồ Điệp & Rum Trắng Thác Đổ",
    subtitle: "Sang trọng, kiêu kỳ & thanh khiết",
    imageUrl: "/images/journal-hero-bouquet-4.jpg",
    tag: "Pure Cascade",
    themeColor: "#6B9080",
  },
];

export const JournalHeroBouquetShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Tự động xoay chuyển nhẹ nhàng sau 5 giây (tự tạm dừng khi người dùng rê chuột)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BOUQUETS_DATA.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const currentBouquet = BOUQUETS_DATA[currentIndex];

  return (
    <div
      className="relative w-full max-w-xl mx-auto flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. KHUNG ẢNH CHÍNH TRUNG TÂM (MAIN FEATURED BOUQUET)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <motion.div
        className="relative w-full aspect-[16/11] rounded-[36px] sm:rounded-[44px] overflow-hidden shadow-[0_25px_65px_rgba(0,0,0,0.14)] border-2 border-[#FAF4E8] bg-stone-100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBouquet.id}
            src={currentBouquet.imageUrl}
            alt={currentBouquet.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
            className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
          />
        </AnimatePresence>

        {/* Lớp phủ chuyển sắc nhẹ đáy ảnh */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

        {/* Tag phong cách trên góc trái */}
        <div className="absolute top-4 left-5 z-20">
          <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-[11px] font-bold uppercase tracking-wider text-stone-800 shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentBouquet.tag}</span>
          </span>
        </div>

        {/* Tiêu đề & mô tả bó hoa ở góc dưới */}
        <div className="absolute bottom-4 inset-x-5 z-20 flex items-end justify-between">
          <div className="text-white drop-shadow-md">
            <h3 className="text-base sm:text-lg font-serif font-bold leading-snug">
              {currentBouquet.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-200/90 font-light">
              {currentBouquet.subtitle}
            </p>
          </div>

          {/* Huy hiệu số thứ tự */}
          <div className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-[10px] font-mono text-white/90">
            0{currentIndex + 1} / 04
          </div>
        </div>
      </motion.div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. DÃY 4 BÓ HOA NGHỆ THUẬT MINI XẾP TẦNG (THUMBNAIL GALLERY)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 w-full mt-3.5 sm:mt-4 z-20">
        {BOUQUETS_DATA.map((item, idx) => {
          const isActive = idx === currentIndex;

          return (
            <motion.button
              key={`thumb-${item.id}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] border-2 transition-all duration-300 shadow-sm cursor-pointer ${
                isActive
                  ? "border-amber-500 ring-2 ring-amber-400/30 shadow-md"
                  : "border-white/80 hover:border-amber-300 opacity-75 hover:opacity-100"
              }`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 transition-opacity ${
                  isActive ? "bg-amber-600/10" : "bg-black/15 group-hover:bg-transparent"
                }`}
              />

              {/* Chấm tròn báo hiệu hoa đang chọn */}
              {isActive && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
