"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  BookOpen,
  Sparkles,
  Layers,
} from "lucide-react";
import { Album3DConfig, AlbumCoverTheme, Album3DPage } from "@/types/album-3d.types";
import { playPageFlipSound } from "@/lib/audio/page-flip-sound";

interface Wedding3DFlipbookProps {
  config?: Album3DConfig;
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  className?: string;
}

const THEME_STYLES: Record<
  AlbumCoverTheme,
  {
    bg: string;
    border: string;
    textTitle: string;
    textSub: string;
    emboss: string;
    accent: string;
  }
> = {
  "leather-burgundy": {
    bg: "bg-gradient-to-br from-[#4A0E17] via-[#5C1D27] to-[#360810]",
    border: "border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30",
    textTitle: "text-[#F5E6BE]",
    textSub: "text-[#D4AF37]/80",
    emboss: "shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_12px_36px_rgba(0,0,0,0.5)]",
    accent: "#D4AF37",
  },
  "linen-cream": {
    bg: "bg-gradient-to-br from-[#F5F2EB] via-[#EFEBE1] to-[#E2DDD0]",
    border: "border-[#8C7A5E]/40 ring-1 ring-[#8C7A5E]/20",
    textTitle: "text-[#3D332A]",
    textSub: "text-[#7A6B58]",
    emboss: "shadow-[inset_0_2px_6px_rgba(255,255,255,0.7),0_10px_30px_rgba(61,51,42,0.15)]",
    accent: "#8C7A5E",
  },
  "royal-gold": {
    bg: "bg-gradient-to-br from-[#D4AF37] via-[#B89628] to-[#8C6D15]",
    border: "border-[#FFF4D0]/60 ring-1 ring-[#FFF4D0]/40",
    textTitle: "text-[#2B1D04]",
    textSub: "text-[#4A3408]",
    emboss: "shadow-[inset_0_2px_8px_rgba(255,255,255,0.5),0_12px_36px_rgba(184,150,40,0.35)]",
    accent: "#FFF4D0",
  },
  "minimalist-dark": {
    bg: "bg-gradient-to-br from-[#1F1F23] via-[#161619] to-[#0D0D0F]",
    border: "border-stone-700/60 ring-1 ring-stone-800",
    textTitle: "text-stone-100",
    textSub: "text-stone-400",
    emboss: "shadow-[inset_0_2px_8px_rgba(255,255,255,0.05),0_12px_36px_rgba(0,0,0,0.6)]",
    accent: "#A8A29E",
  },
};

