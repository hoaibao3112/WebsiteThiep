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
  Download,
  Check,
  Loader2,
  Heart,
  Infinity as InfinityIcon,
  RotateCcw,
  Pencil,
} from "lucide-react";
import {
  Album3DConfig,
  AlbumCoverTheme,
  Album3DPage,
  AlbumFrontCoverConfig,
  ALBUM_BACK_COVER_PRESET_CATALOG,
  DEFAULT_ALBUM_BACK_COVER,
  DEFAULT_ALBUM_FRONT_COVER,
} from "@/types/album-3d.types";
import { playPageFlipSound } from "@/lib/audio/page-flip-sound";
import { downloadImage } from "@/lib/utils/download-image";

interface Wedding3DFlipbookProps {
  config?: Album3DConfig;
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  className?: string;
  isPreview?: boolean;
  onOpenAlbumEditor?: (tab?: "front" | "back") => void;
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
  "botanical-sage": {
    bg: "bg-gradient-to-br from-[#2C3E2D] via-[#374C38] to-[#1F2E20]",
    border: "border-[#8FB38D]/50 ring-1 ring-[#8FB38D]/30",
    textTitle: "text-[#F5FAF5]",
    textSub: "text-[#A3C2A1]",
    emboss: "shadow-[inset_0_2px_8px_rgba(0,0,0,0.4),0_12px_36px_rgba(0,0,0,0.45)]",
    accent: "#8FB38D",
  },
  "oriental-crimson": {
    bg: "bg-gradient-to-br from-[#80121D] via-[#941A26] to-[#630B13]",
    border: "border-[#D4AF37]/60 ring-1 ring-[#D4AF37]/40",
    textTitle: "text-[#FFFDF6]",
    textSub: "text-[#F4C430]",
    emboss: "shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_12px_36px_rgba(0,0,0,0.5)]",
    accent: "#F4C430",
  },
  "polaroid-kraft": {
    bg: "bg-gradient-to-br from-[#382622] via-[#45302C] to-[#291B18]",
    border: "border-[#C9A45C]/50 ring-1 ring-[#C9A45C]/30",
    textTitle: "text-[#FFF9F7]",
    textSub: "text-[#E8B4A2]",
    emboss: "shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_12px_36px_rgba(0,0,0,0.45)]",
    accent: "#C9A45C",
  },
};

