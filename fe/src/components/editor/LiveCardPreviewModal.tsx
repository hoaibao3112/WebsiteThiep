"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  Volume2,
  VolumeX,
  Save,
  X,
  Sparkles,
  Heart,
  MailOpen,
  Check,
  Loader2,
  User,
  MessageSquare,
  Gift,
  UserCheck,
  Wifi,
  Battery,
  ChevronLeft,
} from "lucide-react";
import type { CanvasElement } from "@/types/canvas.types";
import { CanvasElementContent } from "@/components/card/CanvasElementContent";
import { CanvasPatternOverlay, CanvasFallingEffect } from "@/components/card/CanvasEffects";
import {
  canvasElementStyle,
  canvasElementAnimationClass,
  safeCanvasLink,
} from "@/lib/editor/canvas-presentation";
import { RsvpFormModal } from "@/components/shared/RsvpFormModal";
import { GiftQrBoxModal } from "@/components/shared/GiftQrBoxModal";
import { GuestbookSection } from "@/components/shared/GuestbookSection";
import { WaxSealOpening } from "@/components/shared/OpeningEffect/WaxSealOpening";
import { getMonogram } from "@/lib/guest/monogram";

type DeviceMode = "mobile" | "tablet" | "desktop";

interface LiveCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: Record<string, any>;
  templateSlug?: string;
  canvasElements?: CanvasElement[];
  canvasHeight?: number;
  canvasBackgroundColor?: string;
  canvasBackgroundPattern?: string;
  canvasFallingEffect?: string;
  children?: React.ReactNode;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
}

