"use client";

import React, { useState, useEffect, useRef } from "react";
import { CardDetail } from "@/types/card.types";
import { CanvasElement } from "@/components/editor/EditorContext";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { CanvasPatternOverlay, CanvasFallingEffect } from "./CanvasEffects";

interface CanvasCardViewProps {
  card: CardDetail;
  guestName?: string;
  guestPhone?: string;
  guestCode?: string;
}

export function CanvasCardView({ card, guestName }: CanvasCardViewProps) {
  const categoryData = (card.categoryData as unknown as Record<string, unknown>) || {};
  const canvasElements: CanvasElement[] = Array.isArray(categoryData.canvasElements)
    ? (categoryData.canvasElements as CanvasElement[])
    : Array.isArray((categoryData.canvas as { elements?: CanvasElement[] })?.elements)
    ? ((categoryData.canvas as { elements: CanvasElement[] }).elements)
    : [];

  const canvasBackgroundColor =
    (categoryData.canvasBackgroundColor as string) ||
    ((categoryData.canvas as { backgroundColor?: string })?.backgroundColor) ||
    "#FFFFFF";

  const canvasBackgroundPattern =
    (categoryData.canvasBackgroundPattern as "none" | "flower-small" | "flower-large") ||
    ((categoryData.canvas as { backgroundPattern?: "none" | "flower-small" | "flower-large" })?.backgroundPattern) ||
    "none";

  const canvasFallingEffect =
    (categoryData.canvasFallingEffect as "none" | "cherry" | "snow" | "leaves" | "apricot" | "hydrangea") ||
    ((categoryData.canvas as { fallingEffect?: "none" | "cherry" | "snow" | "leaves" | "apricot" | "hydrangea" })?.fallingEffect) ||
    "none";

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play music on first user interaction if configured
  useEffect(() => {
    if (!card.musicUrl) return;
    const audio = new Audio(card.musicUrl);
    audio.loop = true;
    audioRef.current = audio;

    const startPlay = () => {
      audio.play().then(() => setIsPlayingMusic(true)).catch(() => {});
      window.removeEventListener("click", startPlay);
      window.removeEventListener("touchstart", startPlay);
    };

    window.addEventListener("click", startPlay, { once: true });
    window.addEventListener("touchstart", startPlay, { once: true });

    return () => {
      audio.pause();
      window.removeEventListener("click", startPlay);
      window.removeEventListener("touchstart", startPlay);
    };
  }, [card.musicUrl]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  const renderElement = (el: CanvasElement) => {
    // 1. Stock / Vector Illustrations
    if (el.type === "stock" || el.type === "sticker") {
      // Candelabra chandelier 3 nhánh theo mẫu chuẩn ngaychungdoi
      if (el.stockId === "w1" || el.content === "candelabra-vintage" || el.title?.includes("nến")) {
        return (
          <div className="w-full h-full flex items-center justify-center select-none pointer-events-none p-1">
            <svg viewBox="0 0 100 120" className="w-full h-full object-contain drop-shadow-md">
              <ellipse cx="50" cy="112" rx="20" ry="5" fill="#8BB8D4" />
              <rect x="47" y="55" width="6" height="57" rx="3" fill="#8BB8D4" />
              <circle cx="50" cy="85" r="5" fill="#75A6C5" />
              <path d="M 25 70 Q 25 90 50 90 Q 75 90 75 70" stroke="#8BB8D4" strokeWidth="5" fill="none" strokeLinecap="round" />
              <rect x="20" y="68" width="10" height="4" rx="1.5" fill="#75A6C5" />
              <rect x="45" y="52" width="10" height="4" rx="1.5" fill="#75A6C5" />
              <rect x="70" y="68" width="10" height="4" rx="1.5" fill="#75A6C5" />
              <rect x="22" y="44" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1" />
              <rect x="47" y="28" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1" />
              <rect x="72" y="44" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1" />
              <line x1="25" y1="44" x2="25" y2="40" stroke="#4A5568" strokeWidth="1.5" />
              <line x1="50" y1="28" x2="50" y2="24" stroke="#4A5568" strokeWidth="1.5" />
              <line x1="75" y1="44" x2="75" y2="40" stroke="#4A5568" strokeWidth="1.5" />
              <ellipse cx="25" cy="36" rx="3.5" ry="6.5" fill="#F59E0B" />
              <ellipse cx="25" cy="37" rx="1.5" ry="3.5" fill="#FEF08A" />
              <ellipse cx="50" cy="20" rx="4" ry="7.5" fill="#F59E0B" />
              <ellipse cx="50" cy="21" rx="2" ry="4" fill="#FEF08A" />
              <ellipse cx="75" cy="36" rx="3.5" ry="6.5" fill="#F59E0B" />
              <ellipse cx="75" cy="37" rx="1.5" ry="3.5" fill="#FEF08A" />
            </svg>
          </div>
        );
      }

      const isImg = Boolean(
        el.imageUrl ||
          (typeof el.content === "string" &&
            (el.content.startsWith("http") ||
              el.content.startsWith("/images") ||
              el.content.startsWith("data:image")))
      );

      return (
        <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
          {isImg ? (
            <img
              src={el.imageUrl || el.content}
              alt={el.title || "Stock"}
              className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
            />
          ) : (
            <span
              style={{
                fontSize: `${el.fontSize || Math.round(el.height * 0.75)}px`,
                color: el.color || undefined,
                lineHeight: 1,
              }}
              className="filter drop-shadow-md select-none"
            >
              {el.content}
            </span>
          )}
        </div>
      );
    }

    // 2. Shapes
    if (el.type === "shape") {
      if (el.shapeType === "line") {
        return (
          <div className="w-full h-full flex items-center justify-center px-2 pointer-events-none select-none">
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#BE944E] to-[#BE944E]" />
              <span className="text-[#BE944E] text-xs font-serif">✦</span>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-[#BE944E] via-[#BE944E] to-transparent" />
            </div>
          </div>
        );
      }
      if (el.shapeType === "rect") {
        return (
          <div className="w-full h-full rounded-[inherit] border-2 border-[#BE944E] p-1.5 pointer-events-none select-none relative shadow-sm">
            <div className="w-full h-full border border-dashed border-[#BE944E]/60 rounded-[calc(inherit-4px)] flex items-center justify-center">
              <span className="text-[10px] text-amber-800/60 font-serif italic tracking-wider">Khung Hoàng Gia</span>
            </div>
          </div>
        );
      }
      if (el.shapeType === "circle") {
        return (
          <div className="w-full h-full rounded-full border-2 border-[#BE944E] p-1.5 pointer-events-none select-none relative shadow-sm">
            <div className="w-full h-full rounded-full border border-dashed border-[#BE944E]/60 flex items-center justify-center">
              <span className="text-[#BE944E] text-sm font-serif">❦</span>
            </div>
          </div>
        );
      }
      if (el.shapeType === "corner") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none text-amber-700/80">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <path d="M10,10 L90,10 L90,25 L25,25 L25,90 L10,90 Z" opacity="0.85" />
              <circle cx="55" cy="55" r="8" opacity="0.6" />
            </svg>
          </div>
        );
      }
    }

    // 3. Presets
    if (el.presetId === "p-envelope-pink" || el.presetId === "p1" || el.content === "envelope-pink") {
      const groomData = (categoryData.groom as { fullName?: string } | undefined);
      const brideData = (categoryData.bride as { fullName?: string } | undefined);
      const photoUrl =
        el.imageUrl ||
        (categoryData.coverPhotoUrl as string) ||
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80";
      return (
        <div className="w-full h-full relative overflow-visible flex items-center justify-center select-none pointer-events-none">
          <div className="absolute -top-7 w-[84%] h-24 bg-[#EFA0AF] [clip-path:polygon(50%_0%,0%_100%,100%_100%)] rounded-t-sm" />
          <div className="w-[78%] h-[82%] -top-4 absolute bg-white rounded-lg shadow-lg border border-pink-100 overflow-hidden flex flex-col items-center p-1.5 z-10">
            <div className="w-full flex-1 bg-stone-100 rounded overflow-hidden relative">
              <img src={photoUrl} alt="Wedding Photo" className="w-full h-full object-cover" />
            </div>
            <div className="pt-1 text-center">
              <span className="text-[10px] font-serif tracking-[0.2em] font-bold text-pink-700 uppercase block">Save The Date</span>
              <span className="text-[8px] font-mono text-stone-500 block truncate max-w-[200px]">
                {groomData?.fullName ? `${groomData.fullName} & ${brideData?.fullName}` : "Văn Anh & Minh Thơ"}
              </span>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[68%] bg-[#F294A6] rounded-b-2xl z-20 shadow-md [clip-path:polygon(0%_25%,50%_65%,100%_25%,100%_100%,0%_100%)] border-t border-pink-200/50" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 size-9 rounded-full bg-gradient-to-br from-[#F48197] to-[#DF5C75] border-2 border-pink-200 shadow-lg flex items-center justify-center text-[10px] font-serif font-bold text-white tracking-widest drop-shadow-sm">
            ML
          </div>
        </div>
      );
    }

    if (el.presetId === "p-envelope-green") {
      const photoUrl =
        el.imageUrl ||
        (categoryData.coverPhotoUrl as string) ||
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80";
      return (
        <div className="w-full h-full relative overflow-visible flex items-center justify-center pointer-events-none select-none">
          <div className="absolute -top-6 w-[84%] h-22 bg-[#2D3E31] shadow-xs [clip-path:polygon(50%_0%,0%_100%,100%_100%)] rounded-t-sm" />
          <div className="w-[78%] h-[80%] -top-3 absolute bg-[#FDFBF7] rounded-lg shadow-lg border border-stone-200 overflow-hidden flex flex-col items-center p-2 z-10 text-center">
            <span className="text-[10px] font-serif italic text-stone-700">We got married</span>
            <div className="w-full flex-1 bg-stone-100 rounded overflow-hidden my-1">
              <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[68%] bg-[#3E5343] rounded-b-2xl z-20 shadow-md [clip-path:polygon(0%_25%,50%_65%,100%_25%,100%_100%,0%_100%)]" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 size-9 rounded-full bg-[#BE944E] border-2 border-amber-200 shadow-lg flex items-center justify-center text-xs font-bold text-amber-950">
            💍
          </div>
        </div>
      );
    }

    if (el.presetId === "p-carnation-bouquet" || el.content === "carnation") {
      return (
        <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
          <svg viewBox="0 0 120 180" className="w-full h-full drop-shadow-md">
            <path d="M 60 160 Q 55 110 40 70 M 60 160 Q 65 120 75 80" stroke="#4D7C0F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 52 130 Q 35 125 38 115 Q 48 120 52 130 Z" fill="#65A30D" />
            <path d="M 62 110 Q 78 105 76 95 Q 66 100 62 110 Z" fill="#65A30D" />
            <g transform="translate(38, 55)">
              <ellipse cx="0" cy="10" rx="7" ry="9" fill="#4D7C0F" />
              <path d="M -22 -5 C -30 -18 -12 -30 0 -26 C 12 -30 30 -18 22 -5 C 26 10 10 20 0 18 C -10 20 -26 10 -22 -5 Z" fill="#F43F5E" opacity="0.95" />
              <path d="M -16 -10 C -22 -22 -6 -28 0 -24 C 6 -28 22 -22 16 -10 C 20 5 6 12 0 10 C -6 12 -20 5 -16 -10 Z" fill="#FB7185" />
              <path d="M -10 -12 C -15 -18 0 -24 0 -20 C 0 -24 15 -18 10 -12 C 10 0 3 6 0 5 C -3 6 -10 0 -10 -12 Z" fill="#FECDD3" />
            </g>
            <g transform="translate(76, 75) scale(0.85)">
              <ellipse cx="0" cy="10" rx="7" ry="9" fill="#4D7C0F" />
              <path d="M -22 -5 C -30 -18 -12 -30 0 -26 C 12 -30 30 -18 22 -5 C 26 10 10 20 0 18 C -10 20 -26 10 -22 -5 Z" fill="#E11D48" opacity="0.95" />
              <path d="M -16 -10 C -22 -22 -6 -28 0 -24 C 6 -28 22 -22 16 -10 C 20 5 6 12 0 10 C -6 12 -20 5 -16 -10 Z" fill="#FB7185" />
              <path d="M -10 -12 C -15 -18 0 -24 0 -20 C 0 -24 15 -18 10 -12 C 10 0 3 6 0 5 C -3 6 -10 0 -10 -12 Z" fill="#FFE4E6" />
            </g>
            <g transform="translate(58, 140)">
              <circle cx="0" cy="0" r="5" fill="#B91C1C" />
              <path d="M 0 0 C -18 -12 -24 10 0 4 Z" fill="#DC2626" />
              <path d="M 0 0 C 18 -12 24 10 0 4 Z" fill="#DC2626" />
              <path d="M -3 3 Q -10 22 -14 30" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 3 3 Q 10 22 16 30" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );
    }

    if (el.presetId === "p-wax-seal" || el.content === "wax-seal") {
      return (
        <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <path d="M 50 4 C 64 2 73 9 84 18 C 95 28 98 42 96 55 C 94 69 88 80 77 88 C 65 96 48 98 35 94 C 20 90 9 79 5 65 C 2 50 6 36 15 24 C 24 12 36 6 50 4 Z" fill="#F47291" />
            <circle cx="50" cy="51" r="32" fill="none" stroke="#E11D48" strokeWidth="2" strokeOpacity="0.3" />
            <circle cx="50" cy="51" r="28" fill="#FB7185" />
            <text x="50" y="58" textAnchor="middle" fill="#FFFFFF" fillOpacity="0.95" fontFamily="serif" fontStyle="italic" fontWeight="bold" fontSize="22">ML</text>
          </svg>
        </div>
      );
    }

    if (el.presetId === "p-mini-bouquet" || el.content === "mini-bouquet") {
      return (
        <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
            <path d="M 50 115 L 25 65 L 75 65 Z" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1" />
            <path d="M 30 65 Q 50 78 70 65 L 50 115 Z" fill="#FDF2F8" />
            <circle cx="40" cy="50" r="14" fill="#F43F5E" />
            <circle cx="60" cy="48" r="13" fill="#FB7185" />
            <circle cx="50" cy="35" r="15" fill="#FDA4AF" />
            <circle cx="35" cy="36" r="10" fill="#C084FC" />
            <circle cx="65" cy="35" r="11" fill="#A855F7" />
            <circle cx="50" cy="52" r="8" fill="#FBBF24" />
            <ellipse cx="50" cy="85" rx="8" ry="4" fill="#EC4899" />
            <path d="M 45 87 Q 40 102 38 110" stroke="#EC4899" strokeWidth="2.5" fill="none" />
            <path d="M 55 87 Q 60 102 62 110" stroke="#EC4899" strokeWidth="2.5" fill="none" />
          </svg>
        </div>
      );
    }

    if (el.presetId === "p-gold-divider" || el.content === "gold-divider") {
      return (
        <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-xs" />
        </div>
      );
    }

    // 4. Image Element
    if (el.type === "image") {
      return (
        <div className="w-full h-full rounded-[inherit] overflow-hidden pointer-events-none select-none">
          <img src={el.imageUrl || el.content} alt={el.title || "Ảnh"} className="w-full h-full object-cover" />
        </div>
      );
    }

    // 5. Text Element
    return (
      <span className="w-full break-words select-none pointer-events-none leading-tight">
        {el.content}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#ECECEC] flex flex-col items-center justify-center p-3 sm:p-6 relative select-none">
      {/* Personalized Guest Welcome Banner */}
      {guestName && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-amber-300/80 text-center max-w-sm"
        >
          <span className="text-xs font-serif font-semibold text-amber-900">
            Kính mời: <strong className="text-stone-900">{guestName}</strong>
          </span>
        </motion.div>
      )}

      {/* ── CARD PAPER SHEET (KHUNG THIỆP CHÍNH) ── */}
      <div
        style={{
          backgroundColor:
            canvasBackgroundColor && !canvasBackgroundColor.startsWith("http")
              ? canvasBackgroundColor
              : "#FFFFFF",
          backgroundImage:
            canvasBackgroundColor &&
            (canvasBackgroundColor.startsWith("http") || canvasBackgroundColor.startsWith("/"))
              ? `url(${canvasBackgroundColor})`
              : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="relative w-full max-w-[390px] h-[680px] shadow-2xl rounded-sm overflow-hidden border border-stone-200/80"
      >
        {/* Background Pattern Overlay */}
        <CanvasPatternOverlay pattern={canvasBackgroundPattern} />

        {/* Falling Particles Effect */}
        <CanvasFallingEffect effect={canvasFallingEffect} />

        {/* Elements Scene Graph */}
        {canvasElements.map((el) => {
          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                zIndex: el.zIndex || 1,
                opacity: el.opacity ?? 1,
                fontFamily: el.fontFamily,
                fontSize: `${el.fontSize || 28}px`,
                color: el.color || "#000000",
                backgroundColor: el.backgroundColor || "transparent",
                textAlign: el.textAlign || "center",
                fontWeight: el.isBold ? "bold" : "normal",
                fontStyle: el.isItalic ? "italic" : "normal",
                textDecoration: [
                  el.isUnderline ? "underline" : "",
                  el.isStrike ? "line-through" : "",
                ]
                  .filter(Boolean)
                  .join(" ") || "none",
                textTransform: el.isUppercase ? "uppercase" : "none",
                borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                borderWidth: el.borderWidth ? `${el.borderWidth}px` : undefined,
                borderColor: el.borderColor || undefined,
                borderStyle: el.borderWidth ? "solid" : undefined,
                boxShadow: el.shadow || undefined,
                transform: [
                  el.rotation ? `rotate(${el.rotation}deg)` : "",
                  el.flipX ? "scaleX(-1)" : "",
                  el.flipY ? "scaleY(-1)" : "",
                ]
                  .filter(Boolean)
                  .join(" ") || undefined,
              }}
              className="flex items-center justify-center p-1 select-none pointer-events-none"
            >
              {renderElement(el)}
            </div>
          );
        })}
      </div>

      {/* Floating Music Control */}
      {card.musicUrl && (
        <button
          type="button"
          onClick={toggleMusic}
          className={`fixed bottom-6 right-6 size-12 rounded-full shadow-xl flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-50 ${
            isPlayingMusic ? "bg-amber-600 text-white animate-spin-slow" : "bg-stone-900 text-white"
          }`}
          title={isPlayingMusic ? "Tắt nhạc" : "Bật nhạc"}
        >
          {isPlayingMusic ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
      )}
    </main>
  );
}
