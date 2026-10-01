"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CardDetail, WeddingDataPayload } from "@/types/card.types";
import { WaxSealOpening } from "../shared/OpeningEffect/WaxSealOpening";
import { FallingEffect } from "../shared/FallingEffect";
import { AudioPlayer } from "../shared/AudioPlayer";
import { FloatingCelebrationWidget } from "../shared/FloatingCelebrationWidget";
import { GiftQrBoxModal } from "../shared/GiftQrBoxModal";
import { RsvpFormModal } from "../shared/RsvpFormModal";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { getMonogram } from "@/lib/guest/monogram";
import { getTemplateConfig } from "@/lib/editor/template-config";
import { X } from "lucide-react";
import { getWeddingScene } from "@/lib/editor/wedding-scene";
import { WeddingSceneRenderer } from "./WeddingSceneRenderer";
import { PhotoWallSection } from "./photobooth/PhotoWallSection";
import { Wedding3DFlipbook } from "./Wedding3DFlipbook";
import { Album3DConfig } from "@/types/album-3d.types";
import { DEMO_TEMPLATES_MAP } from "@/app/(public)/thiep/[slug]/demo-templates-data";

interface WeddingViewProps {
  card: CardDetail;
  guestName?: string;
  guestPhone?: string;
  isVipExperience?: boolean;
  guestCode?: string;
  templateSlug?: string;
  isPreview?: boolean;
  isDemo?: boolean;
}

