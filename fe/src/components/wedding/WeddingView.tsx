"use client";

import React, { useState } from "react";
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

// IMPORT 9 TEMPLATES ĐỘC BẢN
import {
  WeddingTemplateProps,
  Template01Heritage,
  Template02ModernMagazine,
  Template03SweetRomance,
  Template04CrimsonMarsala,
  Template05ForestBotanical,
  Template06PureLotus,
  Template07Cinematic,
  Template08AlpineLake,
  Template09ImperialDragon,
} from "./templates";

interface WeddingViewProps {
  card: CardDetail;
  guestName?: string;
  guestPhone?: string;
  isVipExperience?: boolean;
  guestCode?: string;
  templateSlug?: string;
}

export const WeddingView: React.FC<WeddingViewProps> = ({
  card,
  guestName,
  guestPhone,
  isVipExperience = false,
  guestCode,
  templateSlug,
}) => {
  const [opened, setOpened] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [showRsvp, setShowRsvp] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const data = (card.categoryData as WeddingDataPayload) || {};
  const primaryColor = card.primaryColor || "#BE944E";
  const effectiveSlug = templateSlug || card.template?.slug;
  const config = getTemplateConfig(effectiveSlug, "WEDDING");
  const variant = config?.variant || "wedding-heritage-crimson-gold";

  const groomShortName = data.groom?.shortName || data.groom?.fullName || "Chú rể";
  const brideShortName = data.bride?.shortName || data.bride?.fullName || "Cô dâu";

  const templateProps: WeddingTemplateProps = {
    card,
    data,
    primaryColor,
    guestName,
    guestPhone,
    isVipExperience,
    onOpenRsvp: () => setShowRsvp(true),
    onOpenGift: () => setShowGift(true),
    onSelectPhoto: (url: string) => setSelectedPhoto(url),
  };

  const renderTemplate = () => {
    switch (variant) {
      case "wedding-heritage-crimson-gold":
      case "minimalist-gold":
        return <Template01Heritage {...templateProps} />;
      case "wedding-modern-editorial-magazine":
        return <Template02ModernMagazine {...templateProps} />;
      case "wedding-sweet-editorial-romance":
      case "hong-xanh-luxury":
        return <Template03SweetRomance {...templateProps} />;
      case "wedding-crimson-wine-marsala":
        return <Template04CrimsonMarsala {...templateProps} />;
      case "wedding-forest-green-botanical":
        return <Template05ForestBotanical {...templateProps} />;
      case "wedding-pure-lotus-heritage":
        return <Template06PureLotus {...templateProps} />;
      case "wedding-cinematic-editorial":
        return <Template07Cinematic {...templateProps} />;
      case "wedding-alpine-lake-romance":
        return <Template08AlpineLake {...templateProps} />;
      case "wedding-imperial-dragon-crimson":
        return <Template09ImperialDragon {...templateProps} />;
      default:
        return <Template01Heritage {...templateProps} />;
    }
  };

  return (
    <div
      data-template-variant={variant}
      className="relative min-h-screen font-sans overflow-x-hidden selection:bg-amber-200"
      style={{ fontFamily: card.fontFamily || config?.defaultFontFamily || "inherit" }}
    >
      {/* 1. HIỆU ỨNG MỞ PHONG BÌ SÁP NẾN */}
      {!opened && card.openingEffect === "WAX_SEAL" && (
        <WaxSealOpening
          primaryColor={primaryColor}
          title={`${groomShortName} & ${brideShortName}`}
          guestName={guestName}
          isVipExperience={isVipExperience}
          monogram={getMonogram(data.groom?.fullName, data.bride?.fullName)}
          onOpenStart={() => setAudioStarted(true)}
          onOpened={() => setOpened(true)}
        />
      )}

      {/* 2. HIỆU ỨNG RƠI, NHẠC NỀN & NÚT THẢ TIM CHÚC PHÚC */}
      <FallingEffect effect={card.fallingEffect || "PETAL"} />
      <AudioPlayer
        musicUrl={card.musicUrl}
        autoPlay={false}
        startOnGesture={audioStarted && card.isAutoPlay}
      />
      <FloatingCelebrationWidget primaryColor={primaryColor} />

      {/* 3. NÚT ĐỔI NGÔN NGỮ FLOATING TRÊN ĐẦU THIỆP */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40">
        <LanguageSwitcher />
      </div>

      {/* 4. RENDER TEMPLATE GIAO DIỆN TƯƠNG ỨNG */}
      {renderTemplate()}

      {/* 5. MODAL FORM RSVP XÁC NHẬN THAM DỰ */}
      <RsvpFormModal
        isOpen={showRsvp}
        onClose={() => setShowRsvp(false)}
        cardId={card.id}
        primaryColor={primaryColor}
        defaultGuestName={guestName}
        defaultGuestPhone={guestPhone}
        guestCode={guestCode}
      />

      {/* 6. MODAL GỬI QUÀ MỪNG VIETQR */}
      <GiftQrBoxModal
        isOpen={showGift}
        onClose={() => setShowGift(false)}
        bankingPrimary={card.bankingPrimary}
        bankingSecondary={card.bankingSecondary}
        primaryColor={primaryColor}
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
