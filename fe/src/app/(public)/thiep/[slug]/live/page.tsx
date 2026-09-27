"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, Sparkles, Camera, Heart, Volume2, VolumeX, QrCode } from "lucide-react";
import confetti from "canvas-confetti";
import { ApiClient } from "@/lib/api";
import { WeddingMemory } from "@/types/wedding-memory.types";

export default function WeddingLiveLedPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [cardInfo, setCardInfo] = useState<{
    groomName: string;
    brideName: string;
    weddingDate?: string;
  }>({
    groomName: "Chú Rể",
    brideName: "Cô Dâu",
  });

  const [memories, setMemories] = useState<WeddingMemory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightMemory, setHighlightMemory] = useState<WeddingMemory | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState("");

  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
  }, []);

  // Link mã QR để khách tại bàn tiệc quét (chỉ render sau khi client mount để tránh hydration mismatch)
  const publicCardUrl = origin ? `${origin}/thiep/${slug}` : "";
  const qrCodeUrl = mounted && publicCardUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
        publicCardUrl
      )}&bgcolor=FFFFFF&color=1A120B&margin=10`
    : "";

  // 1. Tải thông tin thiệp & danh sách ảnh ban đầu
  useEffect(() => {
    if (!slug) return;

    // Lấy thông tin thiệp
    ApiClient.request<{
      data?: {
        groom?: { fullName?: string; shortName?: string };
        bride?: { fullName?: string; shortName?: string };
      };
      categoryData?: {
        groom?: { fullName?: string; shortName?: string };
        bride?: { fullName?: string; shortName?: string };
      };
      events?: Array<{ eventDate?: string }>;
    }>(`/cards/by-slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (res.success && res.data) {
          const cardData = (res.data as any).card || res.data;
          const cat = cardData.categoryData || cardData.data || {};
          const groom = cat.groom?.shortName || cat.groom?.fullName || "Chú Rể";
          const bride = cat.bride?.shortName || cat.bride?.fullName || "Cô Dâu";
          const eventDate = cardData.events?.[0]?.eventDate
            ? new Date(cardData.events[0].eventDate).toLocaleDateString("vi-VN")
            : undefined;

          setCardInfo({
            groomName: groom,
            brideName: bride,
            weddingDate: eventDate,
          });
        }
      })
      .catch((err) => console.warn("Lỗi tải thông tin thiệp:", err));

    // Lấy danh sách ảnh ban đầu
    ApiClient.getWeddingMemories<WeddingMemory[]>(slug, 100)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setMemories(res.data);
        }
      })
      .catch((err) => console.warn("Lỗi tải ảnh ban đầu:", err));
  }, [slug]);

  // 2. Mở kết nối Realtime Server-Sent Events (SSE)
  useEffect(() => {
    if (!slug) return;

    const streamUrl = ApiClient.getMemoryStreamUrl(slug);
    const eventSource = new EventSource(streamUrl);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    // Khi có ảnh mới được khách gửi lên
    eventSource.addEventListener("NEW_MEMORY", (e: MessageEvent) => {
      try {
        const newMem = JSON.parse(e.data) as WeddingMemory;

        // Bổ sung vào danh sách
        setMemories((prev) => [newMem, ...prev.filter((m) => m.id !== newMem.id)]);

        // Đặt ảnh mới vào trạng thái Spotlight (phóng to nổi bật trung tâm)
        setHighlightMemory(newMem);

        // Nổ pháo hoa vàng rực rỡ
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#D4AF37", "#FFD700", "#FFFFFF", "#FFA500", "#FF69B4"],
        });

        // Âm thanh chúc mừng nhẹ
        if (!isMuted) {
          try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch {}
        }

        // Sau 8 giây, kết thúc Spotlight và tiếp tục Slide Show
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => {
          setHighlightMemory(null);
        }, 8000);
      } catch (err) {
        console.warn("Lỗi parse SSE memory:", err);
      }
    });

    // Khi Host ẩn ảnh
    eventSource.addEventListener("HIDE_MEMORY", (e: MessageEvent) => {
      try {
        const mem = JSON.parse(e.data) as WeddingMemory;
        setMemories((prev) => prev.filter((m) => m.id !== mem.id));
        setHighlightMemory((curr) => (curr?.id === mem.id ? null : curr));
      } catch {}
    });

    // Khi Host xóa ảnh
    eventSource.addEventListener("DELETE_MEMORY", (e: MessageEvent) => {
      try {
        const { id } = JSON.parse(e.data) as { id: string };
        setMemories((prev) => prev.filter((m) => m.id !== id));
        setHighlightMemory((curr) => (curr?.id === id ? null : curr));
      } catch {}
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [slug, isMuted]);

  // 3. Tự động xoay vòng Auto Slide Show (mỗi 6 giây)
  useEffect(() => {
    if (highlightMemory || memories.length <= 1) return;

    slideTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, 6000);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [highlightMemory, memories.length]);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeMemory = highlightMemory || memories[currentIndex] || null;

  return (
    <div className="fixed inset-0 bg-[#0E0A06] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* NỀN BOKEH VÀNG HOÀNG GIA */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2C1F13] via-[#140D07] to-[#0A0604] z-0" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP BAR: TÊN CẶP ĐÔI & TRẠNG THÁI REALTIME                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-amber-900/30 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#1A120B] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300">
              {cardInfo.groomName} &amp; {cardInfo.brideName}
            </h1>
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400/80 font-medium">
              Live Wedding Photo Wall • {cardInfo.weddingDate || "Happy Wedding"}
            </p>
          </div>
        </div>

        {/* NÚT ĐIỀU KHIỂN SÂN KHẤU */}
        <div className="flex items-center gap-3">
          {/* Trạng thái kết nối */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-[11px] text-amber-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{isConnected ? "Trực tiếp Realtime" : "Đang kết nối..."}</span>
          </div>

          {/* Toggle Âm thanh */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-amber-200"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Toggle Toàn màn hình */}
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. KHU VỰC TRUNG TÂM: CHIẾU ẢNH SLIDE SHOW & SPOTLIGHT         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-10">
        <AnimatePresence mode="wait">
          {activeMemory ? (
            <motion.div
              key={activeMemory.id}
              initial={{ opacity: 0, scale: highlightMemory ? 0.8 : 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`relative max-w-4xl w-full flex flex-col md:flex-row items-center gap-8 p-6 sm:p-8 rounded-3xl backdrop-blur-md border ${
                highlightMemory
                  ? "bg-gradient-to-b from-[#2A1C10]/90 to-[#1A1108]/90 border-amber-400 shadow-[0_0_60px_rgba(212,175,55,0.4)]"
                  : "bg-black/40 border-amber-500/20 shadow-2xl"
              }`}
            >
              {/* BADGE BÁO ẢNH MỚI NỔ BẬT */}
              {highlightMemory && (
                <div className="absolute -top-4 left-8 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-bounce">
                  <Sparkles className="w-4 h-4 fill-stone-950" />
                  <span>Khoảnh Khắc Mới Vừa Gửi Đến!</span>
                </div>
              )}

              {/* KHUNG ẢNH NGHỆ THUẬT */}
              <div className="w-full md:w-1/2 aspect-4/5 sm:aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-stone-900 shrink-0">
                <img
                  src={activeMemory.photoUrl}
                  alt={activeMemory.senderName}
                  className="w-full h-full object-cover transition-transform duration-7000 ease-out hover:scale-105"
                />
              </div>

              {/* NỘI DUNG LỜI CHÚC & THÔNG TIN KHÁCH MỜI */}
              <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 text-left">
                {/* TÊN KHÁCH MỜI */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm uppercase tracking-widest text-amber-400 font-semibold">
                      Lời chúc từ
                    </span>
                    {activeMemory.relationship && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                        {activeMemory.relationship}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white mt-1">
                    {activeMemory.senderName}
                  </h2>
                </div>

                {/* NỘI DUNG LỜI CHÚC */}
                {activeMemory.message && (
                  <div className="relative pl-6 border-l-2 border-amber-500/60 py-1">
                    <p className="text-base sm:text-xl font-serif italic text-amber-100/90 leading-relaxed">
                      &ldquo;{activeMemory.message}&rdquo;
                    </p>
                  </div>
                )}

                {/* THỜI GIAN GỬI */}
                <div className="flex items-center gap-2 text-xs text-amber-300/60 font-medium pt-2">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                  <span>
                    Gửi lúc {new Date(activeMemory.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* TRẠNG THÁI CHỜ KHI CHƯA CÓ ẢNH */
            <div className="text-center space-y-4 max-w-md p-8 rounded-3xl bg-black/30 border border-amber-500/20 backdrop-blur-md">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Camera className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
                Hãy Là Người Đầu Tiên Lên Sân Khấu!
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/70 leading-relaxed">
                Quét mã QR ở góc màn hình bằng điện thoại để chụp ảnh và gửi lời chúc phúc trực tiếp lên đây.
              </p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. BOTTOM BAR: MÃ QR QUÉT ĐỂ GỬI ẢNH & HƯỚNG DẪN BÀN TIỆC     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-8 py-4 bg-[#140D07]/90 border-t border-amber-900/40 backdrop-blur-md flex items-center justify-between gap-4">
        {/* HƯỚNG DẪN QUÉT QR */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-xl shadow-lg shrink-0 flex items-center justify-center">
            {mounted && qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <QrCode className="w-8 h-8 text-stone-400 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              <span>Quét mã QR tại bàn tiệc</span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 mt-0.5">
              Chụp ảnh selfie &amp; gửi lời chúc xuất hiện trực tiếp lên sân khấu
            </p>
            <p className="text-[11px] text-amber-300/60 font-mono mt-0.5" suppressHydrationWarning>
              {mounted ? publicCardUrl : ""}
            </p>
          </div>
        </div>

        {/* THỐNG KÊ ẢNH ĐÃ GỬI */}
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-xs uppercase tracking-wider text-amber-400/80 font-medium">
            Album Khoảnh Khắc
          </span>
          <span className="text-lg font-bold text-white font-serif">
            {memories.length} bức ảnh kỷ niệm
          </span>
        </div>
      </footer>
    </div>
  );
}
