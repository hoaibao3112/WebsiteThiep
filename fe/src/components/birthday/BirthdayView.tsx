"use client";

import React, { useState } from "react";
import { CardDetail, BirthdayDataPayload } from "@/types/card.types";
import { WaxSealOpening } from "../shared/OpeningEffect/WaxSealOpening";
import { FallingEffect } from "../shared/FallingEffect";
import { AudioPlayer } from "../shared/AudioPlayer";
import { CountdownTimer } from "../shared/CountdownTimer";
import { GiftQrBoxModal } from "../shared/GiftQrBoxModal";
import { RsvpFormModal } from "../shared/RsvpFormModal";
import { GuestbookSection } from "../shared/GuestbookSection";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { Cake, MapPin, Calendar, Clock, Gift, UserCheck, Navigation } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { getTemplateConfig } from "@/lib/editor/template-config";

export const BirthdayView: React.FC<{
  card: CardDetail;
  guestName?: string;
  guestPhone?: string;
  isVipExperience?: boolean;
  guestCode?: string;
  templateSlug?: string;
}> = ({ card, guestName, guestPhone, guestCode, isVipExperience = false, templateSlug }) => {
  const { t } = useLanguage();
  const [opened, setOpened] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [showRsvp, setShowRsvp] = useState(false);
  const [showGift, setShowGift] = useState(false);

  const data = card.categoryData as BirthdayDataPayload;
  const primaryColor = card.primaryColor || "#FF5E36";
  const variant = getTemplateConfig(templateSlug || card.template?.slug, "BIRTHDAY")?.variant || "glow-party";
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date();

  return (
    <div data-template-variant={variant} className="relative min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 overflow-x-hidden">
      {!opened && card.openingEffect === "WAX_SEAL" && (
        <WaxSealOpening
          primaryColor={primaryColor}
          title={`${t("birthdayTitle")} - ${data.celebrantName}`}
          subtitle="Birthday Invitation"
          guestName={guestName}
          isVipExperience={isVipExperience}
          onOpenStart={() => setAudioStarted(true)}
          onOpened={() => setOpened(true)}
        />
      )}

      <FallingEffect effect={card.fallingEffect || "BALLOON"} />
      <AudioPlayer
        musicUrl={card.musicUrl}
        autoPlay={card.openingEffect === "WAX_SEAL" ? false : (card.isAutoPlay ?? true)}
        startOnGesture={card.openingEffect === "WAX_SEAL" ? audioStarted : (card.isAutoPlay ?? true)}
      />

      <main className="max-w-md sm:max-w-lg mx-auto bg-stone-900 min-h-screen shadow-2xl overflow-hidden border-x border-stone-800 relative">
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>

        {/* HERO BANNER */}
        <section className="relative w-full aspect-[4/5] overflow-hidden bg-stone-950 flex flex-col justify-end p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              card.photos[0]?.url ||
              data.avatarUrl ||
              "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop"
            }
            alt="Birthday Celebrant"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-br from-orange-950/70 via-stone-900/40 to-fuchsia-950/60" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-bold tracking-widest uppercase mb-3 border border-amber-400/30">
              <Cake className="w-3.5 h-3.5" />
              <span>{t("birthdayTitle")}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {data.celebrantName}
              {data.age && (
                <span
                  className="block text-2xl font-serif mt-1"
                  style={{ color: primaryColor }}
                >
                  {t("turningAge")} {data.age} ✨
                </span>
              )}
            </h1>
          </div>
        </section>

        {/* LỜI NGỎ */}
        <section className="p-6 text-center border-b border-stone-800 bg-stone-900/90">
          {guestName && (
            <div className="inline-block px-4 py-1.5 bg-amber-950/60 rounded-full border border-amber-500/40 text-xs font-semibold text-amber-200 mb-3">
              {t("invitationTo")}: {guestName}
            </div>
          )}

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-sm mx-auto italic">
            {card.greetingMessage ||
              data.greeting ||
              "Một tuổi mới lại đến với biết bao ước mơ và hy vọng. Hãy cùng đến chung vui, nâng ly và thổi nến mừng sinh nhật cùng mình nhé!"}
          </p>
        </section>

        {/* COUNTDOWN */}
        <section className="px-6 py-2 border-b border-stone-800">
          <CountdownTimer
            targetDate={targetDate}
            title={`${t("birthdayTitle")} - ${data.celebrantName}`}
            location={mainEvent?.venueName || "Việt Nam"}
            primaryColor={primaryColor}
          />
        </section>

        {/* THÔNG TIN BỮA TIỆC */}
        <section className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-white text-center">
            {t("eventsTitle")} 📍
          </h3>

          {card.events.map((event, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-stone-800/80 border border-stone-700/60 text-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-stone-700 pb-2">
                <span
                  className="font-bold text-sm"
                  style={{ color: primaryColor }}
                >
                  {event.eventName}
                </span>
                <span className="flex items-center gap-1 text-stone-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {formatTime(event.eventDate)}
                </span>
              </div>

              <div className="flex items-start gap-2 text-stone-300">
                <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                <span>{formatDate(event.eventDate)}</span>
              </div>

              <div className="flex items-start gap-2 text-stone-300">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <strong className="text-white">{event.venueName}</strong>
                  <p className="text-stone-400 mt-0.5">{event.address}</p>
                </div>
              </div>

              {event.mapUrl && (
                <a
                  href={event.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-stone-700/80 hover:bg-stone-700 rounded-xl text-white font-semibold transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t("openMap")}</span>
                </a>
              )}
            </div>
          ))}
        </section>

        {/* SỔ LƯU BÚT */}
        <div className="bg-stone-900">
          <GuestbookSection cardId={card.id} primaryColor={primaryColor} />
        </div>

        {/* ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 p-3 flex items-center justify-center gap-3 max-w-md sm:max-w-lg mx-auto">
          <button
            onClick={() => setShowRsvp(true)}
            className="flex-1 py-3 px-4 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            style={{ backgroundColor: primaryColor }}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t("btnRsvp")}</span>
          </button>

          {card.bankingPrimary && (
            <button
              onClick={() => setShowGift(true)}
              className="py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white text-xs sm:text-sm font-bold cursor-pointer flex items-center justify-center gap-1.5 border border-stone-700"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>{t("birthdayGiftTab")}</span>
            </button>
          )}
        </div>
      </main>

      <RsvpFormModal
        isOpen={showRsvp}
        onClose={() => setShowRsvp(false)}
        cardId={card.id}
        defaultGuestName={guestName}
        defaultGuestPhone={guestPhone}
        guestCode={guestCode}
        primaryColor={primaryColor}
      />

      <GiftQrBoxModal
        isOpen={showGift}
        onClose={() => setShowGift(false)}
        bankingPrimary={card.bankingPrimary}
        labelPrimary={t("birthdayGiftTab")}
        primaryColor={primaryColor}
      />
    </div>
  );
};
