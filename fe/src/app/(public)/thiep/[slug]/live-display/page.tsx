"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2, Minimize2, Sparkles, Camera, Heart, Volume2, VolumeX,
  QrCode, Pause, Play, MessageCircleHeart, Image as ImageIcon,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ApiClient } from "@/lib/api";
import { WeddingMemory } from "@/types/wedding-memory.types";

// ─── Types ───────────────────────────────────────────────────────────
interface WishItem {
  id: string;
  senderName: string;
  relationship?: string | null;
  content: string;
  emoji?: string | null;
  createdAt: string;
}

type StageItem =
  | { type: "memory"; data: WeddingMemory }
  | { type: "wish"; data: WishItem };

// ─── Constants ───────────────────────────────────────────────────────
const SPOTLIGHT_DURATION_MS = 8000;
const SLIDE_SPEEDS: Record<string, number> = { slow: 10000, normal: 6000, fast: 4000 };
const CHIME_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

// ─── Component ───────────────────────────────────────────────────────
export default function LiveDisplayPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // ── Card info ──
  const [cardInfo, setCardInfo] = useState({
    groomName: "Chú Rể",
    brideName: "Cô Dâu",
    weddingDate: "",
    cardId: "",
  });

  // ── Data state ──
  const [memories, setMemories] = useState<WeddingMemory[]>([]);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [spotlightQueue, setSpotlightQueue] = useState<StageItem[]>([]);
  const [currentSpotlight, setCurrentSpotlight] = useState<StageItem | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // ── UI state ──
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [slideSpeed, setSlideSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [isConnected, setIsConnected] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [clock, setClock] = useState("");
  const [notFoundError, setNotFoundError] = useState(false);

  // ── Refs ──
  const spotlightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const confettiActiveRef = useRef(false);
  const isMutedRef = useRef(isMuted);

  // Keep ref in sync with state
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // ── Mount & Clock ──
  useEffect(() => {
    setMounted(true);
    const tick = setInterval(() => {
      setClock(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Preload chime audio
  useEffect(() => {
    chimeRef.current = new Audio(CHIME_URL);
    chimeRef.current.volume = 0.5;
    chimeRef.current.preload = "auto";
  }, []);

  // ── QR Code ──
  const publicCardUrl = mounted ? `${window.location.origin}/thiep/${slug}` : "";
  const qrCodeUrl = mounted && publicCardUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(publicCardUrl)}&bgcolor=FFFFFF&color=1A120B&margin=10`
    : "";

  // ── Auto-hide controls ──
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    const handler = () => resetControlsTimer();
    window.addEventListener("mousemove", handler);
    window.addEventListener("touchstart", handler);
    resetControlsTimer();
    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("touchstart", handler);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [resetControlsTimer]);

  // ── 1. Fetch card info & initial data ──
  useEffect(() => {
    if (!slug) return;

    // Card info
    ApiClient.request<Record<string, unknown>>(`/cards/by-slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (res.success && res.data) {
          const cardData = (res.data as Record<string, unknown>).card || res.data;
          const cd = cardData as Record<string, unknown>;
          const cat = (cd.categoryData || cd.data || {}) as Record<string, Record<string, string>>;
          const groom = cat.groom?.shortName || cat.groom?.fullName || "Chú Rể";
          const bride = cat.bride?.shortName || cat.bride?.fullName || "Cô Dâu";
          const events = (cd.events || []) as Array<{ eventDate?: string }>;
          const eventDate = events[0]?.eventDate
            ? new Date(events[0].eventDate).toLocaleDateString("vi-VN")
            : "";
          setCardInfo({
            groomName: groom,
            brideName: bride,
            weddingDate: eventDate,
            cardId: cd.id as string || "",
          });

          // Fetch wishes using card ID
          if (cd.id) {
            ApiClient.request<{ items: WishItem[] }>(`/wishes/${cd.id}?limit=50`)
              .then((wRes) => {
                if (wRes.success && wRes.data) {
                  const items = (wRes.data as Record<string, unknown>).items as WishItem[] || wRes.data as unknown as WishItem[];
                  if (Array.isArray(items)) setWishes(items);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => setNotFoundError(true));

    // Initial memories
    ApiClient.getWeddingMemories<WeddingMemory[]>(slug, 100)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setMemories(res.data);
        }
      })
      .catch(() => {});
  }, [slug]);

  // ── 2. SSE Realtime Connection ──
  useEffect(() => {
    if (!slug) return;

    const streamUrl = ApiClient.getMemoryStreamUrl(slug);
    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener("connected", () => {
      setIsConnected(true);
    });

    eventSource.onopen = () => {
      setIsConnected(true);
      // Refetch on reconnect to sync missed events
      ApiClient.getWeddingMemories<WeddingMemory[]>(slug, 100)
        .then((res) => {
          if (res.success && Array.isArray(res.data)) setMemories(res.data);
        })
        .catch(() => {});
    };

    // New photo from photobooth
    eventSource.addEventListener("NEW_MEMORY", (e: MessageEvent) => {
      try {
        const newMem = JSON.parse(e.data) as WeddingMemory;
        setMemories((prev) => [newMem, ...prev.filter((m) => m.id !== newMem.id)]);
        // Queue for spotlight
        setSpotlightQueue((prev) => [...prev, { type: "memory", data: newMem }]);
        triggerEffects();
      } catch {}
    });

    // New wish from guestbook
    eventSource.addEventListener("NEW_WISH", (e: MessageEvent) => {
      try {
        const newWish = JSON.parse(e.data) as WishItem;
        setWishes((prev) => [newWish, ...prev.filter((w) => w.id !== newWish.id)]);
        // Queue for spotlight
        setSpotlightQueue((prev) => [...prev, { type: "wish", data: newWish }]);
        triggerEffects();
      } catch {}
    });

    // Host hides a memory
    eventSource.addEventListener("HIDE_MEMORY", (e: MessageEvent) => {
      try {
        const mem = JSON.parse(e.data) as WeddingMemory;
        setMemories((prev) => prev.filter((m) => m.id !== mem.id));
        setCurrentSpotlight((curr) =>
          curr?.type === "memory" && curr.data.id === mem.id ? null : curr
        );
      } catch {}
    });

    // Host deletes a memory
    eventSource.addEventListener("DELETE_MEMORY", (e: MessageEvent) => {
      try {
        const { id } = JSON.parse(e.data) as { id: string };
        setMemories((prev) => prev.filter((m) => m.id !== id));
        setCurrentSpotlight((curr) =>
          curr?.type === "memory" && curr.data.id === id ? null : curr
        );
      } catch {}
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [slug]);

  // ── Confetti + SFX trigger ──
  const triggerEffects = useCallback(() => {
    // Confetti (debounce: skip if still active)
    if (!confettiActiveRef.current) {
      confettiActiveRef.current = true;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.45 },
        colors: ["#D4AF37", "#FFD700", "#FFFFFF", "#FFA500", "#FF69B4"],
      });
      setTimeout(() => { confettiActiveRef.current = false; }, 3000);
    }

    // Chime SFX
    if (!isMutedRef.current && chimeRef.current) {
      chimeRef.current.currentTime = 0;
      chimeRef.current.play().catch(() => {});
    }
  }, []);

  // ── 3. Spotlight Queue Processor ──
  useEffect(() => {
    if (currentSpotlight || spotlightQueue.length === 0) return;

    // Dequeue next item
    const next = spotlightQueue[0];
    setSpotlightQueue((prev) => prev.slice(1));
    setCurrentSpotlight(next);

    // Auto-dismiss after SPOTLIGHT_DURATION_MS
    spotlightTimerRef.current = setTimeout(() => {
      setCurrentSpotlight(null);
    }, SPOTLIGHT_DURATION_MS);

    return () => {
      if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
    };
  }, [currentSpotlight, spotlightQueue]);

  // ── 4. Auto slideshow (when no spotlight active) ──
  const allSlideItems: StageItem[] = [
    ...memories.map((m): StageItem => ({ type: "memory", data: m })),
    ...wishes.map((w): StageItem => ({ type: "wish", data: w })),
  ];

  useEffect(() => {
    if (currentSpotlight || isPaused || allSlideItems.length <= 1) return;

    slideTimerRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % allSlideItems.length);
    }, SLIDE_SPEEDS[slideSpeed]);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [currentSpotlight, isPaused, allSlideItems.length, slideSpeed]);

  // Active item: spotlight takes priority, otherwise slideshow
  const activeItem: StageItem | null =
    currentSpotlight || (allSlideItems.length > 0 ? allSlideItems[slideIndex % allSlideItems.length] : null);

  // ── Fullscreen ──
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Cycle slide speed
  const cycleSpeed = () => {
    const order: Array<"slow" | "normal" | "fast"> = ["slow", "normal", "fast"];
    const idx = order.indexOf(slideSpeed);
    setSlideSpeed(order[(idx + 1) % order.length]);
  };

  // ── Error state ──
  if (notFoundError) {
    return (
      <div className="fixed inset-0 bg-[#0D0905] flex items-center justify-center">
        <div className="text-center space-y-4 p-10 rounded-3xl bg-black/40 border border-amber-500/20 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <span className="text-3xl">😢</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-amber-100">Không Tìm Thấy Thiệp</h2>
          <p className="text-sm text-amber-200/60">Đường dẫn thiệp không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div
      className="fixed inset-0 bg-[#0D0905] text-white flex flex-col overflow-hidden select-none"
      onMouseMove={resetControlsTimer}
    >
      {/* ═══ BACKGROUND: Bokeh & Golden Particles ═══ */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2C1F13] via-[#140D07] to-[#0A0604] z-0" />
      <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none z-0" />
      {/* Floating golden orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>

      {/* ═══ TOP BAR ═══ */}
      <header
        className={`relative z-20 px-6 lg:px-10 py-4 flex items-center justify-between border-b border-amber-900/30 backdrop-blur-xs transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Left: Couple name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#1A120B] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300">
              {cardInfo.groomName} &amp; {cardInfo.brideName}
            </h1>
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400/80 font-medium">
              Live Wedding Stage • {cardInfo.weddingDate || "Happy Wedding"}
            </p>
          </div>
        </div>

        {/* Right: Clock + Controls */}
        <div className="flex items-center gap-2.5">
          {/* Live clock */}
          <span className="hidden lg:block text-sm font-mono text-amber-300/70 tabular-nums" suppressHydrationWarning>
            {clock}
          </span>

          {/* Connection badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-[11px] text-amber-300">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-500"}`} />
            <span>{isConnected ? "Trực tiếp" : "Đang kết nối..."}</span>
          </div>

          {/* Slide speed */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-amber-200 text-[10px] font-bold uppercase w-9 h-9 flex items-center justify-center"
            title={`Tốc độ: ${slideSpeed === "slow" ? "10s" : slideSpeed === "normal" ? "6s" : "4s"}`}
          >
            {slideSpeed === "slow" ? "10s" : slideSpeed === "normal" ? "6s" : "4s"}
          </button>

          {/* Pause/Play */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-amber-200"
            title={isPaused ? "Tiếp tục trình chiếu" : "Tạm dừng trình chiếu"}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-amber-200"
            title={isMuted ? "Bật âm thanh chuông" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 text-white shadow-md transition cursor-pointer"
            title="Toàn màn hình (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ═══ MAIN STAGE ═══ */}
      <main className="relative z-10 flex-1 flex min-h-0">
        {/* ── LEFT: Spotlight Stage (60%) ── */}
        <div className="flex-[3] flex items-center justify-center p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {activeItem ? (
              activeItem.type === "memory" ? (
                /* ── Memory Spotlight ── */
                <motion.div
                  key={`mem-${activeItem.data.id}`}
                  initial={{ opacity: 0, scale: 0.85, y: 60 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`relative max-w-3xl w-full flex flex-col lg:flex-row items-center gap-6 lg:gap-8 p-5 lg:p-8 rounded-3xl backdrop-blur-md border ${
                    currentSpotlight
                      ? "bg-gradient-to-b from-[#2A1C10]/90 to-[#1A1108]/90 border-amber-400 shadow-[0_0_60px_rgba(212,175,55,0.4)]"
                      : "bg-black/40 border-amber-500/20 shadow-2xl"
                  }`}
                >
                  {/* New badge */}
                  {currentSpotlight && (
                    <div className="absolute -top-4 left-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-bounce">
                      <Sparkles className="w-4 h-4 fill-stone-950" />
                      <span>Khoảnh Khắc Mới!</span>
                    </div>
                  )}

                  {/* Photo frame */}
                  <div className="w-full lg:w-1/2 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-400/30 bg-stone-900 shrink-0 relative">
                    <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(212,175,55,0.15)] pointer-events-none z-10" />
                    <img
                      src={activeItem.data.photoUrl}
                      alt={activeItem.data.senderName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-3 text-left">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm uppercase tracking-widest text-amber-400 font-semibold">Lời chúc từ</span>
                        {activeItem.data.relationship && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                            {activeItem.data.relationship}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl lg:text-4xl font-serif font-bold text-white mt-1">
                        {activeItem.data.senderName}
                      </h2>
                    </div>

                    {activeItem.data.message && (
                      <div className="relative pl-5 border-l-2 border-amber-500/60 py-1">
                        <p className="text-base lg:text-xl font-serif italic text-amber-100/90 leading-relaxed">
                          &ldquo;{activeItem.data.message}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-amber-300/60 font-medium pt-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                      <span>
                        Gửi lúc{" "}
                        {new Date(activeItem.data.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ── Wish Spotlight ── */
                <motion.div
                  key={`wish-${activeItem.data.id}`}
                  initial={{ opacity: 0, scale: 0.85, y: 60 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`relative max-w-2xl w-full p-6 lg:p-10 rounded-3xl backdrop-blur-md border text-center ${
                    currentSpotlight
                      ? "bg-gradient-to-b from-[#2A1C10]/90 to-[#1A1108]/90 border-amber-400 shadow-[0_0_60px_rgba(212,175,55,0.4)]"
                      : "bg-black/40 border-amber-500/20 shadow-2xl"
                  }`}
                >
                  {currentSpotlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-bounce">
                      <MessageCircleHeart className="w-4 h-4" />
                      <span>Lời Chúc Mới!</span>
                    </div>
                  )}

                  {/* Emoji */}
                  <div className="text-5xl lg:text-6xl mb-4">{activeItem.data.emoji || "❤️"}</div>

                  {/* Content */}
                  <div className="relative px-4 lg:px-8 py-2">
                    <p className="text-xl lg:text-3xl font-serif italic text-amber-100/95 leading-relaxed">
                      &ldquo;{activeItem.data.content}&rdquo;
                    </p>
                  </div>

                  {/* Sender */}
                  <div className="mt-5 space-y-1">
                    <p className="text-lg lg:text-2xl font-serif font-bold text-white">
                      {activeItem.data.senderName}
                    </p>
                    {activeItem.data.relationship && (
                      <p className="text-sm text-amber-300/70">{activeItem.data.relationship}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-amber-300/50 font-medium mt-4">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                    <span>
                      Gửi lúc{" "}
                      {new Date(activeItem.data.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              )
            ) : (
              /* ── Empty state ── */
              <div className="text-center space-y-4 max-w-md p-8 rounded-3xl bg-black/30 border border-amber-500/20 backdrop-blur-md">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Camera className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-xl lg:text-2xl font-serif font-bold text-amber-100">
                  Hãy Là Người Đầu Tiên Lên Sân Khấu!
                </h3>
                <p className="text-xs lg:text-sm text-amber-200/70 leading-relaxed">
                  Quét mã QR ở góc màn hình để chụp ảnh và gửi lời chúc phúc trực tiếp lên đây.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Side Memory Wall (40%) ── */}
        <div className="hidden lg:flex flex-[2] flex-col border-l border-amber-900/30 bg-black/20 p-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase tracking-widest text-amber-400/80 font-semibold">
              Album Khoảnh Khắc
            </span>
            <span className="ml-auto text-[11px] text-amber-300/50 font-mono">{memories.length} ảnh</span>
          </div>

          {/* Photo grid */}
          <div className="flex-1 overflow-hidden relative">
            <div className="grid grid-cols-2 gap-3 auto-rows-max overflow-y-auto max-h-full pr-1 scrollbar-hide">
              <AnimatePresence initial={false}>
                {memories.slice(0, 20).map((mem) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-xl overflow-hidden bg-stone-900 border border-amber-500/10 shadow-lg group relative"
                  >
                    <div className="aspect-square">
                      <img
                        src={mem.thumbUrl || mem.photoUrl}
                        alt={mem.senderName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-[11px] font-semibold text-white truncate">{mem.senderName}</p>
                      {mem.message && (
                        <p className="text-[10px] text-amber-200/70 truncate">{mem.message}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {/* Fade edges */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0D0905] to-transparent pointer-events-none" />
          </div>
        </div>
      </main>

      {/* ═══ BOTTOM TICKER BAR ═══ */}
      <footer className="relative z-20 px-4 lg:px-8 py-3 bg-[#0E0A06]/95 border-t border-amber-900/40 backdrop-blur-md flex items-center gap-4">
        {/* QR Code */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-14 h-14 lg:w-[72px] lg:h-[72px] bg-white p-1 rounded-xl shadow-lg flex items-center justify-center shrink-0">
            {mounted && qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-7 h-7 text-stone-400 animate-pulse" />
            )}
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
              <QrCode className="w-3.5 h-3.5" />
              <span>Quét mã tại bàn tiệc</span>
            </div>
            <p className="text-[11px] text-white/70 mt-0.5">Chụp ảnh &amp; gửi lời chúc lên sân khấu</p>
          </div>
        </div>

        {/* Ticker Marquee */}
        <div className="flex-1 overflow-hidden relative mx-2">
          <div className="h-8 flex items-center overflow-hidden">
            {wishes.length > 0 ? (
              <div className="animate-marquee whitespace-nowrap flex items-center gap-6">
                {/* Duplicate for seamless loop */}
                {[...wishes, ...wishes].map((w, i) => (
                  <span key={`${w.id}-${i}`} className="inline-flex items-center gap-2 text-sm text-amber-100/80">
                    <span className="text-rose-400">{w.emoji || "❤️"}</span>
                    <span className="font-semibold text-amber-200">{w.senderName}</span>
                    <span className="italic">&ldquo;{w.content.length > 60 ? w.content.slice(0, 60) + "..." : w.content}&rdquo;</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-amber-300/40 italic">Hãy là người đầu tiên gửi lời chúc...</span>
            )}
          </div>
        </div>

        {/* Counter */}
        <div className="hidden md:flex flex-col items-end text-right shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-amber-400/70 font-medium">Tổng cộng</span>
          <span className="text-sm font-bold text-white font-serif">
            {memories.length} ảnh · {wishes.length} lời chúc
          </span>
        </div>
      </footer>

      {/* ═══ MARQUEE ANIMATION CSS ═══ */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