export function LiveCardPreviewModal({
  isOpen,
  onClose,
  draft,
  templateSlug,
  canvasElements = [],
  canvasHeight = 1200,
  canvasBackgroundColor,
  canvasBackgroundPattern,
  canvasFallingEffect,
  children,
  onSave,
  isSaving = false,
}: LiveCardPreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  const [simulatedGuestName, setSimulatedGuestName] = useState("Anh Nam & Gia đình");
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(true);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showWishesModal, setShowWishesModal] = useState(false);
  const [saveSuccessTick, setSaveSuccessTick] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);

  const categoryData = (draft?.categoryData || {}) as Record<string, any>;
  const cardId = draft?.id || draft?._id || "preview-card";
  const primaryColor = draft?.primaryColor || "#8B1E2D";

  // Check music source
  const musicUrl =
    draft?.musicUrl ||
    categoryData?.musicUrl ||
    categoryData?.canvasDocument?.musicUrl ||
    "";

  // Check envelope configuration
  const envelopeConfig =
    categoryData?.envelopeConfig || draft?.envelopeConfig;
  const hasEnvelope = Boolean(envelopeConfig && envelopeConfig.enabled !== false);

  // Auto setup audio
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingMusic(false);
      return;
    }

    if (musicUrl) {
      const audio = new Audio(musicUrl);
      audio.loop = true;
      audioRef.current = audio;

      if (draft?.isAutoPlay !== false) {
        audio
          .play()
          .then(() => setIsPlayingMusic(true))
          .catch(() => setIsPlayingMusic(false));
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen, musicUrl, draft?.isAutoPlay, refreshKey]);

  // Keyboard navigation: Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showRsvpModal) {
          setShowRsvpModal(false);
          return;
        }
        if (showGiftModal) {
          setShowGiftModal(false);
          return;
        }
        if (showWishesModal) {
          setShowWishesModal(false);
          return;
        }
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showRsvpModal, showGiftModal, showWishesModal, onClose]);

  // Toggle audio playback
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingMusic) {
      audio.pause();
      setIsPlayingMusic(false);
    } else {
      audio
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false));
    }
  };

  // Replay animation & reset scroll
  const handleReplay = () => {
    setRefreshKey((k) => k + 1);
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Trigger save directly from preview
  const handleSave = async () => {
    if (!onSave || isSaving) return;
    try {
      await onSave();
      setSaveSuccessTick(true);
      setTimeout(() => setSaveSuccessTick(false), 2500);
    } catch (err) {
      console.error("Save error from preview:", err);
    }
  };

  // Background style computation
  const resolvedBgColor =
    canvasBackgroundColor &&
    !canvasBackgroundColor.startsWith("http") &&
    !canvasBackgroundColor.startsWith("/") &&
    !canvasBackgroundColor.startsWith("data:")
      ? canvasBackgroundColor
      : categoryData?.canvasDocument?.background?.color || "#FFFFFF";

  const resolvedBgImage =
    canvasBackgroundColor &&
    (canvasBackgroundColor.startsWith("http") ||
      canvasBackgroundColor.startsWith("/") ||
      canvasBackgroundColor.startsWith("data:"))
      ? canvasBackgroundColor
      : categoryData?.canvasDocument?.background?.imageUrl || undefined;

  const contentBottom = canvasElements.reduce(
    (max, el) => Math.max(max, el.y + el.height + 40),
    0
  );
  const effectiveCanvasHeight = Math.max(canvasHeight, contentBottom, 844);

  // Template couple names
  const groomName =
    categoryData?.groom?.fullName ||
    categoryData?.groom?.name ||
    draft?.groomName ||
    "Chú Rể";
  const brideName =
    categoryData?.bride?.fullName ||
    categoryData?.bride?.name ||
    draft?.brideName ||
    "Cô Dâu";
  const coupleMonogram = getMonogram(groomName, brideName);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col bg-stone-950/90 backdrop-blur-md select-none overflow-hidden animate-in fade-in duration-200">
        {/* ── TOP FLOATING CONTROL BAR ── */}
        <header className="h-14 sm:h-16 px-3 sm:px-6 bg-stone-900/95 border-b border-stone-800 flex items-center justify-between gap-2 shrink-0 z-50 text-stone-200">
          {/* LEFT: TITLE & GUEST SIMULATOR */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition cursor-pointer shrink-0"
              title="Quay lại chỉnh sửa (Esc)"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại sửa</span>
            </button>

            <div className="hidden md:flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-stone-300">
                Xem trước trải nghiệm khách mời
              </span>
            </div>

            {/* GUEST NAME SIMULATOR PILL */}
            <div className="hidden lg:flex items-center gap-1.5 bg-stone-800/80 border border-stone-700/80 rounded-full px-3 py-1 text-xs">
              <User className="size-3 text-amber-400" />
              <span className="text-stone-400 text-[11px]">Thử tên khách:</span>
              <input
                type="text"
                value={simulatedGuestName}
                onChange={(e) => setSimulatedGuestName(e.target.value)}
                placeholder="Nhập tên khách mời..."
                className="bg-transparent border-none text-white text-xs font-medium focus:outline-none w-36 px-1 hover:bg-stone-700/50 rounded"
              />
            </div>
          </div>

          {/* CENTER: DEVICE SWITCHER */}
          <div className="flex items-center bg-stone-800/90 p-1 rounded-full border border-stone-700/70 shadow-inner">
            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                deviceMode === "mobile"
                  ? "bg-amber-500 text-stone-950 font-bold shadow-xs"
                  : "text-stone-400 hover:text-white"
              }`}
              title="Chế độ điện thoại di động (390px)"
            >
              <Smartphone className="size-3.5" />
              <span className="hidden sm:inline">Di động</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("tablet")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                deviceMode === "tablet"
                  ? "bg-amber-500 text-stone-950 font-bold shadow-xs"
                  : "text-stone-400 hover:text-white"
              }`}
              title="Chế độ máy tính bảng (Tablet)"
            >
              <Tablet className="size-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                deviceMode === "desktop"
                  ? "bg-amber-500 text-stone-950 font-bold shadow-xs"
                  : "text-stone-400 hover:text-white"
              }`}
              title="Chế độ toàn màn hình máy tính"
            >
              <Monitor className="size-3.5" />
              <span className="hidden sm:inline">Máy tính</span>
            </button>
          </div>

          {/* RIGHT: AUDIO, REPLAY, SAVE, CLOSE */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* ENVELOPE RE-TRIGGER */}
            {hasEnvelope && (
              <button
                type="button"
                onClick={() => setEnvelopeOpened((prev) => !prev)}
                className={`p-2 rounded-full border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  !envelopeOpened
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700"
                }`}
                title={envelopeOpened ? "Thử mở phong bì sáp" : "Đang đóng phong bì"}
              >
                <MailOpen className="size-4" />
                <span className="hidden xl:inline">
                  {envelopeOpened ? "Thử mở phong bì" : "Đang mở bì"}
                </span>
              </button>
            )}

            {/* MUSIC TOGGLE */}
            {musicUrl && (
              <button
                type="button"
                onClick={toggleMusic}
                className={`p-2 rounded-full border transition cursor-pointer flex items-center gap-1.5 text-xs ${
                  isPlayingMusic
                    ? "bg-rose-500/20 border-rose-500/60 text-rose-300"
                    : "border-stone-700 bg-stone-800 text-stone-400 hover:bg-stone-700"
                }`}
                title={isPlayingMusic ? "Tắt nhạc nền" : "Bật nhạc nền"}
              >
                {isPlayingMusic ? (
                  <>
                    <Volume2 className="size-4 text-rose-400 animate-pulse" />
                    <span className="hidden xl:inline text-rose-300 font-semibold">Đang phát nhạc</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="size-4" />
                    <span className="hidden xl:inline">Bật nhạc</span>
                  </>
                )}
              </button>
            )}

            {/* REPLAY */}
            <button
              type="button"
              onClick={handleReplay}
              className="p-2 rounded-full bg-stone-800 border border-stone-700 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
              title="Làm mới hoạt ảnh & cuộn lên đầu"
            >
              <RotateCcw className="size-4" />
            </button>

            {/* SAVE BUTTON */}
            {onSave && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition shadow-md cursor-pointer ${
                  saveSuccessTick
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                }`}
                title="Lưu ngay thiệp này"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : saveSuccessTick ? (
                  <>
                    <Check className="size-3.5" />
                    <span>Đã lưu!</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>Lưu thiệp</span>
                  </>
                )}
              </button>
            )}

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-stone-800 hover:bg-rose-500/20 hover:text-rose-400 border border-stone-700 text-stone-400 transition cursor-pointer ml-1"
              title="Đóng xem trước (Esc)"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        {/* ── MAIN PREVIEW WORKSPACE ── */}
        <main className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-6 overflow-hidden relative">
          {/* DEVICE CONTAINER */}
          {deviceMode === "mobile" && (
            <div className="relative w-[390px] h-[820px] max-h-[calc(100vh-84px)] rounded-[52px] border-[10px] border-stone-800 shadow-[0_25px_70px_rgba(0,0,0,0.8)] bg-white flex flex-col overflow-hidden ring-1 ring-white/10 shrink-0 animate-in zoom-in-95 duration-200">
              {/* SMARTPHONE HARDWARE ACCENTS */}
              {/* Dynamic Island */}
              <div className="w-28 h-6 bg-stone-950 rounded-full mx-auto mt-2 z-40 shrink-0 flex items-center justify-between px-3 shadow-md">
                <span className="size-2 rounded-full bg-stone-800 ring-1 ring-stone-700/50" />
                <span className="size-2.5 rounded-full bg-[#10101c] ring-1 ring-blue-900/60" />
              </div>

              {/* iOS Status Bar */}
              <div className="w-full px-7 -mt-5 flex items-center justify-between text-[11px] font-semibold text-stone-800 select-none z-30 pointer-events-none pb-2">
                <span>09:41</span>
                <div className="flex items-center gap-1.5 text-stone-700">
                  <Wifi className="size-3" />
                  <Battery className="size-3.5" />
                </div>
              </div>

              {/* SCROLLABLE CARD VIEWPORT */}
              <div
                ref={scrollViewportRef}
                key={refreshKey}
                className="flex-1 w-full overflow-y-auto overflow-x-hidden relative scroll-smooth no-scrollbar"
                style={{
                  backgroundColor: resolvedBgColor,
                  backgroundImage: resolvedBgImage ? `url(${resolvedBgImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* WAX SEAL ENVELOPE OPENING OVERLAY */}
                {hasEnvelope && !envelopeOpened ? (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-900/95">
                    <WaxSealOpening
                      primaryColor={primaryColor}
                      title={`${groomName} & ${brideName}`}
                      guestName={simulatedGuestName}
                      monogram={coupleMonogram}
                      envelopeConfig={envelopeConfig}
                      onOpened={() => setEnvelopeOpened(true)}
                    />
                  </div>
                ) : (
                  <CardRenderContent
                    draft={draft}
                    canvasElements={canvasElements}
                    canvasHeight={effectiveCanvasHeight}
                    canvasBackgroundPattern={canvasBackgroundPattern}
                    canvasFallingEffect={canvasFallingEffect}
                    simulatedGuestName={simulatedGuestName}
                    onOpenRsvp={() => setShowRsvpModal(true)}
                    onOpenGift={() => setShowGiftModal(true)}
                    onOpenWishes={() => setShowWishesModal(true)}
                  >
                    {children}
                  </CardRenderContent>
                )}
              </div>

              {/* Home indicator bar */}
              <div className="w-32 h-1 bg-stone-400/50 rounded-full mx-auto my-2 shrink-0 z-40 pointer-events-none" />
            </div>
          )}

          {deviceMode === "tablet" && (
            <div className="relative w-[768px] h-[860px] max-h-[calc(100vh-84px)] rounded-[36px] border-[12px] border-stone-800 shadow-[0_25px_70px_rgba(0,0,0,0.8)] bg-white flex flex-col overflow-hidden ring-1 ring-white/10 shrink-0 animate-in zoom-in-95 duration-200">
              {/* Tablet Top Camera */}
              <div className="w-full py-2 flex items-center justify-center bg-stone-900 text-stone-400 text-xs shrink-0 border-b border-stone-800">
                <span className="size-2 rounded-full bg-stone-950 ring-1 ring-stone-700" />
              </div>

              {/* Tablet Content */}
              <div
                ref={scrollViewportRef}
                key={refreshKey}
                className="flex-1 w-full overflow-y-auto overflow-x-hidden relative scroll-smooth flex justify-center bg-stone-100"
              >
                <div
                  className="w-full max-w-[480px] min-h-full bg-white shadow-xl relative"
                  style={{
                    backgroundColor: resolvedBgColor,
                    backgroundImage: resolvedBgImage ? `url(${resolvedBgImage})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <CardRenderContent
                    draft={draft}
                    canvasElements={canvasElements}
                    canvasHeight={effectiveCanvasHeight}
                    canvasBackgroundPattern={canvasBackgroundPattern}
                    canvasFallingEffect={canvasFallingEffect}
                    simulatedGuestName={simulatedGuestName}
                    onOpenRsvp={() => setShowRsvpModal(true)}
                    onOpenGift={() => setShowGiftModal(true)}
                    onOpenWishes={() => setShowWishesModal(true)}
                  >
                    {children}
                  </CardRenderContent>
                </div>
              </div>
            </div>
          )}

          {deviceMode === "desktop" && (
            <div className="relative w-full max-w-4xl h-[860px] max-h-[calc(100vh-84px)] rounded-2xl border border-stone-700/80 shadow-2xl bg-stone-900 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Browser Header Bar */}
              <div className="h-10 bg-stone-800 px-4 border-b border-stone-700 flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="flex-1 max-w-md mx-auto bg-stone-900/80 border border-stone-700 rounded-full px-3 py-1 text-[11px] text-stone-400 text-center truncate">
                  https://cardvite.vn/thiep/{draft?.slug || "dam-cuoi-minh-khoi-ngoc-han"}
                </div>
              </div>

              {/* Browser Body */}
              <div
                ref={scrollViewportRef}
                key={refreshKey}
                className="flex-1 w-full overflow-y-auto overflow-x-hidden relative scroll-smooth flex justify-center bg-stone-100/90 py-6"
              >
                <div
                  className="w-[390px] min-h-full bg-white shadow-2xl rounded-sm relative overflow-hidden"
                  style={{
                    backgroundColor: resolvedBgColor,
                    backgroundImage: resolvedBgImage ? `url(${resolvedBgImage})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <CardRenderContent
                    draft={draft}
                    canvasElements={canvasElements}
                    canvasHeight={effectiveCanvasHeight}
                    canvasBackgroundPattern={canvasBackgroundPattern}
                    canvasFallingEffect={canvasFallingEffect}
                    simulatedGuestName={simulatedGuestName}
                    onOpenRsvp={() => setShowRsvpModal(true)}
                    onOpenGift={() => setShowGiftModal(true)}
                    onOpenWishes={() => setShowWishesModal(true)}
                  >
                    {children}
                  </CardRenderContent>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── MODALS FOR INTERACTION TEST IN PREVIEW ── */}
        <RsvpFormModal
          isOpen={showRsvpModal}
          onClose={() => setShowRsvpModal(false)}
          cardId={cardId}
          defaultGuestName={simulatedGuestName}
          primaryColor={primaryColor}
        />

        <GiftQrBoxModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          bankingPrimary={draft?.bankingPrimary || categoryData?.bankingPrimary}
          bankingSecondary={draft?.bankingSecondary || categoryData?.bankingSecondary}
          primaryColor={primaryColor}
        />

        {showWishesModal && (
          <dialog
            open
            aria-label="Lời chúc mừng từ khách mời"
            className="fixed inset-0 z-[120] m-auto max-h-[85dvh] w-[min(95vw,32rem)] overflow-auto rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-black/10 border-0"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-amber-600" />
                <h3 className="font-serif font-bold text-stone-900">Sổ Lời Chúc Mừng</h3>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setShowWishesModal(false)}
                className="size-8 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <GuestbookSection cardId={cardId} primaryColor={primaryColor} />
          </dialog>
        )}
      </div>
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────
// INNER CARD CONTENT RENDERER (CANVAS ELEMENTS + TEMPLATE)
// ────────────────────────────────────────────────────────────────

interface CardRenderContentProps {
  draft: Record<string, any>;
  canvasElements: CanvasElement[];
  canvasHeight: number;
  canvasBackgroundPattern?: string;
  canvasFallingEffect?: string;
  simulatedGuestName: string;
  onOpenRsvp: () => void;
  onOpenGift: () => void;
  onOpenWishes: () => void;
  children?: React.ReactNode;
}

function CardRenderContent({
  draft,
  canvasElements,
  canvasHeight,
  canvasBackgroundPattern,
  canvasFallingEffect,
  simulatedGuestName,
  onOpenRsvp,
  onOpenGift,
  onOpenWishes,
  children,
}: CardRenderContentProps) {
  const categoryData = (draft?.categoryData || {}) as Record<string, any>;
  const hasCanvasElements = canvasElements && canvasElements.length > 0;
  const isCanvasDocument = Boolean(categoryData?.canvasDocument);

  return (
    <div
      className="relative w-[390px] mx-auto select-none"
      style={{ minHeight: canvasHeight }}
    >
      {/* 1. BACKGROUND PATTERN */}
      <CanvasPatternOverlay pattern={canvasBackgroundPattern as any} />

      {/* 2. FALLING PARTICLES EFFECT */}
      <CanvasFallingEffect effect={canvasFallingEffect} />

      {/* 3. TEMPLATE LAYER (WHEN NO CANVAS DOCUMENT OR HYBRID) */}
      {!isCanvasDocument && children && (
        <div className="relative z-0 w-full overflow-hidden">
          {children}
        </div>
      )}

      {/* 4. CANVAS ELEMENTS LAYER */}
      {hasCanvasElements && (
        <div className="relative z-10 w-full" style={{ height: canvasHeight }}>
          {canvasElements.map((el) => {
            const href = safeCanvasLink(el.linkUrl);
            const animClass = canvasElementAnimationClass(el);

            return (
              <div
                key={el.id}
                data-canvas-element={el.id}
                style={canvasElementStyle(el)}
                className={`flex items-center justify-center pointer-events-auto transition-transform ${animClass}`}
              >
                <CanvasElementContent
                  element={el}
                  draft={draft}
                  guestName={simulatedGuestName}
                  onRsvp={onOpenRsvp}
                  onGift={onOpenGift}
                />
                {href && el.type !== "widget" && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={el.title || el.content || "Mở liên kết"}
                    className="absolute inset-0 cursor-pointer focus-visible:outline-2"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. GUEST INTERACTION FLOATING TOOLBAR */}
      {categoryData.showBottomToolbar !== false && (
        <nav
          aria-label="Tương tác với thiệp"
          className="sticky bottom-4 mx-auto my-4 z-40 flex items-center justify-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs shadow-xl ring-1 ring-black/10 max-w-[340px]"
        >
          {categoryData.showWishButton !== false && (
            <button
              type="button"
              onClick={onOpenWishes}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-stone-700 hover:bg-stone-100 font-medium transition cursor-pointer"
            >
              <MessageSquare className="size-3.5 text-amber-600" />
              <span>Lời chúc</span>
            </button>
          )}

          {categoryData.showGiftQR !== false && (
            <button
              type="button"
              onClick={onOpenGift}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-stone-700 hover:bg-stone-100 font-medium transition cursor-pointer"
            >
              <Gift className="size-3.5 text-rose-500" />
              <span>Mừng cưới</span>
            </button>
          )}

          {categoryData.showRSVP !== false && (
            <button
              type="button"
              onClick={onOpenRsvp}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-stone-900 text-white font-semibold hover:bg-stone-800 transition shadow-xs cursor-pointer"
            >
              <UserCheck className="size-3.5 text-emerald-400" />
              <span>Xác nhận</span>
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