export const WeddingView: React.FC<WeddingViewProps> = ({
  card,
  guestName,
  guestPhone,
  isVipExperience = false,
  guestCode,
  templateSlug,
  isPreview = false,
  isDemo = false,
}) => {
  const [opened, setOpened] = useState(isPreview);
  const [audioStarted, setAudioStarted] = useState(false);
  const [showRsvp, setShowRsvp] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const [resolvedGuestName, setResolvedGuestName] = useState<string | undefined>(guestName);
  const [hasGuestQuery, setHasGuestQuery] = useState(false);

  useEffect(() => {
    if (guestName) {
      setResolvedGuestName(guestName);
      return;
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const g = params.get("g");
      if (g) {
        setHasGuestQuery(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://websitethiep.onrender.com/api";
        fetch(`${apiUrl}/cards/by-slug/${card.slug}?g=${encodeURIComponent(g)}`)
          .then((r) => r.json())
          .then((res) => {
            if (res.success && res.data?.guestInfo) {
              const gInfo = res.data.guestInfo;
              setResolvedGuestName(`${gInfo.salutation || ""} ${gInfo.fullName}`.trim());
            }
          })
          .catch(() => {});
      }
    }
  }, [guestName, card.slug]);

  // Apply customized field positions if saved
  useEffect(() => {
    const pos = (card.categoryData as any)?.fieldPositions;
    if (!pos || typeof pos !== "object") return;
    Object.entries(pos).forEach(([fieldId, offset]: [string, any]) => {
      const el = document.querySelector<HTMLElement>(`[data-editable-field="${fieldId}"]`);
      if (el && offset) {
        el.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
      }
    });
  }, [card]);

  const activeGuestName = resolvedGuestName || guestName;
  const shouldShowOpening = !isPreview && !opened && (card.openingEffect === "WAX_SEAL" || card.openingEffect === "GATE_OPEN" || Boolean(activeGuestName) || hasGuestQuery);

  const data = (card.categoryData as WeddingDataPayload) || {};
  const primaryColor = card.primaryColor || "#BE944E";
  const effectiveSlug = templateSlug || card.template?.slug;
  const config = getTemplateConfig(effectiveSlug, "WEDDING");
  const variant = config?.variant || "wedding-heritage-crimson-gold";
  const scene = getWeddingScene(card, effectiveSlug);

  const groomShortName = data.groom?.shortName || data.groom?.fullName || "Chú rể";
  const brideShortName = data.bride?.shortName || data.bride?.fullName || "Cô dâu";
  const isDemoCard = isDemo || Boolean(card.id?.startsWith("demo-")) || Boolean(DEMO_TEMPLATES_MAP[card.slug]) || Boolean(templateSlug && DEMO_TEMPLATES_MAP[templateSlug]);

  return (
    <div
      data-template-variant={variant}
      data-scene-template={scene?.templateSlug}
      className={`relative min-h-screen font-sans ${isPreview ? "overflow-hidden" : "overflow-x-hidden"} selection:bg-amber-200`}
      style={{
        fontFamily: card.fontFamily || scene?.tokens.bodyFont || config?.defaultFontFamily || "inherit",
        backgroundColor: scene?.background.color || "#fffdf8",
        "--wedding-scene-primary": scene?.tokens.primary || primaryColor,
        "--wedding-scene-secondary": scene?.tokens.secondary || "#f4e8d0",
        "--wedding-scene-accent": scene?.tokens.accent || "#c9a45c",
        "--wedding-scene-surface": scene?.tokens.surface || "#fffdf8",
        "--wedding-scene-text": scene?.tokens.text || "#2e1b1b",
      } as React.CSSProperties}
    >
      {/* 1. HIỆU ỨNG MỞ PHONG BÌ SÁP NẾN / MÀN KÉO SANG 2 BÊN */}
      {shouldShowOpening && (
        <WaxSealOpening
          primaryColor={primaryColor}
          title={`${groomShortName} & ${brideShortName}`}
          guestName={activeGuestName}
          isVipExperience={isVipExperience}
          monogram={getMonogram(data.groom?.fullName, data.bride?.fullName)}
          envelopeConfig={data.envelopeConfig || (card.categoryData as any)?.envelopeConfig}
          onOpenStart={() => setAudioStarted(true)}
          onOpened={() => setOpened(true)}
        />
      )}

      {/* 2. HIỆU ỨNG RƠI, NHẠC NỀN & NÚT THẢ TIM CHÚC PHÚC */}
      <FallingEffect effect={card.fallingEffect || "PETAL"} scoped={isPreview} />
      {!isPreview && (
        <>
          <AudioPlayer
            musicUrl={card.musicUrl}
            autoPlay={shouldShowOpening ? false : (card.isAutoPlay ?? true)}
            startOnGesture={shouldShowOpening ? audioStarted : (card.isAutoPlay ?? true)}
          />
          <FloatingCelebrationWidget primaryColor={primaryColor} />
          {/* 3. NÚT ĐỔI NGÔN NGỮ FLOATING TRÊN ĐẦU THIỆP */}
          <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40">
            <LanguageSwitcher />
          </div>
        </>
      )}

      {/* 4. RENDER TEMPLATE GIAO DIỆN TƯƠNG ỨNG */}
      <div className="relative">
        {scene && (
          <WeddingSceneRenderer
            card={card}
            data={data}
            scene={scene}
            guestName={activeGuestName}
            onOpenRsvp={() => setShowRsvp(true)}
            onOpenGift={() => setShowGift(true)}
            onSelectPhoto={(url) => setSelectedPhoto(url)}
            isPreview={isPreview}
          />
        )}

        {/* 4.1 ALBUM ẢNH CƯỚI LẬT TRANG 3D CHÂN THỰC */}
        {(() => {
          const rawAlbum = (card.categoryData as any)?.album3d as Album3DConfig | undefined;
          const fallbackPages = (card.photos || []).map((p, idx) => ({
            id: p.id || `p-${idx}`,
            url: p.url,
            caption: p.caption || undefined,
            sortOrder: idx,
          }));

          const albumConfig: Album3DConfig = {
            enabled: rawAlbum?.enabled ?? true,
            title: rawAlbum?.title || "Album Kỷ Niệm Ngày Chung Đôi",
            coverTitle: rawAlbum?.coverTitle || `${groomShortName.toUpperCase()} & ${brideShortName.toUpperCase()}`,
            coverSubtitle: rawAlbum?.coverSubtitle || `Our Wedding Photobook • ${card.events?.[0]?.eventDate ? new Date(card.events[0].eventDate).getFullYear() : "2026"}`,
            coverTheme: rawAlbum?.coverTheme || "leather-burgundy",
            soundEnabled: rawAlbum?.soundEnabled ?? true,
            pages: rawAlbum?.pages && rawAlbum.pages.length > 0 ? rawAlbum.pages : fallbackPages,
          };

          if (!albumConfig.enabled || albumConfig.pages.length === 0) return null;

          const firstEventDate = card.events?.[0]?.eventDate;
          const displayWeddingDate = firstEventDate
            ? (typeof firstEventDate === "string" ? firstEventDate.slice(0, 10).split("-").reverse().join("/") : new Date(firstEventDate).toISOString().slice(0, 10).split("-").reverse().join("/"))
            : "2026";

          return (
            <Wedding3DFlipbook
              config={albumConfig}
              groomName={groomShortName}
              brideName={brideShortName}
              weddingDate={displayWeddingDate}
            />
          );
        })()}

        {/* 4.2 BỨC TƯỜNG ẢNH KỶ NIỆM & PHOTOBOOTH KHÁCH MỜI: Chỉ hiển thị cho thiệp cưới thật do tài khoản người dùng tạo, KHÔNG hiển thị trên thiệp mẫu demo hoặc preview */}
        {(() => {
          if (isPreview || isDemoCard) return null;

          return (
            <PhotoWallSection
              slug={card.slug}
              coupleName={`${groomShortName} & ${brideShortName}`}
              weddingDate={card.events?.[0]?.eventDate ? (typeof card.events[0].eventDate === "string" ? card.events[0].eventDate.slice(0, 10).split("-").reverse().join("/") : new Date(card.events[0].eventDate).toISOString().slice(0, 10).split("-").reverse().join("/")) : undefined}
              monogram={getMonogram(data.groom?.fullName, data.bride?.fullName)}
              defaultGuestName={activeGuestName}
              primaryColor={primaryColor}
            />
          );
        })()}
      </div>

      {/* 5. MODAL FORM RSVP XÁC NHẬN THAM DỰ */}
      <RsvpFormModal
        isOpen={showRsvp}
        onClose={() => setShowRsvp(false)}
        cardId={card.id}
        primaryColor={primaryColor}
        defaultGuestName={guestName}
        defaultGuestPhone={guestPhone}
        guestCode={guestCode}
        isDemo={isDemoCard}
      />

      {/* 6. MODAL GỬI QUÀ MỪNG VIETQR */}
      <GiftQrBoxModal
        isOpen={showGift}
        onClose={() => setShowGift(false)}
        bankingPrimary={card.bankingPrimary}
        bankingSecondary={card.bankingSecondary}
        primaryColor={primaryColor}
        isDemo={isDemoCard}
      />

      {/* 7. LIGHTBOX XEM ẢNH FULLSCREEN */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedPhoto}
              alt="Ảnh phóng to"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
