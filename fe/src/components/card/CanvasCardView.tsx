"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Gift, UserCheck, MessageSquare, X } from "lucide-react";
import type { CardDetail } from "@/types/card.types";
import type { CanvasElement } from "@/types/canvas.types";
import { CanvasElementContent } from "./CanvasElementContent";
import { CanvasPatternOverlay, CanvasFallingEffect } from "./CanvasEffects";
import { canvasElementStyle, readRecord, safeCanvasLink } from "@/lib/editor/canvas-presentation";
import { RsvpFormModal } from "@/components/shared/RsvpFormModal";
import { GiftQrBoxModal } from "@/components/shared/GiftQrBoxModal";
import { GuestbookSection } from "@/components/shared/GuestbookSection";

interface CanvasCardViewProps {
  card: CardDetail;
  guestName?: string;
  guestPhone?: string;
  guestCode?: string;
}

export function CanvasCardView({ card, guestName, guestPhone, guestCode }: CanvasCardViewProps) {
  const data = readRecord(card.categoryData);
  const legacyCanvas = readRecord(data.canvas);
  const elements = Array.isArray(data.canvasElements)
    ? data.canvasElements as CanvasElement[]
    : Array.isArray(legacyCanvas.elements)
      ? legacyCanvas.elements as CanvasElement[]
      : [];
  const designWidth = 390;
  const contentBottom = elements.reduce((bottom, el) => Math.max(bottom, el.y + el.height + 30), 0);
  const height = Math.max(typeof data.canvasHeight === "number" ? data.canvasHeight : 1200, contentBottom);
  const background = typeof data.canvasBackgroundColor === "string"
    ? data.canvasBackgroundColor
    : typeof legacyCanvas.backgroundColor === "string" ? legacyCanvas.backgroundColor : "#ffffff";
  const backgroundImage = /^(https?:\/\/|\/)/.test(background) ? background : undefined;
  const pattern = data.canvasBackgroundPattern === "flower-small" || data.canvasBackgroundPattern === "flower-large"
    ? data.canvasBackgroundPattern
    : legacyCanvas.backgroundPattern === "flower-small" || legacyCanvas.backgroundPattern === "flower-large" ? legacyCanvas.backgroundPattern : "none";
  const effect = typeof data.canvasFallingEffect === "string"
    ? data.canvasFallingEffect
    : typeof legacyCanvas.fallingEffect === "string" ? legacyCanvas.fallingEffect : "none";
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [scale, setScale] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [wishesOpen, setWishesOpen] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const update = () => setScale(Math.min(1, node.clientWidth / designWidth || 1));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!card.musicUrl) return;
    const audio = new Audio(card.musicUrl);
    audio.loop = true;
    audioRef.current = audio;
    const play = () => { void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); };
    if (card.isAutoPlay) window.addEventListener("pointerdown", play, { once: true });
    return () => { audio.pause(); audioRef.current = null; window.removeEventListener("pointerdown", play); };
  }, [card.musicUrl, card.isAutoPlay]);

  useEffect(() => {
    if (!wishesOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setWishesOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [wishesOpen]);

  return <main className="flex min-h-dvh flex-col items-center gap-4 bg-stone-100 px-0 pb-24 sm:px-5 sm:pt-5">
    {guestName && <p className="px-4 pt-4 text-sm text-stone-700">Trân trọng kính mời: <strong>{guestName}</strong></p>}
    <div ref={containerRef} className="w-full max-w-[390px]" style={{ height: height * scale }}>
      <div data-testid="public-canvas" className="relative isolate overflow-hidden bg-white shadow-lg" style={{ width: designWidth, height, transform: `scale(${scale})`, transformOrigin: "top left", backgroundColor: backgroundImage ? "#ffffff" : background, backgroundImage: backgroundImage ? `url("${backgroundImage}")` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
        <CanvasPatternOverlay pattern={pattern} />
        <CanvasFallingEffect effect={effect} />
        {elements.map(element => {
          const href = safeCanvasLink(element.linkUrl);
          return <div key={element.id} data-canvas-element={element.id} style={canvasElementStyle(element)} className="flex items-center justify-center">
            <CanvasElementContent element={element} draft={card} guestName={guestName} onRsvp={() => setRsvpOpen(true)} onGift={() => setGiftOpen(true)} />
            {href && element.type !== "widget" && <a href={href} target="_blank" rel="noopener noreferrer" aria-label={element.title || element.content || "Mở liên kết"} className="absolute inset-0 focus-visible:outline-2" />}
          </div>;
        })}
      </div>
    </div>
    {data.showBottomToolbar !== false && <nav aria-label="Tương tác với thiệp" className="fixed bottom-4 z-40 flex max-w-[calc(100%-2rem)] items-center gap-1 rounded-full bg-white p-2 text-xs shadow-lg ring-1 ring-black/5">
      {data.showWishButton !== false && <button type="button" onClick={() => setWishesOpen(true)} className="flex min-h-11 items-center gap-2 rounded-full px-3 hover:bg-stone-100"><MessageSquare className="size-4" />Lời chúc</button>}
      {data.showGiftQR !== false && <button type="button" onClick={() => setGiftOpen(true)} className="flex min-h-11 items-center gap-2 rounded-full px-3 hover:bg-stone-100"><Gift className="size-4" />Mừng cưới</button>}
      {data.showRSVP !== false && <button type="button" onClick={() => setRsvpOpen(true)} className="flex min-h-11 items-center gap-2 rounded-full px-3 hover:bg-stone-100"><UserCheck className="size-4" />Xác nhận</button>}
    </nav>}
    {card.musicUrl && <button type="button" aria-label={playing ? "Tắt nhạc" : "Bật nhạc"} onClick={() => { const audio = audioRef.current; if (!audio) return; if (playing) { audio.pause(); setPlaying(false); } else { void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); } }} className="fixed bottom-24 right-4 z-40 flex size-11 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg">{playing ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}</button>}
    <RsvpFormModal isOpen={rsvpOpen} onClose={() => setRsvpOpen(false)} cardId={card.id} defaultGuestName={guestName} defaultGuestPhone={guestPhone} guestCode={guestCode} primaryColor={card.primaryColor} />
    <GiftQrBoxModal isOpen={giftOpen} onClose={() => setGiftOpen(false)} bankingPrimary={card.bankingPrimary} bankingSecondary={card.bankingSecondary} primaryColor={card.primaryColor} />
    {wishesOpen && <dialog open aria-label="Lời chúc mừng" className="fixed inset-0 z-50 m-auto max-h-[85dvh] w-[min(95vw,32rem)] overflow-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/10">
      <button type="button" autoFocus aria-label="Đóng lời chúc" onClick={() => setWishesOpen(false)} className="ml-auto flex size-11 items-center justify-center rounded-full hover:bg-stone-100"><X className="size-5" /></button>
      <GuestbookSection cardId={card.id} primaryColor={card.primaryColor} />
    </dialog>}
  </main>;
}