export function Wedding3DFlipbook({
  config,
  groomName = "Chú Rể",
  brideName = "Cô Dâu",
  weddingDate = "2026",
  className = "",
}: Wedding3DFlipbookProps) {
  const pages: Album3DPage[] = config?.pages || [];
  const themeKey: AlbumCoverTheme = config?.coverTheme || "leather-burgundy";
  const theme = THEME_STYLES[themeKey] || THEME_STYLES["leather-burgundy"];

  // State lật trang:
  // Trang 0: Bìa trước (Cover)
  // Trang 1 -> N: Các trang ảnh bên trong
  // Trang N+1: Bìa sau (Back cover)
  const [currentSpread, setCurrentSpread] = useState(0); // Chỉ số trang đôi hiện tại
  const [isMobile, setIsMobile] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(config?.soundEnabled ?? true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev">("next");

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tổng số lượt lật:
  // Desktop: Mở 2 trang một lúc -> totalSpreads = Math.ceil(pages.length / 2) + 1 (bìa trước) + 1 (bìa sau)
  // Mobile: 1 trang mỗi lần -> totalSpreads = pages.length + 2
  const totalSpreads = isMobile
    ? pages.length + 2
    : Math.ceil(pages.length / 2) + 2;

  const playSound = useCallback(() => {
    if (soundEnabled) {
      playPageFlipSound(0.35);
    }
  }, [soundEnabled]);

  const goNext = useCallback(() => {
    if (currentSpread < totalSpreads - 1) {
      setTurnDirection("next");
      playSound();
      setCurrentSpread((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentSpread, totalSpreads, playSound]);

  const goPrev = useCallback(() => {
    if (currentSpread > 0) {
      setTurnDirection("prev");
      playSound();
      setCurrentSpread((prev) => prev - 1);
    }
  }, [currentSpread, playSound]);

  // Autoplay handler
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentSpread((prev) => {
          if (prev >= totalSpreads - 1) {
            setIsPlaying(false);
            return 0; // Quay về bìa nếu hết
          }
          playSound();
          return prev + 1;
        });
      }, 4000);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlaying, totalSpreads, playSound]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, isFullscreen]);

  if (pages.length === 0) {
    return (
      <div className={`w-full py-16 text-center ${className}`}>
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-stone-50 border border-stone-200/80 shadow-inner flex flex-col items-center gap-3">
          <BookOpen className="w-10 h-10 text-stone-400 stroke-1" />
          <h4 className="font-serif font-bold text-stone-800 text-lg">Chưa Có Ảnh Album 3D</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Cô dâu &amp; Chú rể có thể mở trang Chỉnh Sửa Thiệp, chọn tab <strong>Album 3D</strong> để dán link thư mục Google Drive hoặc tải ảnh lên.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER NỘI DUNG TRANG (DESKTOP & MOBILE)
  // ─────────────────────────────────────────────────────────────

  // Xác định ảnh hiển thị trên Spread hiện tại
  let leftPage: Album3DPage | null = null;
  let rightPage: Album3DPage | null = null;
  const isFrontCover = currentSpread === 0;
  const isBackCover = currentSpread === totalSpreads - 1;

  if (isMobile) {
    // Mobile: 1 trang đơn
    if (currentSpread > 0 && currentSpread <= pages.length) {
      rightPage = pages[currentSpread - 1];
    }
  } else {
    // Desktop: 2 trang đôi
    if (currentSpread > 0 && currentSpread < totalSpreads - 1) {
      const pageIndexLeft = (currentSpread - 1) * 2;
      const pageIndexRight = pageIndexLeft + 1;
      leftPage = pages[pageIndexLeft] || null;
      rightPage = pages[pageIndexRight] || null;
    }
  }

  return (
    <section
      ref={containerRef}
      className={`relative w-full py-12 px-3 sm:px-6 md:px-10 flex flex-col items-center select-none overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#0F0E0D] py-4" : ""
      } ${className}`}
    >
      {/* TIÊU ĐỀ KHU VỰC ALBUM 3D */}
      {!isFullscreen && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-semibold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Interactive Photobook 3D</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            {config?.title || "Album Kỷ Niệm Ngày Chung Đôi"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 font-light">
            Chạm vào góc trang hoặc bấm mũi tên để lật xem từng trang kỷ niệm
          </p>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* CUỐN ALBUM 3D CHÍNH (THE 3D PHOTOBOOK)                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-5xl flex items-center justify-center perspective-[2000px] my-auto">
        <AnimatePresence mode="wait">
          {/* 1. BÌA TRƯỚC (FRONT COVER) */}
          {isFrontCover && (
            <motion.div
              key="front-cover"
              initial={{ rotateY: turnDirection === "next" ? -30 : 30, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -75, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
              onClick={goNext}
              className={`relative cursor-pointer w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] aspect-[1/1.38] rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col justify-between items-center text-center ${theme.bg} ${theme.border} ${theme.emboss} transform-gpu hover:scale-[1.01] transition-transform`}
            >
              {/* Chỉ khâu viền giả da sang trọng */}
              <div className="absolute inset-3 sm:inset-4 border border-dashed border-white/20 rounded-xl sm:rounded-2xl pointer-events-none" />

              {/* Họa tiết dập chìm đầu bìa */}
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-white/60 uppercase">
                  Wedding Collection
                </span>
                <div className="w-12 h-px bg-white/30 my-3" />
              </div>

              {/* Tên cặp đôi in nhũ mạ vàng dập nổi */}
              <div className="relative z-10 my-auto px-4">
                <div className="size-16 sm:size-20 mx-auto rounded-full border-2 border-white/30 flex items-center justify-center mb-6 shadow-inner bg-black/10 backdrop-blur-xs">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-white/90">
                    {groomName.charAt(0)} &amp; {brideName.charAt(0)}
                  </span>
                </div>
                <h3
                  className={`font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider leading-snug drop-shadow-md ${theme.textTitle}`}
                >
                  {config?.coverTitle || `${groomName.toUpperCase()} & ${brideName.toUpperCase()}`}
                </h3>
                <p className={`text-xs sm:text-sm tracking-widest uppercase mt-3 font-medium ${theme.textSub}`}>
                  {config?.coverSubtitle || `Our Wedding Photobook • ${weddingDate}`}
                </p>
              </div>

              {/* Nhắc nhở bấm mở */}
              <div className="relative z-10 flex items-center gap-2 text-white/70 text-xs font-medium bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-xs">
                <span>Chạm để mở trang đầu tiên</span>
                <ChevronRight className="w-4 h-4 animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* 2. CÁC TRANG ẢNH BÊN TRONG (INSIDE PAGES) */}
          {!isFrontCover && !isBackCover && (
            <motion.div
              key={`spread-${currentSpread}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative w-full flex items-center justify-center"
            >
              {/* KHUNG SÁCH ĐÔI MÁY TÍNH / KHUNG ĐƠN MOBILE */}
              <div
                className={`relative w-full ${
                  isMobile ? "max-w-[360px] aspect-[1/1.4]" : "max-w-4xl aspect-[2/1.38]"
                } bg-[#FDFCF7] rounded-xl sm:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-stone-200 flex overflow-hidden`}
              >
                {/* GÁY SÁCH Ở GIỮA (BOOK SPINE SHADOW - CHỈ HIỆN TRÊN DESKTOP) */}
                {!isMobile && (
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/20 via-black/5 to-black/20 z-20 pointer-events-none" />
                )}

                {/* ── TRANG BÊN TRÁI (LEFT PAGE - DESKTOP ONLY) ── */}
                {!isMobile && (
                  <div
                    onClick={goPrev}
                    className="relative flex-1 h-full bg-[#FAF8F2] p-4 sm:p-6 flex flex-col justify-between border-r border-stone-300/60 cursor-pointer overflow-hidden group select-none"
                  >
                    {leftPage ? (
                      <>
                        <div className="relative flex-1 w-full rounded-lg overflow-hidden bg-stone-100 shadow-xs flex items-center justify-center">
                          <img
                            src={leftPage.url}
                            alt={leftPage.caption || "Ảnh cưới"}
                            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                            style={{ objectPosition: "center top" }}
                            loading="lazy"
                          />
                        </div>
                        {leftPage.caption && (
                          <p className="mt-3 text-center text-xs font-serif italic text-stone-600 truncate px-2">
                            {leftPage.caption}
                          </p>
                        )}
                        <span className="text-[10px] text-stone-400 font-mono text-center mt-1">
                          Trang {(currentSpread - 1) * 2 + 1}
                        </span>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-xs italic">
                        Trang để trắng
                      </div>
                    )}

                    {/* Vùng lật trang lùi */}
                    <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center pl-2">
                      <ChevronLeft className="w-6 h-6 text-stone-700 drop-shadow-sm" />
                    </div>
                  </div>
                )}

                {/* ── TRANG BÊN PHẢI (RIGHT PAGE HOẶC TRANG ĐƠN MOBILE) ── */}
                <div
                  onClick={goNext}
                  className="relative flex-1 h-full bg-[#FCFBF7] p-4 sm:p-6 flex flex-col justify-between cursor-pointer overflow-hidden group select-none"
                >
                  {rightPage ? (
                    <>
                      <div className="relative flex-1 w-full rounded-lg overflow-hidden bg-stone-100 shadow-xs flex items-center justify-center">
                        <img
                          src={rightPage.url}
                          alt={rightPage.caption || "Ảnh cưới"}
                          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                          style={{ objectPosition: "center top" }}
                          loading="lazy"
                        />
                      </div>
                      {rightPage.caption && (
                        <p className="mt-3 text-center text-xs font-serif italic text-stone-600 truncate px-2">
                          {rightPage.caption}
                        </p>
                      )}
                      <span className="text-[10px] text-stone-400 font-mono text-center mt-1">
                        Trang {isMobile ? currentSpread : (currentSpread - 1) * 2 + 2}
                      </span>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-xs italic">
                      Hết ảnh
                    </div>
                  )}

                  {/* Vùng lật trang tới */}
                  <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2">
                    <ChevronRight className="w-6 h-6 text-stone-700 drop-shadow-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. BÌA SAU (BACK COVER) */}
          {isBackCover && (
            <motion.div
              key="back-cover"
              initial={{ rotateY: 30, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 30, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
              onClick={() => {
                setCurrentSpread(0);
                playSound();
              }}
              className={`relative cursor-pointer w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] aspect-[1/1.38] rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col justify-between items-center text-center ${theme.bg} ${theme.border} ${theme.emboss} transform-gpu`}
            >
              <div className="absolute inset-3 sm:inset-4 border border-dashed border-white/20 rounded-xl sm:rounded-2xl pointer-events-none" />

              <div className="my-auto px-4">
                <span className="font-serif text-3xl sm:text-4xl text-white/90">Forever &amp; Always</span>
                <p className="text-xs sm:text-sm text-white/70 mt-3 font-light">
                  Cảm ơn bạn đã dõi theo và sẻ chia những khoảnh khắc hạnh phúc cùng chúng mình!
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-xs">
                <span>Quay lại trang bìa</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* THANH ĐIỀU KHIỂN DƯỚI (BOTTOM CONTROLS BAR)               */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 z-20">
        {/* NÚT LÙI TRANG */}
        <button
          type="button"
          onClick={goPrev}
          disabled={currentSpread === 0}
          className="size-9 rounded-full bg-stone-900/90 text-white flex items-center justify-center hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition shadow-md active:scale-95"
          title="Trang trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* CHỈ SỐ TRANG HIỆN TẠI */}
        <div className="px-4 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-200 text-xs font-mono font-medium shadow-md">
          {isFrontCover ? (
            <span>Bìa trước</span>
          ) : isBackCover ? (
            <span>Bìa sau</span>
          ) : isMobile ? (
            <span>Trang {currentSpread} / {pages.length}</span>
          ) : (
            <span>
              Trang {(currentSpread - 1) * 2 + 1} - {Math.min((currentSpread - 1) * 2 + 2, pages.length)} / {pages.length}
            </span>
          )}
        </div>

        {/* NÚT TIẾP THEO */}
        <button
          type="button"
          onClick={goNext}
          disabled={currentSpread === totalSpreads - 1}
          className="size-9 rounded-full bg-stone-900/90 text-white flex items-center justify-center hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition shadow-md active:scale-95"
          title="Trang kế tiếp"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* TỰ ĐỘNG LẬT (SLIDESHOW) */}
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          className={`size-9 rounded-full flex items-center justify-center transition shadow-md active:scale-95 ${
            isPlaying ? "bg-amber-500 text-black font-bold" : "bg-stone-900/90 text-white hover:bg-black"
          }`}
          title={isPlaying ? "Dừng tự động lật" : "Tự động lật album"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* BẬT / TẮT ÂM THANH LẬT GIẤY */}
        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`size-9 rounded-full flex items-center justify-center transition shadow-md active:scale-95 ${
            soundEnabled ? "bg-stone-900/90 text-amber-400 hover:bg-black" : "bg-stone-800 text-stone-500 hover:text-stone-300"
          }`}
          title={soundEnabled ? "Tắt âm thanh lật giấy" : "Bật âm thanh lật giấy"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* MỞ DANH SÁCH THUMBNAILS */}
        <button
          type="button"
          onClick={() => setShowThumbnails((prev) => !prev)}
          className={`size-9 rounded-full flex items-center justify-center transition shadow-md active:scale-95 ${
            showThumbnails ? "bg-stone-200 text-stone-900" : "bg-stone-900/90 text-white hover:bg-black"
          }`}
          title="Xem danh sách tất cả các trang"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* PHÓNG TO TOÀN MÀN HÌNH */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="size-9 rounded-full bg-stone-900/90 text-white flex items-center justify-center hover:bg-black transition shadow-md active:scale-95"
          title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* THUMBNAIL DRAWER (DANH SÁCH XEM NHANH TẤT CẢ CÁC TRANG)   */}
      {/* ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="mt-6 w-full max-w-4xl p-3 bg-stone-900/95 backdrop-blur-xl rounded-2xl border border-stone-800 shadow-2xl flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin z-30"
          >
            {/* Thumbnail Bìa Trước */}
            <button
              type="button"
              onClick={() => {
                setCurrentSpread(0);
                playSound();
              }}
              className={`shrink-0 w-16 h-22 rounded-lg p-1.5 flex flex-col justify-between items-center text-[9px] border transition ${
                currentSpread === 0 ? "border-amber-400 ring-2 ring-amber-400/50" : "border-stone-700 opacity-60 hover:opacity-100"
              } ${theme.bg}`}
            >
              <span className="text-[8px] font-mono text-white/70">Bìa</span>
              <BookOpen className="w-4 h-4 text-white/90 my-auto" />
            </button>

            {/* Thumbnails Các Trang Ảnh */}
            {pages.map((p, idx) => {
              const targetSpread = isMobile ? idx + 1 : Math.floor(idx / 2) + 1;
              const isActive = currentSpread === targetSpread;
              return (
                <button
                  key={p.id || idx}
                  type="button"
                  onClick={() => {
                    setCurrentSpread(targetSpread);
                    playSound();
                  }}
                  className={`shrink-0 w-16 h-22 rounded-lg overflow-hidden border transition relative group ${
                    isActive ? "border-amber-400 ring-2 ring-amber-400/50" : "border-stone-700 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={p.url} alt={`Trang ${idx + 1}`} className="w-full h-full object-cover object-top" style={{ objectPosition: "center top" }} />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white font-mono text-center py-0.5">
                    {idx + 1}
                  </span>
                </button>
              );
            })}

            {/* Thumbnail Bìa Sau */}
            <button
              type="button"
              onClick={() => {
                setCurrentSpread(totalSpreads - 1);
                playSound();
              }}
              className={`shrink-0 w-16 h-22 rounded-lg p-1.5 flex flex-col justify-between items-center text-[9px] border transition ${
                currentSpread === totalSpreads - 1
                  ? "border-amber-400 ring-2 ring-amber-400/50"
                  : "border-stone-700 opacity-60 hover:opacity-100"
              } ${theme.bg}`}
            >
              <span className="text-[8px] font-mono text-white/70">Hết</span>
              <Sparkles className="w-4 h-4 text-white/90 my-auto" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