const DEFAULT_PREVIEW_PAGES: Album3DPage[] = [
  { id: "demo-p1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", caption: "Khoảnh khắc ngọt ngào", sortOrder: 0 },
  { id: "demo-p2", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800", caption: "Trao nhau lời hẹn ước", sortOrder: 1 },
  { id: "demo-p3", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800", caption: "Nụ cười rạng rỡ", sortOrder: 2 },
  { id: "demo-p4", url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800", caption: "Tình yêu đơm hoa", sortOrder: 3 },
  { id: "demo-p5", url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800", caption: "Hạnh phúc viên mãn", sortOrder: 4 },
  { id: "demo-p6", url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800", caption: "Forever & Always", sortOrder: 5 },
];

export function Wedding3DFlipbook({
  config,
  groomName = "Chú Rể",
  brideName = "Cô Dâu",
  weddingDate = "2026",
  className = "",
  isPreview = false,
  onOpenAlbumEditor,
}: Wedding3DFlipbookProps) {
  const rawPages: Album3DPage[] = config?.pages || [];
  const pages: Album3DPage[] =
    rawPages.length > 0 ? rawPages : isPreview ? DEFAULT_PREVIEW_PAGES : [];
  const frontCoverConfig: AlbumFrontCoverConfig = config?.frontCover || DEFAULT_ALBUM_FRONT_COVER;
  const themeKey: AlbumCoverTheme = frontCoverConfig.theme || config?.coverTheme || "leather-burgundy";
  const theme = THEME_STYLES[themeKey] || THEME_STYLES["leather-burgundy"];
  const coverPhotoUrl = frontCoverConfig.photoUrl || (pages.length > 0 ? pages[0].url : undefined);
  const frameShape = frontCoverConfig.frameShape || (coverPhotoUrl ? "arch" : "none");

  // Trích xuất chữ cái đầu của Tên chính tiếng Việt (Ví dụ: "Hoàng Long" -> "Long" -> "L", "Bảo Ngọc" -> "Ngọc" -> "N")
  const getGivenNameInitial = (name?: string): string => {
    if (!name) return "";
    const words = name.trim().split(/\s+/).filter(Boolean);
    const mainWord = words[words.length - 1];
    return mainWord ? mainWord.charAt(0).toUpperCase() : "";
  };

  const groomInitial = getGivenNameInitial(groomName) || groomName.charAt(0).toUpperCase();
  const brideInitial = getGivenNameInitial(brideName) || brideName.charAt(0).toUpperCase();
  const displayMonogram =
    frontCoverConfig.monogram ||
    config?.coverMonogram ||
    (groomInitial && brideInitial ? `${groomInitial} & ${brideInitial}` : "♥");

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
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDownloadPage = useCallback(
    async (page: Album3DPage, pageNumber: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const key = page.id || `page-${pageNumber}`;
      setDownloadingKey(key);
      try {
        const ext = page.url.split(".").pop()?.split("?")[0] || "jpg";
        const cleanExt = ["jpg", "jpeg", "png", "webp"].includes(ext.toLowerCase()) ? ext : "jpg";
        const filename = `anh-cuoi-trang-${pageNumber}.${cleanExt}`;
        await downloadImage(page.url, filename);
        setDownloadedKey(key);
        setTimeout(() => {
          setDownloadedKey((current) => (current === key ? null : current));
        }, 1800);
      } finally {
        setDownloadingKey(null);
      }
    },
    []
  );

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

  // Lắng nghe sự kiện nhảy trang từ thanh công cụ (Canvas / Sidebar)
  useEffect(() => {
    const handleJump = (e: Event) => {
      const ce = e as CustomEvent<{ target: "front" | "back" | number }>;
      if (ce.detail?.target === "back") {
        setTurnDirection("next");
        playSound();
        setCurrentSpread(totalSpreads - 1);
      } else if (ce.detail?.target === "front") {
        setTurnDirection("prev");
        playSound();
        setCurrentSpread(0);
      } else if (typeof ce.detail?.target === "number") {
        playSound();
        setCurrentSpread(ce.detail.target);
      }
    };
    window.addEventListener("jump-flipbook-spread", handleJump);
    return () => window.removeEventListener("jump-flipbook-spread", handleJump);
  }, [totalSpreads, playSound]);

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
      data-pointer-interactive="true"
      className={`relative w-full py-12 px-3 sm:px-6 md:px-10 flex flex-col items-center select-none overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#0F0E0D] py-4" : ""
      } ${className}`}
    >
      {/* TIÊU ĐỀ KHU VỰC ALBUM 3D */}
      {!isFullscreen && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-semibold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Interactive Photobook 3D</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            {config?.title || "Album Kỷ Niệm Ngày Chung Đôi"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-light">
            Chạm vào góc trang hoặc bấm nút điều hướng để xem chi tiết
          </p>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* CUỐN ALBUM 3D CHÍNH (THE 3D PHOTOBOOK)                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-5xl flex items-center justify-center perspective-[2000px] my-auto">
        <AnimatePresence mode="wait">
          {/* 1. BÌA TRƯỚC (FRONT COVER NGHỆ THUẬT VỚI KHUNG ẢNH & THIẾT KẾ RIÊNG) */}
          {isFrontCover && (
            <motion.div
              key="front-cover"
              data-pointer-interactive="true"
              initial={{ rotateY: turnDirection === "next" ? -30 : 30, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -75, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
              onClick={goNext}
              className={`relative cursor-pointer w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] aspect-[1/1.38] rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between items-center text-center ${theme.bg} ${theme.border} ${theme.emboss} transform-gpu hover:scale-[1.01] transition-transform overflow-hidden`}
            >
              {/* Nút Chỉnh Bìa Trước nổi trên góc (Chỉ hiện trong Editor) */}
              {isPreview && (
                <button
                  type="button"
                  data-pointer-interactive="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(
                      new CustomEvent("open-album-3d-editor", { detail: { tab: "frontCover" } })
                    );
                    onOpenAlbumEditor?.("front");
                  }}
                  className="absolute top-3.5 right-3.5 z-30 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                  title="Chỉnh sửa thiết kế & khung ảnh Bìa Trước"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Chỉnh Bìa Trước</span>
                </button>
              )}
              {/* Ảnh bìa tràn viền (Full Bleed Layout) */}
              {frameShape === "full" && coverPhotoUrl && (
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
                  <img
                    src={coverPhotoUrl}
                    alt="Bìa Album"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/35" />
                </div>
              )}

              {/* Chỉ khâu viền giả da sang trọng */}
              <div className="absolute inset-3 sm:inset-4 border border-dashed border-white/20 rounded-xl sm:rounded-2xl pointer-events-none z-10" />

              {/* Họa tiết dập chìm đầu bìa & Huy hiệu */}
              <div className="relative z-20 flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-white/75 uppercase drop-shadow-sm font-semibold">
                  {frontCoverConfig.badgeText || "Wedding Collection"}
                </span>
                <div className="w-12 h-px bg-white/30 my-2" />
              </div>

              {/* ── KHU VỰC KHUNG ẢNH BÌA HOẶC MONOGRAM CHÍNH GIỮA ── */}
              <div className="relative z-20 my-auto w-full flex flex-col items-center justify-center">
                {coverPhotoUrl && frameShape !== "none" && frameShape !== "full" ? (
                  <div className="my-1 flex items-center justify-center w-full">
                    {/* Khung Vòm (Arch) */}
                    {frameShape === "arch" && (
                      <div className="relative w-[190px] sm:w-[230px] aspect-[3/3.8] rounded-t-full rounded-b-2xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.55)] border-2 border-[#D4AF37] ring-2 ring-[#D4AF37]/35 bg-black/20 group">
                        <img
                          src={coverPhotoUrl}
                          alt="Bìa Album"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 border border-white/20 rounded-t-full rounded-b-xl pointer-events-none" />
                      </div>
                    )}

                    {/* Khung Oval (Baroque) */}
                    {frameShape === "oval" && (
                      <div className="relative w-[185px] sm:w-[220px] aspect-[3/3.8] rounded-[50%] overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.55)] border-3 border-[#D4AF37] ring-2 ring-[#D4AF37]/35 bg-black/20 group">
                        <img
                          src={coverPhotoUrl}
                          alt="Bìa Album"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 border border-white/20 rounded-[50%] pointer-events-none" />
                      </div>
                    )}

                    {/* Khung Polaroid (Vintage Chic) */}
                    {frameShape === "polaroid" && (
                      <div className="relative w-[195px] sm:w-[230px] bg-white p-2.5 pb-6 sm:pb-7 rounded-xl shadow-[0_18px_42px_rgba(0,0,0,0.6)] -rotate-1 border border-stone-200/90 group">
                        <div className="relative w-full aspect-[4/4.3] overflow-hidden rounded-lg bg-stone-100">
                          <img
                            src={coverPhotoUrl}
                            alt="Bìa Album"
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <p className="mt-1.5 text-center font-serif text-[11px] sm:text-xs text-stone-700 italic tracking-wide truncate px-1">
                          {frontCoverConfig.title || `${groomName} & ${brideName}`}
                        </p>
                      </div>
                    )}

                    {/* Khung Chữ Nhật Nghệ Thuật (Rect) */}
                    {frameShape === "rect" && (
                      <div className="relative w-[195px] sm:w-[235px] aspect-[4/4.8] rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.55)] border-2 border-white/50 ring-1 ring-[#D4AF37]/45 bg-black/20 group">
                        <img
                          src={coverPhotoUrl}
                          alt="Bìa Album"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-1.5 border border-white/20 rounded-xl pointer-events-none" />
                      </div>
                    )}

                    {/* Khung Tròn Hoàng Gia (Circle) */}
                    {frameShape === "circle" && (
                      <div className="relative size-44 sm:size-52 rounded-full overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.55)] border-3 border-[#D4AF37] ring-2 ring-[#D4AF37]/35 bg-black/20 group">
                        <img
                          src={coverPhotoUrl}
                          alt="Bìa Album"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-1 border border-white/20 rounded-full pointer-events-none" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Huy hiệu Monogram truyền thống dập nổi */
                  <div className="size-18 sm:size-22 mx-auto rounded-full border-2 border-[#D4AF37] flex items-center justify-center my-3 shadow-inner bg-black/15 backdrop-blur-xs px-2 ring-2 ring-[#D4AF37]/30">
                    <span className="font-serif text-lg sm:text-2xl font-bold tracking-widest text-[#F5E6BE] drop-shadow-md">
                      {displayMonogram}
                    </span>
                  </div>
                )}

                {/* Tên cặp đôi in nhũ mạ vàng dập nổi */}
                <h3
                  className={`font-serif ${
                    frameShape === "polaroid" ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
                  } font-bold tracking-wider leading-snug drop-shadow-md ${theme.textTitle} mt-2.5 px-2`}
                >
                  {frontCoverConfig.title || config?.coverTitle || `${groomName.toUpperCase()} & ${brideName.toUpperCase()}`}
                </h3>
                <p className={`text-[11px] sm:text-xs tracking-widest uppercase mt-1.5 font-medium ${theme.textSub} px-2`}>
                  {frontCoverConfig.subtitle || config?.coverSubtitle || `Our Wedding Photobook • ${weddingDate}`}
                </p>
              </div>

              {/* Nhắc nhở bấm mở */}
              <div className="relative z-20 flex items-center gap-2 text-white/80 text-[11px] sm:text-xs font-medium bg-black/35 hover:bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm transition">
                <span>Chạm để mở trang đầu tiên</span>
                <ChevronRight className="w-3.5 h-3.5 animate-pulse text-amber-300" />
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
                          {/* Nút tải ảnh mini góc trên bên phải (Desktop) */}
                          <button
                            type="button"
                            onClick={(e) => handleDownloadPage(leftPage!, (currentSpread - 1) * 2 + 1, e)}
                            className="absolute top-2 right-2 z-20 size-7 sm:size-8 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md text-white/90 border border-white/20 shadow-md flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90 cursor-pointer"
                            title="Tải ảnh này về máy"
                            aria-label={`Tải ảnh trang ${(currentSpread - 1) * 2 + 1}`}
                          >
                            {downloadingKey === (leftPage.id || `page-${(currentSpread - 1) * 2 + 1}`) ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            ) : downloadedKey === (leftPage.id || `page-${(currentSpread - 1) * 2 + 1}`) ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>
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
                        {/* Nút tải ảnh mini góc trên bên phải (Mobile & Desktop) */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadPage(rightPage!, isMobile ? currentSpread : (currentSpread - 1) * 2 + 2, e)}
                          className="absolute top-2 right-2 z-20 size-7 sm:size-8 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md text-white/90 border border-white/20 shadow-md flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90 cursor-pointer"
                          title="Tải ảnh này về máy"
                          aria-label={`Tải ảnh trang ${isMobile ? currentSpread : (currentSpread - 1) * 2 + 2}`}
                        >
                          {downloadingKey === (rightPage.id || `page-${isMobile ? currentSpread : (currentSpread - 1) * 2 + 2}`) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : downloadedKey === (rightPage.id || `page-${isMobile ? currentSpread : (currentSpread - 1) * 2 + 2}`) ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>
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

          {/* 3. BÌA SAU (BACK COVER) - ĐỘNG TỪ BACKEND CONFIG */}
          {isBackCover && (() => {
            const backCover = config?.backCover || DEFAULT_ALBUM_BACK_COVER;
            const preset =
              ALBUM_BACK_COVER_PRESET_CATALOG[backCover.designPreset] ||
              ALBUM_BACK_COVER_PRESET_CATALOG["velvet-stitched"];

            const title = backCover.title || preset.defaultTitle;
            const subtitle = backCover.subtitle || preset.defaultSubtitle;
            const buttonText = backCover.buttonText || preset.defaultButtonText;
            const signature = backCover.signatureText || `${groomName} & ${brideName}`;
            const borderStyle = backCover.borderStyle || preset.borderStyle;
            const badgeIcon = backCover.badgeIcon || preset.badgeIcon;
            const showPetals = backCover.showPetals ?? preset.showPetals;
            const bgClass = backCover.customBgColor ? "" : (preset.bgGradient || theme.bg);
            const customBgStyle = backCover.customBgColor ? { backgroundColor: backCover.customBgColor } : {};
            const customTextStyle = backCover.customTextColor ? { color: backCover.customTextColor } : {};

            return (
              <motion.div
                key="back-cover"
                {...(isPreview ? { "data-editable-field": "albumBackCover" } : {})}
                data-pointer-interactive="true"
                initial={{ rotateY: 30, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 30, opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
                onClick={() => {
                  if (isPreview) {
                    window.dispatchEvent(
                      new CustomEvent("open-album-3d-editor", { detail: { tab: "backCover" } })
                    );
                    onOpenAlbumEditor?.("back");
                  }
                }}
                style={customBgStyle}
                className={`relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] aspect-[1/1.38] rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col justify-between items-center text-center ${bgClass} ${theme.border} ${theme.emboss} transform-gpu overflow-hidden transition-all ${
                  isPreview ? "cursor-pointer hover:ring-2 hover:ring-amber-400/80" : ""
                }`}
              >
                {/* Nút Chỉnh Bìa Sau nổi trên góc (Chỉ hiện trong Editor) */}
                {isPreview && (
                  <button
                    type="button"
                    data-pointer-interactive="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.dispatchEvent(
                        new CustomEvent("open-album-3d-editor", { detail: { tab: "backCover" } })
                      );
                      onOpenAlbumEditor?.("back");
                    }}
                    className="absolute top-3.5 right-3.5 z-30 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                    title="Chỉnh sửa thiết kế & nội dung Bìa Sau"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Chỉnh Bìa Sau</span>
                  </button>
                )}
                {/* ── CÁC KIỂU ĐƯỜNG VIỀN BÌA KẾT ── */}
                {borderStyle === "stitched-dashed" && (
                  <div className="absolute inset-3 sm:inset-4 border border-dashed border-white/20 rounded-xl sm:rounded-2xl pointer-events-none" />
                )}
                {borderStyle === "gold-double" && (
                  <div className="absolute inset-2.5 sm:inset-3.5 border-2 border-[#D4AF37]/60 rounded-xl sm:rounded-2xl pointer-events-none">
                    <div className="absolute inset-1 sm:inset-1.5 border border-[#D4AF37]/35 rounded-lg sm:rounded-xl pointer-events-none" />
                  </div>
                )}
                {borderStyle === "ornate-corners" && (
                  <div className="absolute inset-3 sm:inset-4 border border-[#D4AF37]/30 rounded-xl sm:rounded-2xl pointer-events-none">
                    {/* Góc trang trí mạ vàng 4 góc */}
                    <div className="absolute top-1 left-1 size-5 border-t-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute top-1 right-1 size-5 border-t-2 border-r-2 border-[#D4AF37]" />
                    <div className="absolute bottom-1 left-1 size-5 border-b-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute bottom-1 right-1 size-5 border-b-2 border-r-2 border-[#D4AF37]" />
                  </div>
                )}
                {borderStyle === "minimal-solid" && (
                  <div className="absolute inset-3 sm:inset-4 border border-white/15 rounded-xl sm:rounded-2xl pointer-events-none" />
                )}

                {/* ── HIỆU ỨNG CÁNH HOA BAY LÃNG MẠN ── */}
                {showPetals && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl sm:rounded-3xl">
                    {[
                      { top: "10%", left: "15%", delay: 0, rotate: 12 },
                      { top: "25%", right: "12%", delay: 1.2, rotate: -25 },
                      { top: "60%", left: "8%", delay: 0.6, rotate: 40 },
                      { bottom: "20%", right: "14%", delay: 1.8, rotate: -15 },
                      { top: "45%", right: "22%", delay: 2.4, rotate: 30 },
                      { bottom: "10%", left: "20%", delay: 1.5, rotate: -35 },
                    ].map((petal, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.35, y: -6 }}
                        animate={{
                          opacity: [0.35, 0.75, 0.35],
                          y: [0, 8, 0],
                          rotate: [petal.rotate, petal.rotate + 10, petal.rotate],
                        }}
                        transition={{
                          duration: 4.5,
                          repeat: Infinity,
                          delay: petal.delay,
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          top: petal.top,
                          left: petal.left,
                          right: petal.right,
                          bottom: petal.bottom,
                        }}
                        className="w-3.5 h-4.5 bg-gradient-to-br from-pink-300/60 to-rose-400/40 rounded-full blur-[0.4px] shadow-xs transform-gpu"
                      />
                    ))}
                  </div>
                )}

                {/* ── BIỂU TƯỢNG HUY HIỆU TRUNG TÂM (BADGE ICON) ── */}
                <div className="relative z-10 pt-2">
                  {badgeIcon === "heart" && (
                    <div className="size-10 sm:size-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto shadow-inner backdrop-blur-xs">
                      <Heart className="size-5 fill-white/70 text-white/90" />
                    </div>
                  )}
                  {badgeIcon === "wax-seal" && (
                    <div className="size-11 sm:size-12 rounded-full bg-gradient-to-br from-[#8A1422] via-[#6B0E19] to-[#45050C] border-2 border-[#D4AF37]/80 flex items-center justify-center mx-auto shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)]">
                      <span className="font-serif text-base text-[#F5E6BE] font-bold">囍</span>
                    </div>
                  )}
                  {badgeIcon === "song-hy" && (
                    <div className="size-10 sm:size-11 rounded-full bg-amber-500/15 border border-[#D4AF37]/60 flex items-center justify-center mx-auto backdrop-blur-xs">
                      <span className="font-serif text-lg text-[#E8C568] font-bold">囍</span>
                    </div>
                  )}
                  {badgeIcon === "infinity" && (
                    <div className="size-10 sm:size-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto backdrop-blur-xs shadow-inner">
                      <InfinityIcon className="size-5 text-[#D4AF37]" />
                    </div>
                  )}
                </div>

                {/* ── NỘI DUNG CHÍNH (ẢNH POLAROID NẾU CÓ, TIÊU ĐỀ & LỜI CẢM ƠN) ── */}
                <div className="relative z-10 my-auto px-3 sm:px-4 space-y-2.5 max-w-sm">
                  {backCover.photoUrl && (
                    <div className="mx-auto mb-3 p-1.5 pb-3.5 bg-white/95 rounded-lg shadow-xl -rotate-2 max-w-[150px] sm:max-w-[175px] border border-stone-200">
                      <img
                        src={backCover.photoUrl}
                        alt="Ảnh kỷ niệm bìa kết"
                        className="w-full aspect-[4/3] object-cover rounded-xs"
                      />
                      <p className="font-serif text-[9px] text-stone-600 text-center mt-1 italic font-light truncate">
                        {signature}
                      </p>
                    </div>
                  )}

                  <span
                    {...(isPreview ? { "data-editable-field": "backCoverTitle" } : {})}
                    style={customTextStyle}
                    className={`font-serif text-3xl sm:text-4xl text-white/90 drop-shadow-sm block font-normal transition-opacity ${
                      isPreview ? "hover:opacity-90" : ""
                    }`}
                  >
                    {title}
                  </span>

                  <p
                    {...(isPreview ? { "data-editable-field": "backCoverSubtitle" } : {})}
                    style={customTextStyle}
                    className={`text-xs sm:text-sm text-white/75 font-light leading-relaxed max-w-xs mx-auto transition-opacity ${
                      isPreview ? "hover:opacity-90" : ""
                    }`}
                  >
                    {subtitle}
                  </p>

                  {signature && !backCover.photoUrl && (
                    <p
                      style={customTextStyle}
                      className="font-serif text-xs sm:text-sm italic tracking-widest uppercase text-white/80 pt-1"
                    >
                      {signature}
                    </p>
                  )}
                </div>

                {/* ── NÚT ĐIỀU HƯỚNG QUAY LẠI TRANG ĐẦU ── */}
                <button
                  type="button"
                  data-pointer-interactive="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTurnDirection("prev");
                    setCurrentSpread(0);
                    playSound();
                  }}
                  className="relative z-10 flex items-center gap-1.5 text-white/80 text-xs font-medium bg-black/25 hover:bg-black/45 px-4 py-1.5 rounded-full backdrop-blur-xs transition border border-white/10 shadow-xs cursor-pointer active:scale-95"
                >
                  <RotateCcw className="size-3.5 text-white/70" />
                  <span>{buttonText}</span>
                </button>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* THANH ĐIỀU KHIỂN DƯỚI (BOTTOM CONTROLS BAR)               */}
      {/* ───────────────────────────────────────────────────────── */}
      <div
        data-pointer-interactive="true"
        className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 z-20 pointer-events-auto"
      >
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

        {/* NÚT TẢI ẢNH ĐANG XEM (CHỈ HIỂN THỊ KHI ĐANG MỞ CÁC TRANG ẢNH BÊN TRONG) */}
        {!isFrontCover && !isBackCover && (rightPage || leftPage) && (
          <button
            type="button"
            onClick={(e) => {
              const target = rightPage || leftPage;
              const pageNum = isMobile
                ? currentSpread
                : rightPage
                ? (currentSpread - 1) * 2 + 2
                : (currentSpread - 1) * 2 + 1;
              if (target) handleDownloadPage(target, pageNum, e);
            }}
            className="size-9 rounded-full bg-stone-900/90 text-white flex items-center justify-center hover:bg-black transition shadow-md active:scale-95 cursor-pointer"
            title="Tải ảnh trang đang xem về máy"
            aria-label="Tải ảnh trang đang xem về máy"
          >
            {downloadingKey ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : downloadedKey ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        )}

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
